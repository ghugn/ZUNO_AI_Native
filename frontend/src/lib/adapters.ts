import type {
  BudgetAllocation,
  CalendarDay,
  CategoryOption,
  FundType,
  HomeScreenData,
  NotificationViewModel,
  OverflowLevel,
  OverflowResult,
  ParsedTransactionDraft,
  ProfileViewModel,
  RawAiParseLog,
  RawDailyFood,
  RawFund,
  RawOverflow,
  RawOverflowResponse,
  RawProfile,
  RawRewardPoints,
  RawTag,
  RawTransaction,
  RawWeeklyReward,
  RewardSummary,
  TodayFoodWrap,
  TransactionItem,
} from "@/types/zuno";

const FUND_LABELS: Record<FundType, string> = {
  living: "Fixed bill",
  food: "Food and Drinks",
  growth: "Development",
  experience: "Experience",
  future: "Savings",
};

const OVERFLOW_SEVERITY: Record<OverflowLevel, NotificationViewModel["severity"]> = {
  level_1: "warning",
  level_2: "warning",
  level_3: "danger",
};

export function toNumber(value: unknown, fallback = 0) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (typeof value === "string") {
    const normalized = value.replace(/[,_\s]/g, "");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

export function getMonthStart(value: string | Date = new Date()) {
  const date = typeof value === "string" ? parseDate(value) : value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
}

export function getDateOnly(value: string | Date = new Date()) {
  const date = typeof value === "string" ? parseDate(value) : value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function getWeekStart(value: string | Date = new Date()) {
  const date = typeof value === "string" ? parseDate(value) : new Date(value);
  const dayIndex = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - dayIndex);
  return getDateOnly(date);
}

export function parseDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(value);
}

export function adaptProfile(profile: RawProfile | null | undefined): ProfileViewModel | null {
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    userId: profile.userId,
    residenceType: profile.residenceType,
    bankBalance: toNumber(profile.bankBalance),
    onboardingCompleted: profile.onboardingCompleted,
    dormPaidSemester: profile.dormPaidSemester,
    hasFoodFromFamily: profile.hasFoodFromFamily,
  };
}

export function adaptFund(fund: RawFund): BudgetAllocation {
  const allocatedAmount = toNumber(fund.allocatedAmount);
  const spentAmount = toNumber(fund.spentAmount);

  return {
    id: fund.id,
    fundType: fund.fundType,
    label: FUND_LABELS[fund.fundType],
    month: fund.month,
    allocatedAmount,
    spentAmount,
    remainingAmount: allocatedAmount + toNumber(fund.borrowAmount) - spentAmount,
    percentage: fund.allocatedPercent !== undefined && fund.allocatedPercent !== null
      ? toNumber(fund.allocatedPercent)
      : toNumber(fund.customPercentage),
    borrowAmount: toNumber(fund.borrowAmount),
    isLocked: fund.isLocked,
  };
}

export function adaptFunds(funds: RawFund[]) {
  return funds.map(adaptFund);
}

export function adaptTag(tag: RawTag): CategoryOption {
  return {
    id: tag.id,
    name: tag.name,
    fundType: tag.fundType,
    iconUrl: tag.iconUrl,
  };
}

export function adaptTags(tags: RawTag[]) {
  return tags.map(adaptTag);
}

export function adaptOverflowResult(overflow?: RawOverflowResponse): OverflowResult | undefined {
  if (!overflow) {
    return undefined;
  }

  return {
    totalOverspent: toNumber(overflow.totalOverspent),
    highestLevel: overflow.highestLevel,
    actions: overflow.actions.map((action) => ({
      level: action.level,
      amount: toNumber(action.amount),
      source: action.source,
      description: action.description,
    })),
  };
}

export function adaptTransaction(transaction: RawTransaction, funds: RawFund[] = []): TransactionItem {
  const fund = funds.find((item) => item.id === transaction.fundId);

  return {
    id: transaction.id,
    fundId: transaction.fundId,
    targetFundId: transaction.targetFundId ?? null,
    amount: toNumber(transaction.amount),
    type: transaction.transactionType,
    category: transaction.category,
    description: transaction.description ?? transaction.category,
    inputMethod: transaction.inputMethod,
    mealType: transaction.mealType,
    date: getDateOnly(transaction.transactionDate),
    timestamp: transaction.transactionDate,
    fundType: fund?.fundType ?? null,
    overflow: adaptOverflowResult(transaction.overflow),
  };
}

export function adaptTransactions(transactions: RawTransaction[], funds: RawFund[] = []) {
  return [...transactions]
    .sort((left, right) => Date.parse(right.transactionDate) - Date.parse(left.transactionDate))
    .map((transaction) => adaptTransaction(transaction, funds));
}

export function adaptDailyFood(record: RawDailyFood): TodayFoodWrap {
  const budgetMain = toNumber(record.budgetMain);
  const budgetSub = toNumber(record.budgetSub);
  const spentMain = toNumber(record.spentMain);
  const spentSub = toNumber(record.spentSub);
  const penalty = toNumber(record.penaltyAppliedFromYesterday);
  const budgetAmount = Math.max(0, budgetMain + budgetSub - penalty);
  const spentAmount = spentMain + spentSub;
  const overflowAmount = toNumber(record.dailyOverflow);

  return {
    date: record.date,
    budgetMain,
    budgetSub: Math.max(0, budgetSub - penalty),
    spentMain,
    spentSub,
    savedAmount: toNumber(record.savedAmount),
    overflowAmount,
    budgetAmount,
    remainingAmount: Math.max(0, budgetAmount - spentAmount),
    status: overflowAmount > 0 ? "overspent" : "safe",
  };
}

function getCalendarStatus(record: RawDailyFood, overflows: RawOverflow[]): CalendarDay["status"] {
  const overflowLevels = overflows.filter((item) => item.eventDate === record.date).map((item) => item.overflowLevel);
  if (overflowLevels.includes("level_3")) {
    return "overspendLevel3";
  }
  if (overflowLevels.includes("level_2")) {
    return "overspendLevel2";
  }
  if (overflowLevels.includes("level_1") || toNumber(record.dailyOverflow) > 0) {
    return "overspendLevel1";
  }
  if (toNumber(record.spentMain) === 0 && toNumber(record.spentSub) === 0) {
    return "noData";
  }
  return "safe";
}

export function adaptCalendarDay(record: RawDailyFood, overflows: RawOverflow[] = []): CalendarDay {
  const budgetAmount = toNumber(record.budgetMain) + toNumber(record.budgetSub) - toNumber(record.penaltyAppliedFromYesterday);
  const spentAmount = toNumber(record.spentMain) + toNumber(record.spentSub);

  return {
    date: record.date,
    budgetAmount,
    spentAmount,
    savedAmount: toNumber(record.savedAmount),
    overflowAmount: toNumber(record.dailyOverflow),
    status: getCalendarStatus(record, overflows),
  };
}

export function adaptCalendarMonth(records: RawDailyFood[], overflows: RawOverflow[] = []) {
  return records.map((record) => adaptCalendarDay(record, overflows));
}

export function adaptRewardSummary(points: RawRewardPoints | null, weeklyReward: RawWeeklyReward | null): RewardSummary | null {
  if (!points && !weeklyReward) {
    return null;
  }

  return {
    totalPoints: points?.total ?? 0,
    multiplier: toNumber(points?.multiplier, 1),
    weeklySavings: toNumber(weeklyReward?.accumulatedSavings),
    weeklyMilestone: weeklyReward?.milestoneReached ?? null,
    weeklyPointsEarned: weeklyReward?.pointsEarned ?? 0,
    isWeeklyUnlocked: weeklyReward?.isUnlocked ?? false,
    streak: points?.streak ?? 0,
  };
}

export function adaptOverflowNotification(overflow: RawOverflow, transactions: RawTransaction[] = []): NotificationViewModel {
  const amount = toNumber(overflow.overflowAmount);
  const transaction = transactions.find((item) => item.id === overflow.transactionId);
  const penaltyPerDay = toNumber(overflow.penaltyApplied?.penaltyPerDay);
  const actionLabel = overflow.status === "repaid" || overflow.status === "resolved"
    ? undefined
    : overflow.overflowLevel === "level_1"
      ? "Confirm changes"
      : overflow.status === "pending" || overflow.status === "partial"
        ? "Action required"
        : undefined;

  return {
    id: overflow.id,
    kind: "Alerts",
    title: "Overspent Alert",
    message: `${overflow.eventDate} overspent ${amount.toLocaleString("vi-VN")} VND from ${FUND_LABELS[overflow.sourceFundType]}.`,
    date: overflow.eventDate,
    time: transaction?.transactionDate ?? overflow.eventDate,
    severity: OVERFLOW_SEVERITY[overflow.overflowLevel],
    actionLabel,
    tag: overflow.overflowLevel.replace("_", " ").replace("level", "Level"),
    overflowLevel: overflow.overflowLevel,
    overflowAmount: amount,
    transactionAmount: toNumber(transaction?.amount),
    penaltyPerDay,
  };
}

export function adaptRewardNotification(reward: RawWeeklyReward): NotificationViewModel {
  return {
    id: reward.id,
    kind: "Rewards",
    title: reward.isUnlocked ? "Weekly Reward Earned" : "Weekly Reward Progress",
    message: (toNumber(reward.accumulatedSavings) === 0 && reward.pointsEarned === 0)
      ? "Link your bank app and make your first transaction to earn Weekly Rewards!"
      : `You saved ${toNumber(reward.accumulatedSavings).toLocaleString("vi-VN")} VND and earned ${reward.pointsEarned} coins.`,
    date: reward.weekStart,
    time: reward.weekStart,
    severity: reward.isUnlocked ? "success" : "info",
    tag: reward.milestoneReached ?? undefined,
  };
}

export function adaptAiLogNotification(log: RawAiParseLog): NotificationViewModel {
  const amount = log.parsedAmount === null ? null : toNumber(log.parsedAmount);
  const amountText = amount === null ? "" : ` for ${amount.toLocaleString("vi-VN")} VND`;

  return {
    id: log.id,
    kind: "System",
    title: log.transactionId ? "AI Parse Confirmed" : "AI Parse Draft",
    message: `Parsed "${log.rawInput}" as ${log.parsedCategory}${amountText}.`,
    date: getDateOnly(log.createdAt),
    time: log.createdAt,
    severity: log.transactionId ? "success" : "info",
  };
}

export function adaptNotifications(overflows: RawOverflow[], pendingOverflows: RawOverflow[], rewards: RawWeeklyReward[], aiLogs: RawAiParseLog[] = [], transactions: RawTransaction[] = []) {
  const pendingIds = new Set(pendingOverflows.map((overflow) => overflow.id));
  const overflowNotifications = overflows
    .filter((overflow) => overflow.status !== "resolved" && overflow.status !== "repaid")
    .map((overflow) => adaptOverflowNotification(overflow, transactions));
  const rewardNotifications = rewards.filter(r => r.isUnlocked).map(adaptRewardNotification);
  const aiNotifications = aiLogs.map(adaptAiLogNotification);

  return [...overflowNotifications, ...rewardNotifications, ...aiNotifications].sort((left, right) => Date.parse(right.time) - Date.parse(left.time));
}

export function adaptAiParseLog(log: RawAiParseLog): ParsedTransactionDraft {
  return {
    logId: log.id,
    rawInput: log.rawInput,
    entity: log.parsedEntity,
    amount: log.parsedAmount === null ? null : toNumber(log.parsedAmount),
    category: log.parsedCategory,
    createdAt: log.createdAt,
  };
}

export function summarizeHomeData(input: {
  profile?: RawProfile | null;
  funds: RawFund[];
  transactions: RawTransaction[];
  dailyFood?: RawDailyFood | null;
  points?: RawRewardPoints | null;
  weeklyReward?: RawWeeklyReward | null;
  date: string;
  month: string;
}): HomeScreenData {
  const allocations = adaptFunds(input.funds);
  const totalBudget = allocations.reduce((sum, item) => sum + item.allocatedAmount, 0);
  const totalSpent = allocations.reduce((sum, item) => sum + item.spentAmount, 0);

  return {
    profile: adaptProfile(input.profile),
    month: input.month,
    date: input.date,
    totalBudget,
    totalSpent,
    totalRemaining: totalBudget - totalSpent,
    allocations,
    todayFood: input.dailyFood ? adaptDailyFood(input.dailyFood) : null,
    recentTransactions: adaptTransactions(input.transactions, input.funds).slice(0, 5),
    rewardSummary: adaptRewardSummary(input.points ?? null, input.weeklyReward ?? null),
  };
}
