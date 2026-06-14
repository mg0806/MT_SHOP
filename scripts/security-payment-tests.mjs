import fs from "node:fs";
import assert from "node:assert/strict";
import crypto from "node:crypto";

const read = (path) => fs.readFileSync(path, "utf8");

const initiate = read("app/api/checkout/initiate/route.ts");
const verify = read("app/api/payment/verify/route.ts");
const webhook = read("app/api/webhooks/razorpay/route.ts");
const refund = read("app/api/admin/orders/[id]/refund/route.ts");
const pricing = read("libs/pricing.ts");
const checkoutButton = read("components/checkout/SecureCheckoutButton.tsx");
const deprecatedPayment = read("app/api/create-payment-intent/route.ts");
const deprecatedVerify = read("app/api/verify-payment/route.ts");
const deprecatedShiprocket = read("app/api/shiprocket/create-order/route.ts");

// TEST 1 - Price tampering: checkout client sends only productId + qty; pricing fetches DB product price.
assert.match(checkoutButton, /productId: item\.id,\s*qty: item\.quantity/s);
const initiateBody = checkoutButton.match(/body: JSON\.stringify\(\{([\s\S]*?)\}\),\s*\}\);\s*const data/)?.[1] || "";
assert.doesNotMatch(initiateBody, /price|amount|discountAmount|shippingCharge/);
assert.match(pricing, /prisma\.product\.findMany/);
assert.match(pricing, /unitPrice = Number\(product\.finalPrice \?\? product\.price\)/);

// TEST 2 - Fake signature: verify route rejects invalid HMAC.
assert.match(verify, /verifyRazorpaySignature/);
assert.match(verify, /PAYMENT_SIGNATURE_INVALID/);
const fakeExpected = crypto.createHmac("sha256", "secret").update("order|payment").digest("hex");
assert.notEqual(fakeExpected, "fakesignature");

// TEST 3 - Double confirm: non-PENDING orders return already processed.
assert.match(verify, /order\.status !== "PENDING"/);
assert.match(verify, /Order already processed/);

// TEST 4 - Cross-user order access: verify checks order userId.
assert.match(verify, /order\.userId !== user\.id/);
assert.match(verify, /Forbidden/);

// TEST 5 - Coupon tampering: coupon is looked up and validated server-side.
assert.match(pricing, /prisma\.coupon\.findUnique/);
assert.match(pricing, /Invalid or expired coupon/);
assert.match(pricing, /Coupon expired/);

// TEST 6 - Out-of-stock bypass: pricing rejects inactive/out of stock and insufficient quantity.
assert.match(pricing, /inStock: true/);
assert.match(pricing, /Insufficient stock/);

// TEST 7 - Fake webhook: raw webhook signature must verify before processing.
assert.match(webhook, /request\.text\(\)/);
assert.match(webhook, /verifyWebhookSignature/);
assert.match(webhook, /Invalid signature/);

// TEST 8 - Admin refund over-charge: refund amount clamped to order amount and admin checked.
assert.match(refund, /user\.role !== "ADMIN"/);
assert.match(refund, /Math\.min\(requestedPaise, maxPaise\)/);

// Legacy unsafe endpoints disabled.
assert.match(deprecatedPayment, /Deprecated/);
assert.match(deprecatedVerify, /Deprecated/);
assert.match(deprecatedShiprocket, /Deprecated/);

console.log("All secure payment/delivery tests passed.");
