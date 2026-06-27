import prisma from '../lib/prisma.js';

interface CreateDailyFoodInput {
  userId: string;
  date: string;
  budgetMain: number;
  budgetSub: number;
}

interface UpdateDailyFoodInput {
  spentMain?: number;
  spentSub?: number;
  savedAmount?: number;
  dailyOverflow?: number;
  penaltyAppliedFromYesterday?: number;
}

export async function getDailyFoodSavings(userId: string, date: string) {
  return prisma.dailyFoodSavings.findUnique({
    where: { userId_date: { userId, date: new Date(date) } },
  });
}

export async function getDailyFoodSavingsByMonth(userId: string, month: string) {
  const start = new Date(month);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);

  return prisma.dailyFoodSavings.findMany({
    where: {
      userId,
      date: { gte: start, lte: end },
    },
    orderBy: { date: 'asc' },
  });
}

export async function createDailyFoodSavings(input: CreateDailyFoodInput) {
  return prisma.dailyFoodSavings.create({
    data: {
      userId: input.userId,
      date: new Date(input.date),
      budgetMain: BigInt(input.budgetMain),
      budgetSub: BigInt(input.budgetSub),
    },
  });
}

export async function createBulkDailyFoodSavings(userId: string, month: string, budgetMain: bigint, budgetSub: bigint) {
  const start = new Date(month);
  const year = start.getFullYear();
  const m = start.getMonth();
  const daysInMonth = new Date(year, m + 1, 0).getDate();

  const records = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(Date.UTC(year, m, day));
    records.push({
      userId,
      date,
      budgetMain,
      budgetSub,
      spentMain: BigInt(0),
      spentSub: BigInt(0),
      savedAmount: BigInt(0),
      dailyOverflow: BigInt(0),
      penaltyAppliedFromYesterday: BigInt(0),
    });
  }

  return prisma.dailyFoodSavings.createMany({
    data: records,
    skipDuplicates: true,
  });
}

export async function updateDailyFoodSavings(userId: string, date: string, input: UpdateDailyFoodInput) {
  const data: Record<string, unknown> = {};
  if (input.spentMain !== undefined) data.spentMain = BigInt(input.spentMain);
  if (input.spentSub !== undefined) data.spentSub = BigInt(input.spentSub);
  if (input.savedAmount !== undefined) data.savedAmount = BigInt(input.savedAmount);
  if (input.dailyOverflow !== undefined) data.dailyOverflow = BigInt(input.dailyOverflow);
  if (input.penaltyAppliedFromYesterday !== undefined) data.penaltyAppliedFromYesterday = BigInt(input.penaltyAppliedFromYesterday);

  return prisma.dailyFoodSavings.update({
    where: { userId_date: { userId, date: new Date(date) } },
    data,
  });
}
