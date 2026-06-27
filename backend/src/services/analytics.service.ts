// ════════════════════════════════════════════════════════════
//  ANALYTICS SERVICE — Financial Health Score & Dashboard Data
// ════════════════════════════════════════════════════════════

import prisma from '../lib/prisma.js';

export interface FinancialHealthScore {
  total: number;               // 0-100
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  components: {
    budgetAdherence: number;   // 0-40 points
    savingsRate: number;       // 0-35 points
    overflowPenalty: number;   // 0-25 points (inverted: lower overflow = higher score)
  };
  summary: string;
}

export interface SpendingCategory {
  fundType: string;
  category: string;
  totalAmount: number;
  percentage: number;
  transactionCount: number;
}

export interface LatteFactor {
  merchantName: string;
  totalAmount: number;
  frequency: number;
  percentOfExperience: number;
  potentialSavings: number;
}

export interface DashboardData {
  healthScore: FinancialHealthScore;
  funds: {
    fundType: string;
    allocated: number;
    spent: number;
    remaining: number;
    percentage: number;
  }[];
  dailyFoodStatus: {
    date: string;
    budgetMain: number;
    budgetSub: number;
    spentMain: number;
    spentSub: number;
    remaining: number;
    savedAmount: number;
  } | null;
  topCategories: SpendingCategory[];
  latteFactors: LatteFactor[];
  weeklySavingsProgress: {
    weekStart: string;
    weekEnd: string;
    accumulated: number;
    milestone: string;
    isUnlocked: boolean;
    pointsEarned: number;
  } | null;
  savingsGrowth: {
    dates: string[];
    balances: number[];
    projections: {
      months3: number;
      months6: number;
      months12: number;
    };
  };
  recentTransactions: {
    id: string;
    merchant: string;
    category: string;
    fundType: string;
    amount: number;
    date: string;
    inputMethod: string;
  }[];
}

// ── Helpers ──────────────────────────────────────────────────

function safeNumber(val: bigint | null | undefined): number {
  if (val == null) return 0;
  return Number(val);
}

function gradeFromScore(score: number): FinancialHealthScore['grade'] {
  if (score >= 90) return 'S';
  if (score >= 80) return 'A';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  if (score >= 35) return 'D';
  return 'F';
}

function gradeSummary(grade: string): string {
  const map: Record<string, string> = {
    S: 'Xuất sắc! Tài chính của bạn rất lành mạnh.',
    A: 'Tốt! Bạn đang quản lý tài chính hiệu quả.',
    B: 'Khá tốt. Còn một số điểm cần cải thiện nhỏ.',
    C: 'Trung bình. Cần chú ý hơn đến ngân sách.',
    D: 'Yếu. Cần xem xét lại thói quen chi tiêu.',
    F: 'Nguy hiểm! Cần hành động ngay để cải thiện tình hình.',
  };
  return map[grade] || 'Chưa đánh giá';
}

// ── Main Functions ────────────────────────────────────────────

export async function calculateHealthScore(
  userId: string,
  monthStr: string,
): Promise<FinancialHealthScore> {
  const monthStart = new Date(monthStr);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59);

  // Get funds for this month
  const funds = await prisma.fund.findMany({
    where: { userId, month: monthStart },
  });

  // === Component 1: Budget Adherence (0-40 pts) ===
  // Ratio of funds NOT overspent
  let adherenceScore = 40;
  if (funds.length > 0) {
    const shortTermFunds = funds.filter(f => f.fundType !== 'future');
    if (shortTermFunds.length > 0) {
      const noOverspend = shortTermFunds.filter(f => f.spentAmount <= f.allocatedAmount).length;
      adherenceScore = Math.round(40 * (noOverspend / shortTermFunds.length));
    }
  }

  // === Component 2: Savings Rate (0-35 pts) ===
  // Ratio of future fund allocation to total income
  const futureFund = funds.find(f => f.fundType === 'future');
  const totalAllocated = funds.reduce((acc, f) => acc + safeNumber(f.allocatedAmount), 0);
  let savingsScore = 0;
  if (futureFund && totalAllocated > 0) {
    const savingsRatio = safeNumber(futureFund.allocatedAmount) / totalAllocated;
    // Target: 20% savings = full 35 pts
    savingsScore = Math.min(35, Math.round(35 * (savingsRatio / 0.20)));
  }

  // === Component 3: Overflow Penalty (0-25 pts) ===
  // Count overflow events in the month
  const overflowEvents = await prisma.overflowEvent.count({
    where: {
      userId,
      eventDate: { gte: monthStart, lte: monthEnd },
    },
  });
  // 0 events = 25 pts, 5+ events = 0 pts
  const overflowScore = Math.max(0, 25 - overflowEvents * 5);

  const total = Math.min(100, adherenceScore + savingsScore + overflowScore);
  const grade = gradeFromScore(total);

  return {
    total,
    grade,
    components: {
      budgetAdherence: adherenceScore,
      savingsRate: savingsScore,
      overflowPenalty: overflowScore,
    },
    summary: gradeSummary(grade),
  };
}

export async function getDashboardData(
  userId: string,
  monthStr: string,
): Promise<DashboardData> {
  const monthStart = new Date(monthStr);

  // ── 1. Health Score ──────────────────────────────────────
  const healthScore = await calculateHealthScore(userId, monthStr);

  // ── 2. Funds ─────────────────────────────────────────────
  const rawFunds = await prisma.fund.findMany({
    where: { userId, month: monthStart },
    orderBy: { fundType: 'asc' },
  });

  const funds = rawFunds.map(f => {
    const allocated = safeNumber(f.allocatedAmount);
    const spent = safeNumber(f.spentAmount);
    const remaining = Math.max(0, allocated - spent);
    return {
      fundType: f.fundType,
      allocated,
      spent,
      remaining,
      percentage: allocated > 0 ? Math.round((spent / allocated) * 100) : 0,
    };
  });

  // ── 3. Today's Daily Food Status ─────────────────────────
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const dailyFoodRaw = await prisma.dailyFoodSavings.findUnique({
    where: { userId_date: { userId, date: todayUTC } },
  });

  const dailyFoodStatus = dailyFoodRaw
    ? {
        date: todayUTC.toISOString().slice(0, 10),
        budgetMain: safeNumber(dailyFoodRaw.budgetMain),
        budgetSub: safeNumber(dailyFoodRaw.budgetSub),
        spentMain: safeNumber(dailyFoodRaw.spentMain),
        spentSub: safeNumber(dailyFoodRaw.spentSub),
        remaining: Math.max(
          0,
          safeNumber(dailyFoodRaw.budgetMain) + safeNumber(dailyFoodRaw.budgetSub)
          - safeNumber(dailyFoodRaw.spentMain) - safeNumber(dailyFoodRaw.spentSub)
          - safeNumber(dailyFoodRaw.penaltyAppliedFromYesterday)
        ),
        savedAmount: safeNumber(dailyFoodRaw.savedAmount),
      }
    : null;

  // ── 4. Top Spending Categories ────────────────────────────
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59);
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      transactionType: 'expense',
      transactionDate: { gte: monthStart, lte: monthEnd },
    },
    include: { fund: { select: { fundType: true } } },
  });

  const categoryMap = new Map<string, { fundType: string; total: number; count: number }>();
  let totalSpent = 0;

  for (const tx of transactions) {
    const key = `${tx.fund.fundType}::${tx.category}`;
    const existing = categoryMap.get(key) || { fundType: tx.fund.fundType, total: 0, count: 0 };
    existing.total += safeNumber(tx.amount);
    existing.count += 1;
    categoryMap.set(key, existing);
    totalSpent += safeNumber(tx.amount);
  }

  const topCategories: SpendingCategory[] = Array.from(categoryMap.entries())
    .map(([key, val]) => ({
      fundType: val.fundType,
      category: key.split('::')[1],
      totalAmount: val.total,
      percentage: totalSpent > 0 ? Math.round((val.total / totalSpent) * 100) : 0,
      transactionCount: val.count,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 8);

  // ── 5. Latte Factor ───────────────────────────────────────
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentExpense = await prisma.transaction.findMany({
    where: {
      userId,
      transactionType: 'expense',
      transactionDate: { gte: thirtyDaysAgo },
    },
    include: { fund: { select: { fundType: true, allocatedAmount: true } } },
  });

  const merchantMap = new Map<string, { total: number; count: number; fundType: string }>();
  for (const tx of recentExpense) {
    const name = tx.description?.split('[')[0].trim() || tx.category;
    const existing = merchantMap.get(name) || { total: 0, count: 0, fundType: tx.fund.fundType };
    existing.total += safeNumber(tx.amount);
    existing.count += 1;
    merchantMap.set(name, existing);
  }

  const experienceFund = rawFunds.find(f => f.fundType === 'experience');
  const experienceAllocated = safeNumber(experienceFund?.allocatedAmount);

  const latteFactors: LatteFactor[] = Array.from(merchantMap.entries())
    .filter(([_, v]) => v.count >= 3 && v.fundType === 'experience') // recurring purchases
    .map(([name, v]) => ({
      merchantName: name,
      totalAmount: v.total,
      frequency: v.count,
      percentOfExperience: experienceAllocated > 0 ? Math.round((v.total / experienceAllocated) * 100) : 0,
      potentialSavings: Math.round(v.total * 0.5), // could save 50% if reduced
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5);

  // ── 6. Weekly Savings Progress ────────────────────────────
  const currentWeek = await prisma.weeklyReward.findFirst({
    where: { userId },
    orderBy: { weekStart: 'desc' },
  });

  const weeklySavingsProgress = currentWeek
    ? {
        weekStart: currentWeek.weekStart.toISOString().slice(0, 10),
        weekEnd: currentWeek.weekEnd.toISOString().slice(0, 10),
        accumulated: safeNumber(currentWeek.accumulatedSavings),
        milestone: currentWeek.milestoneReached,
        isUnlocked: currentWeek.isUnlocked,
        pointsEarned: currentWeek.pointsEarned,
      }
    : null;

  // ── 7. Savings Growth Chart (last 12 fund snapshots) ─────
  const futureSnaps = await prisma.fundSnapshot.findMany({
    where: { fund: { userId, fundType: 'future' } },
    orderBy: { snapshotDate: 'asc' },
    take: 30,
    include: { fund: { select: { allocatedAmount: true } } },
  });

  const futureFundData = rawFunds.find(f => f.fundType === 'future');
  const futureAllocated = safeNumber(futureFundData?.allocatedAmount);
  const monthlyRate = 0.06 / 12; // 6% annual interest rate

  const savingsGrowth = {
    dates: futureSnaps.map(s => s.snapshotDate.toISOString().slice(0, 10)),
    balances: futureSnaps.map(s => safeNumber(s.remainingAmount)),
    projections: {
      months3: Math.round(futureAllocated * Math.pow(1 + monthlyRate, 3)),
      months6: Math.round(futureAllocated * Math.pow(1 + monthlyRate, 6)),
      months12: Math.round(futureAllocated * Math.pow(1 + monthlyRate, 12)),
    },
  };

  // ── 8. Recent Transactions ────────────────────────────────
  const recentTxs = await prisma.transaction.findMany({
    where: { userId, transactionType: 'expense' },
    orderBy: { transactionDate: 'desc' },
    take: 10,
    include: { fund: { select: { fundType: true } } },
  });

  const recentTransactions = recentTxs.map(tx => ({
    id: tx.id,
    merchant: tx.description?.split('[')[0].trim() || tx.category,
    category: tx.category,
    fundType: tx.fund.fundType,
    amount: safeNumber(tx.amount),
    date: tx.transactionDate.toISOString().slice(0, 10),
    timestamp: tx.transactionDate.toISOString(),
    type: tx.transactionType,
    inputMethod: tx.inputMethod,
  }));

  return {
    healthScore,
    funds,
    dailyFoodStatus,
    topCategories,
    latteFactors,
    weeklySavingsProgress,
    savingsGrowth,
    recentTransactions,
  };
}
