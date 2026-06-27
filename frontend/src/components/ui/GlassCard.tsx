"use client";

import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div className={`glass-panel p-5 ${className}`}>
      {children}
    </div>
  );
}
