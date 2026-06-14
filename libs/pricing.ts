import prisma from "@/libs/prismadb";

export type SecureCartItem = {
  productId: string;
  qty: number;
  variantId?: string | null;
};

const objectIdPattern = /^[a-f\d]{24}$/i;

export async function computeOrderTotal(
  cartItems: SecureCartItem[],
  couponCode?: string | null,
  options: { cod?: boolean } = {},
) {
  const normalizedItems = cartItems.map((item) => {
    const productId = String(item.productId || "");
    const qty = Number.parseInt(String(item.qty), 10);
    if (!objectIdPattern.test(productId)) throw new Error("Invalid product id");
    if (!Number.isInteger(qty) || qty < 1) throw new Error("Invalid quantity");
    return { productId, qty };
  });

  const productIds = normalizedItems.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, inStock: true },
  });
  const productMap = new Map(products.map((product) => [product.id, product]));

  const lineItems = normalizedItems.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) throw new Error(`Product ${item.productId} not found or inactive`);
    if (typeof product.quantity === "number" && product.quantity < item.qty) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }
    const hasSalePrice =
      typeof product.finalPrice === "number" &&
      product.finalPrice > 0 &&
      product.finalPrice < product.price;
    const unitPrice = Number(hasSalePrice ? product.finalPrice : product.price);
    const images = Array.isArray(product.images) ? product.images : [];
    const firstImageGroup = images[0] as any;
    return {
      productId: item.productId,
      name: product.name,
      qty: item.qty,
      unitPrice,
      lineTotal: unitPrice * item.qty,
      selectedImg: {
        color: firstImageGroup?.color || "",
        colorCode: firstImageGroup?.colorCode || "",
        images: firstImageGroup?.images || (firstImageGroup?.image ? [firstImageGroup.image] : []),
      },
    };
  });

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  let discountAmount = 0;
  let appliedCoupon: { code: string; discountAmount: number } | null = null;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
    });
    if (!coupon || !coupon.isActive) throw new Error("Invalid or expired coupon");
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new Error("Coupon expired");
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new Error("Coupon usage limit reached");
    }
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      throw new Error(`Minimum order Rs.${coupon.minOrderAmount} required for this coupon`);
    }
    discountAmount =
      coupon.type === "PERCENT"
        ? Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount ?? Number.POSITIVE_INFINITY)
        : coupon.value;
    discountAmount = Math.min(discountAmount, subtotal);
    appliedCoupon = { code: coupon.code, discountAmount };
  }

  const afterDiscount = subtotal - discountAmount;
  const shippingCharge = afterDiscount >= 999 ? 0 : 49;
  const codCharge = options.cod ? 20 : 0;
  const taxAmount = 0;
  const grandTotal = afterDiscount + shippingCharge + codCharge + taxAmount;

  return {
    lineItems,
    subtotal,
    discountAmount,
    appliedCoupon,
    shippingCharge,
    codCharge,
    taxAmount,
    grandTotal,
    grandTotalPaise: Math.round(grandTotal * 100),
  };
}
