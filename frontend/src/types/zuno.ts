export type MoneyLike = string | number;

export type ResidenceType = "dorm" | "rent";
export type FundType = "living" | "food" | "growth" | "experience" | "future";
export type TransactionType = "expense" | "income" | "transfer" | "refund";
export type MealType = "main" | "sub";
export type OverflowLevel = "level_1" | "level_2" | "level_3";
export type OverflowStatus = "pending" | "partial" | "repaid" | "resolved";
export type InputMethod = "manual" | "ai" | "receipt" | string;

export type RawPersonalWallet = {
  id: string;
  userId: string;
  balance: MoneyLike;
  note: string | null;
  updatedAt: string;
};

export type PersonalWalletViewModel = {
  balance: number;
  note: string;
  updatedAt: string;
};

export type RawProfile = {
  id: string;
  userId: string;
  residenceType: ResidenceType;
  bankBalance: MoneyLike;
  dormPaidSemester: boolean;
  hasFoodFromFamily: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  bankAccountId?: string | null;
};

export type RawFundTemplate = {
  id: string;
  name: string;
  residenceType: ResidenceType;
  livingPct: MoneyLike;
  foodPct: MoneyLike;
  growthPct: MoneyLike;
  experiencePct: MoneyLike;
  futurePct: MoneyLike;
  isDefault: boolean;
};

export type RawFund = {
  id: string;
  userId: string;
  month: string;
  fundType: FundType;
  allocatedAmount: MoneyLike;
  spentAmount: MoneyLike;
  customPercentage: MoneyLike;
  allocatedPercent?: MoneyLike;
  borrowAmount: MoneyLike;
  isLocked: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type RawTag = {
  id: string;
  name: string;
  fundType: FundType;
  iconUrl: string | null;
  isSystem: boolean;
  userId: string | null;
};

export type RawTransaction = {
  id: string;
  userId: string;
  fundId: string;
  targetFundId?: string | null;
  amount: MoneyLike;
  transactionType: TransactionType;
  category: string;
  description: string | null;
  inputMethod: InputMethod;
  aiConfidence: number | null;
  isAiCorrected: boolean;
  mealType: MealType | null;
  transactionDate: string;
  createdAt: string;
  overflow?: RawOverflowResponse;
};

export type RawDailyFood = {
  id: string;
  userId: string;
  date: string;
  budgetMain: MoneyLike;
  budgetSub: MoneyLike;
  spentMain: MoneyLike;
  spentSub: MoneyLike;
  savedAmount: MoneyLike;
  dailyOverflow: MoneyLike;
  penaltyAppliedFromYesterday: MoneyLike;
};

export type RawWeeklyReward = {
  id: string;
  userId: string;
  weekStart: string;
  weekEnd: string;
  accumulatedSavings: MoneyLike;
  milestoneReached: string | null;
  isUnlocked: boolean;
  unlockedAt: string | null;
  pointsEarned: number;
  syncDetails?: unknown[];
};

export type RawRewardPoints = {
  id: string;
  userId: string;
  total: number;
  multiplier: MoneyLike;
  updatedAt: string;
  streak?: number;
};

export type RawOverflow = {
  id: string;
  userId: string;
  transactionId: string;
  eventDate: string;
  overflowLevel: OverflowLevel;
  overflowAmount: MoneyLike;
  sourceFundType: FundType;
  borrowedFromFundType: FundType | null;
  repaidAmount: MoneyLike;
  status: OverflowStatus;
  penaltyApplied: Record<string, unknown> | null;
};

export type RawOverflowResponse = {
  totalOverspent: MoneyLike;
  highestLevel: OverflowLevel;
  actions: Array<{
    level: OverflowLevel;
    amount: MoneyLike;
    source: string;
    description: string;
  }>;
};

export type RawAiParseLog = {
  id: string;
  userId: string;
  transactionId: string | null;
  rawInput: string;
  parsedEntity: string;
  parsedAmount: MoneyLike | null;
  parsedCategory: string;
  userCorrection: Record<string, unknown> | null;
  createdAt: string;
};

export type RawZunoDatabase = {
  profile: RawProfile;
  fundTemplates: RawFundTemplate[];
  funds: RawFund[];
  tags: RawTag[];
  transactions: RawTransaction[];
  dailyFood: RawDailyFood[];
  weeklyRewards: RawWeeklyReward[];
  rewardPoints: RawRewardPoints;
  overflows: RawOverflow[];
  aiLogs: RawAiParseLog[];
};

export type ProfileViewModel = {
  id: string;
  userId: string;
  residenceType: ResidenceType;
  bankBalance: number;
  onboardingCompleted: boolean;
  dormPaidSemester: boolean;
  hasFoodFromFamily: boolean;
};

export type BudgetAllocation = {
  id: string;
  fundType: FundType;
  label: string;
  month: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
  borrowAmount: number;
  isLocked: boolean;
};

export type CategoryOption = {
  id: string;
  name: string;
  fundType: FundType;
  iconUrl: string | null;
};

export type TransactionItem = {
  id: string;
  fundId: string;
  targetFundId: string | null;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  inputMethod: InputMethod;
  mealType: MealType | null;
  date: string;
  timestamp: string;
  fundType: FundType | null;
  overflow?: OverflowResult;
};

export type TodayFoodWrap = {
  date: string;
  budgetMain: number;
  budgetSub: number;
  spentMain: number;
  spentSub: number;
  savedAmount: number;
  overflowAmount: number;
  budgetAmount: number;
  remainingAmount: number;
  status: "safe" | "overspent";
};

export type CalendarDay = {
  date: string;
  budgetAmount: number;
  spentAmount: number;
  savedAmount: number;
  overflowAmount: number;
  status: "safe" | "overspendLevel1" | "overspendLevel2" | "overspendLevel3" | "noData";
};

export type AiMicroInsight = {
  id: string;
  date: string;
  severity: "warning" | "danger";
  overflowLevel: OverflowLevel;
  overflowAmount: number;
  reason: string;
  message: string;
  actionLabel: string;
  actionHref: string;
};

export type SmartHubSuggestion = {
  id: string;
  date: string;
  scenario: "subscription_leak" | "weekend_buffer";
  title: string;
  suggestions: string[];
  primaryActionLabel: string;
  secondaryActionLabel: string;
};

export type RewardSummary = {
  totalPoints: number;
  multiplier: number;
  weeklySavings: number;
  weeklyMilestone: string | null;
  weeklyPointsEarned: number;
  isWeeklyUnlocked: boolean;
  streak?: number;
};

export type NotificationKind = "Alerts" | "Budget" | "Rewards" | "System";

export type NotificationViewModel = {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  date: string;
  time: string;
  severity: "info" | "success" | "warning" | "danger";
  actionLabel?: string;
  isRead?: boolean;
  tag?: string;
  overflowLevel?: OverflowLevel;
  overflowAmount?: number;
  transactionAmount?: number;
  penaltyPerDay?: number;
};

export type OverflowResult = {
  totalOverspent: number;
  highestLevel: OverflowLevel;
  actions: Array<{
    level: OverflowLevel;
    amount: number;
    source: string;
    description: string;
  }>;
};

export type HomeScreenData = {
  profile: ProfileViewModel | null;
  month: string;
  date: string;
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  allocations: BudgetAllocation[];
  todayFood: TodayFoodWrap | null;
  recentTransactions: TransactionItem[];
  rewardSummary: RewardSummary | null;
};

export type BudgetScreenData = {
  month: string;
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  allocations: BudgetAllocation[];
  templates: RawFundTemplate[];
  dailyFood: TodayFoodWrap[];
  hasPendingOverflows: boolean;
  bankAccountId?: string | null;
  residenceType?: string | null;
};

export type CalendarMonthData = {
  month: string;
  days: CalendarDay[];
};

export type TransactionSetupData = {
  month: string;
  funds: BudgetAllocation[];
  categories: CategoryOption[];
};

export type TransactionFormState = {
  fundId?: string;
  targetFundId?: string | null;
  amount?: MoneyLike;
  amountValue?: string;
  transactionType?: TransactionType;
  type?: TransactionType;
  category?: string;
  description?: string | null;
  inputMethod?: InputMethod;
  aiConfidence?: number | null;
  isAiCorrected?: boolean;
  mealType?: MealType | null;
  transactionDate?: string;
  dateValue?: string;
};

export type ParsedTransactionDraft = {
  logId: string;
  rawInput: string;
  entity: string;
  amount: number | null;
  category: string;
  createdAt: string;
};
