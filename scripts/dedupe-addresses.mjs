import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const normalize = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const signature = (address) =>
  [
    address.userId,
    address.fullName,
    address.phone,
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.pincode,
  ]
    .map(normalize)
    .join("|");

try {
  const addresses = await prisma.savedAddress.findMany({
    orderBy: { createdAt: "desc" },
  });
  const seen = new Set();
  const duplicates = [];

  for (const address of addresses) {
    const key = signature(address);
    if (seen.has(key)) {
      duplicates.push(address.id);
    } else {
      seen.add(key);
    }
  }

  if (duplicates.length) {
    await prisma.savedAddress.deleteMany({
      where: { id: { in: duplicates } },
    });
  }

  console.log(`Removed ${duplicates.length} duplicate saved address(es).`);
} finally {
  await prisma.$disconnect();
}
