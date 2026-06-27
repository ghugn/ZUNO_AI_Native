"use client";

import React from "react";

export default function DailyDistribution() {
  return (
    <div className="w-[363px] h-[145px] bg-[#f7f8fa] border border-[#42a959] border-dashed rounded-[20px] shadow-[0px_10px_30px_0px_rgba(0,0,20,0.08)] mx-auto p-3 relative">
      <div className="flex justify-center items-center gap-1 mb-1">
        <h3 className="font-['SF_Compact_Rounded',sans-serif] font-semibold text-[14px] text-black">
          Daily distribution for food
        </h3>
        <span className="text-[#c5c5c5] text-[10px] w-[14px] h-[14px] rounded-full border border-[#c5c5c5] flex items-center justify-center font-bold">i</span>
      </div>
      
      <p className="font-['SF_Compact_Rounded',sans-serif] text-[12px] text-black text-center mb-4 opacity-70">
        4 days left this month
      </p>

      <div className="grid grid-cols-2 gap-[10px]">
        {/* Main Meals Card */}
        <div className="h-[67px] bg-gradient-to-b from-[#BFE6C3]/50 to-white/50 rounded-[20px] shadow-[3px_3px_10px_0px_rgba(0,0,0,0.25)] p-3 relative flex items-center">
            <div className="absolute left-[-5px] top-[-5px] w-[40px] h-[40px]">
                <span className="text-[20px]">🍲</span>
            </div>
            <div className="flex flex-col ml-8">
                <span className="font-['SF_Compact_Rounded',sans-serif] font-semibold text-[12px] text-black">Main meals</span>
                <p className="font-['SF_Compact_Rounded',sans-serif] font-bold text-black mt-[-2px]">
                    <span className="text-[18px]">80.000đ</span>
                    <span className="text-[12px] font-normal ml-1">/ day</span>
                </p>
            </div>
        </div>

        {/* Snacks Card */}
        <div className="h-[67px] bg-gradient-to-b from-[#F4D58C]/50 to-white/50 rounded-[20px] shadow-[3px_3px_10px_0px_rgba(0,0,0,0.25)] p-3 relative flex items-center">
             <div className="absolute left-[-5px] top-[-5px] w-[40px] h-[40px]">
                <span className="text-[20px]">🍿</span>
            </div>
            <div className="flex flex-col ml-8">
                <span className="font-['SF_Compact_Rounded',sans-serif] font-semibold text-[12px] text-black">Snacks</span>
                <p className="font-['SF_Compact_Rounded',sans-serif] font-bold text-black mt-[-2px]">
                    <span className="text-[18px]">20.000đ</span>
                    <span className="text-[12px] font-normal ml-1">/ day</span>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}

