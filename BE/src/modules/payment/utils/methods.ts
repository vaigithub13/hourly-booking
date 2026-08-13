import crypto from "crypto";
import { ISCWebhookSentPayload } from "../payment.dto";

/**
 * Verifies SkipCash webhook signature
 * @param payload - The JSON body received in the webhook request.
 * @param webhookKey - The secret key used to validate the signature.
 * @param receivedSignature - The signature from the Authorization header.
 * @returns true if the signature is valid, false otherwise.
 */
function verifySkipCashWebhook(
  payload: ISCWebhookSentPayload,
  webhookKey: string,
  receivedSignature: string
): boolean {
  if (!payload || !webhookKey || !receivedSignature) {
    return false;
  }

  // Extract fields in the correct order
  const { PaymentId, Amount, StatusId, TransactionId, Custom1, VisaId } =
    payload;
  const values = [
    PaymentId ? `PaymentId=${PaymentId}` : "",
    Amount ? `Amount=${Amount}` : "",
    StatusId !== undefined ? `StatusId=${StatusId}` : "",
    TransactionId ? `TransactionId=${TransactionId}` : "",
    Custom1 ? `Custom1=${Custom1}` : "",
    VisaId ? `VisaId=${VisaId}` : "",
  ]
    .filter(Boolean)
    .join(",");

  // Compute HMAC-SHA256 signature
  const hmac = crypto.createHmac("sha256", webhookKey);
  hmac.update(values);
  const calculatedSignature = hmac.digest("base64");

  // Compare the received signature with the calculated signature
  return calculatedSignature === receivedSignature;
}

export { verifySkipCashWebhook };
