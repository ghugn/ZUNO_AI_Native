'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import DaySelector from '@/components/ui/DaySelector';
import BudgetCard from '@/components/ui/BudgetCard';
import DailyDistribution from '@/components/ui/DailyDistribution';
import GoalCards from '@/components/ui/GoalCards';
import RecentTransactions from '@/components/ui/RecentTransactions';

export default function Dashboard() {
  return (
    <div className="relative w-full max-w-[393px] h-[852px] mx-auto bg-[#F7F8FA] overflow-hidden flex flex-col">
      {/* Header with gradient background */}
      <Header />

      {/* Main scrollable content */}
      <div className="flex-1 overflow-y-auto mt-[40px] pb-[80px]">
        <div className="px-3 w-full">
          {/* Day Selector */}
          <DaySelector />

          {/* Today's Wrap Section */}
          <div className="mt-6 mb-4">
            <h2 className="font-['SF_Compact_Rounded'] font-bold text-[25px] text-black mb-4">
              Today&apos;s wrap
            </h2>

            {/* Budget Card */}
            <div className="mb-4">
              <BudgetCard
                category="Food and Drinks"
                icon={<span className="text-2xl">🍽️</span>}
                remainingAmount={45000}
                totalBudget={110000}
                spentToday={65000}
                avgPerDay={62000}
                overBudgetPercent={0}
                status="Good"
              />
            </div>

            {/* Daily Distribution */}
            <div className="mb-4">
              <DailyDistribution />
            </div>

            {/* Goal Cards */}
            <div className="mb-6">
              <GoalCards />
            </div>
          </div>

          {/* Recents Section */}
          <div className="mt-8">
            <RecentTransactions />
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
