import prisma from "@/libs/prismadb";
import getStoreSettings from "@/actions/getStoreSettings";
import { getCheapestRoadCourier, getShiprocketAvailability } from "@/libs/shiprocketCourier";

export async function getReturnPickupQuote(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { lineItems: true, savedAddress: true },
  });

  if (!order) throw new Error("Order not found");
  if (!order.savedAddress?.pincode) throw new Error("Customer return pickup pincode is missing");
  const settings = await getStoreSettings();

  const productIds = order.lineItems.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, weight: true },
  });
  const productWeightMap = new Map(products.map((product) => [product.id, Number(product.weight || 0)]));

  const orderWeight = order.lineItems.reduce((total, item) => {
    const weight = productWeightMap.get(item.productId) || settings.defaultPackageWeight;
    return total + weight * item.qty;
  }, 0);

  const data = await getShiprocketAvailability({
    pickup_postcode: order.savedAddress.pincode,
    delivery_postcode: settings.pickupPincode,
    weight: Math.max(orderWeight, settings.defaultPackageWeight),
    length: settings.defaultPackageLength,
    breadth: settings.defaultPackageBreadth,
    height: settings.defaultPackageHeight,
    cod: false,
  });

  const courier = getCheapestRoadCourier(data?.available_courier_companies || []);
  if (!courier) throw new Error("No road courier available for return pickup");

  return {
    pickupDeduction: Number(courier.rate || 0),
    courierName: courier.courier_name || "",
    estimatedDays: courier.estimated_delivery_days || "-",
    weight: Math.max(orderWeight, settings.defaultPackageWeight),
  };
}
