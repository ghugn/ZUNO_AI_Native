import prisma from '../lib/prisma.js';
import type { Prisma } from '@prisma/client';

interface CreateAiParseLogInput {
  userId: string;
  rawInput: string;
  parsedEntity?: string;
  parsedAmount?: number;
  parsedCategory?: string;
}

export async function createAiParseLog(input: CreateAiParseLogInput) {
  return prisma.aiParseLog.create({
    data: {
      userId: input.userId,
      rawInput: input.rawInput,
      parsedEntity: input.parsedEntity,
      parsedAmount: input.parsedAmount ? BigInt(input.parsedAmount) : null,
      parsedCategory: input.parsedCategory,
    },
  });
}

export async function getAiParseLogs(userId: string, limit: number = 50) {
  return prisma.aiParseLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getAiParseLogById(logId: string) {
  return prisma.aiParseLog.findUnique({ where: { id: logId } });
}

export async function confirmAiParseLog(logId: string, transactionId: string) {
  return prisma.aiParseLog.update({
    where: { id: logId },
    data: { transactionId },
  });
}

export async function correctAiParseLog(logId: string, userCorrection: Prisma.InputJsonValue) {
  return prisma.aiParseLog.update({
    where: { id: logId },
    data: { userCorrection },
  });
}
