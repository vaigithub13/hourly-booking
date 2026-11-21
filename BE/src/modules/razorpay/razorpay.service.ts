import { FastifyInstance } from "fastify";
import axios, { AxiosInstance } from "axios";
import { Op } from "sequelize";
import { Booking, BookingStatus } from "../booking/booking.model";
import { BookingPayment, BookingPaymentStatus } from "./razorpay.model";
import { isValidCheckoutSignature, rupeesToPaise } from "./razorpay.signature";

const RAZORPAY_API = "https://api.razorpay.com/v1";

interface RazorpayOrder {
	id: string;
	amount: number;
	currency: string;
	status: string;
}

interface RazorpayPayment {
	id: string;
	order_id: string;
	amount: number;
	currency: string;
	status: "created" | "authorized" | "captured" | "refunded" | "failed";
	method?: string;
	error_description?: string | null;
}

interface RazorpayRefund {
	id: string;
	amount: number;
	status: string;
}

export interface IVerifyCheckout {
	userId: number;
	bookingId: number;
	razorpayOrderId: string;
	razorpayPaymentId: string;
	razorpaySignature: string;
}

const RazorpayService = (instance: FastifyInstance) => {
	const cfg = instance.configs.razorpay;

	const api = (): AxiosInstance => {
		if (!cfg.keyId || !cfg.keySecret) {
			throw instance.httpErrors.serviceUnavailable("Payments are not configured on the server yet");
		}
		return axios.create({
			baseURL: RAZORPAY_API,
			auth: { username: cfg.keyId, password: cfg.keySecret },
			timeout: 15000,
		});
	};

	const callRazorpay = async <T>(fn: (client: AxiosInstance) => Promise<{ data: T }>): Promise<T> => {
		try {
			return (await fn(api())).data;
		} catch (err: any) {
			if (err?.statusCode) throw err; // already an http error from api()
			const description = err?.response?.data?.error?.description || err?.message || "unknown error";
			instance.log.error({ razorpayError: err?.response?.data }, "Razorpay API call failed");
			throw instance.httpErrors.badGateway(`Payment provider error: ${description}`);
		}
	};

	/** Refund `amountPaise` of a captured payment and record it. Safe to call twice. */
	const refundPayment = async (payment: BookingPayment, amountPaise: number, reason: string) => {
		if (payment.status === BookingPaymentStatus.REFUNDED || payment.status === BookingPaymentStatus.REFUND_PENDING) {
			return payment;
		}
		if (payment.status !== BookingPaymentStatus.PAID || !payment.razorpayPaymentId || amountPaise <= 0) {
			return payment;
		}
		const refund = await callRazorpay<RazorpayRefund>((c) =>
			c.post(`/payments/${payment.razorpayPaymentId}/refund`, {
				amount: amountPaise,
				speed: "normal",
				notes: { bookingId: String(payment.bookingId), reason },
				receipt: `refund_booking_${payment.bookingId}`,
			})
		);
		payment.razorpayRefundId = refund.id;
		payment.refundAmountPaise = refund.amount;
		payment.status = refund.status === "processed" ? BookingPaymentStatus.REFUNDED : BookingPaymentStatus.REFUND_PENDING;
		await payment.save();
		return payment;
	};

	/**
	 * Marks the payment as paid and confirms the booking. Idempotent: the app's /verify call and the
	 * webhook can both arrive, in any order. If the booking was already cancelled/expired when the money
	 * came in (guest paid after the hold ran out), the payment is refunded in full instead.
	 */
	const markPaid = async (payment: BookingPayment, razorpayPayment: RazorpayPayment) => {
		if (payment.status !== BookingPaymentStatus.CREATED && payment.status !== BookingPaymentStatus.FAILED) {
			return payment;
		}
		if (razorpayPayment.order_id !== payment.razorpayOrderId || razorpayPayment.amount !== payment.amountPaise) {
			throw instance.httpErrors.badRequest("Payment does not match this booking");
		}

		let captured = razorpayPayment;
		if (captured.status === "authorized") {
			// Account is set to manual capture: capture now so the money is actually collected.
			captured = await callRazorpay<RazorpayPayment>((c) =>
				c.post(`/payments/${razorpayPayment.id}/capture`, {
					amount: payment.amountPaise,
					currency: payment.currency,
				})
			);
		}
		if (captured.status !== "captured") {
			throw instance.httpErrors.badRequest(`Payment is not complete (status: ${captured.status})`);
		}

		payment.razorpayPaymentId = captured.id;
		payment.method = captured.method ?? null;
		payment.status = BookingPaymentStatus.PAID;
		payment.failureReason = null;
		await payment.save();

		const booking = await Booking.findByPk(payment.bookingId);
		if (booking && booking.status === BookingStatus.PENDING_PAYMENT) {
			booking.status = BookingStatus.CONFIRMED;
			await booking.save();
		} else if (booking && booking.status !== BookingStatus.CONFIRMED) {
			instance.log.warn({ bookingId: booking.id, status: booking.status }, "Payment arrived for a booking that is no longer payable; refunding");
			await refundPayment(payment, payment.amountPaise, "booking no longer available");
		}
		return payment;
	};

	const service = {
		/** Step 1: the app calls this after POST /bookings to get an order to open Razorpay Checkout with. */
		createOrder: async (userId: number, bookingId: number) => {
			const booking = await Booking.findOne({ where: { id: bookingId, userId } });
			if (!booking) throw instance.httpErrors.notFound("Booking not found");
			if (booking.status !== BookingStatus.PENDING_PAYMENT) {
				throw instance.httpErrors.badRequest("This booking is not waiting for payment");
			}

			const amountPaise = rupeesToPaise(booking.totalPrice);
			if (amountPaise < 100) throw instance.httpErrors.badRequest("Amount must be at least ₹1");

			// Reuse an open order for the same amount so retries don't create duplicates.
			const existing = await BookingPayment.findOne({
				where: { bookingId, status: BookingPaymentStatus.CREATED, amountPaise },
				order: [["createdAt", "DESC"]],
			});

			let payment = existing;
			if (!payment) {
				const order = await callRazorpay<RazorpayOrder>((c) =>
					c.post("/orders", {
						amount: amountPaise,
						currency: "INR",
						receipt: `booking_${bookingId}`,
						notes: { bookingId: String(bookingId), userId: String(userId) },
					})
				);
				payment = await BookingPayment.create({
					bookingId,
					userId,
					razorpayOrderId: order.id,
					amountPaise: order.amount,
					currency: order.currency,
					status: BookingPaymentStatus.CREATED,
				});
			}

			return {
				keyId: cfg.keyId, // public key, safe for the app
				orderId: payment.razorpayOrderId,
				amount: payment.amountPaise,
				currency: payment.currency,
				bookingId,
				name: cfg.merchantName,
				description: `Hourly stay booking #${bookingId}`,
				payBefore: new Date(new Date(booking.get("createdAt")).getTime() + cfg.paymentWindowMinutes * 60 * 1000).toISOString(),
			};
		},

		/** Step 2: the app sends the three values from Checkout's success callback. */
		verifyCheckout: async (dto: IVerifyCheckout) => {
			const payment = await BookingPayment.findOne({
				where: { razorpayOrderId: dto.razorpayOrderId, bookingId: dto.bookingId, userId: dto.userId },
			});
			if (!payment) throw instance.httpErrors.notFound("Payment not found for this booking");

			if (!isValidCheckoutSignature(dto.razorpayOrderId, dto.razorpayPaymentId, dto.razorpaySignature, cfg.keySecret)) {
				throw instance.httpErrors.badRequest("Payment signature is invalid");
			}

			const rzpPayment = await callRazorpay<RazorpayPayment>((c) => c.get(`/payments/${dto.razorpayPaymentId}`));
			await markPaid(payment, rzpPayment);

			const booking = await Booking.findByPk(payment.bookingId);
			return { bookingId: payment.bookingId, bookingStatus: booking?.status, paymentStatus: payment.status };
		},

		/** Webhook events (already signature-checked by the route). */
		handleWebhook: async (event: string, payload: any) => {
			const rzpPayment: RazorpayPayment | undefined = payload?.payment?.entity;
			const refundEntity: RazorpayRefund & { payment_id?: string } | undefined = payload?.refund?.entity;

			if ((event === "payment.captured" || event === "order.paid") && rzpPayment?.order_id) {
				const payment = await BookingPayment.findOne({ where: { razorpayOrderId: rzpPayment.order_id } });
				if (payment) await markPaid(payment, rzpPayment);
				return;
			}

			if (event === "payment.failed" && rzpPayment?.order_id) {
				const payment = await BookingPayment.findOne({ where: { razorpayOrderId: rzpPayment.order_id } });
				if (payment && payment.status === BookingPaymentStatus.CREATED) {
					payment.status = BookingPaymentStatus.FAILED;
					payment.failureReason = rzpPayment.error_description ?? "payment failed";
					payment.razorpayPaymentId = rzpPayment.id;
					await payment.save();
				}
				return;
			}

			if ((event === "refund.processed" || event === "refund.failed") && refundEntity?.payment_id) {
				const payment = await BookingPayment.findOne({ where: { razorpayPaymentId: refundEntity.payment_id } });
				if (!payment) return;
				if (event === "refund.processed") payment.status = BookingPaymentStatus.REFUNDED;
				else {
					payment.status = BookingPaymentStatus.PAID; // refund failed: money still with us, admin must retry
					payment.failureReason = "refund failed";
				}
				await payment.save();
			}
		},

		/**
		 * Called after a guest cancels. Policy (same as hourlyzo.com/refund-policy):
		 * cancelled at least `fullRefundWindowHours` before check-in → 100% refund, otherwise none.
		 */
		refundOnCancellation: async (booking: Booking) => {
			const payment = await BookingPayment.findOne({
				where: { bookingId: booking.id, status: BookingPaymentStatus.PAID },
			});
			if (!payment) return { refunded: false, reason: "no captured payment" };

			const hoursBeforeCheckIn = (new Date(booking.checkIn).getTime() - Date.now()) / (1000 * 60 * 60);
			if (hoursBeforeCheckIn < cfg.fullRefundWindowHours) {
				return { refunded: false, reason: `cancelled less than ${cfg.fullRefundWindowHours} hours before check-in` };
			}
			await refundPayment(payment, payment.amountPaise, "guest cancelled within refund window");
			return { refunded: true, amountPaise: payment.refundAmountPaise, status: payment.status };
		},

		/** Releases rooms held by bookings that were never paid. Run on a schedule. */
		expireUnpaidBookings: async () => {
			const cutoff = new Date(Date.now() - cfg.paymentWindowMinutes * 60 * 1000);
			const stale = await Booking.findAll({
				where: { status: BookingStatus.PENDING_PAYMENT, createdAt: { [Op.lt]: cutoff } },
			});
			for (const booking of stale) {
				const paid = await BookingPayment.findOne({
					where: { bookingId: booking.id, status: BookingPaymentStatus.PAID },
				});
				if (paid) continue; // webhook already confirmed it; leave for markPaid
				booking.status = BookingStatus.CANCELLED;
				booking.cancellationReason = "Payment not completed in time";
				await booking.save();
				await BookingPayment.update(
					{ status: BookingPaymentStatus.EXPIRED },
					{ where: { bookingId: booking.id, status: { [Op.in]: [BookingPaymentStatus.CREATED, BookingPaymentStatus.FAILED] } } }
				);
			}
			return stale.length;
		},

		getBookingPayments: async (userId: number, bookingId: number) => {
			return BookingPayment.findAll({ where: { bookingId, userId }, order: [["createdAt", "DESC"]] });
		},
	};

	return service;
};

export default RazorpayService;
