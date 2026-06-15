import prisma from "@/libs/prismadb";

const defaults = {
  storeName: "MTShop",
  shiprocketPickupName: "Primary",
  pickupCountry: "India",
  pickupPincode: process.env.SHIPROCKET_PICKUP_POSTCODE || "382481",
  defaultPackageLength: 29.7,
  defaultPackageBreadth: 21,
  defaultPackageHeight: 2,
  defaultPackageWeight: 0.5,
};

export default async function getStoreSettings() {
  const settings = await prisma.storeSettings.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (settings) return settings;

  return prisma.storeSettings.create({
    data: defaults,
  });
}
