/**
 * Transactions API
 */
import { apiFetch } from './client';

export type Transaction = {
  id: string;
  userId: string;
  fundId: string;
  amount: string;
  transactionType: 'expense' | 'income';
  category: string;
  description?: string;
  inputMethod?: string;
  mealType?: 'main' | 'sub';
  transactionDate: string;
  createdAt: string;
};

export type CreateTransactionBody = {
  fundId: string;
  amount: number;
  transactionType: 'expense' | 'income';
  category: string;
  description?: string;
  inputMethod?: string;
  mealType?: 'main' | 'sub';
  transactionDate?: string;
};

export type CreateTransactionResponse = Transaction & {
  overflow?: {
    totalOverspent: string;
    highestLevel: 'level_1' | 'level_2' | 'level_3';
    actions: Array<{
      level: string;
      amount: string;
      source: string;
      description: string;
    }>;
  };
};

/** Create a new transaction */
export async function createTransaction(body: CreateTransactionBody) {
  return apiFetch<CreateTransactionResponse>('/api/transactions', {
    method: 'POST',
    body,
  });
}

/** List transactions, optionally filtered by month (YYYY-MM-01) */
export async function getTransactions(month?: string) {
  return apiFetch<Transaction[]>('/api/transactions', {
    query: month ? { month } : undefined,
  });
}

/** Get transactions for a specific date (YYYY-MM-DD) */
export async function getTransactionsByDate(date: string) {
  return apiFetch<Transaction[]>('/api/transactions/by-date', {
    query: { date },
  });
}

/** Get a single transaction by ID */
export async function getTransactionById(id: string) {
  return apiFetch<Transaction>(`/api/transactions/${id}`);
}

/** Delete a transaction */
export async function deleteTransaction(id: string) {
  return apiFetch<{ success: boolean }>(`/api/transactions/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Determine mealType based on description keywords.
 * Returns 'sub' for snack-like items, 'main' for main meals.
 */
export function classifyMealType(description: string): 'main' | 'sub' {
  const SNACK_KEYWORDS = [
    'tea', 'coffee', 'cafe', 'milk tea', 'trà', 'cà phê', 'sinh tố',
    'juice', 'snack', 'bubble', 'boba', 'nước', 'bánh mì', 'kẹo',
    'chip', 'crackers', 'chocolate', 'ice cream', 'kem',
  ];
  const lower = description.toLowerCase();
  return SNACK_KEYWORDS.some((kw) => lower.includes(kw)) ? 'sub' : 'main';
}
