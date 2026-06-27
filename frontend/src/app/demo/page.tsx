'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Home, BarChart2, Wallet, User, Zap, RefreshCw,
  Play, Square, CheckCircle2, AlertTriangle, XCircle,
  Users, FlaskConical, BarChart, TrendingUp, Coffee,
  ChevronRight, Activity, Wifi, WifiOff,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { bootstrapAuth } from '@/lib/api/auth';
import { apiClient } from '@/lib/apiClient';

// ── Types ─────────────────────────────────────────────────────
interface DemoUser {
  id: string;
  fullName: string;
  email: string;
  profile?: { residenceType?: string; bankBalance?: number };
}

interface DemoScenario {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  transactions: Array<{
    merchantName: string;
    amount: number;
    bankCategory: string;
    description: string;
  }>;
}

interface FeedItem {
  id: string;
  status: 'success' | 'overflow' | 'error' | 'pending';
  merchant: string;
  amount: number;
  fundType?: string;
  category?: string;
  overflowLevel?: string;
  error?: string;
  time: Date;
}

// ── Constants ─────────────────────────────────────────────────
const WEBHOOK_SECRET = 'mock-bank-secret-2024';
const BACKEND = 'http://localhost:5000/api';

const FUND_COLOR: Record<string, string> = {
  food: '#fb923c', living: '#818cf8', growth: '#4ade80',
  experience: '#c084fc', future: '#fbbf24',
};
const FUND_EMOJI: Record<string, string> = {
  food: '🍽️', living: '🏠', growth: '📚', experience: '🎉', future: '💰',
};

// ── Bottom Nav ────────────────────────────────────────────────
function BottomNav() {
  const pathname = usePathname();
  const navItems = [
    { icon: Home,      href: '/' },
    { icon: BarChart2, href: '/analytics' },
    { icon: Wallet,    href: '/budgets' },
    { icon: User,      href: '/profile' },
  ];
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[393px] h-[58px] bg-white z-50 flex items-center justify-around px-[25px] shadow-[-2px_-2px_20px_0px_rgba(0,0,0,0.18)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex size-[38px] items-center justify-center rounded-full transition-colors hover:bg-[#edf4ff] hover:text-[#174f84] ${
              isActive ? 'bg-[#edf4ff] text-[#174f84]' : 'text-[#546982]'
            }`}
          >
            <Icon className={isActive ? 'size-[22px]' : 'size-[24px]'} strokeWidth={isActive ? 2.25 : 1.75} />
          </Link>
        );
      })}
    </nav>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function DemoPage() {
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<DemoUser | null>(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState({ total: 0, success: 0, overflow: 0, error: 0 });

  // ── Scenarios ──────────────────────────────────────────────
  const SCENARIOS: DemoScenario[] = [
    {
      id: 'overflow',
      label: 'Cơ chế Lố',
      description: 'Kích hoạt 3 mức Lố bằng cách chi vượt quỹ Food liên tiếp',
      icon: <AlertTriangle className="size-5" />,
      color: '#f59e0b',
      transactions: [
        { merchantName: 'Grab Food', amount: 120000, bankCategory: 'food_and_beverage', description: 'Đặt đồ ăn' },
        { merchantName: 'Bún bò Huế', amount: 85000, bankCategory: 'food_and_beverage', description: 'Bữa trưa' },
        { merchantName: 'Cơm tấm Lan Anh', amount: 95000, bankCategory: 'food_and_beverage', description: 'Bữa tối' },
        { merchantName: 'Highlands Coffee', amount: 75000, bankCategory: 'food_and_beverage', description: 'Cà phê buổi sáng' },
        { merchantName: 'Lotteria', amount: 110000, bankCategory: 'fast_food', description: 'Fast food' },
      ],
    },
    {
      id: 'savings',
      label: 'Tiết kiệm',
      description: 'Mô phỏng chi tiêu hợp lý để đạt mốc tiết kiệm tuần',
      icon: <TrendingUp className="size-5" />,
      color: '#22c55e',
      transactions: [
        { merchantName: 'Điện lực TP.HCM', amount: 280000, bankCategory: 'utilities', description: 'Hoá đơn điện' },
        { merchantName: 'Fahasa Books', amount: 85000, bankCategory: 'education', description: 'Sách kỹ năng' },
        { merchantName: 'VPBank tiết kiệm', amount: 300000, bankCategory: 'savings', description: 'Gửi tiết kiệm' },
      ],
    },
    {
      id: 'latte',
      label: 'Latte Factor',
      description: 'Chi tiêu lặp lại nhỏ hàng ngày tạo tác động lớn',
      icon: <Coffee className="size-5" />,
      color: '#a78bfa',
      transactions: [
        { merchantName: 'Highlands Coffee', amount: 65000, bankCategory: 'food_and_beverage', description: 'Cà phê sáng thứ 2' },
        { merchantName: 'Shopee - iPhone case', amount: 95000, bankCategory: 'shopping', description: 'Mua sắm online nhỏ' },
        { merchantName: 'Highlands Coffee', amount: 65000, bankCategory: 'food_and_beverage', description: 'Cà phê sáng thứ 3' },
        { merchantName: 'Circle K', amount: 35000, bankCategory: 'convenience_store', description: 'Nước + snack' },
        { merchantName: 'Highlands Coffee', amount: 65000, bankCategory: 'food_and_beverage', description: 'Cà phê sáng thứ 4' },
        { merchantName: 'Tiki - phụ kiện', amount: 120000, bankCategory: 'shopping', description: 'Mua online' },
      ],
    },
    {
      id: 'mixed',
      label: 'Full Demo',
      description: 'Kịch bản tổng hợp: chi ăn uống, giải trí, mua sắm, tiết kiệm',
      icon: <FlaskConical className="size-5" />,
      color: '#38bdf8',
      transactions: [
        { merchantName: 'Cơm tấm', amount: 40000, bankCategory: 'food_and_beverage', description: 'Bữa sáng' },
        { merchantName: 'Grab Food', amount: 85000, bankCategory: 'food_and_beverage', description: 'Bữa trưa' },
        { merchantName: 'CGV Cinema', amount: 110000, bankCategory: 'entertainment', description: 'Vé xem phim' },
        { merchantName: 'Shopee', amount: 350000, bankCategory: 'shopping', description: 'Áo phông' },
        { merchantName: 'Điện lực', amount: 280000, bankCategory: 'utilities', description: 'Tiền điện' },
        { merchantName: 'Fahasa', amount: 120000, bankCategory: 'education', description: 'Sách' },
        { merchantName: 'Highlands Coffee', amount: 65000, bankCategory: 'food_and_beverage', description: 'Cà phê' },
        { merchantName: 'VPBank tiết kiệm', amount: 200000, bankCategory: 'savings', description: 'Gửi tiết kiệm' },
      ],
    },
  ];

  // ── Init ───────────────────────────────────────────────────
  useEffect(() => {
    void bootstrapAuth();
    void checkBackend();
    void loadUsers();
  }, []);

  async function checkBackend() {
    try {
      const r = await fetch(`${BACKEND}/health`, { signal: AbortSignal.timeout(3000) });
      setBackendOnline(r.ok);
    } catch {
      setBackendOnline(false);
    }
  }

  async function loadUsers() {
    try {
      const r = await fetch(`${BACKEND}/webhook/users`, {
        headers: { 'x-webhook-secret': WEBHOOK_SECRET },
      });
      if (r.ok) {
        const data = await r.json();
        setUsers(data);
        if (data.length > 0) setSelectedUser(data[0]);
      }
    } catch { /* offline */ }
  }

  // ── Run Scenario ───────────────────────────────────────────
  const runScenario = useCallback(async (scenario: DemoScenario) => {
    if (!selectedUser || running) return;
    setRunning(true);

    for (const tx of scenario.transactions) {
      const itemId = `${Date.now()}-${Math.random()}`;

      // Add pending
      setFeed(prev => [{
        id: itemId, status: 'pending',
        merchant: tx.merchantName, amount: tx.amount, time: new Date(),
      }, ...prev]);

      try {
        const r = await fetch(`${BACKEND}/webhook/bank-transaction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-webhook-secret': WEBHOOK_SECRET },
          body: JSON.stringify({
            userId: selectedUser.id,
            merchantName: tx.merchantName,
            amount: tx.amount,
            description: tx.description,
            bankCategory: tx.bankCategory,
            bankTransactionId: `demo-${itemId}`,
          }),
        });

        const data = await r.json();

        setFeed(prev => prev.map(f => f.id === itemId ? {
          ...f,
          status: data.overflow?.triggered ? 'overflow' : 'success',
          fundType: data.categorization?.fundType,
          category: data.categorization?.category,
          overflowLevel: data.overflow?.highestLevel,
        } : f));

        setStats(prev => ({
          total: prev.total + 1,
          success: prev.success + 1,
          overflow: data.overflow?.triggered ? prev.overflow + 1 : prev.overflow,
          error: prev.error,
        }));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setFeed(prev => prev.map(f => f.id === itemId ? {
          ...f, status: 'error', error: msg,
        } : f));
        setStats(prev => ({ ...prev, error: prev.error + 1 }));
      }

      // Delay between transactions for dramatic effect
      await new Promise(res => setTimeout(res, 900));
    }

    setRunning(false);
  }, [selectedUser, running]);

  async function resetDemo() {
    if (!selectedUser) return;
    try {
      await apiClient.post('/cron/daily-drip', {});
    } catch { /* ignore */ }
    setFeed([]);
    setStats({ total: 0, success: 0, overflow: 0, error: 0 });
  }

  const residenceLabel = (type?: string) =>
    type === 'dorm' ? 'Sinh viên KTX' : type === 'rent' ? 'Thuê nhà' : 'Chuyên nghiệp';

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[393px] overflow-x-hidden bg-[#f7f8fa] pb-[80px]">
      {/* Header gradient */}
      <div className="absolute inset-x-0 top-0 h-[200px] bg-gradient-to-b from-[#112945] via-[#4d78a8] to-transparent z-0" />

      {/* Header */}
      <div className="relative z-10 px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="font-['SF_Compact_Rounded',sans-serif] text-white/70 text-[13px]">ZUNO</p>
            <h1 className="font-['SF_Compact_Rounded',sans-serif] text-white text-[28px] font-bold">Demo Control</h1>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${backendOnline ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            {backendOnline
              ? <Wifi className="size-[14px] text-green-300" />
              : <WifiOff className="size-[14px] text-red-300" />}
            <span className={`text-[12px] font-semibold ${backendOnline ? 'text-green-300' : 'text-red-300'}`}>
              {backendOnline ? 'Backend OK' : 'Offline'}
            </span>
          </div>
        </div>
        <p className="font-['SF_Compact_Rounded',sans-serif] text-white/60 text-[13px]">
          Fintech Competition Demo Panel
        </p>
      </div>

      {/* Stats bar */}
      <div className="relative z-10 mx-5 mb-4">
        <div className="bg-white rounded-[16px] p-4 shadow-[0_4px_20px_rgba(17,41,69,0.10)]">
          <div className="grid grid-cols-4 divide-x divide-[#e3e6eb]">
            {[
              { label: 'Tổng', value: stats.total, color: '#112945' },
              { label: 'Thành công', value: stats.success, color: '#16a34a' },
              { label: 'Lố', value: stats.overflow, color: '#f59e0b' },
              { label: 'Lỗi', value: stats.error, color: '#dc2626' },
            ].map(s => (
              <div key={s.label} className="text-center px-2">
                <p className="font-['SF_Compact_Rounded',sans-serif] text-[22px] font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="font-['SF_Compact_Rounded',sans-serif] text-[10px] text-[#546982]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Persona selector */}
      <div className="relative z-10 px-5 mb-4">
        <p className="font-['SF_Compact_Rounded',sans-serif] text-[12px] font-semibold text-[#546982] uppercase tracking-wide mb-2">
          <Users className="inline size-[14px] mr-1 mb-0.5" />Chọn Persona
        </p>
        {users.length === 0 ? (
          <div className="bg-white rounded-[16px] p-4 text-center text-[#546982] text-[13px] shadow-[0_4px_20px_rgba(17,41,69,0.08)]">
            {backendOnline ? 'Chưa có user nào. Hãy đăng ký trước.' : '⚠️ Backend offline — không tải được users'}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {users.map((u, i) => {
              const isSelected = selectedUser?.id === u.id;
              const colors = ['#112945', '#4D78A8', '#02577A'];
              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`flex items-center gap-3 w-full rounded-[16px] p-3 text-left transition-all shadow-[0_2px_12px_rgba(17,41,69,0.08)] ${
                    isSelected
                      ? 'bg-[#112945] text-white'
                      : 'bg-white text-[#283241] hover:bg-[#f0f4f8]'
                  }`}
                >
                  <div
                    className="flex size-[38px] shrink-0 items-center justify-center rounded-full text-white font-bold text-[16px]"
                    style={{ background: colors[i % colors.length] }}
                  >
                    {u.fullName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-['SF_Compact_Rounded',sans-serif] text-[14px] font-semibold truncate ${isSelected ? 'text-white' : 'text-[#283241]'}`}>
                      {u.fullName}
                    </p>
                    <p className={`font-['SF_Compact_Rounded',sans-serif] text-[11px] truncate ${isSelected ? 'text-white/70' : 'text-[#546982]'}`}>
                      {residenceLabel(u.profile?.residenceType)} · {u.email}
                    </p>
                  </div>
                  {isSelected && <CheckCircle2 className="size-[18px] text-white/80 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Scenario buttons */}
      <div className="relative z-10 px-5 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="font-['SF_Compact_Rounded',sans-serif] text-[12px] font-semibold text-[#546982] uppercase tracking-wide">
            <FlaskConical className="inline size-[14px] mr-1 mb-0.5" />Kịch bản Demo
          </p>
          <button
            onClick={resetDemo}
            disabled={running}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#f7f8fa] border border-[#e3e6eb] text-[#546982] text-[11px] font-semibold hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-40"
          >
            <RefreshCw className="size-[11px]" />Reset
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {SCENARIOS.map(scenario => (
            <button
              key={scenario.id}
              onClick={() => runScenario(scenario)}
              disabled={running || !selectedUser || !backendOnline}
              className="flex flex-col items-start gap-2 bg-white rounded-[16px] p-4 text-left shadow-[0_2px_12px_rgba(17,41,69,0.08)] hover:shadow-[0_4px_20px_rgba(17,41,69,0.14)] transition-all disabled:opacity-40 active:scale-[0.98]"
            >
              <div
                className="flex size-[36px] items-center justify-center rounded-full"
                style={{ background: `${scenario.color}20`, color: scenario.color }}
              >
                {scenario.icon}
              </div>
              <div>
                <p className="font-['SF_Compact_Rounded',sans-serif] text-[13px] font-bold text-[#283241]">{scenario.label}</p>
                <p className="font-['SF_Compact_Rounded',sans-serif] text-[11px] text-[#546982] leading-[14px] mt-0.5">{scenario.description}</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: scenario.color }}>
                {running ? <Square className="size-[10px]" /> : <Play className="size-[10px]" />}
                {scenario.transactions.length} giao dịch
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="relative z-10 px-5 mb-4">
        <p className="font-['SF_Compact_Rounded',sans-serif] text-[12px] font-semibold text-[#546982] uppercase tracking-wide mb-2">
          <Activity className="inline size-[14px] mr-1 mb-0.5" />Liên kết nhanh
        </p>
        <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(17,41,69,0.08)] divide-y divide-[#f0f2f5]">
          {[
            { label: 'Mock Bank (VietBank)', href: '/mock-bank/index.html', icon: <Zap className="size-[16px]" />, color: '#112945', external: true },
            { label: 'Analytics Dashboard', href: '/analytics', icon: <BarChart className="size-[16px]" />, color: '#4D78A8', external: false },
            { label: 'Budget & Funds', href: '/budgets', icon: <Wallet className="size-[16px]" />, color: '#02577A', external: false },
            { label: 'Bank Activity', href: '/add-transaction', icon: <Activity className="size-[16px]" />, color: '#4ade80', external: false },
          ].map(link => (
            link.external ? (
              <a key={link.href} href={link.href} target="_blank" rel="noreferrer"
                className="flex items-center justify-between px-4 py-3 hover:bg-[#f7f8fa] transition-colors first:rounded-t-[16px] last:rounded-b-[16px]">
                <div className="flex items-center gap-3">
                  <div className="flex size-[32px] items-center justify-center rounded-full" style={{ background: `${link.color}15`, color: link.color }}>
                    {link.icon}
                  </div>
                  <p className="font-['SF_Compact_Rounded',sans-serif] text-[13px] font-semibold text-[#283241]">{link.label}</p>
                </div>
                <ChevronRight className="size-[14px] text-[#9db2c6]" />
              </a>
            ) : (
              <Link key={link.href} href={link.href}
                className="flex items-center justify-between px-4 py-3 hover:bg-[#f7f8fa] transition-colors first:rounded-t-[16px] last:rounded-b-[16px]">
                <div className="flex items-center gap-3">
                  <div className="flex size-[32px] items-center justify-center rounded-full" style={{ background: `${link.color}15`, color: link.color }}>
                    {link.icon}
                  </div>
                  <p className="font-['SF_Compact_Rounded',sans-serif] text-[13px] font-semibold text-[#283241]">{link.label}</p>
                </div>
                <ChevronRight className="size-[14px] text-[#9db2c6]" />
              </Link>
            )
          ))}
        </div>
      </div>

      {/* Live feed */}
      <div className="relative z-10 px-5 mb-4">
        <p className="font-['SF_Compact_Rounded',sans-serif] text-[12px] font-semibold text-[#546982] uppercase tracking-wide mb-2">
          Live Feed {running && <span className="ml-1 inline-block size-2 rounded-full bg-green-500 animate-pulse" />}
        </p>
        <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(17,41,69,0.08)] overflow-hidden">
          {feed.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-3xl mb-2">🏦</p>
              <p className="font-['SF_Compact_Rounded',sans-serif] text-[13px] text-[#546982]">Chọn kịch bản để bắt đầu demo</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f0f2f5] max-h-[320px] overflow-y-auto">
              {feed.map(item => {
                const isPending = item.status === 'pending';
                const isOverflow = item.status === 'overflow';
                const isError = item.status === 'error';
                const fundType = item.fundType ?? 'food';
                const emoji = FUND_EMOJI[fundType] ?? '💳';
                const dotColor = isPending ? '#94a3b8' : isError ? '#dc2626' : isOverflow ? '#f59e0b' : '#16a34a';
                return (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <div
                      className="flex size-[34px] shrink-0 items-center justify-center rounded-full text-[16px]"
                      style={{ background: `${(FUND_COLOR[fundType] ?? '#94a3b8')}18` }}
                    >
                      {isPending ? <span className="animate-spin text-[12px]">⏳</span> : isError ? '❌' : emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-['SF_Compact_Rounded',sans-serif] text-[13px] font-semibold text-[#283241] truncate">{item.merchant}</p>
                      <p className="font-['SF_Compact_Rounded',sans-serif] text-[11px] text-[#546982]">
                        {isPending ? 'Đang xử lý...' : isError ? item.error : `${item.category ?? ''} · ${isOverflow ? `⚠️ LỐ ${item.overflowLevel ?? ''}` : '✅ OK'}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-['SF_Compact_Rounded',sans-serif] text-[13px] font-semibold text-[#283241]">
                        -{item.amount.toLocaleString('vi-VN')}đ
                      </p>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <div className="size-1.5 rounded-full" style={{ background: dotColor }} />
                        <p className="font-['SF_Compact_Rounded',sans-serif] text-[10px] text-[#546982]">
                          {item.time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Running indicator */}
      {running && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#112945] text-white px-4 py-2 rounded-full shadow-lg">
          <div className="size-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-['SF_Compact_Rounded',sans-serif] text-[13px] font-semibold">Demo đang chạy...</span>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
