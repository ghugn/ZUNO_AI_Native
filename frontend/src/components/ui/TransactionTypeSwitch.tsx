'use client';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type TransactionType = 'expenses' | 'income';

type TransactionTypeSwitchProps = {
  value?: TransactionType;
  onChange?: (value: TransactionType) => void;
  className?: string;
};

function cn(...inputs: (string | undefined | null | false)[]): string {
  return twMerge(clsx(inputs));
}

export function TransactionTypeSwitch({ value = 'expenses', onChange, className }: TransactionTypeSwitchProps) {
  const handleSelect = (nextTab: TransactionType) => {
    onChange?.(nextTab);
  };

  return (
    <div
      className={cn(
        'flex h-[45px] w-full items-center rounded-[20px] bg-[rgba(255,255,255,0.5)] shadow-[3px_3px_10px_rgba(0,0,0,0.15)] px-[4px] py-[3px] pr-[37px]',
        className
      )}
      role="tablist"
      aria-label="Transaction type"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === 'expenses'}
        onClick={() => handleSelect('expenses')}
        className={cn(
          'flex h-[39px] flex-[0_0_157px] items-center justify-center gap-[8px] rounded-[20px] px-[12px] transition-all',
          value === 'expenses' ? 'bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1)]' : 'bg-transparent'
        )}
      >
        <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full border border-[#FF9A9A] bg-[rgba(247,184,184,0.5)] text-[#FF9A9A]">
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0 block"
            aria-hidden="true"
          >
            <path d="M5 1L5 9" strokeLinecap="round" />
            <path d="M2 6L5 9L8 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="font-amount text-[12px] leading-[14px] text-[#174F84]">Expenses</span>
      </button>

      <div className="mx-[10px] h-[20px] w-px bg-[#B7B7B7]/40" aria-hidden="true" />

      <button
        type="button"
        role="tab"
        aria-selected={value === 'income'}
        onClick={() => handleSelect('income')}
        className={cn(
          'flex h-[39px] flex-[0_0_170px] items-center justify-center gap-[8px] rounded-[20px] px-[12px] transition-all',
          value === 'income' ? 'bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1)]' : 'bg-transparent'
        )}
      >
        <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full border border-[rgba(91,180,100,0.8)] bg-[rgba(191,230,195,0.58)] text-[rgba(91,180,100,0.8)]">
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0 block"
            aria-hidden="true"
          >
            <path d="M5 1L5 9" strokeLinecap="round" />
            <path d="M2 4L5 1L8 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="font-amount text-[12px] leading-[14px] text-[rgba(23,79,132,0.8)]">Income</span>
      </button>
    </div>
  );
}

export default TransactionTypeSwitch;
