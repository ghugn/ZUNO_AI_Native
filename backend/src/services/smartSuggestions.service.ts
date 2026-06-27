// ════════════════════════════════════════════════════════════
//  SMART SUGGESTIONS SERVICE — Requirement 12
//  Analyze last 30 days patterns → Personalized recommendations
// ════════════════════════════════════════════════════════════

import prisma from '../lib/prisma.js';
import { calculateHealthScore } from './analytics.service.js';

export type SuggestionLevel = 'tip' | 'warning' | 'urgent';
export type SuggestionCategory = 'food' | 'savings' | 'overflow' | 'latte' | 'milestone' | 'general';

export interface Suggestion {
  id: string;
  level: SuggestionLevel;
  category: SuggestionCategory;
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
  metric?: {
    label: string;
    value: string;
    change?: string; // e.g. "+12%" or "-5k"
  };
}

function safeNum(v: bigint | null | undefined): number {
  return v == null ? 0 : Number(v);
}

export async function generateSuggestions(
  userId: string,
  monthStr: string,
): Promise<Suggestion[]> {
  const suggestions: Suggestion[] = [];
  const monthStart = new Date(monthStr);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // ── 1. Financial Health Score check ──────────────────────
  const fhs = await calculateHealthScore(userId, monthStr);

  if (fhs.total < 50) {
    suggestions.push({
      id: 'fhs-low',
      level: 'urgent',
      category: 'general',
      title: 'Điểm sức khoẻ tài chính thấp',
      body: `Điểm FHS của bạn là ${fhs.total}/100 (${fhs.grade}). ${fhs.summary}`,
      actionLabel: 'Xem chi tiết',
      actionHref: '/analytics',
      metric: { label: 'FHS Score', value: `${fhs.total}/100`, change: fhs.grade },
    });
  } else if (fhs.total < 70) {
    suggestions.push({
      id: 'fhs-medium',
      level: 'warning',
      category: 'general',
      title: 'Tài chính cần cải thiện',
      body: `FHS ${fhs.total}/100. ${fhs.summary}`,
      actionLabel: 'Xem Analytics',
      actionHref: '/analytics',
      metric: { label: 'FHS', value: `${fhs.total}/100` },
    });
  }

  // ── 2. Overflow events ────────────────────────────────────
  const overflowCount = await prisma.overflowEvent.count({
    where: { userId, eventDate: { gte: monthStart, lte: monthEnd } },
  });

  if (overflowCount >= 3) {
    suggestions.push({
      id: 'overflow-high',
      level: 'urgent',
      category: 'overflow',
      title: `${overflowCount} lần vượt ngưỡng tháng này`,
      body: 'Bạn đã kích hoạt Cơ chế Lố nhiều lần. Cần điều chỉnh ngân sách ngay để tránh ảnh hưởng đến quỹ khác.',
      actionLabel: 'Xem quỹ',
      actionHref: '/budgets',
      metric: { label: 'Overflow events', value: `${overflowCount} lần` },
    });
  } else if (overflowCount >= 1) {
    suggestions.push({
      id: 'overflow-low',
      level: 'warning',
      category: 'overflow',
      title: 'Đã xảy ra Cơ chế Lố',
      body: `${overflowCount} giao dịch đã vượt ngân sách. Hãy kiểm tra lại chi tiêu.`,
      actionLabel: 'Xem quỹ',
      actionHref: '/budgets',
      metric: { label: 'Overflow', value: `${overflowCount} lần` },
    });
  }

  // ── 3. Food fund overspending ─────────────────────────────
  const foodFund = await prisma.fund.findFirst({
    where: { userId, month: monthStart, fundType: 'food' },
  });

  if (foodFund) {
    const foodBudget = safeNum(foodFund.allocatedAmount);
    const foodSpent = safeNum(foodFund.spentAmount);
    const foodPct = foodBudget > 0 ? (foodSpent / foodBudget) * 100 : 0;

    if (foodPct > 90) {
      suggestions.push({
        id: 'food-critical',
        level: 'urgent',
        category: 'food',
        title: 'Quỹ Ăn uống gần cạn!',
        body: `Bạn đã dùng ${foodPct.toFixed(0)}% quỹ Food. Chỉ còn ${(foodBudget - foodSpent).toLocaleString('vi-VN')}đ cho phần còn lại của tháng.`,
        actionLabel: 'Xem Budgets',
        actionHref: '/budgets',
        metric: { label: 'Food spent', value: `${foodPct.toFixed(0)}%` },
      });
    } else if (foodPct > 75) {
      suggestions.push({
        id: 'food-warning',
        level: 'warning',
        category: 'food',
        title: 'Quỹ Ăn uống dùng nhiều',
        body: `${foodPct.toFixed(0)}% ngân sách food đã được sử dụng. Hãy ăn uống tiết kiệm hơn.`,
        metric: { label: 'Food', value: `${foodPct.toFixed(0)}%` },
      });
    }
  }

  // ── 4. Savings rate check ─────────────────────────────────
  const futureFund = await prisma.fund.findFirst({
    where: { userId, month: monthStart, fundType: 'future' },
  });

  if (futureFund) {
    const futureSpent = safeNum(futureFund.spentAmount);
    const futureBalance = safeNum(futureFund.allocatedAmount) - futureSpent;

    if (futureBalance >= 500000) {
      suggestions.push({
        id: 'savings-milestone',
        level: 'tip',
        category: 'savings',
        title: '💰 Quỹ Tương lai đủ để gửi tiết kiệm!',
        body: `Quỹ Future của bạn có ${futureBalance.toLocaleString('vi-VN')}đ. Đây là thời điểm tốt để gửi tiết kiệm và hưởng lãi suất 6.2%/năm.`,
        actionLabel: 'Xem Savings Growth',
        actionHref: '/savings',
        metric: { label: 'Future fund', value: `${(futureBalance / 1000).toFixed(0)}K ₫` },
      });
    }

    if (safeNum(futureFund.allocatedAmount) === 0) {
      suggestions.push({
        id: 'savings-zero',
        level: 'warning',
        category: 'savings',
        title: 'Chưa có ngân sách tiết kiệm',
        body: 'Quỹ Tương lai chưa được phân bổ. Hãy dành ít nhất 15-20% thu nhập cho tiết kiệm dài hạn.',
        actionLabel: 'Xem Budgets',
        actionHref: '/budgets',
      });
    }
  }

  // ── 5. Latte Factor detection ─────────────────────────────
  const recentTxs = await prisma.transaction.findMany({
    where: {
      userId,
      transactionType: 'expense',
      transactionDate: { gte: thirtyDaysAgo },
    },
    include: { fund: { select: { fundType: true } } },
  });

  // Group by merchant name
  const merchantFreq = new Map<string, { count: number; total: number; fundType: string }>();
  for (const tx of recentTxs) {
    const name = tx.description?.split('[')[0].trim() || tx.category;
    const existing = merchantFreq.get(name) || { count: 0, total: 0, fundType: tx.fund.fundType };
    existing.count += 1;
    existing.total += safeNum(tx.amount);
    merchantFreq.set(name, existing);
  }

  const latteCandidates = Array.from(merchantFreq.entries())
    .filter(([_, v]) => v.count >= 4 && v.fundType === 'experience')
    .sort((a, b) => b[1].total - a[1].total);

  if (latteCandidates.length > 0) {
    const top = latteCandidates[0];
    const [name, data] = top;
    suggestions.push({
      id: `latte-${name.replace(/\s/g, '-').toLowerCase()}`,
      level: 'tip',
      category: 'latte',
      title: `☕ Latte Factor: ${name}`,
      body: `Bạn đã mua "${name}" ${data.count} lần trong 30 ngày, tổng ${data.total.toLocaleString('vi-VN')}đ. Giảm 50% có thể tiết kiệm thêm ${(data.total * 0.5).toLocaleString('vi-VN')}đ/tháng.`,
      metric: { label: 'Tần suất', value: `${data.count} lần`, change: `${data.total.toLocaleString('vi-VN')}đ` },
    });
  }

  // ── 6. Weekly reward tip ──────────────────────────────────
  const weeklyReward = await prisma.weeklyReward.findFirst({
    where: { userId },
    orderBy: { weekStart: 'desc' },
  });

  if (weeklyReward && !weeklyReward.isUnlocked) {
    const accumulated = safeNum(weeklyReward.accumulatedSavings);
    const target = parseInt(weeklyReward.milestoneReached?.replace(/\D/g, '') || '100', 10) * 1000;
    const pct = target > 0 ? Math.round((accumulated / target) * 100) : 0;

    if (pct >= 70 && pct < 100) {
      suggestions.push({
        id: 'reward-close',
        level: 'tip',
        category: 'milestone',
        title: '🎁 Sắp đạt mốc thưởng tuần!',
        body: `Bạn đã đạt ${pct}% mục tiêu tiết kiệm tuần. Tiết kiệm thêm một chút nữa để mở khóa phần thưởng!`,
        metric: { label: 'Weekly progress', value: `${pct}%` },
      });
    }
  }

  // Return max 5 suggestions, urgent first
  const priority: Record<SuggestionLevel, number> = { urgent: 0, warning: 1, tip: 2 };
  return suggestions
    .sort((a, b) => priority[a.level] - priority[b.level])
    .slice(0, 5);
}
