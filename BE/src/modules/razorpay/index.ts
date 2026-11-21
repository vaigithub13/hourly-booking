import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyInstance } from "fastify";
import RazorpayService from "./razorpay.service";
import * as schema from "./razorpay.schema";
import { isValidWebhookSignature } from "./razorpay.signature";
import { FastifyRequestTypebox } from "../../types/FastifyTypebox";

/**
 * Razorpay payment flow (mounted at /v1/payments/razorpay):
 *
 * 1. App: POST /v1/bookings                      -> booking in PENDING_PAYMENT (room held)
 * 2. App: POST /v1/payments/razorpay/orders      -> { keyId, orderId, amount, ... }
 * 3. App opens Razorpay Checkout with keyId + orderId; guest pays.
 * 4. App: POST /v1/payments/razorpay/verify      -> server checks signature + payment, booking CONFIRMED
 * 5. Razorpay: POST /v1/payments/razorpay/webhook -> same confirmation server-to-server, in case the app
 *    was closed before step 4. Both paths are idempotent.
 *
 * The key secret and webhook secret never leave the server.
 */
export default async (fastify: FastifyInstance) => {
	const instance = fastify.withTypeProvider<TypeBoxTypeProvider>();
	const razorpayService = RazorpayService(fastify);

	// Keep the raw JSON body for webhook signature checks. Scoped to this plugin only.
	instance.addContentTypeParser("application/json", { parseAs: "string" }, (request, body, done) => {
		(request as any).rawBody = body;
		try {
			done(null, body ? JSON.parse(body as string) : {});
		} catch (err: any) {
			err.statusCode = 400;
			done(err, undefined);
		}
	});

	instance.post(
		"/orders",
		{
			preValidation: instance.auth([instance.authenticate], { relation: "and" }),
			schema: schema.createOrder,
		},
		async (request: FastifyRequestTypebox<typeof schema.createOrder>) => {
			const userId = (request.user as any).id;
			return razorpayService.createOrder(userId, request.body.bookingId);
		}
	);

	instance.post(
		"/verify",
		{
			preValidation: instance.auth([instance.authenticate], { relation: "and" }),
			schema: schema.verify,
		},
		async (request: FastifyRequestTypebox<typeof schema.verify>) => {
			const userId = (request.user as any).id;
			const body = request.body;
			return razorpayService.verifyCheckout({
				userId,
				bookingId: body.bookingId,
				razorpayOrderId: body.razorpay_order_id,
				razorpayPaymentId: body.razorpay_payment_id,
				razorpaySignature: body.razorpay_signature,
			});
		}
	);

	instance.get(
		"/bookings/:bookingId",
		{
			preValidation: instance.auth([instance.authenticate], { relation: "and" }),
			schema: schema.bookingPayments,
		},
		async (request: FastifyRequestTypebox<typeof schema.bookingPayments>) => {
			const userId = (request.user as any).id;
			return razorpayService.getBookingPayments(userId, request.params.bookingId);
		}
	);

	instance.post("/webhook", { schema: schema.webhook }, async (request, reply) => {
		const signature = request.headers["x-razorpay-signature"] as string | undefined;
		const rawBody = (request as any).rawBody as string;
		if (!isValidWebhookSignature(rawBody, signature || "", fastify.configs.razorpay.webhookSecret)) {
			throw fastify.httpErrors.unauthorized("Invalid webhook signature");
		}
		const { event, payload } = (request.body || {}) as { event?: string; payload?: any };
		try {
			await razorpayService.handleWebhook(event || "", payload);
		} catch (err: any) {
			// 4xx = the event doesn't match our records; retrying won't help, so acknowledge it.
			if (err?.statusCode && err.statusCode < 500) {
				request.log.warn({ event, err: err.message }, "Razorpay webhook ignored");
			} else {
				throw err; // 5xx makes Razorpay retry later
			}
		}
		return reply.send({ ok: true });
	});
};
