/**
 * Daily Food Savings API
 */
import { apiFetch } from './client';

export type DailyFoodSavings = {
  id: string;
  userId: string;
  date: string;
  budgetMain: string;
  budgetSub: string;
  spentMain: string;
  spentSub: string;
  savedAmount?: string;
  dailyOverflow?: string;
  penaltyAppliedFromYesterday?: string;
};

/** Get daily food savings for a specific date (YYYY-MM-DD) */
export async function getDailyFoodByDate(date: string) {
  return apiFetch<DailyFoodSavings>('/api/daily-food', {
    query: { date },
  });
}

/** Get all daily food savings for a month (YYYY-MM-01) */
export async function getDailyFoodByMonth(month: string) {
  return apiFetch<DailyFoodSavings[]>('/api/daily-food/month', {
    query: { month },
  });
}

/** Create daily food savings record for a single day */
export async function createDailyFood(body: {
  date: string;
  budgetMain: number;
  budgetSub: number;
}) {
  return apiFetch<DailyFoodSavings>('/api/daily-food', {
    method: 'POST',
    body,
  });
}

/** Bulk create daily food savings for an entire month */
export async function createBulkDailyFood(body: {
  month: string;
  budgetMain: number;
  budgetSub: number;
}) {
  return apiFetch<{ created: number }>('/api/daily-food/bulk', {
    method: 'POST',
    body,
  });
}

/** Update daily food record (add spending) */
export async function updateDailyFood(
  date: string,
  body: Partial<Pick<DailyFoodSavings, 'spentMain' | 'spentSub'>>,
) {
  return apiFetch<DailyFoodSavings>('/api/daily-food', {
    method: 'PUT',
    query: { date },
    body,
  });
}
