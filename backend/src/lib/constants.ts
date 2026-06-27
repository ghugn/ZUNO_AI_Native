// Valid values for VARCHAR columns — validate at application layer

export const RESIDENCE_TYPES = ['rent', 'dorm'] as const;
export const FUND_TYPES = ['living', 'food', 'growth', 'experience', 'future'] as const;
export const TRANSACTION_TYPES = ['expense', 'income', 'transfer', 'borrow'] as const;
export const INPUT_METHODS = ['manual', 'ai_text', 'ai_image'] as const;
export const MEAL_TYPES = ['main', 'sub'] as const;
export const OVERFLOW_LEVELS = ['level_1', 'level_2', 'level_3'] as const;
export const MILESTONES = ['none', '50k', '100k', '150k'] as const;
export const OVERFLOW_STATUSES = ['pending', 'partial', 'repaid'] as const;
