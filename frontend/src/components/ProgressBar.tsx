import React from 'react';

interface ProgressBarProps {
  percentage: number; // Phần trăm số tiền đã tiêu (0 - 100)
}

export default function ProgressBar({ percentage }: ProgressBarProps) {
  // Tự động tính toán màu sắc dựa trên phần trăm đã tiêu (Thuật toán chánh niệm của ZUNO)
  let barColor = 'bg-green-500'; // Dưới 70%: Cơ chế Xanh
  let statusText = 'Cơ chế 1: Chánh niệm';

  if (percentage >= 70 && percentage < 100) {
    barColor = 'bg-yellow-500'; // From 70% to 99%: Cơ chế Vàng
    statusText = 'Cơ chế 2: Cảnh báo lố nhẹ!';
  } else if (percentage >= 100) {
    barColor = 'bg-red-500'; // Từ 100% trở lên: Cơ chế Đỏ
    statusText = 'Cơ chế 3: LỐ NẶNG - Kích hoạt sinh tồn!';
  }

  return (
    <div className="w-full max-w-md p-4 bg-white rounded-xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-700">{statusText}</span>
        <span className="text-sm font-bold text-slate-900">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full ${barColor} transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}