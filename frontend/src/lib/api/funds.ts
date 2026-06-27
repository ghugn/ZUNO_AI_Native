/**
 * Funds API
 */
import { apiFetch } from './client';

export type Fund = {
  id: string;
  userId: string;
  fundType: string;
  name?: string;
  allocatedPercent: number;
  allocatedAmount: string;
  spentAmount: string;
  remainingAmount: string;
  borrowAmount?: string;
  month: string;
};

export type FundTemplate = {
  id: string;
  residenceType: string;
  fundType: string;
  allocatedPercent: number;
};

export type CompoundProjection = {
  monthly: number;
  annual: number;
  years: number;
  totalContributed: number;
  totalInterest: number;
  finalBalance: number;
  breakdown: Array<{ year: number; balance: number }>;
};

/** Get all funds for the current (or specified) month */
export async function getFunds(month?: string) {
  return apiFetch<Fund[]>('/api/funds', {
    query: month ? { month } : undefined,
  });
}

/** Get a single fund by ID */
export async function getFundById(id: string) {
  return apiFetch<Fund>(`/api/funds/${id}`);
}

/** Create monthly funds */
export async function createMonthlyFunds(body: {
  month: string;
  bankBalance: number;
  residenceType: string;
}) {
  return apiFetch<Fund[]>('/api/funds', { method: 'POST', body });
}

/** Update a fund (e.g. change allocatedPercent) */
export async function updateFund(id: string, body: Partial<Pick<Fund, 'allocatedPercent'>>) {
  return apiFetch<Fund>(`/api/funds/${id}`, { method: 'PUT', body });
}

/** Get fund templates for a given residenceType */
export async function getFundTemplates(residenceType?: string) {
  return apiFetch<FundTemplate[]>('/api/funds/templates', {
    query: residenceType ? { residenceType } : undefined,
  });
}

/** Get compound interest projection */
export async function getProjection(params?: {
  monthlyContribution?: number;
  annualRate?: number;
  years?: number;
}) {
  return apiFetch<CompoundProjection>('/api/funds/projection', {
    query: params
      ? {
          monthlyContribution: params.monthlyContribution,
          annualRate: params.annualRate,
          years: params.years,
        }
      : undefined,
  });
}
