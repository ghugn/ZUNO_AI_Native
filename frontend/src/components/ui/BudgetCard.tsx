"use client";

import React from "react";
import GlassCard from "./GlassCard";
import ProgressBar from "./ProgressBar";

interface BudgetCardProps {
  category: string;
  icon?: React.ReactNode;
  remainingAmount: number;
  totalBudget: number;
  spentToday: number;
  avgPerDay: number;
  overBudgetPercent: number;
  status?: "Good" | "Warning" | "Critical" | "Over";
}

export default function BudgetCard({
  category,
  icon,
  remainingAmount,
  totalBudget,
  spentToday,
  avgPerDay,
  overBudgetPercent,
  status = "Good",
}: BudgetCardProps) {
  const statusColors = {
    Good: "bg-safe",
    Warning: "bg-warning",
    Critical: "bg-alert",
    Over: "bg-danger",
  };

  return (
    <GlassCard className="relative overflow-hidden">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-[43px] h-[39px] flex items-center justify-center text-dark-blue">
              {icon}
            </div>
          )}
          <div>
            <p className="text-[14px] text-dark-blue/70 font-medium">
              {category} budget left
            </p>
            <p className="text-[28px] font-amount text-dark-blue">
              {remainingAmount.toLocaleString()}đ
            </p>
          </div>
        </div>
        
        <div className={`px-[10px] py-[2px] rounded-full ${statusColors[status]} transition-colors`}>
          <span className="text-[10px] font-bold text-dark-blue/80 uppercase">
            {status}
          </span>
        </div>
      </div>

      <div className="mt-4 mb-6">
        <ProgressBar 
          allocated={totalBudget} 
          used={totalBudget - remainingAmount} 
          showLabels={false} 
        />
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-black/5 pt-4">
        <div className="text-center">
          <p className="text-[11px] text-text-secondary mb-1">Spent today</p>
          <p className="text-[15px] font-amount text-dark-blue">{spentToday.toLocaleString()}đ</p>
        </div>
        <div className="text-center">
          <p className="text-[11px] text-text-secondary mb-1">Avg / day</p>
          <p className="text-[15px] font-amount text-dark-blue">{avgPerDay.toLocaleString()}đ</p>
        </div>
        <div className="text-center">
          <p className="text-[11px] text-text-secondary mb-1">Over budget</p>
          <p className="text-[15px] font-amount text-dark-blue">{overBudgetPercent}%</p>
        </div>
      </div>
    </GlassCard>
  );
}
