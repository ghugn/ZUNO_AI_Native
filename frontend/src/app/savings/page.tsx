'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import Link from 'next/link';
import {
  Home, BarChart2, Wallet, User, TrendingUp, PiggyBank,
  Award, ArrowLeft, Lightbulb, AlertCircle, CheckCircle2,
  Coffee, Target
} from 'lucide-react';
import { usePathname } from 'next/navigation';

// ── Types ─────────────────────────────────────────────────────

interface DashboardData {
  weeklySavingsProgress: {
    weekStart: string;
    weekEnd: string;
    accumulated: number;
    milestone: string;
    isUnlocked: boolean;
    pointsEarned: number;
  } | null;
  savingsGrowth: {
    dates: string[];
    balances: number[];
    projections: { months3: number; months6: number; months12: number };
  };
  funds: {
    fundType: string;
    allocated: number;
    spent: number;
    remaining: number;
  }[];
}

interface Suggestion {
  id: string;
  level: 'tip' | 'warning' | 'urgent';
  category: string;
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
  metric?: {
    label: string;
    value: string;
    change?: string;
  };
}

// ── Helpers ───────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n);
}

function getMonthStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

// ── Main Page ─────────────────────────────────────────────────
export default function SavingsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const month = getMonthStr();
      const [dashResult, suggResult] = await Promise.all([
        apiClient.get<DashboardData>('/api/analytics/dashboard', { query: { month } }),
        apiClient.get<Suggestion[]>('/api/analytics/suggestions', { query: { month } }),
      ]);
      setData(dashResult);
      setSuggestions(suggResult);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex justify-center items-start min-h-screen bg-slate-100">
        <div className="relative w-full max-w-[393px] min-h-screen bg-[#f7f8fa] flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-[#e3e6eb] border-t-[#174f84] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex justify-center items-start min-h-screen bg-slate-100">
        <div className="relative w-full max-w-[393px] min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6">
          <p className="text-[#dc2626] mb-4 text-center">{error}</p>
          <button onClick={fetchData} className="bg-[#112945] text-white px-6 py-2 rounded-full">Thử lại</button>
        </div>
      </div>
    );
  }

  const futureFund = data.funds.find(f => f.fundType === 'future');

  return (
    <div className="flex justify-center items-start min-h-screen bg-slate-100">
      <div className="relative w-full max-w-[393px] min-h-screen bg-[#f7f8fa] pb-10">

        {/* ── Header ────────────────────────────────────────── */}
        <div className="bg-[#112945] text-white px-5 pt-12 pb-6 rounded-b-[24px] shadow-md relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/analytics" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="font-['SF_Compact_Rounded',sans-serif] text-[20px] font-bold">Tiết kiệm & Gợi ý</h1>
          </div>

          <div className="text-center mt-2">
            <p className="font-['SF_Compact_Rounded',sans-serif] text-[13px] text-white/70 uppercase tracking-wider mb-1">
              Số dư quỹ Tương lai
            </p>
            <p className="font-['SF_Compact_Rounded',sans-serif] text-[36px] font-black tracking-tight">
              {fmt(futureFund?.remaining || 0)} <span className="text-[20px] text-white/70">₫</span>
            </p>
          </div>
        </div>

        <div className="px-[14px] mt-[-20px] relative z-20 space-y-4">

          {/* ── Smart Suggestions (AI Insights) ───────────────── */}
          <div className="bg-white rounded-[20px] shadow-[0_10px_30px_rgba(0,0,20,0.08)] overflow-hidden">
            <div className="p-4 border-b border-[#f0f2f5] bg-gradient-to-r from-blue-50/50 to-transparent">
              <div className="flex items-center gap-2">
                <Lightbulb size={20} className="text-[#2563eb]" />
                <h2 className="font-['SF_Compact_Rounded',sans-serif] text-[15px] font-bold text-[#112945]">Gợi ý thông minh ZUNO</h2>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {suggestions.length === 0 ? (
                <p className="text-center text-[#546982] text-[13px]">Hiện chưa có gợi ý mới nào.</p>
              ) : (
                suggestions.map(s => {
                  const colors = {
                    urgent: 'bg-[#fef2f2] border-[#fecaca] text-[#dc2626]',
                    warning: 'bg-[#fffbeb] border-[#fde68a] text-[#d97706]',
                    tip: 'bg-[#f0fdf4] border-[#bbf7d0] text-[#16a34a]',
                  };
                  const icons = {
                    urgent: <AlertCircle size={18} className="mt-0.5 shrink-0" />,
                    warning: <AlertCircle size={18} className="mt-0.5 shrink-0" />,
                    tip: <CheckCircle2 size={18} className="mt-0.5 shrink-0" />,
                  };
                  return (
                    <div key={s.id} className={`p-3 rounded-[16px] border ${colors[s.level]} flex items-start gap-3`}>
                      {icons[s.level]}
                      <div className="flex-1 min-w-0">
                        <p className="font-['SF_Compact_Rounded',sans-serif] text-[14px] font-bold mb-1">{s.title}</p>
                        <p className="font-['SF_Compact_Rounded',sans-serif] text-[12px] opacity-90 leading-snug">{s.body}</p>
                        
                        {s.metric && (
                          <div className="mt-2 inline-flex items-center gap-2 bg-white/60 px-2 py-1 rounded-md">
                            <span className="font-['SF_Compact_Rounded',sans-serif] text-[10px] uppercase">{s.metric.label}:</span>
                            <span className="font-['SF_Compact_Rounded',sans-serif] text-[12px] font-bold">{s.metric.value}</span>
                          </div>
                        )}
                        
                        {s.actionHref && (
                          <div className="mt-2 text-right">
                            <Link href={s.actionHref} className="inline-block px-3 py-1.5 bg-white/80 rounded-full font-['SF_Compact_Rounded',sans-serif] text-[11px] font-bold shadow-sm">
                              {s.actionLabel}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Savings Projection ────────────────────────────── */}
          <div className="bg-white rounded-[20px] shadow-[0_10px_30px_rgba(0,0,20,0.08)] p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-[#f3e8ff] text-[#9333ea] flex items-center justify-center">
                  <TrendingUp size={16} />
                </div>
                <h3 className="font-['SF_Compact_Rounded',sans-serif] text-[14px] font-bold text-[#112945]">Dự phóng sinh lời</h3>
              </div>
              <span className="font-['SF_Compact_Rounded',sans-serif] text-[11px] bg-[#f7f8fa] text-[#546982] px-2 py-1 rounded-md">
                Lãi suất 6%/năm
              </span>
            </div>

            <div className="space-y-2">
              {[
                { label: '3 tháng tới', val: data.savingsGrowth.projections.months3 },
                { label: '6 tháng tới', val: data.savingsGrowth.projections.months6 },
                { label: '1 năm tới', val: data.savingsGrowth.projections.months12 },
              ].map((proj, idx) => (
                <div key={proj.label} className="flex items-center justify-between p-3 rounded-[12px] bg-[#f7f8fa]">
                  <span className="font-['SF_Compact_Rounded',sans-serif] text-[13px] text-[#546982]">{proj.label}</span>
                  <span className="font-['SF_Compact_Rounded',sans-serif] text-[14px] font-bold text-[#9333ea]">
                    ~ {fmt(proj.val)} ₫
                  </span>
                </div>
              ))}
            </div>
            <p className="font-['SF_Compact_Rounded',sans-serif] text-[11px] text-center text-[#9db2c6] mt-3">
              * Ước tính dựa trên số dư quỹ Tương lai hiện tại
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
