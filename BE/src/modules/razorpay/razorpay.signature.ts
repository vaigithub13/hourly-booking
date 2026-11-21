import crypto from "crypto";

const safeEqual = (a: string, b: string) => {
	const bufA = Buffer.from(a, "utf8");
	const bufB = Buffer.from(b, "utf8");
	return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

const hmacHex = (secret: string, payload: string) => crypto.createHmac("sha256", secret).update(payload).digest("hex");

/**
 * Checkout signature: HMAC-SHA256(order_id + "|" + payment_id, key_secret).
 * The app gets razorpay_signature from the checkout success callback and sends it to us.
 */
export const isValidCheckoutSignature = (
	orderId: string,
	paymentId: string,
	signature: string,
	keySecret: string
): boolean => {
	if (!orderId || !paymentId || !signature || !keySecret) return false;
	return safeEqual(hmacHex(keySecret, `${orderId}|${paymentId}`), signature);
};

/**
 * Webhook signature: HMAC-SHA256(raw request body, webhook_secret), sent in X-Razorpay-Signature.
 * Must be computed over the exact raw body, not re-serialised JSON.
 */
export const isValidWebhookSignature = (rawBody: string, signature: string, webhookSecret: string): boolean => {
	if (!rawBody || !signature || !webhookSecret) return false;
	return safeEqual(hmacHex(webhookSecret, rawBody), signature);
};

/** ₹ (may have paise decimals) → integer paise. */
export const rupeesToPaise = (rupees: number | string): number => Math.round(Number(rupees) * 100);
