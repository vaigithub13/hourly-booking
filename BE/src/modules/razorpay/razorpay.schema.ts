import { Type } from "@sinclair/typebox";

export const createOrder = {
	description:
		"Step 1 of payment. Call after POST /bookings. Returns what the app passes to Razorpay Checkout (key, order_id, amount in paise).",
	tags: ["Payments (Razorpay)"],
	security: [{ userToken: [] }],
	body: Type.Object({ bookingId: Type.Integer() }),
	response: {
		200: Type.Object({
			keyId: Type.String(),
			orderId: Type.String(),
			amount: Type.Integer({ description: "In paise. ₹300 = 30000" }),
			currency: Type.String(),
			bookingId: Type.Integer(),
			name: Type.String(),
			description: Type.String(),
			payBefore: Type.String({ description: "Unpaid bookings are released after this time" }),
		}),
	},
};

export const verify = {
	description:
		"Step 2 of payment. Send the three values from Razorpay Checkout's success callback. Confirms the booking only after the server checks the signature.",
	tags: ["Payments (Razorpay)"],
	security: [{ userToken: [] }],
	body: Type.Object({
		bookingId: Type.Integer(),
		razorpay_order_id: Type.String(),
		razorpay_payment_id: Type.String(),
		razorpay_signature: Type.String(),
	}),
	response: {
		200: Type.Object({
			bookingId: Type.Integer(),
			bookingStatus: Type.Optional(Type.String()),
			paymentStatus: Type.String(),
		}),
	},
};

export const bookingPayments = {
	description: "Payment history for one of the user's bookings.",
	tags: ["Payments (Razorpay)"],
	security: [{ userToken: [] }],
	params: Type.Object({ bookingId: Type.Integer() }),
};

export const webhook = {
	description: "Razorpay calls this. Not for the app.",
	tags: ["Payments (Razorpay)"],
	hide: true,
};
