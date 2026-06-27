import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import { FUND_TYPES } from '../lib/constants.js';
import { createWeeklyRewardsForMonth } from './reward.service.js';
import { reverseOverflowForTransaction, handleOverspending } from './overflowEngine.service.js';

// ── Tỷ lệ chia ngân sách ăn chính / ăn phụ trong ngày theo từng nhóm phong cách sống ────
// Tỷ lệ = ăn chính / tổng ngân sách ăn  (phần còn lại = ăn phụ/snack)
const FOOD_RATIOS: Record<string, number> = {
  dorm:         0.80,  // Dorm: 80% ăn chính (cơm/bún/phở), 20% ăn phụ (Req 7.3: Food 30%)
  rent:         0.75,  // Rent: 75% ăn chính, 25% ăn phụ (Req 7.4: Food 25%)
  professional: 0.70,  // Professional: 70% ăn chính, 30% ăn phụ/coffee
};


// ── Fund CRUD ──────────────────────────────────────────────

export async function getFundsByMonth(userId: string, month: string) {
  return prisma.fund.findMany({
    where: { userId, month: new Date(month) },
    orderBy: { fundType: 'asc' },
  });
}

export async function getFundById(fundId: string) {
  return prisma.fund.findUnique({ where: { id: fundId } });
}

export interface MonthlyFundsResult {
  fundsCreated: number;
  dailyFoodCreated: number;
  weeksCreated: number;
  allocations: Record<string, bigint>;
  dailyBudget: { main: bigint; sub: bigint };
}

export async function createMonthlyFunds(
  userId: string,
  month: string,
  bankBalance: bigint,
  residenceType: string,
): Promise<MonthlyFundsResult> {
  // Check if monthly funds already exist
  const existingFundsCount = await prisma.fund.count({
    where: {
      userId,
      month: new Date(month),
    },
  });

  if (existingFundsCount > 0) {
    throw new Error('Funds for this month already exist');
  }

  // Get template for this residence type, fall back to hardcoded defaults if DB is not seeded
  const template = await prisma.fundTemplate.findFirst({
    where: { residenceType, isDefault: true },
  });

  const DEFAULT_PERCENTAGES: Record<string, Record<string, number>> = {
    // Requirement 7.3: Dormitory allocation
    dorm: { living: 15, food: 30, growth: 15, experience: 20, future: 20 },
    // Requirement 7.4: Rental allocation
    rent: { living: 30, food: 25, growth: 15, experience: 15, future: 15 },
    // Professional (extended)
    professional: { living: 35, food: 20, growth: 20, experience: 15, future: 10 },
  };

  const percentages: Record<string, number> = template
    ? {
        living: Number(template.livingPct),
        food: Number(template.foodPct),
        growth: Number(template.growthPct),
        experience: Number(template.experiencePct),
        future: Number(template.futurePct),
      }
    : (DEFAULT_PERCENTAGES[residenceType] ?? DEFAULT_PERCENTAGES['dorm']);


  // Tính allocated cho từng quỹ
  const allocations: Record<string, bigint> = {};
  const fundsData = FUND_TYPES.map((fundType) => {
    const amount = BigInt(Math.round(Number(bankBalance) * percentages[fundType] / 100));
    allocations[fundType] = amount;
    return {
      userId,
      month: new Date(month),
      fundType,
      allocatedAmount: amount,
      spentAmount: BigInt(0),
      borrowAmount: BigInt(0),
      isLocked: fundType === 'future',
    };
  });

  // ── Tính ngân sách ăn uống hàng ngày ────────────────────
  const foodAllocation = allocations['food'];
  const monthDate = new Date(month);
  const year = monthDate.getFullYear();
  const m = monthDate.getMonth();
  const daysInMonth = new Date(year, m + 1, 0).getDate();

  const dailyFoodTotal = foodAllocation / BigInt(daysInMonth);
  const foodRatio = FOOD_RATIOS[residenceType] ?? 0.70;
  const budgetMain = BigInt(Math.round(Number(dailyFoodTotal) * foodRatio));
  const budgetSub = dailyFoodTotal - budgetMain; // Phần còn lại → ăn phụ

  const dailyFoodRecords: Prisma.DailyFoodSavingsCreateManyInput[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    dailyFoodRecords.push({
      userId,
      date: new Date(Date.UTC(year, m, day)),
      budgetMain,
      budgetSub,
      spentMain: BigInt(0),
      spentSub: BigInt(0),
      savedAmount: BigInt(0),
      dailyOverflow: BigInt(0),
      penaltyAppliedFromYesterday: BigInt(0),
    });
  }

  // ── Thực hiện trong Prisma Transaction (atomic) ─────────
  const result = await prisma.$transaction(async (tx) => {
    const fundsResult = await tx.fund.createMany({ data: fundsData });

    const dailyFoodResult = await tx.dailyFoodSavings.createMany({
      data: dailyFoodRecords,
      skipDuplicates: true,
    });

    return { fundsCreated: fundsResult.count, dailyFoodCreated: dailyFoodResult.count };
  });

  // ── Tự động tạo rương tuần cho tháng ─────────────────────
  const { weeksCreated } = await createWeeklyRewardsForMonth(userId, month);

  return {
    ...result,
    weeksCreated,
    allocations,
    dailyBudget: { main: budgetMain, sub: budgetSub },
  };
}

// ════════════════════════════════════════════════════════════
//  Optimistic Locking — Phòng chống tranh chấp đồng thời
// ════════════════════════════════════════════════════════════

/**
 * Cập nhật quỹ với Optimistic Locking.
 *
 * Cơ chế:
 *   1. Đọc version hiện tại của quỹ.
 *   2. Ghi update kèm điều kiện `where: { id, version }`.
 *   3. Nếu version đã bị thay đổi bởi request khác (count === 0),
 *      đọc lại và thử lại tối đa `maxRetries` lần.
 *
 * @param fundId - ID quỹ cần cập nhật
 * @param data - Dữ liệu cần cập nhật (hỗ trợ increment/decrement)
 * @param maxRetries - Số lần thử lại tối đa (mặc định 3)
 */
export async function optimisticFundUpdate(
  fundId: string,
  data: Record<string, unknown>,
  maxRetries: number = 3,
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const fund = await prisma.fund.findUnique({ where: { id: fundId } });
    if (!fund) throw new Error('Fund not found');

    const result = await prisma.fund.updateMany({
      where: { id: fundId, version: fund.version },
      data: {
        ...data,
        version: { increment: 1 },
      },
    });

    if (result.count > 0) return; // Thành công

    if (attempt === maxRetries) {
      throw new Error(
        'Dữ liệu quỹ đã bị thay đổi bởi thao tác khác. Vui lòng thử lại. (Optimistic Lock Failed)',
      );
    }
  }
}

export async function updateFundSpent(fundId: string, amount: bigint) {
  return optimisticFundUpdate(fundId, {
    spentAmount: { increment: amount },
  });
}

export async function updateFund(fundId: string, data: {
  allocatedAmount?: number;
  spentAmount?: number;
  customPercentage?: number;
  borrowAmount?: number;
  isLocked?: boolean;
}) {
  const updateData: Record<string, unknown> = {};
  if (data.spentAmount !== undefined) updateData.spentAmount = BigInt(data.spentAmount);
  if (data.customPercentage !== undefined) updateData.customPercentage = data.customPercentage;
  if (data.borrowAmount !== undefined) updateData.borrowAmount = BigInt(data.borrowAmount);
  if (data.isLocked !== undefined) updateData.isLocked = data.isLocked;

  if (data.customPercentage !== undefined) {
    const currentFund = await prisma.fund.findUnique({ where: { id: fundId } });
    if (currentFund) {
      const userProfile = await prisma.userProfile.findUnique({
        where: { userId: currentFund.userId },
      });
      const totalIncome = userProfile?.bankBalance || BigInt(0);
      updateData.allocatedAmount = BigInt(Math.round(Number(totalIncome) * data.customPercentage / 100));
    }
  } else if (data.allocatedAmount !== undefined) {
    updateData.allocatedAmount = BigInt(data.allocatedAmount);
  }

  updateData.version = { increment: 1 };

  const updatedFund = await prisma.fund.update({
    where: { id: fundId },
    data: updateData,
  });

  if (updatedFund.fundType === 'food' && (data.allocatedAmount !== undefined || data.customPercentage !== undefined)) {
    await redistributeRemainingFoodBudget(updatedFund.userId, updatedFund.month, new Date());
  }

  return updatedFund;
}

// ── Fund Templates ─────────────────────────────────────────

export async function getFundTemplates(residenceType?: string) {
  const where = residenceType ? { residenceType } : {};
  return prisma.fundTemplate.findMany({ where });
}

// ── Fund Snapshots ─────────────────────────────────────────

export async function createSnapshot(fundId: string, snapshotDate: string, remainingAmount: bigint, dailyDripAmount: bigint = BigInt(0)) {
  return prisma.fundSnapshot.create({
    data: {
      fundId,
      snapshotDate: new Date(snapshotDate),
      remainingAmount,
      dailyDripAmount,
    },
  });
}

export async function getSnapshots(fundId: string) {
  return prisma.fundSnapshot.findMany({
    where: { fundId },
    orderBy: { snapshotDate: 'desc' },
  });
}

export async function getSnapshotsByUserAndMonth(userId: string, month: string) {
  const start = new Date(month);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);

  return prisma.fundSnapshot.findMany({
    where: {
      fund: { userId },
      snapshotDate: { gte: start, lte: end },
    },
    include: { fund: { select: { fundType: true } } },
    orderBy: { snapshotDate: 'asc' },
  });
}

// ════════════════════════════════════════════════════════════
//  Compound Interest Projection — Dự phóng lãi kép dài hạn
// ════════════════════════════════════════════════════════════

export interface ProjectionDataPoint {
  year: number;
  month: number;
  totalPrincipal: number;    // Tổng tiền gốc đã gửi (VND)
  totalInterest: number;     // Tổng lãi tích lũy (VND)
  totalBalance: number;      // Số dư cuối kỳ = gốc + lãi (VND)
}

export interface CompoundProjectionResult {
  params: {
    monthlyContribution: number;
    annualRate: number;
    years: number;
  };
  summary: {
    totalPrincipal: number;
    totalInterest: number;
    totalBalance: number;
  };
  yearlyBreakdown: ProjectionDataPoint[];
  educationTips: string[];
}

/**
 * Tính toán dự phóng tăng trưởng tài sản theo lãi kép tích lũy hàng tháng.
 *
 * Công thức: B(t) = (B(t-1) + M) × (1 + r)
 *   Với M = số tiền gửi mỗi tháng, r = lãi suất tháng, B(0) = 0.
 *   Giả định gửi tiền vào đầu mỗi tháng.
 *
 * @param monthlyContribution - Số tiền tích lũy mỗi tháng (VND)
 * @param annualRate - Lãi suất năm (%, ví dụ: 6.5 cho 6.5%/năm)
 * @param years - Số năm dự phóng
 */
export function calculateCompoundInterest(
  monthlyContribution: number,
  annualRate: number = 6.5,
  years: number = 5,
): CompoundProjectionResult {
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = years * 12;

  const yearlyBreakdown: ProjectionDataPoint[] = [];
  let balance = 0;

  for (let t = 1; t <= totalMonths; t++) {
    // Gửi đầu tháng → tính lãi trên cả khoản vừa gửi
    balance = (balance + monthlyContribution) * (1 + monthlyRate);

    const totalPrincipal = monthlyContribution * t;
    const totalInterest = Math.round(balance - totalPrincipal);

    // Ghi nhận tại mốc cuối mỗi năm
    if (t % 12 === 0) {
      yearlyBreakdown.push({
        year: t / 12,
        month: t,
        totalPrincipal: Math.round(totalPrincipal),
        totalInterest,
        totalBalance: Math.round(balance),
      });
    }
  }

  // Tổng kết cuối cùng
  const finalPrincipal = monthlyContribution * totalMonths;
  const finalBalance = Math.round(balance);
  const finalInterest = finalBalance - Math.round(finalPrincipal);

  // Gợi ý giáo dục tài chính cho sinh viên
  const educationTips = generateEducationTips(
    monthlyContribution,
    finalBalance,
    finalInterest,
    years,
  );

  return {
    params: { monthlyContribution, annualRate, years },
    summary: {
      totalPrincipal: Math.round(finalPrincipal),
      totalInterest: finalInterest,
      totalBalance: finalBalance,
    },
    yearlyBreakdown,
    educationTips,
  };
}

/**
 * Tạo gợi ý giáo dục tài chính dựa trên kết quả dự phóng.
 */
function generateEducationTips(
  monthly: number,
  totalBalance: number,
  totalInterest: number,
  years: number,
): string[] {
  const tips: string[] = [];
  const formatted = (n: number) =>
    new Intl.NumberFormat('vi-VN').format(n);

  tips.push(
    `💰 Với ${formatted(monthly)}₫/tháng, sau ${years} năm bạn sẽ tích lũy được ${formatted(totalBalance)}₫.`,
  );

  tips.push(
    `📈 Trong đó, ${formatted(totalInterest)}₫ là tiền lãi kép — tiền sinh ra từ tiền mà bạn không cần làm gì thêm!`,
  );

  // So sánh với giá vàng (giả định ~8.500.000₫/chỉ)
  const goldChiPrice = 8_500_000;
  const goldChis = Math.floor(totalBalance / goldChiPrice);
  if (goldChis >= 1) {
    tips.push(
      `🪙 Số tiền này tương đương khoảng ${goldChis} chỉ vàng.`,
    );
  }

  // So sánh với laptop
  if (totalBalance >= 15_000_000) {
    tips.push(
      `💻 Đủ để mua một chiếc laptop chất lượng cho học tập và làm việc!`,
    );
  }

  // Lời khuyên chung
  tips.push(
    `🏦 Hãy cân nhắc gửi tiết kiệm ngân hàng hoặc mở tài khoản tích lũy tự động để tận dụng sức mạnh lãi kép.`,
  );

  return tips;
}

/**
 * Phân bổ lại ngân sách ăn uống hàng ngày cho các ngày còn lại trong tháng
 * khi hạn mức quỹ Ăn uống (food fund) thay đổi (ví dụ do Income, Transfer, hoặc updateFund).
 */
export async function redistributeRemainingFoodBudget(userId: string, monthDate: Date, txDate: Date) {
  // 1. Tìm quỹ Ăn uống (food) của tháng đó
  const foodFund = await prisma.fund.findFirst({
    where: {
      userId,
      month: monthDate,
      fundType: 'food',
    },
  });

  if (!foodFund) return;

  // 2. Lấy danh sách các ngày bắt đầu từ ngày giao dịch/ngày chọn (txDate) tới cuối tháng
  const dateOnly = new Date(Date.UTC(txDate.getUTCFullYear(), txDate.getUTCMonth(), txDate.getUTCDate()));
  const monthStart = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0));

  const remainingDays = await prisma.dailyFoodSavings.findMany({
    where: {
      userId,
      date: { gte: dateOnly, lte: monthEnd },
    },
    orderBy: { date: 'asc' },
  });

  if (remainingDays.length === 0) return;

  // 3. Tính tổng ngân sách đã phân bổ ở các ngày trước đó trong tháng
  const pastDays = await prisma.dailyFoodSavings.findMany({
    where: {
      userId,
      date: { lt: dateOnly, gte: monthStart },
    },
  });

  const totalBudgetInPast = pastDays.reduce((sum, day) => sum + day.budgetMain + day.budgetSub, BigInt(0));

  // 4. Số tiền còn lại trong quỹ có thể phân bổ cho các ngày còn lại
  let remainingAllocation = foodFund.allocatedAmount - totalBudgetInPast;
  if (remainingAllocation < BigInt(0)) remainingAllocation = BigInt(0);

  // 5. Chia đều cho các ngày còn lại (loại bỏ cap MAX_DAILY_FOOD_BUDGET)
  const numDays = remainingDays.length;
  const dailyTotal = remainingAllocation / BigInt(numDays);

  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  const residenceType = profile?.residenceType || 'dorm';
  const foodRatio = FOOD_RATIOS[residenceType] ?? 0.70;

  const budgetMain = BigInt(Math.round(Number(dailyTotal) * foodRatio));
  const budgetSub = dailyTotal - budgetMain;

  // 6. Đảo ngược các sự kiện lố đã xảy ra hôm nay trước khi tính toán lại
  const todayEvents = await prisma.overflowEvent.findMany({
    where: {
      userId,
      eventDate: dateOnly,
    },
  });

  let lastTxId: string | null = null;
  if (todayEvents.length > 0) {
    lastTxId = todayEvents[todayEvents.length - 1].transactionId;
    for (const event of todayEvents) {
      await reverseOverflowForTransaction(event.transactionId);
    }
  } else {
    const lastExpense = await prisma.transaction.findFirst({
      where: {
        userId,
        transactionDate: dateOnly,
        transactionType: 'expense',
        fund: { fundType: 'food' },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (lastExpense) {
      lastTxId = lastExpense.id;
    }
  }

  // Lấy lại danh sách ngày hôm nay và tương lai sau khi đã hoàn trả penalty
  const updatedRemainingDays = await prisma.dailyFoodSavings.findMany({
    where: {
      userId,
      date: { gte: dateOnly, lte: monthEnd },
    },
    orderBy: { date: 'asc' },
  });

  // Tìm ngày hôm nay trong danh sách
  const todayRecord = updatedRemainingDays.find((d) => d.date.getTime() === dateOnly.getTime());
  
  if (todayRecord) {
    // 7. Re-evaluate ngày hôm nay dưới ngân sách mới
    const effectiveBudget = budgetMain + budgetSub - todayRecord.penaltyAppliedFromYesterday;
    const totalSpent = todayRecord.spentMain + todayRecord.spentSub;

    if (totalSpent <= effectiveBudget) {
      await prisma.dailyFoodSavings.update({
        where: { id: todayRecord.id },
        data: {
          budgetMain,
          budgetSub,
          savedAmount: effectiveBudget - totalSpent,
          dailyOverflow: BigInt(0),
        },
      });
    } else {
      const overspent = totalSpent - effectiveBudget;
      await prisma.dailyFoodSavings.update({
        where: { id: todayRecord.id },
        data: {
          budgetMain,
          budgetSub,
          savedAmount: BigInt(0),
          dailyOverflow: overspent,
        },
      });

      // Kích hoạt cơ chế lố mới cho số tiền còn lố
      if (lastTxId) {
        const monthStr = `${dateOnly.getFullYear()}-${String(dateOnly.getMonth() + 1).padStart(2, '0')}-01`;
        const transactionDateStr = dateOnly.toISOString().slice(0, 10);
        await handleOverspending({
          userId,
          transactionId: lastTxId,
          transactionDate: transactionDateStr,
          month: monthStr,
          overspentAmount: overspent,
        });
      }
    }
  }

  // 8. Cập nhật các ngày tương lai
  const finalFutureDays = await prisma.dailyFoodSavings.findMany({
    where: {
      userId,
      date: { gt: dateOnly, lte: monthEnd },
    },
    orderBy: { date: 'asc' },
  });

  for (const day of finalFutureDays) {
    const effectiveBudget = budgetMain + budgetSub - day.penaltyAppliedFromYesterday;
    const totalSpent = day.spentMain + day.spentSub;

    // For future days, savedAmount must be 0 because the day hasn't finished yet
    await prisma.dailyFoodSavings.update({
      where: { id: day.id },
      data: {
        budgetMain,
        budgetSub,
        savedAmount: BigInt(0),
        dailyOverflow: BigInt(0),
      },
    });
  }
}

export async function clearUserDemoData(userId: string) {
  // 1. Delete overflow events
  await prisma.overflowEvent.deleteMany({ where: { userId } });

  // 2. Delete AI parse logs
  await prisma.aiParseLog.deleteMany({ where: { userId } });

  // 3. Delete transactions
  await prisma.transaction.deleteMany({ where: { userId } });

  // 4. Delete fund snapshots
  const userFunds = await prisma.fund.findMany({ where: { userId } });
  const fundIds = userFunds.map(f => f.id);
  await prisma.fundSnapshot.deleteMany({ where: { fundId: { in: fundIds } } });

  // 5. Delete funds
  await prisma.fund.deleteMany({ where: { userId } });

  // 6. Delete daily food savings
  await prisma.dailyFoodSavings.deleteMany({ where: { userId } });

  // 7. Delete weekly rewards
  await prisma.weeklyReward.deleteMany({ where: { userId } });

  // 8. Delete notifications
  await prisma.notification.deleteMany({ where: { userId } });

  // 9. Reset reward points to 0
  await prisma.rewardPoints.updateMany({
    where: { userId },
    data: {
      total: 0,
    },
  });
}


