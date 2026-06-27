'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import BottomNav from "@/components/layout/BottomNav";
import {
  Home, BarChart2, Wallet, User, ArrowLeft, RefreshCw,
  Wifi, WifiOff, Building2, CheckCircle2, Zap,
  TrendingDown, TrendingUp, Utensils, Compass, BookOpen,
  PiggyBank
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { getStoredUserId } from '@/lib/api/client';

// ── Types ─────────────────────────────────────────────────────
interface BankTx {
  status: string;
  merchant: string;
  amount: number;
  category: string;
  fundType: string;
  method: string;
  confidence: number;
  time: string;
  overflow: { triggered: boolean; highestLevel?: string | null };
}

// ── Fund config (light mode) ──────────────────────────────────
const FUND_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string; border: string; iconComp: any; iconColor: string }> = {
  food:       { label: 'Ăn uống',     icon: '🍽️', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', iconComp: Utensils,  iconColor: '#ea580c' },
  living:     { label: 'Sinh hoạt',   icon: '🏠', color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', iconComp: Home,      iconColor: '#4f46e5' },
  growth:     { label: 'Phát triển',  icon: '📚', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', iconComp: BookOpen,  iconColor: '#16a34a' },
  experience: { label: 'Trải nghiệm', icon: '🎉', color: '#9333ea', bg: '#faf5ff', border: '#e9d5ff', iconComp: Compass,   iconColor: '#9333ea' },
  future:     { label: 'Tương lai',   icon: '💰', color: '#d97706', bg: '#fffbeb', border: '#fde68a', iconComp: PiggyBank, iconColor: '#d97706' },
};

const METHOD_LABEL: Record<string, string> = {
  bank_metadata: 'MCC',
  rule_engine:   'Rule',
  ai_fallback:   'AI',
  default:       'Default',
};

function fmt(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n);
}

function formatTime(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}



// ── Card wrapper ──────────────────────────────────────────────
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-[20px] shadow-[0px_10px_30px_0px_rgba(0,0,20,0.08)] ${className}`}>
      {children}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function BankActivityPage() {
  const [transactions, setTransactions] = useState<BankTx[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // The correct secret that matches the backend env
  const BACKEND_URL     = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const WEBHOOK_SECRET  = 'mock-bank-secret-2024'; // must match MOCK_BANK_WEBHOOK_SECRET in .env

  const fetchTransactions = useCallback(async () => {
    try {
      const userId = getStoredUserId();
      const url = userId 
        ? `${BACKEND_URL}/api/webhook/transactions?limit=30&userId=${userId}`
        : `${BACKEND_URL}/api/webhook/transactions?limit=30`;
        
      // Backend returns a plain array (not { transactions: [] })
      const res = await fetch(url, {
        headers: { 'x-webhook-secret': WEBHOOK_SECRET },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: BankTx[] = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
      setIsConnected(true);
      setError(null);
      setLastUpdated(new Date());
    } catch (e: any) {
      setIsConnected(false);
      setError(e.message || 'Cannot reach bank stream');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [BACKEND_URL, WEBHOOK_SECRET]);

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 10_000);
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  const handleRefresh = () => { setRefreshing(true); fetchTransactions(); };

  const expenseTotal = transactions.filter(t => t.status !== 'income').reduce((s, t) => s + t.amount, 0);
  const incomeTotal  = transactions.filter(t => t.status === 'income').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="flex justify-center items-start min-h-screen bg-slate-100">
      <div className="relative w-full max-w-[393px] min-h-screen bg-[#f7f8fa]" style={{ paddingBottom: '80px' }}>

        {/* ── Gradient header (same as home / analytics) ────── */}
        <div className="absolute top-0 left-0 w-full h-[457px] bg-gradient-to-b from-[#112945] via-[#4d78a8] via-[37.5%] to-[#f7f8fa]" />
        
        <div className="pointer-events-none absolute left-[88px] top-[48px] size-[3px] rounded-full bg-white/45 z-0" />
        <div className="pointer-events-none absolute left-[172px] top-[28px] size-[2px] rounded-full bg-white/45 z-0" />
        <div className="pointer-events-none absolute right-[56px] top-[50px] size-[2px] rounded-full bg-white/45 z-0" />
        <div className="pointer-events-none absolute right-[78px] top-[34px] size-[1.5px] rounded-full bg-white/45 z-0" />

        <div className="relative z-10">
          {/* Top bar */}
          <div className="px-5 pt-12 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center"
              >
                <ArrowLeft size={16} className="text-white" />
              </Link>
              <div>
                <p className="font-['SF_Compact_Rounded',sans-serif] text-white/70 text-[12px] font-medium tracking-wider uppercase">
                  Bank Activity
                </p>
                <h1 className="font-['SF_Compact_Rounded',sans-serif] text-white text-[28px] font-bold leading-tight mt-0.5">
                  Zuno
                </h1>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              aria-label="Refresh"
              className={`w-[43px] h-[43px] rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center transition-all hover:bg-white/25 ${refreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={18} className="text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="px-[14px] space-y-4 mt-2">

            {/* ── Connection Status ──────────────────────────── */}
            <Card>
              <div className="p-4 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isConnected ? 'bg-[#f0fdf4]' : 'bg-[#fef2f2]'
                  }`}
                >
                  {isConnected
                    ? <Wifi size={20} className="text-[#16a34a]" />
                    : <WifiOff size={20} className="text-[#dc2626]" />
                  }
                </div>
                <div className="flex-1">
                  <p className={`font-['SF_Compact_Rounded',sans-serif] text-[13px] font-semibold ${isConnected ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
                    {isConnected ? 'VietBank Digital — Đã kết nối' : 'Bank stream offline'}
                  </p>
                  <p className={`font-['SF_Compact_Rounded',sans-serif] text-[11px] ${isConnected ? 'text-[#546982]' : 'text-[#dc2626]/70'}`}>
                    {isConnected && lastUpdated
                      ? `Cập nhật lúc ${lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                      : error || 'Không thể kết nối backend'
                    }
                  </p>
                </div>
                {isConnected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#16a34a] animate-pulse flex-shrink-0" />
                )}
              </div>
            </Card>

            {/* ── How it works ──────────────────────────────── */}
            <Card>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="size-[33px] rounded-full bg-[#edf4ff] flex items-center justify-center">
                    <Building2 size={16} className="text-[#174f84]" />
                  </div>
                  <p className="font-['SF_Compact_Rounded',sans-serif] text-[13px] font-semibold text-black">
                    Tự động từ VietBank
                  </p>
                </div>
                <div className="space-y-2">
                  {[
                    { icon: Zap,           label: 'Giao dịch xảy ra tại VietBank',         color: '#d97706', bg: '#fffbeb' },
                    { icon: CheckCircle2,  label: 'Webhook đẩy dữ liệu vào ZUNO',          color: '#16a34a', bg: '#f0fdf4' },
                    { icon: Building2,     label: 'Smart Categorizer phân loại quỹ',        color: '#174f84', bg: '#edf4ff' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="size-[26px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: step.bg }}>
                        <step.icon size={13} style={{ color: step.color }} />
                      </div>
                      <p className="font-['SF_Compact_Rounded',sans-serif] text-[12px] text-[#546982]">{step.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* ── Summary cards ─────────────────────────────── */}
            {transactions.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingDown size={13} className="text-[#dc2626]" />
                    <p className="font-['SF_Compact_Rounded',sans-serif] text-[10px] font-semibold uppercase tracking-wider text-[#546982]">Chi tiêu</p>
                  </div>
                  <p className="font-['SF_Compact_Rounded',sans-serif] text-[16px] font-bold text-black">{fmt(expenseTotal)} ₫</p>
                  <p className="font-['SF_Compact_Rounded',sans-serif] text-[10px] text-[#9db2c6] mt-0.5">
                    {transactions.filter(t => t.status !== 'income').length} giao dịch
                  </p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp size={13} className="text-[#16a34a]" />
                    <p className="font-['SF_Compact_Rounded',sans-serif] text-[10px] font-semibold uppercase tracking-wider text-[#546982]">Thu nhập</p>
                  </div>
                  <p className="font-['SF_Compact_Rounded',sans-serif] text-[16px] font-bold text-black">{fmt(incomeTotal)} ₫</p>
                  <p className="font-['SF_Compact_Rounded',sans-serif] text-[10px] text-[#9db2c6] mt-0.5">
                    {transactions.filter(t => t.status === 'income').length} giao dịch
                  </p>
                </Card>
              </div>
            )}

            {/* ── Transaction Feed ──────────────────────────── */}
            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-['SF_Compact_Rounded',sans-serif] text-[11px] font-semibold uppercase tracking-[1.2px] text-[#546982]">
                    Live Transaction Stream
                  </p>
                  <span className="font-['SF_Compact_Rounded',sans-serif] text-[11px] text-[#9db2c6]">{transactions.length} bản ghi</span>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-[#e3e6eb] border-t-[#174f84] rounded-full animate-spin" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-[48px] mb-3">🏦</div>
                    <p className="font-['SF_Compact_Rounded',sans-serif] text-[15px] font-semibold text-[#283241] mb-1">
                      Chưa có giao dịch ngân hàng
                    </p>
                    <p className="font-['SF_Compact_Rounded',sans-serif] text-[12px] text-[#546982] leading-relaxed">
                      Mở VietBank tại localhost:8080<br />
                      và tạo giao dịch để thấy ở đây
                    </p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {transactions.map((tx, index, arr) => {
                      const conf = FUND_CONFIG[tx.fundType] || FUND_CONFIG.experience;
                      const isIncome = tx.status === 'income';
                      const methodLabel = METHOD_LABEL[tx.method] || tx.method;
                      const IconComp = conf.iconComp;

                      return (
                        <div key={`${tx.merchant}-${tx.time}-${index}`}>
                          <div className="flex items-center gap-3 py-3">
                            {/* Fund icon */}
                            <div
                              className="size-[38px] rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: conf.bg }}
                            >
                              <IconComp size={18} style={{ color: conf.iconColor }} />
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <p className="font-['SF_Compact_Rounded',sans-serif] text-[13px] font-semibold text-black truncate">
                                  {tx.merchant || tx.category}
                                </p>
                                {tx.overflow?.triggered && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] flex-shrink-0">
                                    LỐ
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className="font-['SF_Compact_Rounded',sans-serif] text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                  style={{ background: conf.bg, color: conf.color }}
                                >
                                  {conf.label}
                                </span>
                                <span className="font-['SF_Compact_Rounded',sans-serif] text-[10px] text-[#9db2c6] bg-[#f7f8fa] border border-[#e3e6eb] px-1.5 py-0.5 rounded">
                                  {methodLabel}
                                </span>
                                <span className="font-['SF_Compact_Rounded',sans-serif] text-[10px] text-[#9db2c6]">
                                  {formatTime(tx.time)}
                                </span>
                              </div>
                              {/* Confidence bar */}
                              <div className="mt-1.5 flex items-center gap-1.5">
                                <div className="flex-1 bg-[#e3e6eb] rounded-full h-[3px]">
                                  <div
                                    className="h-[3px] rounded-full"
                                    style={{ width: `${Math.round(tx.confidence * 100)}%`, background: conf.color }}
                                  />
                                </div>
                                <span className="font-['SF_Compact_Rounded',sans-serif] text-[9px] text-[#9db2c6]">
                                  {Math.round(tx.confidence * 100)}%
                                </span>
                              </div>
                            </div>

                            {/* Amount */}
                            <p className={`font-['SF_Compact_Rounded',sans-serif] text-[13px] font-bold flex-shrink-0 ${isIncome ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
                              {isIncome ? '+' : '-'}{fmt(tx.amount)} ₫
                            </p>
                          </div>
                          {index < arr.length - 1 && <div className="h-px bg-[#e3e6eb] ml-[50px]" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>

          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
