import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const initializePrisma = (): PrismaClient => {
  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient();
  } else {
    if (!globalThis.prisma) {
      globalThis.prisma = new PrismaClient();
    }
    return globalThis.prisma;
  }
};

const prisma = initializePrisma();

export default prisma;
