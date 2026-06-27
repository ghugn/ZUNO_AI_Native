"use client";

import React from "react";

export default function DaySelector() {
  const days = [
    { name: "Mon", date: 20 },
    { name: "Tue", date: 21 },
    { name: "Wed", date: 22 },
    { name: "Thu", date: 23 },
    { name: "Fri", date: 24, active: true },
    { name: "Sat", date: 25 },
    { name: "Sun", date: 26 },
  ];

  return (
    <div className="w-full flex flex-col items-center gap-[10px] my-6">
      {/* Date Picker Button */}
      <button className="px-[20px] py-[4px] rounded-[30px] border border-[#f7f8fa] bg-transparent">
        <span className="font-['SF_Compact_Rounded',sans-serif] font-medium text-[13px] text-[#f7f8fa]">
          26/04/2026
        </span>
      </button>

      {/* Days Row */}
      <div className="w-full h-full flex flex-col items-center">
        <div className="flex justify-between w-full max-w-[333px] px-2 mb-2">
          {days.map((day) => (
            <span
              key={day.name}
              className="font-['Inter',sans-serif] text-[12px] text-white text-center w-[28px]"
            >
              {day.name}
            </span>
          ))}
        </div>
        <div className="flex justify-between w-full max-w-[333px] px-2">
          {days.map((day) => (
            <div
              key={day.date}
              className={`w-[28px] h-[28px] rounded-full flex items-center justify-center font-['Inter',sans-serif] font-bold text-[12px] transition-all ${
                day.active
                  ? "bg-[#112945] text-white"
                  : "bg-white text-black shadow-sm"
              }`}
            >
              {day.date}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

