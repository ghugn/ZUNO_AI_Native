"use client";

import React from "react";

interface ProgressBarProps {
  label?: string;
  allocated: number;
  used: number;
  showLabels?: boolean;
}

export default function ProgressBar({ 
  label, 
  allocated, 
  used,
  showLabels = true
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((used / allocated) * 100), 100);

  // ZUNO Multi-stage fill colors
  let barColor = "bg-safe"; // #BFE6C3
  let statusText = "Safe";

  if (percentage >= 70 && percentage < 90) {
    barColor = "bg-warning"; // #F4D58C
    statusText = "Warning";
  } else if (percentage >= 90 && percentage < 100) {
    barColor = "bg-alert"; // #E6A39C
    statusText = "Critical";
  } else if (percentage >= 100) {
    barColor = "bg-danger"; // #F7B8B8
    statusText = "Over";
  }

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-dark-blue">{label}</span>}
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${barColor} text-dark-blue/80`}>
            {statusText}
          </span>
        </div>
      )}
      
      <div className="w-full bg-black/5 rounded-full h-[10px] overflow-hidden">
        <div 
          className={`h-full ${barColor} transition-all duration-700 ease-out rounded-full shadow-inner`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {showLabels && (
        <div className="flex justify-between items-center mt-1.5 text-[11px] font-medium text-text-secondary">
          <span className="font-amount">{used.toLocaleString()}đ</span>
          <span className="opacity-60">{percentage}% used</span>
        </div>
      )}
    </div>
  );
}
