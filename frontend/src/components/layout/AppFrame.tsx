"use client";

import React from "react";

interface AppFrameProps {
  children: React.ReactNode;
}

export default function AppFrame({ children }: AppFrameProps) {
  return (
    <div className="flex justify-center items-start min-h-screen bg-slate-100">
      <div className="relative w-full max-w-[393px] h-[852px] bg-[#f7f8fa] overflow-hidden shadow-2xl">
        {/* Background Gradient from Figma Rectangle 36 (node 1:2122) */}
        <div 
          className="absolute top-[-3px] left-0 w-full h-[457px]"
          style={{
            background: 'linear-gradient(180deg, #112945 0%, #4D78A8 37.5%, #F7F8FA 100%)'
          }}
        />
        <div className="relative h-full overflow-y-auto no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
