import { ApiError, apiClient } from "@/lib/apiClient";
import {
  adaptAiParseLog,
  adaptCalendarMonth,
  adaptDailyFood,
  adaptFunds,
  adaptNotifications,
  adaptTags,
  adaptTransaction,
  adaptTransactions,
  getDateOnly,
  getMonthStart,
  getWeekStart,
  summarizeHomeData,
  toNumber,
} from "@/lib/adapters";
import type {
  BudgetScreenData,
  CalendarMonthData,
  FundType,
  HomeScreenData,
  NotificationViewModel,
  OverflowLevel,
  ParsedTransactionDraft,
  RawAiParseLog,
  RawDailyFood,
  RawFund,
  RawFundTemplate,
  RawOverflow,
  RawProfile,
  RawRewardPoints,
  RawTag,
  RawTransaction,
  RawWeeklyReward,
  RawPersonalWallet,
  PersonalWalletViewModel,
  RawZunoDatabase,
  TransactionFormState,
  TransactionItem,
  TransactionSetupData,
  TransactionType,
} from "@/types/zuno";

const USE_MOCK = process.env.NEXT_PUBLIC_API_MODE === "memory-mock";

const MOCK_DB: RawZunoDatabase = {
  profile: {
    id: "profile_demo",
    userId: "user_demo",
    residenceType: "dorm",
    bankBalance: "5000000",
    dormPaidSemester: false,
    hasFoodFromFamily: false,
    onboardingCompleted: true,
    createdAt: "2026-04-01T00:00:00.000Z",
  },
  fundTemplates: [
    {
      id: "template-rent",
      name: "Student renting room",
      residenceType: "rent",
      livingPct: "40.00",
      foodPct: "20.00",
      growthPct: "15.00",
      experiencePct: "10.00",
      futurePct: "15.00",
      isDefault: true,
    },
    {
      id: "template-dorm",
      name: "Student in dorm",
      residenceType: "dorm",
      livingPct: "7.50",
      foodPct: "65.00",
      growthPct: "10.00",
      experiencePct: "7.50",
      futurePct: "10.00",
      isDefault: true,
    },
  ],
  funds: [
    {
      id: "fund_living_2026_04",
      userId: "user_demo",
      month: "2026-04-01",
      fundType: "living",
      allocatedAmount: "375000",
      spentAmount: "120000",
      customPercentage: "7.50",
      borrowAmount: "0",
      isLocked: false,
      version: 1,
      createdAt: "2026-04-01T00:00:00.000Z",
      updatedAt: "2026-04-20T00:00:00.000Z",
    },
    {
      id: "fund_food_2026_04",
      userId: "user_demo",
      month: "2026-04-01",
      fundType: "food",
      allocatedAmount: "3250000",
      spentAmount: "1820000",
      customPercentage: "65.00",
      borrowAmount: "0",
      isLocked: false,
      version: 1,
      createdAt: "2026-04-01T00:00:00.000Z",
      updatedAt: "2026-04-26T08:31:00.000Z",
    },
    {
      id: "fund_growth_2026_04",
      userId: "user_demo",
      month: "2026-04-01",
      fundType: "growth",
      allocatedAmount: "500000",
      spentAmount: "175000",
      customPercentage: "10.00",
      borrowAmount: "0",
      isLocked: false,
      version: 1,
      createdAt: "2026-04-01T00:00:00.000Z",
      updatedAt: "2026-04-20T00:00:00.000Z",
    },
    {
      id: "fund_experience_2026_04",
      userId: "user_demo",
      month: "2026-04-01",
      fundType: "experience",
      allocatedAmount: "375000",
      spentAmount: "210000",
      customPercentage: "7.50",
      borrowAmount: "0",
      isLocked: false,
      version: 1,
      createdAt: "2026-04-01T00:00:00.000Z",
      updatedAt: "2026-04-24T00:00:00.000Z",
    },
    {
      id: "fund_future_2026_04",
      userId: "user_demo",
      month: "2026-04-01",
      fundType: "future",
      allocatedAmount: "500000",
      spentAmount: "0",
      customPercentage: "10.00",
      borrowAmount: "0",
      isLocked: true,
      version: 1,
      createdAt: "2026-04-01T00:00:00.000Z",
      updatedAt: "2026-04-20T00:00:00.000Z",
    },
  ],
  tags: [
    { id: "tag_food_drinks", name: "Food and Drinks", fundType: "food", iconUrl: null, isSystem: true, userId: null },
    { id: "tag_experience", name: "Experience", fundType: "experience", iconUrl: null, isSystem: true, userId: null },
    { id: "tag_development", name: "Development", fundType: "growth", iconUrl: null, isSystem: true, userId: null },
    { id: "tag_fixed_bill", name: "Fixed bill", fundType: "living", iconUrl: null, isSystem: true, userId: null },
    { id: "tag_savings", name: "Savings", fundType: "future", iconUrl: null, isSystem: true, userId: null },
  ],
  transactions: [
    {
      id: "tx_001",
      userId: "user_demo",
      fundId: "fund_food_2026_04",
      amount: "65000",
      transactionType: "expense",
      category: "Food and Drinks",
      description: "Bun cha",
      inputMethod: "manual",
      aiConfidence: null,
      isAiCorrected: false,
      mealType: "main",
      transactionDate: "2026-04-26T08:30:00.000Z",
      createdAt: "2026-04-26T08:31:00.000Z",
    },
    {
      id: "tx_002",
      userId: "user_demo",
      fundId: "fund_future_2026_04",
      amount: "3000000",
      transactionType: "income",
      category: "Savings",
      description: "Monthly allowance",
      inputMethod: "manual",
      aiConfidence: null,
      isAiCorrected: false,
      mealType: null,
      transactionDate: "2026-04-25T21:30:00.000Z",
      createdAt: "2026-04-25T21:31:00.000Z",
    },
    {
      id: "tx_003",
      userId: "user_demo",
      fundId: "fund_experience_2026_04",
      amount: "100000",
      transactionType: "expense",
      category: "Experience",
      description: "Movie night",
      inputMethod: "manual",
      aiConfidence: null,
      isAiCorrected: false,
      mealType: null,
      transactionDate: "2026-04-24T20:00:00.000Z",
      createdAt: "2026-04-24T20:01:00.000Z",
    },
    {
      id: "tx_overspend",
      userId: "user_demo",
      fundId: "fund_food_2026_04",
      amount: "2000000",
      transactionType: "expense",
      category: "Food and Drinks",
      description: "Group dinner",
      inputMethod: "manual",
      aiConfidence: null,
      isAiCorrected: false,
      mealType: "main",
      transactionDate: "2026-04-22T10:30:00.000Z",
      createdAt: "2026-04-22T10:31:00.000Z",
    },
    {
      id: "tx_level_1_0403",
      userId: "user_demo",
      fundId: "fund_food_2026_04",
      amount: "116000",
      transactionType: "expense",
      category: "Food and Drinks",
      description: "Lunch and snacks",
      inputMethod: "manual",
      aiConfidence: null,
      isAiCorrected: false,
      mealType: "sub",
      transactionDate: "2026-04-03T10:30:00.000Z",
      createdAt: "2026-04-03T10:31:00.000Z",
    },
    {
      id: "tx_level_2_0410",
      userId: "user_demo",
      fundId: "fund_food_2026_04",
      amount: "163000",
      transactionType: "expense",
      category: "Food and Drinks",
      description: "Dinner with friends",
      inputMethod: "manual",
      aiConfidence: null,
      isAiCorrected: false,
      mealType: "main",
      transactionDate: "2026-04-10T10:30:00.000Z",
      createdAt: "2026-04-10T10:31:00.000Z",
    },
    {
      id: "tx_level_1_demo",
      userId: "user_demo",
      fundId: "fund_food_2026_04",
      amount: "122000",
      transactionType: "expense",
      category: "Food and Drinks",
      description: "Food delivery",
      inputMethod: "manual",
      aiConfidence: null,
      isAiCorrected: false,
      mealType: "main",
      transactionDate: "2026-04-25T10:30:00.000Z",
      createdAt: "2026-04-25T10:31:00.000Z",
    },
  ],
  dailyFood: [
    makeDailyFood("2026-04-01", "76000", "33000", "54000", "12000", "43000", "0"),
    makeDailyFood("2026-04-03", "76000", "33000", "82000", "34000", "0", "7000"),
    makeDailyFood("2026-04-05", "76000", "33000", "60000", "14000", "35000", "0"),
    makeDailyFood("2026-04-10", "76000", "33000", "122000", "41000", "0", "54000"),
    makeDailyFood("2026-04-15", "76000", "33000", "70000", "15000", "24000", "0"),
    makeDailyFood("2026-04-18", "76000", "33000", "79000", "36000", "0", "6000"),
    makeDailyFood("2026-04-21", "76000", "33000", "65000", "10000", "34000", "0"),
    makeDailyFood("2026-04-22", "76000", "33000", "2000000", "0", "0", "1891000"),
    makeDailyFood("2026-04-23", "76000", "33000", "105000", "45000", "0", "41000"),
    makeDailyFood("2026-04-24", "76000", "33000", "60000", "18000", "31000", "0"),
    makeDailyFood("2026-04-25", "76000", "33000", "80000", "42000", "0", "13000"),
    makeDailyFood("2026-04-26", "76000", "33000", "65000", "12000", "32000", "0"),
  ],
  weeklyRewards: [
    {
      id: "reward_week_2026_03_30",
      userId: "user_demo",
      weekStart: "2026-03-30",
      weekEnd: "2026-04-05",
      accumulatedSavings: "95000",
      milestoneReached: "75k",
      isUnlocked: true,
      unlockedAt: "2026-04-05T22:00:00.000Z",
      pointsEarned: 35,
    },
    {
      id: "reward_week_2026_04_06",
      userId: "user_demo",
      weekStart: "2026-04-06",
      weekEnd: "2026-04-12",
      accumulatedSavings: "120000",
      milestoneReached: "100k",
      isUnlocked: true,
      unlockedAt: "2026-04-12T21:00:00.000Z",
      pointsEarned: 45,
    },
    {
      id: "reward_week_2026_04_13",
      userId: "user_demo",
      weekStart: "2026-04-13",
      weekEnd: "2026-04-19",
      accumulatedSavings: "88000",
      milestoneReached: "75k",
      isUnlocked: true,
      unlockedAt: "2026-04-19T20:30:00.000Z",
      pointsEarned: 30,
    },
    {
      id: "reward_week_2026_04_20",
      userId: "user_demo",
      weekStart: "2026-04-20",
      weekEnd: "2026-04-26",
      accumulatedSavings: "180000",
      milestoneReached: "150k",
      isUnlocked: false,
      unlockedAt: null,
      pointsEarned: 70,
    },
  ],
  rewardPoints: {
    id: "points_demo",
    userId: "user_demo",
    total: 420,
    multiplier: "1.00",
    updatedAt: "2026-04-26T00:00:00.000Z",
  },
  overflows: [
    {
      id: "overflow_000",
      userId: "user_demo",
      transactionId: "tx_level_1_0403",
      eventDate: "2026-04-03",
      overflowLevel: "level_1",
      overflowAmount: "7000",
      sourceFundType: "food",
      borrowedFromFundType: null,
      repaidAmount: "0",
      status: "repaid",
      penaltyApplied: { penaltyPerDay: "259", daysAffected: 27 },
    },
    {
      id: "overflow_000b",
      userId: "user_demo",
      transactionId: "tx_level_2_0410",
      eventDate: "2026-04-10",
      overflowLevel: "level_2",
      overflowAmount: "54000",
      sourceFundType: "food",
      borrowedFromFundType: "experience",
      repaidAmount: "0",
      status: "pending",
      penaltyApplied: null,
    },
    {
      id: "overflow_001",
      userId: "user_demo",
      transactionId: "tx_overspend",
      eventDate: "2026-04-22",
      overflowLevel: "level_3",
      overflowAmount: "1891000",
      sourceFundType: "food",
      borrowedFromFundType: "future",
      repaidAmount: "0",
      status: "pending",
      penaltyApplied: { lockWeeklyChest: true, multiplierDeduction: 0.1, previousMultiplier: 1, newMultiplier: 0.9, borrowedAmount: "1891000" },
    },
    {
      id: "overflow_002",
      userId: "user_demo",
      transactionId: "tx_level_1_demo",
      eventDate: "2026-04-25",
      overflowLevel: "level_1",
      overflowAmount: "13000",
      sourceFundType: "food",
      borrowedFromFundType: null,
      repaidAmount: "0",
      status: "repaid",
      penaltyApplied: { penaltyPerDay: "2600", daysAffected: 5 },
    },
  ],
  aiLogs: [
    {
      id: "ai_log_pending",
      userId: "user_demo",
      transactionId: null,
      rawInput: "tra da 10k",
      parsedEntity: "tra da",
      parsedAmount: "10000",
      parsedCategory: "Food and Drinks",
      userCorrection: null,
      createdAt: "2026-04-26T08:00:00.000Z",
    },
    {
      id: "ai_log_confirmed",
      userId: "user_demo",
      transactionId: "tx_001",
      rawInput: "bun cha 65k",
      parsedEntity: "bun cha",
      parsedAmount: "65000",
      parsedCategory: "Food and Drinks",
      userCorrection: null,
      createdAt: "2026-04-26T08:29:00.000Z",
    },
  ],
};

function makeDailyFood(date: string, budgetMain: string, budgetSub: string, spentMain: string, spentSub: string, savedAmount: string, dailyOverflow: string): RawDailyFood {
  return {
    id: `daily_food_${date.replaceAll("-", "_")}`,
    userId: "user_demo",
    date,
    budgetMain,
    budgetSub,
    spentMain,
    spentSub,
    savedAmount,
    dailyOverflow,
    penaltyAppliedFromYesterday: "0",
  };
}

function isSameMonth(value: string, month: string) {
  return getMonthStart(value) === month;
}

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function toMoneyString(value: unknown) {
  return String(Math.round(toNumber(value)));
}

function getFundById(fundId: string) {
  return MOCK_DB.funds.find((fund) => fund.id === fundId) ?? null;
}

const CATEGORY_FUND_TYPES: Record<string, FundType> = {
  "food and drinks": "food",
  experience: "experience",
  developement: "growth",
  development: "growth",
  "fixed bill": "living",
  savings: "future",
};

function getFundTypeByCategory(category: string): FundType | null {
  return CATEGORY_FUND_TYPES[category.trim().toLowerCase()] ?? null;
}

function adjustDateString(dateStr: string, daysToAdd: number): string {
  if (!dateStr) return dateStr;
  const d = new Date(dateStr + "T00:00:00.000Z");
  if (isNaN(d.getTime())) return dateStr;
  d.setDate(d.getDate() + daysToAdd);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function adjustIsoString(isoStr: string, daysToAdd: number): string {
  if (!isoStr) return isoStr;
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  d.setDate(d.getDate() + daysToAdd);
  return d.toISOString();
}

let datesAdjusted = false;

function adjustMockDbDates() {
  if (datesAdjusted) return;
  datesAdjusted = true;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  // Base reference date in mock DB is April 26, 2026 (2026-04-26)
  const baseDate = new Date("2026-04-26T00:00:00.000Z");
  const currentDate = new Date(todayStr + "T00:00:00.000Z");
  
  const diffTime = currentDate.getTime() - baseDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return;

  // Adjust profile
  if (MOCK_DB.profile) {
    MOCK_DB.profile.createdAt = adjustIsoString(MOCK_DB.profile.createdAt, diffDays);
  }

  // Adjust funds
  MOCK_DB.funds.forEach(fund => {
    const baseMonthFirst = new Date("2026-04-01T00:00:00.000Z");
    const d = new Date(baseMonthFirst);
    const monthDiff = (now.getFullYear() - 2026) * 12 + now.getMonth() - 3;
    d.setMonth(d.getMonth() + monthDiff);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    fund.month = `${yyyy}-${mm}-01`;
    
    fund.createdAt = adjustIsoString(fund.createdAt, diffDays);
    fund.updatedAt = adjustIsoString(fund.updatedAt, diffDays);
    fund.id = `fund_${fund.fundType}_${fund.month.replace(/-/g, '_').slice(0, 7)}`;
  });

  // Adjust transactions
  MOCK_DB.transactions.forEach(tx => {
    tx.transactionDate = adjustIsoString(tx.transactionDate, diffDays);
    tx.createdAt = adjustIsoString(tx.createdAt, diffDays);
    const monthStr = tx.transactionDate.slice(0, 7).replace(/-/g, '_');
    tx.fundId = `fund_${getFundTypeByCategory(tx.category) || 'food'}_${monthStr}`;
  });

  // Adjust dailyFood
  MOCK_DB.dailyFood.forEach(df => {
    df.date = adjustDateString(df.date, diffDays);
    df.id = `daily_food_${df.date.replace(/-/g, '_')}`;
  });

  // Ensure every day of the current month has a daily food record in MOCK_DB
  const year = now.getFullYear();
  const monthIdx = now.getMonth();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const exists = MOCK_DB.dailyFood.some(df => df.date === dateStr);
    if (!exists) {
      MOCK_DB.dailyFood.push({
        id: `daily_food_${dateStr.replace(/-/g, '_')}`,
        userId: MOCK_DB.profile.userId,
        date: dateStr,
        budgetMain: "76000",
        budgetSub: "33000",
        spentMain: "0",
        spentSub: "0",
        savedAmount: "0",
        dailyOverflow: "0",
        penaltyAppliedFromYesterday: "0",
      });
    }
  }

  // Adjust weeklyRewards
  MOCK_DB.weeklyRewards.forEach(wr => {
    wr.weekStart = adjustDateString(wr.weekStart, diffDays);
    wr.weekEnd = adjustDateString(wr.weekEnd, diffDays);
    if (wr.unlockedAt) {
      wr.unlockedAt = adjustIsoString(wr.unlockedAt, diffDays);
    }
  });

  // Adjust overflows
  MOCK_DB.overflows.forEach(of => {
    of.eventDate = adjustDateString(of.eventDate, diffDays);
  });

  // Adjust aiLogs
  MOCK_DB.aiLogs.forEach(al => {
    al.createdAt = adjustIsoString(al.createdAt, diffDays);
  });
}

if (USE_MOCK) {
  adjustMockDbDates();
}

function getOverflowLevel(overflow: number, effectiveBudget: number): OverflowLevel | null {
  if (overflow <= 0) {
    return null;
  }
  if (overflow >= effectiveBudget) {
    return "level_3";
  }
  if (overflow >= effectiveBudget * 0.5) {
    return "level_2";
  }
  return "level_1";
}

function updateFundForMockTransaction(transaction: RawTransaction) {
  const fund = getFundById(transaction.fundId);
  if (!fund) {
    return;
  }

  const amount = toNumber(transaction.amount);
  if (transaction.transactionType === "expense" || transaction.transactionType === "transfer") {
    fund.spentAmount = toMoneyString(toNumber(fund.spentAmount) + amount);
  }
  if (transaction.transactionType === "income") {
    fund.allocatedAmount = toMoneyString(toNumber(fund.allocatedAmount) + amount);
  }
  if (transaction.transactionType === "transfer" && transaction.targetFundId) {
    const targetFund = getFundById(transaction.targetFundId);
    if (targetFund) {
      targetFund.allocatedAmount = toMoneyString(toNumber(targetFund.allocatedAmount) + amount);
      targetFund.updatedAt = new Date().toISOString();
      targetFund.version += 1;
    }
  }

  fund.updatedAt = new Date().toISOString();
  fund.version += 1;
}

function updateDailyFoodForMockTransaction(transaction: RawTransaction) {
  const fund = getFundById(transaction.fundId);
  if (!fund || fund.fundType !== "food" || transaction.transactionType !== "expense") {
    return null;
  }

  const date = getDateOnly(transaction.transactionDate);
  const record = MOCK_DB.dailyFood.find((item) => item.date === date);
  if (!record) {
    return null;
  }

  const amount = toNumber(transaction.amount);
  const spentKey = transaction.mealType === "sub" ? "spentSub" : "spentMain";
  record[spentKey] = toMoneyString(toNumber(record[spentKey]) + amount);

  const effectiveBudget = toNumber(record.budgetMain) + toNumber(record.budgetSub) - toNumber(record.penaltyAppliedFromYesterday);
  const totalSpent = toNumber(record.spentMain) + toNumber(record.spentSub);
  const overflow = Math.max(0, totalSpent - effectiveBudget);

  record.dailyOverflow = toMoneyString(overflow);
  record.savedAmount = toMoneyString(Math.max(0, effectiveBudget - totalSpent));

  return { record, overflow };
}

function createOverflowForMockTransaction(transaction: RawTransaction, dailyFoodResult: ReturnType<typeof updateDailyFoodForMockTransaction>) {
  if (!dailyFoodResult || dailyFoodResult.overflow <= 0) {
    return null;
  }

  const effectiveBudget =
    toNumber(dailyFoodResult.record.budgetMain) +
    toNumber(dailyFoodResult.record.budgetSub) -
    toNumber(dailyFoodResult.record.penaltyAppliedFromYesterday);
  const level = getOverflowLevel(dailyFoodResult.overflow, effectiveBudget);
  if (!level) {
    return null;
  }

  const overflow: RawOverflow = {
    id: createId("overflow"),
    userId: transaction.userId,
    transactionId: transaction.id,
    eventDate: getDateOnly(transaction.transactionDate),
    overflowLevel: level,
    overflowAmount: toMoneyString(dailyFoodResult.overflow),
    sourceFundType: "food",
    borrowedFromFundType: level === "level_1" ? null : "future",
    repaidAmount: "0",
    status: "pending",
    penaltyApplied: { multiplier: level === "level_3" ? 0.5 : level === "level_2" ? 0.75 : 1 },
  };

  MOCK_DB.overflows.push(overflow);
  return overflow;
}

function adaptOverflowResponse(overflow: RawOverflow | null) {
  if (!overflow) {
    return undefined;
  }

  return {
    totalOverspent: overflow.overflowAmount,
    highestLevel: overflow.overflowLevel,
    actions: [
      {
        level: overflow.overflowLevel,
        amount: overflow.overflowAmount,
        source: overflow.borrowedFromFundType || overflow.sourceFundType,
        description: `Overspent ${overflow.overflowAmount} VND from ${overflow.sourceFundType}`,
      },
    ],
  };
}

function parseMockInput(rawInput: string) {
  const amountMatch = rawInput.match(/(\d+(?:[.,]\d+)?)\s*(k|nghin|ngàn|000)?/i);
  const parsedAmount = amountMatch ? Math.round(toNumber(amountMatch[1].replace(",", ".")) * (amountMatch[2] ? 1000 : 1)) : null;
  const normalized = rawInput.toLowerCase();
  const parsedCategory =
    normalized.includes("cafe") ||
    normalized.includes("coffee") ||
    normalized.includes("tra") ||
    normalized.includes("bun") ||
    normalized.includes("com")
      ? "Food and Drinks"
      : normalized.includes("movie") || normalized.includes("game")
        ? "Experience"
        : "Food and Drinks";

  return {
    parsedEntity: rawInput.replace(amountMatch?.[0] || "", "").trim() || rawInput,
    parsedAmount,
    parsedCategory,
  };
}

async function getProfile(): Promise<RawProfile> {
  return USE_MOCK ? MOCK_DB.profile : apiClient.get<RawProfile>("/api/profile");
}

async function getFunds(month: string): Promise<RawFund[]> {
  if (USE_MOCK) {
    let funds = MOCK_DB.funds.filter((fund) => fund.month === month);
    if (funds.length === 0 && MOCK_DB.funds.length > 0) {
      const sourceMonth = MOCK_DB.funds[0].month;
      const cloned = MOCK_DB.funds
        .filter(f => f.month === sourceMonth)
        .map(f => ({
          ...f,
          id: `fund_${f.fundType}_${month.replace(/-/g, '_').slice(0, 7)}`,
          month: month,
        }));
      MOCK_DB.funds.push(...cloned);
      funds = cloned;
    }
    return funds;
  }
  return apiClient.get<RawFund[]>("/api/funds", { query: { month } });
}

async function getFundTemplates(): Promise<RawFundTemplate[]> {
  return USE_MOCK ? MOCK_DB.fundTemplates : apiClient.get<RawFundTemplate[]>("/api/funds/templates");
}

async function getTags(): Promise<RawTag[]> {
  return USE_MOCK ? MOCK_DB.tags : apiClient.get<RawTag[]>("/api/tags");
}

async function getDailyFoodByDate(date: string): Promise<RawDailyFood | null> {
  if (USE_MOCK) {
    return MOCK_DB.dailyFood.find((record) => record.date === date) ?? null;
  }

  try {
    return await apiClient.get<RawDailyFood>("/api/daily-food", { query: { date } });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

async function getDailyFoodByMonth(month: string): Promise<RawDailyFood[]> {
  return USE_MOCK
    ? MOCK_DB.dailyFood.filter((record) => isSameMonth(record.date, month))
    : apiClient.get<RawDailyFood[]>("/api/daily-food/month", { query: { month } });
}

async function getRewardPoints(): Promise<RawRewardPoints> {
  if (USE_MOCK) {
    if (MOCK_DB.transactions.length === 0) {
      return {
        ...MOCK_DB.rewardPoints,
        streak: 0,
      };
    }

    const uniqueDates = new Set<string>();
    for (const tx of MOCK_DB.transactions) {
      uniqueDates.add(tx.transactionDate.slice(0, 10));
    }

    const sortedDates = Array.from(uniqueDates).sort();
    const latestDateStr = sortedDates[sortedDates.length - 1];

    let streak = 0;
    const currentDate = new Date(latestDateStr);

    while (true) {
      const dateStr = currentDate.toISOString().slice(0, 10);
      if (uniqueDates.has(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      ...MOCK_DB.rewardPoints,
      streak,
    };
  }
  return apiClient.get<RawRewardPoints>("/api/rewards/points");
}

async function getWeeklyReward(weekStart: string): Promise<RawWeeklyReward | null> {
  if (USE_MOCK) {
    return MOCK_DB.weeklyRewards.find((reward) => reward.weekStart === weekStart) ?? null;
  }

  try {
    return await apiClient.get<RawWeeklyReward>("/api/rewards/weekly", { query: { weekStart } });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

async function getWeeklyRewardsByMonth(month: string): Promise<RawWeeklyReward[]> {
  return USE_MOCK
    ? MOCK_DB.weeklyRewards.filter((reward) => isSameMonth(reward.weekStart, month))
    : apiClient.get<RawWeeklyReward[]>("/api/rewards/weekly/month", { query: { month } });
}

async function getOverflows(month?: string): Promise<RawOverflow[]> {
  return USE_MOCK
    ? MOCK_DB.overflows.filter((overflow) => !month || isSameMonth(overflow.eventDate, month))
    : apiClient.get<RawOverflow[]>("/api/overflows", { query: { month } });
}

async function getPendingOverflows(): Promise<RawOverflow[]> {
  return USE_MOCK
    ? MOCK_DB.overflows.filter((overflow) => overflow.status === "pending" || overflow.status === "partial")
    : apiClient.get<RawOverflow[]>("/api/overflows/pending");
}

async function getAiLogs(): Promise<RawAiParseLog[]> {
  return USE_MOCK ? MOCK_DB.aiLogs : apiClient.get<RawAiParseLog[]>("/api/ai-logs");
}

export async function getTransactions(month: string): Promise<TransactionItem[]> {
  const [transactions, funds] = await Promise.all([
    USE_MOCK
      ? Promise.resolve(MOCK_DB.transactions.filter((transaction) => isSameMonth(transaction.transactionDate, month)))
      : apiClient.get<RawTransaction[]>("/api/transactions", { query: { month } }),
    getFunds(month),
  ]);

  return adaptTransactions(transactions, funds);
}

export async function getHomeScreenData(date: string, month: string): Promise<HomeScreenData> {
  const weekStart = getWeekStart(date);

  const [funds, profile, transactions, dailyFood, points, weeklyReward] = await Promise.all([
    getFunds(month),
    getProfile(),
    USE_MOCK
      ? Promise.resolve(MOCK_DB.transactions.filter((transaction) => isSameMonth(transaction.transactionDate, month)))
      : apiClient.get<RawTransaction[]>("/api/transactions", { query: { month } }),
    getDailyFoodByDate(date),
    getRewardPoints(),
    getWeeklyReward(weekStart),
  ]);

  return summarizeHomeData({ profile, funds, transactions, dailyFood, points, weeklyReward, date, month });
}

export async function getBudgetScreenData(month: string): Promise<BudgetScreenData> {
  const [funds, profile, templates, dailyFood, pendingOverflows] = await Promise.all([
    getFunds(month),
    getProfile(), 
    getFundTemplates(), 
    getDailyFoodByMonth(month),
    getPendingOverflows()
  ]);
  const allocations = adaptFunds(funds);
  const totalBudget = Number(profile?.bankBalance) || allocations.reduce((sum, item) => sum + item.allocatedAmount, 0);
  const totalSpent = allocations.reduce((sum, item) => sum + item.spentAmount, 0);

  return {
    month,
    totalBudget,
    totalSpent,
    totalRemaining: totalBudget - totalSpent,
    allocations,
    templates,
    dailyFood: dailyFood.map(adaptDailyFood),
    hasPendingOverflows: pendingOverflows.length > 0,
    bankAccountId: profile?.bankAccountId || null,
    residenceType: profile?.residenceType || null,
  };
}

export async function getNotifications(month: string): Promise<NotificationViewModel[]> {
  const [overflows, pendingOverflows, rewards, aiLogs, transactions] = await Promise.all([
    getOverflows(month),
    getPendingOverflows(),
    getWeeklyRewardsByMonth(month),
    getAiLogs(),
    USE_MOCK
      ? Promise.resolve(MOCK_DB.transactions.filter((transaction) => isSameMonth(transaction.transactionDate, month)))
      : apiClient.get<RawTransaction[]>("/api/transactions", { query: { month } }),
  ]);
  return adaptNotifications(overflows, pendingOverflows, rewards, aiLogs, transactions);
}

export async function getCalendarMonth(month: string): Promise<CalendarMonthData> {
  const [dailyFood, overflows] = await Promise.all([getDailyFoodByMonth(month), getOverflows(month)]);
  return {
    month,
    days: adaptCalendarMonth(dailyFood, overflows),
  };
}

export async function getTransactionSetupData(month: string): Promise<TransactionSetupData> {
  const [funds, tags] = await Promise.all([getFunds(month), getTags()]);

  return {
    month,
    funds: adaptFunds(funds),
    categories: adaptTags(tags),
  };
}

export async function createTransaction(formState: TransactionFormState): Promise<TransactionItem> {
  const transactionDate = formState.transactionDate ?? (formState.dateValue ? `${formState.dateValue}T00:00:00.000Z` : new Date().toISOString());
  const month = getMonthStart(transactionDate);
  const transactionType = formState.transactionType ?? formState.type ?? "expense";
  const category = formState.category ?? "Food and Drinks";
  const fundType = getFundTypeByCategory(category);
  const funds = formState.fundId ? null : await getFunds(month);
  const fundId = formState.fundId ?? funds?.find((fund) => fund.fundType === fundType)?.id;

  if (!fundId) {
    throw new Error(`No ${fundType ?? "matching"} fund is available for this transaction month.`);
  }

  const payload = {
    fundId,
    targetFundId: formState.targetFundId ?? null,
    amount: toNumber(formState.amount ?? formState.amountValue),
    transactionType,
    category,
    description: formState.description ?? null,
    inputMethod: formState.inputMethod ?? "manual",
    aiConfidence: formState.aiConfidence ?? null,
    isAiCorrected: formState.isAiCorrected ?? false,
    mealType: formState.mealType ?? null,
    transactionDate,
  };

  if (!USE_MOCK) {
    const created = await apiClient.post<RawTransaction>("/api/transactions", payload);
    const updatedFunds = await getFunds(month);
    return adaptTransaction(created, updatedFunds);
  }

  const now = new Date().toISOString();
  const transaction: RawTransaction = {
    id: createId("tx"),
    userId: MOCK_DB.profile.userId,
    ...payload,
    amount: toMoneyString(payload.amount),
    transactionType: payload.transactionType as TransactionType,
    createdAt: now,
  };

  MOCK_DB.transactions.push(transaction);
  updateFundForMockTransaction(transaction);
  const dailyFoodResult = updateDailyFoodForMockTransaction(transaction);
  const overflow = createOverflowForMockTransaction(transaction, dailyFoodResult);
  transaction.overflow = adaptOverflowResponse(overflow);

  return adaptTransaction(transaction, MOCK_DB.funds);
}

export async function parseTransactionText(rawInput: string): Promise<ParsedTransactionDraft> {
  if (!USE_MOCK) {
    const parsed = parseMockInput(rawInput);
    const log = await apiClient.post<RawAiParseLog>("/api/ai-logs", {
      rawInput,
      parsedEntity: parsed.parsedEntity,
      parsedAmount: parsed.parsedAmount,
      parsedCategory: parsed.parsedCategory,
    });
    return adaptAiParseLog(log);
  }

  const parsed = parseMockInput(rawInput);
  const log: RawAiParseLog = {
    id: createId("ai_log"),
    userId: MOCK_DB.profile.userId,
    transactionId: null,
    rawInput,
    parsedEntity: parsed.parsedEntity,
    parsedAmount: parsed.parsedAmount,
    parsedCategory: parsed.parsedCategory,
    userCorrection: null,
    createdAt: new Date().toISOString(),
  };
  MOCK_DB.aiLogs.push(log);

  return adaptAiParseLog(log);
}

export async function getPersonalWallet(): Promise<PersonalWalletViewModel> {
  const raw = await apiClient.get<RawPersonalWallet>("/api/wallet");
  return {
    balance: Number(raw.balance),
    note: raw.note ?? "",
    updatedAt: raw.updatedAt,
  };
}

export async function updatePersonalWallet(balance: number, note?: string): Promise<PersonalWalletViewModel> {
  const raw = await apiClient.put<RawPersonalWallet>("/api/wallet", { balance, note: note ?? "" });
  return {
    balance: Number(raw.balance),
    note: raw.note ?? "",
    updatedAt: raw.updatedAt,
  };
}
