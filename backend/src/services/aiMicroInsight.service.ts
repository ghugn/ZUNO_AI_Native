import prisma from '../lib/prisma.js';

type InsightSeverity = 'warning' | 'danger';
type OverflowLevel = 'level_1' | 'level_2' | 'level_3';

export type AiMicroInsight = {
  id: string;
  date: string;
  severity: InsightSeverity;
  overflowLevel: OverflowLevel;
  overflowAmount: number;
  reason: string;
  message: string;
  actionLabel: string;
  actionHref: string;
};

function formatDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function addDays(value: string, days: number) {
  const date = parseDateOnly(value);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDateOnly(date);
}

function getWeekStart(value: string | Date = new Date()) {
  const date = typeof value === 'string' ? parseDateOnly(value) : new Date(value);
  const dayIndex = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayIndex);
  return formatDateOnly(date);
}

function getCurrentWeekMockInsights(): AiMicroInsight[] {
  const weekStart = getWeekStart(new Date());
  return [
    {
      id: `ai_micro_${weekStart}_0`,
      date: addDays(weekStart, 0),
      severity: 'warning',
      overflowLevel: 'level_1',
      overflowAmount: 36000,
      reason: 'ăn sáng và cà phê',
      message: 'Bạn tiêu lố 36k do ăn sáng và cà phê. Giảm nhẹ bữa phụ hôm sau là đủ quay về nhịp an toàn.',
      actionLabel: 'Details',
      actionHref: '/notifications',
    },
    {
      id: `ai_micro_${weekStart}_1`,
      date: addDays(weekStart, 1),
      severity: 'warning',
      overflowLevel: 'level_1',
      overflowAmount: 42000,
      reason: 'ăn ngoài và đồ uống',
      message: 'Bạn tiêu lố 42k do ăn ngoài và đồ uống. Giảm 14k/ngày trong 3 ngày tới là đủ kéo Food về vùng an toàn.',
      actionLabel: 'Xem đề xuất điều chỉnh',
      actionHref: '/notifications',
    },
    {
      id: `ai_micro_${weekStart}_2`,
      date: addDays(weekStart, 2),
      severity: 'danger',
      overflowLevel: 'level_2',
      overflowAmount: 120000,
      reason: 'ăn ngoài',
      message: 'Bạn tiêu lố 120k do ăn ngoài. ZUNO gợi ý giảm bữa chính ngày mai để giữ streak tuần này.',
      actionLabel: 'Details',
      actionHref: '/notifications',
    },
    {
      id: `ai_micro_${weekStart}_3`,
      date: addDays(weekStart, 3),
      severity: 'warning',
      overflowLevel: 'level_1',
      overflowAmount: 68000,
      reason: 'đặt đồ ăn khuya',
      message: 'Bạn lố 68k vì đặt đồ ăn khuya. ZUNO gợi ý chuyển bữa phụ ngày mai về 20k để không chạm quỹ dự phòng.',
      actionLabel: 'Xem chi tiết nguyên nhân',
      actionHref: '/notifications',
    },
    {
      id: `ai_micro_${weekStart}_4`,
      date: addDays(weekStart, 4),
      severity: 'warning',
      overflowLevel: 'level_1',
      overflowAmount: 54000,
      reason: 'Food and Drinks',
      message: 'Bạn tiêu lố 54k cho Food and Drinks. Dời một bữa phụ sang ngày mai sẽ giúp cân lại ngân sách.',
      actionLabel: 'Details',
      actionHref: '/notifications',
    },
    {
      id: `ai_micro_${weekStart}_5`,
      date: addDays(weekStart, 5),
      severity: 'danger',
      overflowLevel: 'level_2',
      overflowAmount: 120000,
      reason: 'ăn ngoài cuối tuần',
      message: 'Bạn tiêu lố 120k vào cuối tuần do ăn ngoài. Nếu giữ bữa chính dưới 55k hôm sau, tuần này vẫn có thể giữ streak.',
      actionLabel: 'Mở phân tích tối ưu',
      actionHref: '/notifications',
    },
  ];
}

function formatMoneyShort(amount: number) {
  if (amount >= 1000000) {
    return `${Number((amount / 1000000).toFixed(1)).toLocaleString('vi-VN')}M`;
  }
  return `${Math.round(amount / 100).toLocaleString('vi-VN')}k`;
}

function normalizeOverflowLevel(value: string): OverflowLevel {
  if (value === 'level_2' || value === 'level_3') {
    return value;
  }
  return 'level_1';
}

function buildInsightFromOverflow(overflow: {
  id: string;
  eventDate: Date;
  overflowLevel: string;
  overflowAmount: bigint | number;
  transaction?: { description: string | null; category: string } | null;
}): AiMicroInsight {
  const amount = Number(overflow.overflowAmount);
  const date = formatDateOnly(overflow.eventDate);
  const overflowLevel = normalizeOverflowLevel(overflow.overflowLevel);
  const isDanger = overflowLevel === 'level_2' || overflowLevel === 'level_3';
  const reason = overflow.transaction?.description || overflow.transaction?.category || 'chi tiêu vượt nhịp';

  return {
    id: `ai_micro_${overflow.id}`,
    date,
    severity: isDanger ? 'danger' : 'warning',
    overflowLevel,
    overflowAmount: amount,
    reason,
    message: `Bạn tiêu lố ${formatMoneyShort(amount)} do ${reason}. ZUNO gợi ý xem lại phân bổ Food để giữ tuần này trong vùng an toàn.`,
    actionLabel: isDanger ? 'Mở phân tích tối ưu' : 'Xem đề xuất điều chỉnh',
    actionHref: '/notifications',
  };
}

export async function getAiMicroInsights(userId: string, weekStartInput?: string) {
  const weekStart = weekStartInput || getWeekStart(new Date());
  const weekEnd = addDays(weekStart, 6);
  const overflows = await prisma.overflowEvent.findMany({
    where: {
      userId,
      eventDate: {
        gte: parseDateOnly(weekStart),
        lte: parseDateOnly(weekEnd),
      },
    },
    include: {
      transaction: {
        select: {
          description: true,
          category: true,
        },
      },
    },
    orderBy: { eventDate: 'asc' },
  });

  const fromData = overflows.map((overflow) => buildInsightFromOverflow(overflow));
  const fromDataDates = new Set(fromData.map((insight) => insight.date));
  const mockForCurrentWeek = weekStart === getWeekStart(new Date())
    ? getCurrentWeekMockInsights().filter((insight) => !fromDataDates.has(insight.date))
    : [];

  return [...fromData, ...mockForCurrentWeek].sort((left, right) => left.date.localeCompare(right.date));
}

export async function getAiMicroInsightByDate(userId: string, date: string) {
  const insights = await getAiMicroInsights(userId, getWeekStart(date));
  return insights.find((insight) => insight.date === date) ?? null;
}
