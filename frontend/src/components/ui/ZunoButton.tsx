"use client";

import React from "react";

interface ZunoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
}

export default function ZunoButton({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}: ZunoButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-[16px] font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-dark-blue text-white shadow-lg active:bg-dark-blue/90",
    secondary: "bg-white text-dark-blue border border-muted-blue/20 shadow-sm active:bg-bg-primary",
    danger: "bg-danger text-dark-blue font-bold shadow-md active:bg-danger/80",
    ghost: "bg-transparent text-text-secondary hover:bg-black/5",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
    xl: "px-10 py-5 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
