import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Hàm gộp class chống xung đột của Tailwind
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

export default function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const baseStyles = "px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 shadow-xs cursor-pointer";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    danger: "bg-co-che-do text-white hover:opacity-90"
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}

// Component Chuông chuẩn hóa chống tàng hình
export function ZunoBellButton({ className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button 
      className={cn(
        "w-[43px] h-[43px] rounded-full bg-[#738BA5] flex items-center justify-center hover:bg-[#6B7A96] transition-all active:scale-95 cursor-pointer text-white",
        className
      )}
      {...props}
    >
      {/* Thêm shrink-0 block để ép SVG luôn giữ đúng tỷ lệ không bị bóp nghẹt */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-[22px] h-[22px] shrink-0 block"
      >
        <path d="M12 22a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2zm6-6v2H6v-2l2-2v-4a4 4 0 0 1 4-4 4 4 0 0 1 4 4v4l2 2z" />
      </svg>
    </button>
  );
}