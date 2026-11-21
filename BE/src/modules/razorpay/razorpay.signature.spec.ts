import tap from "tap";
import crypto from "crypto";
import { isValidCheckoutSignature, isValidWebhookSignature, rupeesToPaise } from "./razorpay.signature";

const secret = "test_key_secret";

tap.test("checkout signature: accepts Razorpay's HMAC of order_id|payment_id", async (t) => {
	const sig = crypto.createHmac("sha256", secret).update("order_ABC|pay_XYZ").digest("hex");
	t.ok(isValidCheckoutSignature("order_ABC", "pay_XYZ", sig, secret));
});

tap.test("checkout signature: rejects tampered ids, wrong secret, and empty values", async (t) => {
	const sig = crypto.createHmac("sha256", secret).update("order_ABC|pay_XYZ").digest("hex");
	t.notOk(isValidCheckoutSignature("order_ABC", "pay_OTHER", sig, secret));
	t.notOk(isValidCheckoutSignature("order_ABC", "pay_XYZ", sig, "wrong_secret"));
	t.notOk(isValidCheckoutSignature("order_ABC", "pay_XYZ", "", secret));
	t.notOk(isValidCheckoutSignature("order_ABC", "pay_XYZ", sig, ""));
	t.notOk(isValidCheckoutSignature("order_ABC", "pay_XYZ", "short", secret));
});

tap.test("webhook signature: HMAC over the exact raw body", async (t) => {
	const raw = '{"event":"payment.captured","payload":{}}';
	const sig = crypto.createHmac("sha256", "wh_secret").update(raw).digest("hex");
	t.ok(isValidWebhookSignature(raw, sig, "wh_secret"));
	t.notOk(isValidWebhookSignature(raw + " ", sig, "wh_secret"), "whitespace change breaks it");
	t.notOk(isValidWebhookSignature(raw, sig, ""), "no secret configured -> reject");
});

tap.test("rupeesToPaise", async (t) => {
	t.equal(rupeesToPaise(300), 30000);
	t.equal(rupeesToPaise("450.50"), 45050);
	t.equal(rupeesToPaise(0.1 + 0.2), 30);
});
