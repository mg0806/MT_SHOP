import crypto from "crypto";
import Razorpay from "razorpay";

const getKeyId = () => process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const getKeySecret = () => process.env.RAZORPAY_SECRET || process.env.RAZORPAY_KEY_SECRET;

let razorpayInstance: Razorpay | null = null;

export const assertRazorpayConfigured = () => {
  const keyId = getKeyId();
  const keySecret = getKeySecret();
  if (!keyId || !keySecret) throw new Error("Razorpay is not configured");
};

export const getRazorpayInstance = () => {
  assertRazorpayConfigured();

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: getKeyId()!,
      key_secret: getKeySecret()!,
    });
  }

  return razorpayInstance;
};

export function verifyRazorpaySignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const keySecret = getKeySecret();
  if (!keySecret) return false;
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = crypto.createHmac("sha256", keySecret).update(body).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(razorpaySignature || "");

  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export function verifyWebhookSignature(rawBody: string, signatureHeader?: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signatureHeader);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}
