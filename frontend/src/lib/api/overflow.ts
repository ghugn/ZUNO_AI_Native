import { apiFetch } from './client';

export type OverflowEvent = {
  id: string;
  userId: string;
  transactionId: string;
  eventDate: string;
  overflowLevel: 'level_1' | 'level_2' | 'level_3';
  overflowAmount: string;
  repaidAmount: string;
  sourceFundType: string;
  borrowedFromFundType: string | null;
  status: 'pending' | 'partial' | 'repaid';
  penaltyApplied: any;
  createdAt: string;
  updatedAt: string;
};

/** Get all overflow events for the user (optionally filtered by month YYYY-MM-01) */
export async function getOverflowEvents(month?: string) {
  return apiFetch<OverflowEvent[]>('/api/overflow', {
    query: month ? { month } : undefined,
  });
}

/** Get pending overflow events for the user */
export async function getPendingOverflows() {
  return apiFetch<OverflowEvent[]>('/api/overflow/pending');
}
