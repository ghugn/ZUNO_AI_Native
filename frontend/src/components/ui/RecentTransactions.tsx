"use client";

import React from "react";

export default function RecentTransactions() {
  const transactions = [
    { title: "Food and Drinks", time: "Today, 08:30", amount: "-65.000đ", type: "expense", icon: "🍲" },
    { title: "Income", time: "Yesterday, 21:30", amount: "+3.000.000đ", type: "income", icon: "💰" },
    { title: "Food", time: "Yesterday, 19:00", amount: "-35.000đ", type: "expense", icon: "🍔" },
    { title: "Entertainment", time: "25 April", amount: "-100.000đ", type: "expense", icon: "🎮" },
    { title: "Transport", time: "25 April", amount: "-20.000đ", type: "expense", icon: "🚌" },
  ];

  return (
    <div className="w-full flex flex-col gap-[12px] mt-2 mb-8 px-2">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-['SF Compact Rounded',sans-serif] font-bold text-[20px] text-black">
          Recents
        </h2>
        <button className="font-['SF Compact Rounded',sans-serif] text-[12px] text-black opacity-60">
          See all
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {transactions.map((t, i) => (
          <div key={i} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-[33px] h-[33px] bg-white rounded-lg shadow-sm flex items-center justify-center text-[18px]">
                  {t.icon}
                </div>
                <div className="flex flex-col">
                  <span className="font-['SF Compact Rounded',sans-serif] font-semibold text-[12px] text-black">
                    {t.title}
                  </span>
                  <span className="font-['SF Compact Rounded',sans-serif] text-[10px] text-[#546982]">
                    {t.time}
                  </span>
                </div>
              </div>
              <span className={`font-['SF Compact Rounded',sans-serif] font-semibold text-[13px] ${
                t.type === 'income' ? 'text-[#2e9b56]' : 'text-[#111]'
              }`}>
                {t.amount}
              </span>
            </div>
            {i < transactions.length - 1 && (
                <div className="h-[1px] w-full bg-[#E3E3E3] ml-[49px]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

