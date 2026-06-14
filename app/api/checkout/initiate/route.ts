import { getCurrentUser } from "@/actions/getCurrentUser";
import { auditLog } from "@/libs/auditLog";
import { computeOrderTotal } from "@/libs/pricing";
import { getRazorpayInstance } from "@/libs/razorpay";
import { getIp, rateLimit } from "@/libs/rateLimit";
import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const limited = rateLimit(`checkout:${user.id}`, 10, 60 * 60 * 1000);
  if (!limited.allowed) return NextResponse.json({ error: "Too many checkout attempts" }, { status: 429 });

  try {
    const razorpayInstance = getRazorpayInstance();
    const { cartItems, couponCode, addressId } = await request.json();
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!addressId) return NextResponse.json({ error: "Delivery address required" }, { status: 400 });

    const address = await prisma.savedAddress.findFirst({
      where: { id: addressId, userId: user.id },
    });
    if (!address) return NextResponse.json({ error: "Invalid address" }, { status: 400 });

    const pricing = await computeOrderTotal(
      cartItems.map((item: any) => ({
        productId: item.productId,
        qty: item.qty,
        variantId: item.variantId ?? null,
      })),
      couponCode,
    );
    const orderLineItems = pricing.lineItems.map(({ selectedImg, ...item }: any) => item);

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        addressId,
        status: "PENDING",
        deliveryStatus: "pending",
        amount: pricing.grandTotalPaise,
        currency: "INR",
        subtotal: pricing.subtotal,
        discountAmount: pricing.discountAmount,
        couponCode: pricing.appliedCoupon?.code ?? null,
        shippingCharge: pricing.shippingCharge,
        taxAmount: pricing.taxAmount,
        grandTotal: pricing.grandTotal,
        paymentIntentId: `pending_${Date.now()}_${user.id}`,
        products: pricing.lineItems,
        lineItems: { create: orderLineItems },
      },
    });

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: pricing.grandTotalPaise,
      currency: "INR",
      receipt: order.id,
      notes: { internalOrderId: order.id, userId: user.id },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        razorpayOrderId: razorpayOrder.id,
        paymentIntentId: razorpayOrder.id,
      },
    });

    auditLog("checkout_initiated", { userId: user.id, orderId: order.id, ip: getIp(request.headers) });

    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      internalOrderId: order.id,
      pricing: {
        subtotal: pricing.subtotal,
        discountAmount: pricing.discountAmount,
        shippingCharge: pricing.shippingCharge,
        taxAmount: pricing.taxAmount,
        grandTotal: pricing.grandTotal,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout initiation failed";
    console.error("Checkout initiation failed:", error);
    auditLog("checkout_initiate_failed", { userId: user.id, error: message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
