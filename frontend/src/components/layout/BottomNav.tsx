"use client";

import React from "react";
import { Home, BarChart2, Bot, Wallet, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav({ className = "fixed bottom-0 left-1/2 -translate-x-1/2" }: { className?: string }) {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Trang chủ", href: "/", id: "home" },
    { icon: BarChart2, label: "Thống kê", href: "/analytics", id: "analytics" },
    { icon: Bot, label: "Trợ lý AI", href: "/screen-chatbot", id: "chat-ai" },
    { icon: Wallet, label: "Ngân sách", href: "/budgets", id: "budget" },
    { icon: User, label: "Cá nhân", href: "/profile", id: "profile" },
  ];

  return (
    <nav className={`${className} w-full max-w-[393px] h-[58px] bg-white z-50 flex items-center justify-around px-[25px] border-t border-gray-100`}>
      {navItems.map((item, index) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        if (index === 2) {
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={item.label}
              className={`relative -top-3.5 z-10 flex size-[50px] items-center justify-center rounded-full bg-[#112945] text-white shadow-md shadow-[#112945]/30 transition-all hover:scale-105 active:scale-95 border-2 border-white ${
                isActive ? "ring-2 ring-emerald-500 ring-offset-[1px]" : ""
              }`}
            >
              <Icon className="size-[26px]" strokeWidth={2} />
            </Link>
          );
        }

        return (
          <Link
            key={item.id}
            href={item.href}
            aria-label={item.label}
            className={`flex size-[38px] items-center justify-center rounded-full transition-colors hover:bg-[#edf4ff] hover:text-[#174f84] ${isActive ? "bg-[#edf4ff] text-[#174f84]" : "text-[#546982]"
              }`}
          >
            <Icon
              className="size-[24px]"
              strokeWidth={2}
            />
          </Link>
        );
      })}
    </nav>
  );
}
