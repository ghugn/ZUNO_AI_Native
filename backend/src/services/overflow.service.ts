import prisma from '../lib/prisma.js';
import type { Prisma } from '@prisma/client';

interface CreateOverflowInput {
  userId: string;
  transactionId: string;
  eventDate: string;
  overflowLevel: string;
  overflowAmount: number;
  sourceFundType: string;
  borrowedFromFundType?: string;
  penaltyApplied?: Prisma.InputJsonValue;
}

export async function createOverflowEvent(input: CreateOverflowInput) {
  return prisma.overflowEvent.create({
    data: {
      userId: input.userId,
      transactionId: input.transactionId,
      eventDate: new Date(input.eventDate),
      overflowLevel: input.overflowLevel,
      overflowAmount: BigInt(input.overflowAmount),
      sourceFundType: input.sourceFundType,
      borrowedFromFundType: input.borrowedFromFundType,
      penaltyApplied: input.penaltyApplied ?? undefined,
    },
  });
}

export async function getOverflowEvents(userId: string, month?: string) {
  const where: Record<string, unknown> = { userId };

  if (month) {
    const start = new Date(month);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    where.eventDate = { gte: start, lte: end };
  }

  return prisma.overflowEvent.findMany({
    where,
    orderBy: { eventDate: 'desc' },
    include: { transaction: { select: { category: true, amount: true, description: true } } },
  });
}

export async function getOverflowEventById(eventId: string) {
  return prisma.overflowEvent.findUnique({
    where: { id: eventId },
    include: { transaction: true },
  });
}

export async function updateOverflowStatus(eventId: string, data: {
  repaidAmount?: number;
  status?: string;
}) {
  const updateData: Record<string, unknown> = {};
  if (data.repaidAmount !== undefined) updateData.repaidAmount = BigInt(data.repaidAmount);
  if (data.status !== undefined) updateData.status = data.status;

  return prisma.overflowEvent.update({
    where: { id: eventId },
    data: updateData,
  });
}

export async function getPendingOverflows(userId: string) {
  return prisma.overflowEvent.findMany({
    where: { userId, status: { in: ['pending', 'partial'] } },
    orderBy: { eventDate: 'asc' },
  });
}
