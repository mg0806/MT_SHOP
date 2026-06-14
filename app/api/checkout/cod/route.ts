import { getCurrentUser } from "@/actions/getCurrentUser";
import { auditLog } from "@/libs/auditLog";
import { computeOrderTotal } from "@/libs/pricing";
import prisma from "@/libs/prismadb";
import { getIp, rateLimit } from "@/libs/rateLimit";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const limited = rateLimit(`checkout-cod:${user.id}`, 10, 60 * 60 * 1000);
  if (!limited.allowed) return NextResponse.json({ error: "Too many checkout attempts" }, { status: 429 });

  try {
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
      { cod: true },
    );
    const orderLineItems = pricing.lineItems.map(({ selectedImg, ...item }: any) => item);

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        addressId,
        status: "COD_CONFIRMED",
        deliveryStatus: "pending",
        amount: pricing.grandTotalPaise,
        currency: "INR",
        subtotal: pricing.subtotal,
        discountAmount: pricing.discountAmount,
        couponCode: pricing.appliedCoupon?.code ?? null,
        shippingCharge: pricing.shippingCharge + pricing.codCharge,
        taxAmount: pricing.taxAmount,
        grandTotal: pricing.grandTotal,
        paymentIntentId: `cod_${Date.now()}_${user.id}`,
        products: pricing.lineItems,
        lineItems: { create: orderLineItems },
      },
    });

    await prisma.$transaction(
      orderLineItems.map((item: any) =>
        prisma.product.updateMany({
          where: { id: item.productId, quantity: { not: null } },
          data: { quantity: { decrement: item.qty } },
        }),
      ),
    );

    auditLog("cod_order_confirmed", { userId: user.id, orderId: order.id, ip: getIp(request.headers) });
    return NextResponse.json({ success: true, orderId: order.id, pricing });
  } catch (error) {
    const message = error instanceof Error ? error.message : "COD checkout failed";
    auditLog("cod_checkout_failed", { userId: user.id, error: message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
