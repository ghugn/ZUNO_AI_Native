"use client";

import React from "react";

export default function GoalCards() {
  return (
    <div className="w-full flex flex-col gap-[20px]">
      {/* Small Cards Row */}
      <div className="grid grid-cols-2 gap-[11px]">
        {/* Weekly Rewards */}
        <div className="bg-[#f7f8fa] h-[85px] rounded-[20px] shadow-[3px_3px_10px_0px_rgba(0,0,0,0.25)] p-3 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[18px]">🏆</span>
            <span className="font-['SF Compact Rounded',sans-serif] font-semibold text-[12px] text-black">
              Weekly rewards
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-['SF Compact Rounded',sans-serif] text-center text-[15px]">
              <span className="font-semibold text-black">90K</span>
              <span className="text-[#546982] mx-1">/</span>
              <span className="text-[#546982]">100K</span>
            </p>
            <div className="w-full h-[10px] bg-[#d9d9d9] rounded-full overflow-hidden">
              <div className="h-full bg-[#89e692] w-[90%] rounded-full" />
            </div>
          </div>
        </div>

        {/* Long-term goal */}
        <div className="bg-[#f7f8fa] h-[85px] rounded-[20px] shadow-[3px_3px_10px_0px_rgba(0,0,0,0.25)] p-3 flex flex-col justify-between">
           <div className="flex items-center gap-2">
            <span className="text-[18px]">🎯</span>
            <span className="font-['SF Compact Rounded',sans-serif] font-semibold text-[12px] text-black">
              Long-term goal
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-['SF Compact Rounded',sans-serif] text-center text-[15px]">
              <span className="font-semibold text-black">2M</span>
              <span className="text-[#546982] mx-1">/</span>
              <span className="text-[#546982]">16M</span>
            </p>
            <div className="w-full h-[10px] bg-[#d9d9d9] rounded-full overflow-hidden">
              <div className="h-full bg-[#89e692] w-[12.5%] rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Large Investment Card */}
      <div className="bg-[#f7f8fa] min-h-[194px] rounded-[20px] shadow-[3px_3px_10px_0px_rgba(0,0,0,0.25)] p-4 relative">
        <div className="flex gap-4">
            <div className="w-[80px] h-[50px] bg-white rounded-lg flex items-center justify-center p-2">
                 <span className="text-[20px]">🏦</span>
            </div>
            <div className="flex flex-col gap-1">
                <p className="font-['SF Compact Rounded',sans-serif] font-semibold text-[12px] text-black leading-tight">
                    Investment type: Installment savings deposit
                </p>
                <div className="flex flex-col font-['SF Compact Rounded',sans-serif] text-[12px]">
                    <p className="text-black">Terms: <span className="text-[#546982]">6 months</span></p>
                    <p className="text-black">Interest: <span className="text-[#546982]">6.2%/year</span></p>
                    <p className="text-black leading-tight">Monthly deposit: <span className="text-[#546982]">250.000 VNĐ (5% savings)</span></p>
                </div>
            </div>
        </div>

        {/* Progress Bars for Investment */}
        <div className="mt-6 flex flex-col gap-4">
            <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                    <span className="font-['SF Compact Rounded',sans-serif] font-semibold text-[12px] text-black">Progress</span>
                    <p className="font-['SF Compact Rounded',sans-serif] text-[12px]">
                        <span className="font-semibold text-black">55 days</span>
                        <span className="text-[#546982] mx-1">/</span>
                        <span className="text-[#546982]">180 days</span>
                    </p>
                </div>
                <div className="w-full h-[10px] bg-[#d9d9d9] rounded-full overflow-hidden">
                    <div className="h-full bg-[#89e692] w-[30.5%] rounded-full" />
                </div>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-1">
                        <span className="font-['SF Compact Rounded',sans-serif] font-semibold text-[12px] text-black">Current amount</span>
                        <span className="text-[#c5c5c5] text-[10px] w-[14px] h-[14px] rounded-full border border-[#c5c5c5] flex items-center justify-center font-bold">i</span>
                    </div>
                    <p className="font-['SF Compact Rounded',sans-serif] text-[12px]">
                        <span className="font-semibold text-black">755.7K</span>
                        <span className="text-[#546982] mx-1">/</span>
                        <span className="text-[#546982]">1750K</span>
                    </p>
                </div>
                <div className="w-full h-[10px] bg-[#d9d9d9] rounded-full overflow-hidden">
                    <div className="h-full bg-[#89e692] w-[43.1%] rounded-full" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

