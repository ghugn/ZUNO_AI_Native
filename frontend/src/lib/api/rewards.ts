/**
 * Rewards API
 */
import { apiFetch } from './client';

export type WeeklyReward = {
  id: string;
  userId: string;
  weekStart: string;
  weekEnd: string;
  savedAmount: string;
  targetAmount: string;
  isUnlocked: boolean;
  pointsAwarded: number;
};

export type RewardPoints = {
  id: string;
  userId: string;
  total: number;
  totalPoints?: number;
  multiplier: number;
  streak?: number;
};

/** Get weekly reward for a specific week */
export async function getWeeklyReward(weekStart: string) {
  return apiFetch<WeeklyReward>('/api/rewards/weekly', {
    query: { weekStart },
  });
}

/** Get all weekly rewards for a month (YYYY-MM-01) */
export async function getWeeklyRewardsByMonth(month: string) {
  return apiFetch<WeeklyReward[]>('/api/rewards/weekly/month', {
    query: { month },
  });
}

/** Create a weekly reward record */
export async function createWeeklyReward(body: {
  weekStart: string;
  weekEnd: string;
}) {
  return apiFetch<WeeklyReward>('/api/rewards/weekly', {
    method: 'POST',
    body,
  });
}

/** Claim (unlock) a weekly reward by ID */
export async function claimWeeklyReward(id: string) {
  return apiFetch<{
    message: string;
    reward: WeeklyReward;
    pointsAwarded: number;
    newTotalPoints: number;
  }>(`/api/rewards/weekly/${id}/claim`, {
    method: 'POST',
  });
}

/** Get current user's reward points */
export async function getRewardPoints() {
  return apiFetch<RewardPoints>('/api/rewards/points');
}

/** Add points to the user's account */
export async function addPoints(points: number) {
  return apiFetch<RewardPoints>('/api/rewards/points/add', {
    method: 'POST',
    body: { points },
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the ISO date string (YYYY-MM-DD) for the current week's Monday */
export function getCurrentWeekStart(): string {
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // Mon=0
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  return weekStart.toISOString().slice(0, 10);
}

/** Returns the ISO date string (YYYY-MM-DD) for the current week's Sunday */
export function getCurrentWeekEnd(): string {
  const start = new Date(getCurrentWeekStart());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end.toISOString().slice(0, 10);
}

/** Returns the first day of the current month as YYYY-MM-01 */
export function getCurrentMonthFirstDay(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}
