// ════════════════════════════════════════════════════════════
//  PRE-SPENDING ALERT SERVICE
//  Evaluate budget status BEFORE a transaction occurs
//  Requirement 3: Alert when spending will exceed fund budget
// ════════════════════════════════════════════════════════════

import prisma from '../lib/prisma.js';
import { categorizeTransaction } from './smartCategorizer.service.js';

export interface PreSpendingAlertResult {
  shouldAlert: boolean;
  level: 'safe' | 'warning' | 'danger' | 'critical';
  fundType: string;
  category: string;
  remainingBudget: number;
  overflowAmount: number;
  overflowPercent: number;
  currentSpent: number;
  monthBudget: number;
  suggestion: string;
  alternativeFund?: {
    fundType: string;
    available: number;
  };
}

/**
 * Evaluate whether a proposed transaction will exceed the user's fund budget.
 * Called BEFORE committing a transaction to give the user a chance to reconsider.
 */
export async function evaluatePreSpending(params: {
  userId: string;
  merchantName: string;
  amount: number;
  bankCategory?: string;
  description?: string;
}): Promise<PreSpendingAlertResult> {
  const { userId, merchantName, amount, bankCategory, description } = params;

  // 1. Categorize the transaction using the smart categorizer
  const categorization = await categorizeTransaction({
    merchantName,
    description,
    amount,
    bankCategory,
  });

  const { fundType, category } = categorization;

  // 2. Get the current month's fund for this category
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));

  const fund = await prisma.fund.findFirst({
    where: {
      userId,
      fundType,
      month: monthStart,
    },
  });

  // No fund found — alert as safe but with note
  if (!fund) {
    return {
      shouldAlert: false,
      level: 'safe',
      fundType,
      category,
      remainingBudget: 0,
      overflowAmount: 0,
      overflowPercent: 0,
      currentSpent: 0,
      monthBudget: 0,
      suggestion: 'Chưa có quỹ cho tháng này. Giao dịch sẽ tự tạo quỹ mới.',
    };
  }

  const monthBudget   = Number(fund.allocatedAmount);
  const currentSpent  = Number(fund.spentAmount);
  const remaining     = monthBudget - currentSpent;
  const newSpent      = currentSpent + amount;
  const overflowAmt   = Math.max(0, newSpent - monthBudget);
  const overflowPct   = monthBudget > 0 ? (overflowAmt / monthBudget) * 100 : 0;

  // 3. Determine alert level
  let level: PreSpendingAlertResult['level'] = 'safe';
  let shouldAlert = false;
  let suggestion = '';

  if (overflowAmt > 0) {
    // Will overflow
    shouldAlert = true;
    if (overflowPct >= 30) {
      level = 'critical';
      suggestion = `Giao dịch này vượt ngân sách ${fundType} đến ${overflowPct.toFixed(0)}%! Cân nhắc hoãn chi tiêu hoặc chuyển sang quỹ khác.`;
    } else if (overflowPct >= 15) {
      level = 'danger';
      suggestion = `Giao dịch này sẽ vượt quỹ ${fundType} ${overflowPct.toFixed(0)}%. Cơ chế Lố có thể được kích hoạt.`;
    } else {
      level = 'warning';
      suggestion = `Giao dịch này sẽ vượt nhẹ quỹ ${fundType}. Bạn vẫn có thể thực hiện nhưng hãy chú ý chi tiêu.`;
    }
  } else if (remaining - amount < monthBudget * 0.1) {
    // Less than 10% budget remaining after this tx
    shouldAlert = true;
    level = 'warning';
    suggestion = `Sau giao dịch này, quỹ ${fundType} chỉ còn ${((remaining - amount) / monthBudget * 100).toFixed(0)}%. Hãy chi tiêu cẩn thận.`;
  } else {
    suggestion = `Giao dịch an toàn. Quỹ ${fundType} còn ${remaining.toLocaleString('vi-VN')}đ sau chi tiêu này.`;
  }

  // 4. Find an alternative fund with more room (for suggestions)
  let alternativeFund: PreSpendingAlertResult['alternativeFund'] | undefined;
  if (shouldAlert) {
    const otherFunds = await prisma.fund.findMany({
      where: {
        userId,
        month: monthStart,
        fundType: { not: fundType },
      },
    });

    const bestAlternative = otherFunds
      .map(f => ({
        fundType: f.fundType,
        available: Number(f.allocatedAmount) - Number(f.spentAmount),
      }))
      .filter(f => f.available > amount)
      .sort((a, b) => b.available - a.available)[0];

    if (bestAlternative) {
      alternativeFund = bestAlternative;
    }
  }

  return {
    shouldAlert,
    level,
    fundType,
    category,
    remainingBudget: Math.max(0, remaining),
    overflowAmount: overflowAmt,
    overflowPercent: overflowPct,
    currentSpent,
    monthBudget,
    suggestion,
    alternativeFund,
  };
}
