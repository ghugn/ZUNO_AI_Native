import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Lấy ví cá nhân của user. Nếu chưa tồn tại, tạo mới với balance = 0.
 */
export async function getWallet(userId: string) {
  const existing = await prisma.personalWallet.findUnique({ where: { userId } });
  if (existing) return existing;

  return prisma.personalWallet.create({
    data: { userId, balance: BigInt(0), note: '' },
  });
}

/**
 * Cập nhật số dư và ghi chú ví cá nhân.
 */
export async function updateWallet(userId: string, balance: number, note?: string) {
  return prisma.personalWallet.upsert({
    where: { userId },
    update: {
      balance: BigInt(Math.round(balance)),
      note: note ?? '',
    },
    create: {
      userId,
      balance: BigInt(Math.round(balance)),
      note: note ?? '',
    },
  });
}
