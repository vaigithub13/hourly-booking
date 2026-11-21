import "reflect-metadata";
import tap from "tap";
import crypto from "crypto";
import axios from "axios";
import { Booking, BookingStatus } from "../booking/booking.model";
import { BookingPayment, BookingPaymentStatus } from "./razorpay.model";
import RazorpayService from "./razorpay.service";

/**
 * Service-level tests with the database and Razorpay API stubbed out, so they run without
 * Postgres or real keys. They cover the money-handling rules, not HTTP wiring.
 */

const httpError = (statusCode: number) => (msg: string) => Object.assign(new Error(msg), { statusCode });
const instance: any = {
	configs: {
		razorpay: {
			keyId: "rzp_test_key",
			keySecret: "secret",
			webhookSecret: "wh",
			merchantName: "Hourlyzo",
			paymentWindowMinutes: 15,
			fullRefundWindowHours: 48,
		},
	},
	httpErrors: {
		notFound: httpError(404),
		badRequest: httpError(400),
		badGateway: httpError(502),
		serviceUnavailable: httpError(503),
	},
	log: { error: () => undefined, warn: () => undefined, info: () => undefined },
};

const record = <T extends object>(data: T) => {
	const r: any = { ...data, saves: 0 };
	r.save = async () => {
		r.saves++;
		return r;
	};
	r.get = (k: string) => r[k];
	return r;
};

type ApiCall = { method: string; url: string; body?: any };
const stubApi = (responses: Record<string, any>) => {
	const calls: ApiCall[] = [];
	(axios as any).create = () => ({
		get: async (url: string) => {
			calls.push({ method: "GET", url });
			return { data: responses[`GET ${url}`] };
		},
		post: async (url: string, body: any) => {
			calls.push({ method: "POST", url, body });
			const key = Object.keys(responses).find((k) => k === `POST ${url}` || (k.endsWith("*") && `POST ${url}`.startsWith(k.slice(0, -1))));
			return { data: key ? responses[key] : {} };
		},
	});
	return calls;
};

const sig = (orderId: string, paymentId: string) =>
	crypto.createHmac("sha256", "secret").update(`${orderId}|${paymentId}`).digest("hex");

tap.test("createOrder sends paise and returns checkout options", async (t) => {
	const booking = record({ id: 7, userId: 1, status: BookingStatus.PENDING_PAYMENT, totalPrice: 450, createdAt: new Date() });
	(Booking as any).findOne = async () => booking;
	(BookingPayment as any).findOne = async () => null;
	let created: any;
	(BookingPayment as any).create = async (d: any) => (created = record(d));
	const calls = stubApi({ "POST /orders": { id: "order_1", amount: 45000, currency: "INR", status: "created" } });

	const res = await RazorpayService(instance).createOrder(1, 7);
	t.equal(calls[0].body.amount, 45000, "₹450 -> 45000 paise");
	t.equal(res.orderId, "order_1");
	t.equal(res.keyId, "rzp_test_key");
	t.notOk(JSON.stringify(res).includes("secret"), "never returns the secret");
	t.equal(created.status, BookingPaymentStatus.CREATED);
});

tap.test("createOrder refuses bookings that are not awaiting payment", async (t) => {
	(Booking as any).findOne = async () => record({ id: 7, userId: 1, status: BookingStatus.CONFIRMED, totalPrice: 450 });
	await t.rejects(RazorpayService(instance).createOrder(1, 7), { statusCode: 400 });
});

tap.test("verify rejects a forged signature without calling Razorpay", async (t) => {
	(BookingPayment as any).findOne = async () =>
		record({ bookingId: 7, razorpayOrderId: "order_1", amountPaise: 45000, status: BookingPaymentStatus.CREATED });
	const calls = stubApi({});
	await t.rejects(
		RazorpayService(instance).verifyCheckout({
			userId: 1,
			bookingId: 7,
			razorpayOrderId: "order_1",
			razorpayPaymentId: "pay_1",
			razorpaySignature: "forged",
		}),
		{ statusCode: 400 }
	);
	t.equal(calls.length, 0);
});

tap.test("verify confirms the booking, and a repeat (webhook) is a no-op", async (t) => {
	const payment = record({ bookingId: 7, razorpayOrderId: "order_1", amountPaise: 45000, currency: "INR", status: BookingPaymentStatus.CREATED });
	const booking = record({ id: 7, status: BookingStatus.PENDING_PAYMENT });
	(BookingPayment as any).findOne = async () => payment;
	(Booking as any).findByPk = async () => booking;
	stubApi({ "GET /payments/pay_1": { id: "pay_1", order_id: "order_1", amount: 45000, status: "captured", method: "upi" } });

	const svc = RazorpayService(instance);
	const res = await svc.verifyCheckout({ userId: 1, bookingId: 7, razorpayOrderId: "order_1", razorpayPaymentId: "pay_1", razorpaySignature: sig("order_1", "pay_1") });
	t.equal(res.bookingStatus, BookingStatus.CONFIRMED);
	t.equal(payment.status, BookingPaymentStatus.PAID);
	t.equal(payment.method, "upi");

	const savesBefore = payment.saves;
	await svc.handleWebhook("payment.captured", { payment: { entity: { id: "pay_1", order_id: "order_1", amount: 45000, status: "captured" } } });
	t.equal(payment.saves, savesBefore, "second confirmation changes nothing");
});

tap.test("authorized (manual-capture) payments get captured", async (t) => {
	const payment = record({ bookingId: 7, razorpayOrderId: "order_1", amountPaise: 45000, currency: "INR", status: BookingPaymentStatus.CREATED });
	(BookingPayment as any).findOne = async () => payment;
	(Booking as any).findByPk = async () => record({ id: 7, status: BookingStatus.PENDING_PAYMENT });
	const calls = stubApi({
		"GET /payments/pay_1": { id: "pay_1", order_id: "order_1", amount: 45000, status: "authorized" },
		"POST /payments/pay_1/capture": { id: "pay_1", order_id: "order_1", amount: 45000, status: "captured" },
	});
	await RazorpayService(instance).verifyCheckout({ userId: 1, bookingId: 7, razorpayOrderId: "order_1", razorpayPaymentId: "pay_1", razorpaySignature: sig("order_1", "pay_1") });
	t.ok(calls.some((c) => c.url === "/payments/pay_1/capture" && c.body.amount === 45000));
	t.equal(payment.status, BookingPaymentStatus.PAID);
});

tap.test("payment amount mismatch is rejected", async (t) => {
	(BookingPayment as any).findOne = async () =>
		record({ bookingId: 7, razorpayOrderId: "order_1", amountPaise: 45000, status: BookingPaymentStatus.CREATED });
	stubApi({ "GET /payments/pay_1": { id: "pay_1", order_id: "order_1", amount: 100, status: "captured" } });
	await t.rejects(
		RazorpayService(instance).verifyCheckout({ userId: 1, bookingId: 7, razorpayOrderId: "order_1", razorpayPaymentId: "pay_1", razorpaySignature: sig("order_1", "pay_1") }),
		{ statusCode: 400 }
	);
});

tap.test("late payment for an expired booking is refunded in full", async (t) => {
	const payment = record({ bookingId: 7, razorpayOrderId: "order_1", amountPaise: 45000, currency: "INR", status: BookingPaymentStatus.CREATED });
	(BookingPayment as any).findOne = async () => payment;
	(Booking as any).findByPk = async () => record({ id: 7, status: BookingStatus.CANCELLED });
	const calls = stubApi({ "POST /payments/pay_1/refund": { id: "rfnd_1", amount: 45000, status: "processed" } });
	await RazorpayService(instance).handleWebhook("payment.captured", { payment: { entity: { id: "pay_1", order_id: "order_1", amount: 45000, status: "captured" } } });
	t.ok(calls.some((c) => c.url === "/payments/pay_1/refund" && c.body.amount === 45000));
	t.equal(payment.status, BookingPaymentStatus.REFUNDED);
});

tap.test("cancellation refund follows the 48-hour policy", async (t) => {
	const hours = (h: number) => new Date(Date.now() + h * 3600 * 1000);
	const mkPaid = () => record({ bookingId: 7, razorpayPaymentId: "pay_1", amountPaise: 45000, status: BookingPaymentStatus.PAID });

	let payment = mkPaid();
	(BookingPayment as any).findOne = async () => payment;
	let calls = stubApi({ "POST /payments/pay_1/refund": { id: "rfnd_1", amount: 45000, status: "pending" } });
	const early = await RazorpayService(instance).refundOnCancellation(record({ id: 7, checkIn: hours(72) }) as any);
	t.equal(early.refunded, true);
	t.equal(payment.status, BookingPaymentStatus.REFUND_PENDING);
	t.equal(calls.length, 1);

	payment = mkPaid();
	calls = stubApi({});
	const late = await RazorpayService(instance).refundOnCancellation(record({ id: 7, checkIn: hours(10) }) as any);
	t.equal(late.refunded, false);
	t.equal(calls.length, 0, "no refund inside 48 hours");
});

tap.test("missing keys give a clear 503 instead of crashing", async (t) => {
	const noKeys = { ...instance, configs: { razorpay: { ...instance.configs.razorpay, keyId: "", keySecret: "" } } };
	(Booking as any).findOne = async () => record({ id: 7, userId: 1, status: BookingStatus.PENDING_PAYMENT, totalPrice: 450, createdAt: new Date() });
	(BookingPayment as any).findOne = async () => null;
	await t.rejects(RazorpayService(noKeys).createOrder(1, 7), { statusCode: 503 });
});
