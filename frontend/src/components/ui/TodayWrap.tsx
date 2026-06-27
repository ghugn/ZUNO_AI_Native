"use client";

import React from "react";

export default function TodayWrap() {
  return (
    <div className="w-full mt-[20px] flex flex-col gap-[16px]">
      <h2 className="font-['SF Compact Rounded',sans-serif] font-bold text-[25px] text-black text-center mb-[10px]">
        Today’s wrap
      </h2>

      <div className="relative w-[363px] h-[184px] bg-[#f7f8fa] rounded-[20px] shadow-[0px_10px_30px_0px_rgba(0,0,20,0.08)] mx-auto p-4 flex flex-col justify-between">
        {/* Top Section */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
              <span className="font-['SF Compact Rounded',sans-serif] text-[14px] text-black">
              Food and Drinks budget left
            </span>
            <div className="flex items-center gap-2">
              <span className="font-['SF Compact Rounded',sans-serif] font-bold text-[28px] text-black">
                45.000đ
              </span>
              <div className="bg-[#BFE6C3] px-3 py-0.5 rounded-full">
                <span className="font-['SF Compact Rounded',sans-serif] font-medium text-[10px] text-black">
                  Good
                </span>
              </div>
            </div>
          </div>
          
          {/* Vector/Icon Placeholder */}
          <div className="w-[107px] h-[90px] opacity-10 flex items-center justify-center">
            {/* Using a placeholder for the complex Figma vector */}
            <div className="w-full h-full bg-dark-blue rounded-full blur-2xl" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-around items-center">
             <span className="font-['SF Compact Rounded',sans-serif] text-[12px] text-black text-center w-[90px]">Spent today</span>
             <span className="font-['SF Compact Rounded',sans-serif] text-[12px] text-black text-center w-[90px]">Avg / day</span>
             <span className="font-['SF Compact Rounded',sans-serif] text-[12px] text-black text-center w-[90px]">Over budget</span>
          </div>
          <div className="flex justify-around items-center">
             <span className="font-['SF Compact Rounded',sans-serif] font-semibold text-[16px] text-black text-center w-[90px]">65.000đ</span>
             <span className="font-['SF Compact Rounded',sans-serif] font-semibold text-[16px] text-black text-center w-[90px]">62.000đ</span>
             <span className="font-['SF Compact Rounded',sans-serif] font-semibold text-[16px] text-black text-center w-[90px]">0%</span>
          </div>
        </div>
      </div>
    </div>
  );
}


