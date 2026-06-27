'use client';

import { useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CalendarPlus,
  ChevronRight,
  Coins,
  Flame,
  Heart,
  Trophy,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";

type DashboardRange = "day" | "week" | "month";

type DashboardMock = {
  heroLabel: string;
  heroAmount: string;
};

const dashboardData: Record<DashboardRange, DashboardMock> = {
  day: {
    heroLabel: "Money left today",
    heroAmount: "65.000đ",
  },
  week: {
    heroLabel: "Money left this week",
    heroAmount: "540kđ",
  },
  month: {
    heroLabel: "Money left this month",
    heroAmount: "2.15Mđ",
  },
};

const staticCards = {
  spentAmount: "35.000đ",
  spentTotal: "100.000đ",
  spentProgress: 35,
  runoutLabel: "Will run out of money in",
  runoutValue: "6 days",
  monthLeftAmount: "420,000đ",
  alertTitle: "You're over the daily living fund",
  alertBody: "You've exceeded the budget by 20.000đ.",
  topCategoryAmount: "520,000đ",
  topCategoryBudget: "1,200,000đ",
  topCategoryProgress: 43,
  topCategoryPercent: "43%",
  goalAmount: "3,400,000đ",
  goalBudget: "5,000,000đ",
  goalPercent: "68%",
  goalProgress: 68,
  interestAmount: "+18,000đ",
  goalRemaining: "4.3 months left",
  healthScore: "82",
  healthTone: "Good",
  streakValue: "12 days",
  overspendingValue: "1 time",
} as const;

function Progress({
  value,
  colorClass,
}: {
  value: number;
  colorClass: string;
}) {
  return (
    <div className="h-[6px] w-full overflow-hidden rounded-full bg-[#edf0f4]">
      <div
        className={`h-full rounded-full ${colorClass}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function RangeToggle({
  activeRange,
  onChange,
}: {
  activeRange: DashboardRange;
  onChange: (range: DashboardRange) => void;
}) {
  const options: Array<{ key: DashboardRange; label: string }> = [
    { key: "day", label: "Day" },
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
  ];

  return (
    <div className="mt-5 inline-flex rounded-full bg-white/12 p-1 backdrop-blur-sm">
      {options.map((option) => {
        const active = option.key === activeRange;
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-all ${
              active
                ? "bg-white text-[#174f84] shadow-[0_8px_18px_rgba(17,41,69,0.18)]"
                : "text-white/85"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<DashboardRange>("day");
  const data = dashboardData[range];

  return (
    <main className="flex min-h-screen justify-center bg-slate-100">
      <div className="relative min-h-screen w-full max-w-[393px] overflow-hidden bg-[#f7f8fa] pb-[88px] font-['SF_Compact_Rounded',sans-serif] text-[#1f2937]">
        <section className="absolute inset-x-0 top-0 h-[430px] bg-[linear-gradient(180deg,#112945_0%,#4d78a8_37.5%,#f7f8fa_100%)]" />
        <div className="pointer-events-none absolute left-[88px] top-[48px] size-[3px] rounded-full bg-white/45 z-0" />
        <div className="pointer-events-none absolute left-[172px] top-[28px] size-[2px] rounded-full bg-white/45 z-0" />
        <div className="pointer-events-none absolute right-[56px] top-[50px] size-[2px] rounded-full bg-white/45 z-0" />
        <div className="pointer-events-none absolute right-[78px] top-[34px] size-[1.5px] rounded-full bg-white/45 z-0" />

        <section className="relative px-4 pb-8 pt-[56px]">
          <header className="mb-5 flex items-start justify-between">
            <div>
              <h1 className="text-[38px] font-bold leading-none text-white">
                Dashboard
              </h1>
              <p className="mt-3 text-[14px] text-white/90">
                Your financial overview
              </p>
              <RangeToggle activeRange={range} onChange={setRange} />
            </div>

            <div className="mt-2 flex size-[42px] items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm">
              <CalendarPlus className="size-5" strokeWidth={2.2} />
            </div>
          </header>

          <div className="space-y-4">
            <section className="rounded-[26px] border border-white/70 bg-white px-5 py-5 shadow-[0_10px_28px_rgba(17,41,69,0.08)]">
              <div className="flex gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[14px] text-[#6b7280]">
                    <AlertCircle className="size-4" strokeWidth={1.8} />
                    <span>{data.heroLabel}</span>
                  </div>

                  <div className="mt-2 text-[40px] font-bold leading-none tracking-[-0.02em] text-[#1a1a1a]">
                    {data.heroAmount}
                  </div>

                  <div className="mt-5">
                    <Progress value={staticCards.spentProgress} colorClass="bg-[#48a678]" />
                    <div className="mt-2 flex items-center gap-1 text-[13px]">
                      <span className="text-[#6b7280]">Spent</span>
                      <span className="font-bold text-[#48a678]">{staticCards.spentAmount}</span>
                      <span className="text-[#9ca3af]">/ {staticCards.spentTotal}</span>
                    </div>
                  </div>
                </div>

                <div className="w-[118px] rounded-[18px] bg-[#fff3f3] px-4 py-4 text-center">
                  <div className="mx-auto flex size-9 items-center justify-center rounded-full bg-white text-[#ef6b6b]">
                    <CalendarPlus className="size-4" strokeWidth={2} />
                  </div>
                  <p className="mt-3 text-[11px] leading-[1.2] text-[#7b7b86]">
                    {staticCards.runoutLabel}
                  </p>
                  <p className="mt-3 text-[18px] font-bold text-[#e54d4d]">
                    {staticCards.runoutValue}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-[#f4f5f7] pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-[12px] bg-[#eef0ff] text-[#5c64f4]">
                      <BarChart3 className="size-5" strokeWidth={2} />
                    </div>
                    <p className="max-w-[170px] text-[14px] font-medium leading-[1.2] text-[#4b5563]">
                      By the end of the month you still have:
                    </p>
                  </div>
                  <div className="text-[15px] font-bold text-[#1a1a1a]">
                    {staticCards.monthLeftAmount}
                  </div>
                </div>
              </div>
            </section>

            <section className="flex items-center justify-between gap-4 rounded-[18px] border border-[#ffe5e5] bg-[#fff7f7] px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#ef5350] text-white">
                  <AlertCircle className="size-5 fill-white/0" strokeWidth={2.4} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#ef4444]">
                    {staticCards.alertTitle}
                  </p>
                  <p className="mt-1 text-[12px] leading-[1.25] text-[#4b5563]">
                    {staticCards.alertBody}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-full border border-[#ff6b6b] bg-white px-5 py-2 text-[12px] font-bold text-[#ef4444]"
              >
                Review
              </button>
            </section>

            <section className="rounded-[24px] border border-[#f2f4f7] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(17,41,69,0.05)]">
              <div className="mb-5 flex items-center justify-between gap-2 whitespace-nowrap">
                <h2 className="min-w-0 text-[18px] font-bold text-black">
                  Top 1 spending category
                </h2>
                <div className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-[#9ca3af]">
                  <span>See all budgets</span>
                  <ChevronRight className="size-3" strokeWidth={2.4} />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-[#f0f9e8] text-[#529100]">
                  <UtensilsCrossed className="size-6" strokeWidth={2} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[16px] font-bold text-[#1f2937]">
                        Food and Drinks
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-[14px]">
                        <span className="font-bold text-[#529100]">{staticCards.topCategoryAmount}</span>
                        <span className="text-[#9ca3af]">/ {staticCards.topCategoryBudget}</span>
                      </div>
                    </div>
                    <p className="text-[20px] font-bold text-[#111827]">
                      {staticCards.topCategoryPercent}
                    </p>
                  </div>

                  <div className="mt-3">
                    <Progress value={staticCards.topCategoryProgress} colorClass="bg-[#529100]" />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-[#f2f4f7] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(17,41,69,0.05)]">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-[18px] font-bold text-black">My goals</h2>

                <div className="flex items-center gap-1 text-[10px] font-medium text-[#9ca3af]">
                  <span>See all goals</span>
                  <ChevronRight className="size-3" strokeWidth={2.4} />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-[#ffebeb] text-[#ef5350]">
                  <Wallet className="size-6" strokeWidth={2} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[16px] font-bold text-[#1f2937]">Laptop</p>
                      <div className="mt-2 flex items-center gap-1 text-[14px]">
                        <span className="font-bold text-[#ef4444]">{staticCards.goalAmount}</span>
                        <span className="text-[#9ca3af]">/ {staticCards.goalBudget}</span>
                      </div>
                    </div>
                    <p className="text-[20px] font-bold text-[#ef4444]">{staticCards.goalPercent}</p>
                  </div>

                  <div className="mt-3">
                    <Progress value={staticCards.goalProgress} colorClass="bg-[#ef5350]" />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#f4f5f7] pt-4 text-[12px]">
                <div className="flex items-center gap-2 text-[#4b5563]">
                  <TrendingUpMini />
                  <p>
                    <span className="font-bold text-[#1f2937]">{staticCards.interestAmount}</span>{" "}
                    interest this month
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[#4b5563]">
                  <Coins className="size-4 text-[#94a3b8]" strokeWidth={2} />
                  <p>{staticCards.goalRemaining}</p>
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-[#f2f4f7] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(17,41,69,0.05)]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex size-16 items-center justify-center rounded-full bg-[#eefbf3] text-[#48a678]">
                    <Heart className="size-8" strokeWidth={2} />
                  </div>

                  <div>
                    <h2 className="max-w-[160px] text-[18px] font-bold leading-[1.05] text-[#1f2937]">
                      Financial Health Score
                    </h2>
                    <div className="mt-3 inline-flex rounded-[6px] bg-[#f0fdf4] px-3 py-1 text-[9px] font-bold text-[#059669]">
                      {staticCards.healthTone}
                    </div>
                  </div>
                </div>

                <div className="pt-1 text-right">
                  <div className="text-[14px] font-bold text-[#059669]">
                    {staticCards.healthScore}
                    <span className="font-normal text-[#8b97ad]">/100</span>
                  </div>
                  <div className="mt-3 flex justify-end text-[#f5a524]">
                    <Trophy className="size-5" strokeWidth={2} />
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 border-t border-[#f4f5f7] pt-4">
                <div className="border-r border-[#f4f5f7] pr-4">
                  <div className="flex items-center gap-2 text-[10px] text-[#94a3b8]">
                    <Flame className="size-4 text-[#f97316]" strokeWidth={2} />
                    <span>On budget streak</span>
                  </div>
                  <p className="mt-2 text-[22px] font-bold text-[#f97316]">{staticCards.streakValue}</p>
                </div>

                <div className="pl-4">
                  <div className="flex items-center gap-2 text-[10px] text-[#94a3b8]">
                    <AlertCircle className="size-4 text-[#fbbf24]" strokeWidth={2} />
                    <span>Overspending</span>
                  </div>
                  <p className="mt-2 text-[22px] font-bold text-[#ef4444]">
                    {staticCards.overspendingValue}
                  </p>
                  <p className="mt-1 text-[10px] text-[#94a3b8]">This month</p>
                </div>
              </div>
            </section>
          </div>
        </section>

        <BottomNav />
      </div>
    </main>
  );
}

function TrendingUpMini() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 text-[#4caf74]"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 11L6.5 7.5L8.8 9.8L13 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 5.5H13V8.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
