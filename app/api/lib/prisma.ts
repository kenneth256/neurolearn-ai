import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prismaClientSingleton = () => {
 
  const options: any = {
    accelerateUrl: process.env.ACCELERATE_URL || process.env.DATABASE_URL,
    log: ['query', 'error', 'warn'],
  };

  return new PrismaClient(options).$extends(withAccelerate());
};

type PrismaClientConfigured = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = global as unknown as { 
  prisma: PrismaClientConfigured | undefined 
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;