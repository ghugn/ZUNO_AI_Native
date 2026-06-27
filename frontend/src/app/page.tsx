'use client';

import { getCalendarMonth, getHomeScreenData, getNotifications } from "@/lib/zunoApi";
import type { CalendarDay, HomeScreenData } from "@/types/zuno";
import { BarChart2, Bell, ChevronDown, Home, User, Wallet, Flame, Info, Utensils, Soup, Cookie, Gift, Target, PiggyBank, Compass, X, Bot } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { bootstrapAuth } from "@/lib/api/auth";
import BottomNav from "@/components/layout/BottomNav";



type CurrentAmountInfoProps = {
  className?: string;
  property1?: "Default";
};

function CurrentAmountInfo({ className }: CurrentAmountInfoProps) {
  return (
    <div className={className || "h-[15px] relative w-[14px] flex items-center justify-center text-[#9db2c6]"} data-node-id="281:912">
      <Info className="size-[12px]" />
    </div>
  );
}

type Component5Props = {
  className?: string;
  property1?: "Folded";
  onStreakChange?: (streak: number) => void;
};

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function parseDateValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateDisplay(date: Date) {
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function formatDateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatSelectedWrapLabel(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return "Today's wrap";
  }

  return `${day}/${month}/${year}'s wrap`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getWeekStart(date: Date) {
  const dayIndex = (date.getDay() + 6) % 7;
  return addDays(date, -dayIndex);
}

function isSameDate(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

function getMonthCalendarDays(date: Date) {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = getWeekStart(firstOfMonth);
  return Array.from({ length: 35 }, (_, index) => addDays(start, index));
}

function openNativeDatePicker(input: HTMLInputElement | null) {
  if (!input) {
    return;
  }

  const inputWithPicker = input as HTMLInputElement & { showPicker?: () => void };
  if (inputWithPicker.showPicker) {
    inputWithPicker.showPicker();
    return;
  }

  input.click();
}

type HomeCalendarProps = {
  isMonthOpen: boolean;
  onMonthOpenChange: (isMonthOpen: boolean) => void;
  selectedDate: string;
  onSelectDate: (value: string) => void;
  calendarDays: Map<string, CalendarDay>;
};

function HomeCalendar({ isMonthOpen, onMonthOpenChange, selectedDate, onSelectDate, calendarDays }: HomeCalendarProps) {
  const selectedDateValue = parseDateValue(selectedDate);
  const todayValue = new Date();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const weekStart = getWeekStart(selectedDateValue);
  const weekDates = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const monthDates = getMonthCalendarDays(selectedDateValue);
  const highlightColorForDay = (date: Date) => {
    if (isSameDate(date, todayValue)) {
      return "bg-[#02577A] text-white";
    }

    const dayStatus = calendarDays.get(formatDateValue(date))?.status ?? "noData";
    if (dayStatus === "noData") {
      return "bg-white text-black";
    }
    if (dayStatus === "overspendLevel2" || dayStatus === "overspendLevel3") {
      return "bg-[#f6b1b1] text-black";
    }
    if (dayStatus === "overspendLevel1") {
      return "bg-[#f5d37a] text-black";
    }
    return "bg-[#bceac8] text-black";
  };
  const selectedRing = (date: Date) => (isSameDate(date, selectedDateValue) ? " ring-2 ring-[#42a959]" : "");

  return (
    <div className={`absolute left-[14px] top-0 z-20 w-[333px] ${isMonthOpen ? "h-[370px]" : "h-[110px]"}`}>
      <button
        aria-label="Choose dashboard date"
        className="absolute left-1/2 top-0 flex h-6 -translate-x-1/2 items-center justify-center rounded-[30px] border border-[#f7f8fa] px-[18px] text-[13px] font-medium text-[#f7f8fa]"
        onClick={() => openNativeDatePicker(dateInputRef.current)}
        type="button"
      >
        {formatDateDisplay(selectedDateValue)}
      </button>
      <input
        aria-hidden
        className="absolute left-1/2 top-0 h-0 w-0 opacity-0"
        onChange={(event) => onSelectDate(event.target.value)}
        ref={dateInputRef}
        tabIndex={-1}
        type="date"
        value={selectedDate}
      />

      <div className="absolute left-0 top-[33px] grid w-[333px] grid-cols-7 text-center font-['Inter',sans-serif] text-[12px] text-white">
        {weekdayLabels.map((label) => (
          <p key={label}>{label}</p>
        ))}
      </div>

      {isMonthOpen ? (
        <div className="absolute left-[-14px] top-[61px] grid w-[361px] grid-cols-7 place-items-center gap-y-[16px] px-[10px] pb-[18px] pt-[8px]">
          {monthDates.map((date) => {
            const isCurrentMonth = date.getMonth() === selectedDateValue.getMonth();
            return (
              <button
                aria-label={`Select ${formatDateDisplay(date)}`}
                className={`flex size-[28px] items-center justify-center rounded-full font-['Inter',sans-serif] text-[12px] font-bold ${
                  isCurrentMonth ? highlightColorForDay(date) : "bg-transparent text-black"
                }${selectedRing(date)}`}
                key={formatDateValue(date)}
                onClick={() => onSelectDate(formatDateValue(date))}
                type="button"
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="absolute left-0 top-[61px] grid w-[333px] grid-cols-7 place-items-center">
          {weekDates.map((date) => (
            <button
              aria-label={`Select ${formatDateDisplay(date)}`}
              className={`flex size-7 items-center justify-center rounded-full font-['Inter',sans-serif] text-[12px] font-bold ${highlightColorForDay(date)}${selectedRing(date)}`}
              key={formatDateValue(date)}
              onClick={() => onSelectDate(formatDateValue(date))}
              type="button"
            >
              {date.getDate()}
            </button>
          ))}
        </div>
      )}

      <button
        aria-label={isMonthOpen ? "Collapse month calendar" : "Expand month calendar"}
        className={`absolute left-1/2 flex h-5 w-10 -translate-x-1/2 items-center justify-center rounded-full transition-colors ${
          isMonthOpen ? "top-[307px] bg-white/80 text-[#174f84] shadow-[0_2px_8px_rgba(17,41,69,0.16)]" : "top-[94px] text-white/90"
        }`}
        onClick={() => onMonthOpenChange(!isMonthOpen)}
        type="button"
      >
        <ChevronDown className={`size-4 transition-transform ${isMonthOpen ? "rotate-180" : ""}`} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function Component5({ className, onStreakChange }: Component5Props) {
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [homeData, setHomeData] = useState<HomeScreenData | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [showConnectZunoPopup, setShowConnectZunoPopup] = useState(false);
  const calendarOffset = isCalendarExpanded ? 215 : 0;
  const month = `${selectedDate.slice(0, 7)}-01`;

  useEffect(() => {
    let isMounted = true;

    async function loadHomeState() {
      try {
        const ok = await bootstrapAuth();
        if (!ok || !isMounted) return;

        const [homeSummary, calendarMonth] = await Promise.all([
          getHomeScreenData(selectedDate, month),
          getCalendarMonth(month),
        ]);

        if (isMounted) {
          setHomeData(homeSummary);
          setCalendarDays(calendarMonth.days);
          if (onStreakChange) {
            onStreakChange(homeSummary.rewardSummary?.streak ?? 0);
          }
        }
      } catch (error) {
        console.error('[loadHomeState] Error:', error);
        
        // Self-healing: if profile doesn't exist, clear bootstrap flag and reload to force creation
        if (error instanceof Error && error.message.includes('Profile not found')) {
          if (typeof window !== 'undefined') {
            window.sessionStorage.clear();
            window.location.reload();
            return;
          }
        }

        if (isMounted) {
          setHomeData(null);
          setCalendarDays([]);
        }
      }
    }

    loadHomeState();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadHomeState();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      isMounted = false;
    };
  }, [selectedDate, month, onStreakChange]);

  const recentsForView = (homeData?.recentTransactions ?? []).slice(0, 6).map((transaction) => {
    const isIncome = transaction.type === "income";
    const date = new Date(transaction.timestamp);
    const amountText = `${isIncome ? "+" : "-"}${transaction.amount.toLocaleString("vi-VN")}đ`;
    const timeText = Number.isNaN(date.getTime())
      ? transaction.date
      : `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}, ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;

    let iconType = 'food';
    if (transaction.fundType === 'experience') {
      iconType = 'experience';
    } else if (isIncome) {
      iconType = 'income';
    } else if (transaction.fundType === 'growth') {
      iconType = 'growth';
    } else if (transaction.fundType === 'living') {
      iconType = 'living';
    } else if (transaction.fundType === 'future') {
      iconType = 'future';
    } else if (transaction.fundType === 'food') {
      iconType = 'food';
    }

    return {
      title: isIncome ? "Income" : ((transaction as any).merchant || transaction.category || "Transaction"),
      time: timeText,
      amount: amountText,
      iconType,
      income: isIncome,
    };
  });
  const todayFood = homeData?.todayFood;
  const foodBudgetLeft = todayFood ? todayFood.remainingAmount.toLocaleString("vi-VN") : "0";
  const spentToday = todayFood ? (todayFood.spentMain + todayFood.spentSub).toLocaleString("vi-VN") : "0";
  const avgPerDay = todayFood ? (todayFood.budgetMain + todayFood.budgetSub).toLocaleString("vi-VN") : "0";
  const overBudgetPct = todayFood && todayFood.overflowAmount > 0
    ? `${Math.round((todayFood.overflowAmount / Math.max(todayFood.budgetMain + todayFood.budgetSub, 1)) * 100)}%`
    : "0%";
  const todayWrapLabel = formatSelectedWrapLabel(selectedDate);
  const wrapStatusLabel = todayFood?.overflowAmount ? "Overspent" : todayFood ? "Good" : "No data";
  const mainMealsBudget = todayFood?.budgetMain.toLocaleString("vi-VN") ?? "0";
  const snackBudget = todayFood?.budgetSub.toLocaleString("vi-VN") ?? "0";
  const daysLeftInMonth = Math.max(0, 30 - parseDateValue(selectedDate).getDate());
  const rewardSummary = homeData?.rewardSummary;
  const weeklyRewardCurrent = rewardSummary?.weeklySavings ?? 0;
  const weeklyRewardGoal = rewardSummary?.weeklyMilestone ? Number.parseInt(rewardSummary.weeklyMilestone.replace(/\D/g, ""), 10) * 1000 : 100000;
  const weeklyRewardProgress = Math.min(165.341, weeklyRewardGoal > 0 ? (weeklyRewardCurrent / weeklyRewardGoal) * 165.341 : 0);
  const calendarDayMap = new Map(calendarDays.map((day) => [day.date, day]));
  const selectedCalendarDay = calendarDayMap.get(selectedDate);
  const dailyBudget = todayFood ? Math.max(todayFood.budgetAmount, 1) : 1;
  const dailySpent = todayFood ? todayFood.spentMain + todayFood.spentSub : 0;
  const dailySpentPercent = todayFood ? Math.min(100, Math.max(0, (dailySpent / dailyBudget) * 100)) : 0;
  const wrapStatusTone = selectedCalendarDay?.status === "overspendLevel1"
    ? { background: "#F5D37A", text: "#6B4E00" }
    : selectedCalendarDay?.status === "overspendLevel2" || selectedCalendarDay?.status === "overspendLevel3"
      ? { background: "#F6B1B1", text: "#B4232E" }
      : todayFood
        ? { background: "#BCEAC8", text: "#237A3B" }
        : { background: "#E6E6E6", text: "#546982" };

  return (
    <div className={className || "h-[669px] relative w-[380px]"} data-node-id="545:1586">
      <div
        className="absolute inset-0 transition-transform duration-200 ease-out"
        style={{ transform: `translateY(${calendarOffset}px)` }}
      >
      <p className="absolute left-[18px] top-[119px] w-[245px] text-left font-['SF Compact Rounded',sans-serif] text-[22px] font-bold leading-[26px] not-italic text-black" data-node-id="545:1016">
        {todayWrapLabel}
      </p>
      <div className="-translate-x-1/2 absolute left-[100px] top-[828px] flex items-center gap-2 whitespace-nowrap">
        <p className="font-['SF Compact Rounded',sans-serif] font-bold leading-[normal] not-italic text-[20px] text-black text-center" data-node-id="545:1017">
          Bank Activity
        </p>
        <span className="flex items-center gap-1 bg-[#112945]/10 text-[#112945] text-[10px] font-semibold px-2 py-0.5 rounded-full">
          🏦 Live
        </span>
      </div>
      <div className="absolute contents left-px top-[160px]" data-node-id="545:1018">
        <div className="absolute contents left-px top-[160px]" data-node-id="545:1019">
          <div className="absolute bg-[#f7f8fa] h-[184px] left-px rounded-[20px] shadow-[0px_10px_30px_0px_rgba(0,0,20,0.08)] top-[160px] w-[363px]" data-node-id="545:1020" />
          <div className="absolute left-[12px] top-[181px] flex size-[39px] items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600" data-node-id="545:1021" data-name="svg">
            <Utensils className="size-[22px]" />
          </div>
          <p className="-translate-x-1/2 absolute font-['SF Compact Rounded',sans-serif] font-normal h-[15px] leading-[normal] left-[143px] not-italic text-[13px] text-black text-center top-[179px] w-[158px] whitespace-nowrap" data-node-id="545:1028">
            Food and Drinks budget left
          </p>
          {homeData === null ? (
            <div className="absolute left-[68px] top-[198px] w-[140px] h-[30px] rounded-[8px] shimmer" />
          ) : (
            <p className="absolute left-[68px] font-['SF Compact Rounded',sans-serif] font-bold h-[27px] leading-[normal] not-italic text-[28px] text-black text-left top-[198px] w-[150px] whitespace-nowrap" data-node-id="545:1029">
              {foodBudgetLeft}đ
            </p>
          )}
          <div className="absolute left-[68px] top-[236px] flex h-[22px] min-w-[74px] items-center justify-center rounded-full px-[10px]" data-node-id="545:1030" style={{ backgroundColor: homeData === null ? "#edf0f5" : wrapStatusTone.background }}>
          </div>
          <p className="absolute left-[68px] top-[239px] min-w-[74px] px-[10px] text-center font-['SF Compact Rounded',sans-serif] text-[10px] font-medium leading-[normal] whitespace-nowrap" data-node-id="545:1031" style={{ color: homeData === null ? "#94a3b8" : wrapStatusTone.text }}>
            {homeData === null ? "Loading..." : wrapStatusLabel}
          </p>
          {homeData === null ? (
            <div className="absolute left-[252px] top-[178px] flex size-[82px] items-center justify-center rounded-full bg-[#edf0f5] animate-pulse" />
          ) : (
            <div className="absolute left-[252px] top-[178px] flex size-[82px] items-center justify-center rounded-full" data-node-id="545:1032" data-name="Daily spending progress" style={{ background: `conic-gradient(${wrapStatusTone.text} 0deg ${dailySpentPercent * 3.6}deg, #e3e6eb ${dailySpentPercent * 3.6}deg 360deg)` }}>
              <div className="flex size-[62px] items-center justify-center rounded-full bg-[#f7f8fa] text-center font-['SF Compact Rounded',sans-serif] text-[13px] font-bold leading-[15px]" style={{ color: wrapStatusTone.text }}>
                {Math.round(dailySpentPercent)}%
              </div>
            </div>
          )}
          {homeData === null ? (
            <div className="absolute top-[286px] left-[16px] right-[16px] flex justify-between px-4">
              <div className="flex flex-col items-center gap-1.5 w-[65px]">
                <div className="h-[12px] w-[50px] rounded-[3px] bg-[#edf0f5]" />
                <div className="h-[16px] w-[60px] rounded-[4px] shimmer mt-0.5" />
              </div>
              <div className="flex flex-col items-center gap-1.5 w-[65px]">
                <div className="h-[12px] w-[50px] rounded-[3px] bg-[#edf0f5]" />
                <div className="h-[16px] w-[60px] rounded-[4px] shimmer mt-0.5" />
              </div>
              <div className="flex flex-col items-center gap-1.5 w-[65px]">
                <div className="h-[12px] w-[55px] rounded-[3px] bg-[#edf0f5]" />
                <div className="h-[16px] w-[45px] rounded-[4px] shimmer mt-0.5" />
              </div>
            </div>
          ) : (
            <div className="absolute top-[286px] left-[16px] right-[16px] flex justify-between px-4 font-['SF_Compact_Rounded',sans-serif]" data-node-id="545:1033">
              <div className="flex flex-col items-center gap-1.5" data-node-id="545:1034">
                <p className="text-[12px] font-normal text-black whitespace-nowrap">Spent today</p>
                <p className="text-[16px] font-semibold text-black whitespace-nowrap">{spentToday}đ</p>
              </div>
              <div className="flex flex-col items-center gap-1.5" data-node-id="545:1035">
                <p className="text-[12px] font-normal text-black whitespace-nowrap">Avg / day</p>
                <p className="text-[16px] font-semibold text-black whitespace-nowrap">{avgPerDay}đ</p>
              </div>
              <div className="flex flex-col items-center gap-1.5" data-node-id="545:1036">
                <p className="text-[12px] font-normal text-black whitespace-nowrap">Over budget</p>
                <p className="text-[16px] font-semibold text-black whitespace-nowrap">{overBudgetPct}</p>
              </div>
            </div>
          )}
        </div>
        <div className="absolute contents left-px top-[355px]" data-node-id="545:1040">
          <div className={`absolute h-[145px] left-px rounded-[20px] shadow-[0px_10px_30px_0px_rgba(0,0,20,0.08)] top-[355px] w-[363px] ${todayFood ? "border border-[#42a959] border-dashed bg-[#f7f8fa]" : "bg-white border border-[#e6e6e6]"}`} data-node-id="545:1041" />
          <p className="absolute font-['SF_Compact_Rounded',sans-serif] font-semibold h-[15px] leading-[normal] left-[16px] not-italic text-[14px] text-black text-left top-[364px] whitespace-nowrap" data-node-id="545:1042">
            Daily distribution for food
          </p>
          {homeData === null ? (
            <>
              <div className="absolute bg-[#edf0f5] h-[67px] left-[11px] rounded-[20px] top-[414px] w-[165px] animate-pulse" />
              <div className="absolute bg-[#edf0f5] h-[67px] left-[187px] rounded-[20px] top-[414px] w-[165px] animate-pulse" />
            </>
          ) : (
            <>
              <div className="absolute contents left-[8px] top-[411px]" data-node-id="545:1043">
                <div className="absolute bg-gradient-to-b from-[28.824%] from-[rgba(191,230,195,0.5)] h-[67px] left-[11px] rounded-[20px] shadow-[3px_3px_10px_0px_rgba(0,0,0,0.25)] to-[120.59%] to-[var(--bubble,rgba(245,247,251,0.5))] top-[414px] w-[165px]" data-node-id="545:1044" />
                <p className="-translate-x-1/2 absolute font-['SF_Compact_Rounded',sans-serif] font-bold h-[27px] leading-[0] left-[113.5px] not-italic text-[0px] text-black text-center top-[443px] w-[99px] whitespace-nowrap" data-node-id="545:1045">
                  <span className="leading-[normal] text-[18px]">{mainMealsBudget}đ</span>
                  <span className="leading-[normal] text-[20px]">{` `}</span>
                  <span className="font-['SF_Compact_Rounded',sans-serif] font-normal leading-[normal] text-[12px]">/ day</span>
                </p>
                <p className="-translate-x-1/2 absolute font-['SF_Compact_Rounded',sans-serif] font-semibold leading-[normal] left-[95px] not-italic text-[12px] text-black text-center top-[426px] whitespace-nowrap" data-node-id="545:1046">
                  Main meals
                </p>
                <div className="absolute left-[16px] top-[420px] flex size-[40px] items-center justify-center rounded-full bg-emerald-500/20 text-emerald-700" data-node-id="545:1047" data-name="svg">
                  <Soup className="size-[22px]" />
                </div>
              </div>
              <div className="absolute contents left-[187px] top-[414px]" data-node-id="545:1052">
                <div className="absolute bg-gradient-to-b from-[28.358%] from-[rgba(244,213,140,0.5)] h-[67px] left-[187px] rounded-[20px] shadow-[3px_3px_10px_0px_rgba(0,0,0,0.25)] to-[138.06%] to-[rgba(255,255,255,0.5)] top-[414px] w-[165px]" data-node-id="545:1053" />
                <p className="-translate-x-1/2 absolute font-['SF_Compact_Rounded',sans-serif] font-bold h-[27px] leading-[0] left-[292.5px] not-italic text-[0px] text-black text-center top-[443px] w-[99px] whitespace-nowrap" data-node-id="545:1054">
                  <span className="leading-[normal] text-[18px]">{snackBudget}đ</span>
                  <span className="leading-[normal] text-[20px]">{` `}</span>
                  <span className="font-['SF_Compact_Rounded',sans-serif] font-normal leading-[normal] text-[12px]">/ day</span>
                </p>
                <div className="absolute left-[192px] top-[428px] flex size-[34px] items-center justify-center rounded-full bg-amber-500/20 text-amber-700" data-node-id="545:1055" data-name="svg">
                  <Cookie className="size-[20px]" />
                </div>
                <p className="-translate-x-1/2 absolute font-['SF_Compact_Rounded',sans-serif] font-semibold leading-[normal] left-[262px] not-italic text-[12px] text-black text-center top-[426px] whitespace-nowrap" data-node-id="545:1064">
                  Snacks
                </p>
              </div>
            </>
          )}
          <div className="absolute contents left-[196px] top-[366px]" data-node-id="545:1065">
            <div className="absolute left-[196px] top-[366px] flex size-[14px] items-center justify-center text-[#9db2c6]" data-node-id="545:1066">
              <Info className="size-[14px]" />
            </div>
          </div>
          <p className="absolute font-['SF_Compact_Rounded',sans-serif] font-normal leading-[normal] left-[16px] not-italic text-[12px] text-black text-left top-[388px] whitespace-nowrap" data-node-id="545:1068">
            {daysLeftInMonth} days left this month
          </p>
        </div>
      </div>
      <Link href="/add-transaction" className="-translate-x-1/2 absolute font-['SF_Compact_Rounded',sans-serif] font-normal leading-[normal] left-[332px] not-italic text-[12px] text-[#174f84] text-center top-[828px] whitespace-nowrap hover:underline" data-node-id="545:1069">
        See all
      </Link>
      <div className="absolute h-[400px] left-[12px] overflow-x-clip overflow-y-auto pb-[70px] top-[867px] w-[330px]" data-node-id="545:1070">
        {homeData === null ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="grid grid-cols-[33px_1fr_auto] gap-x-[23px] py-[7px]">
                <div className="size-[33px] rounded-full shimmer" />
                <div className="flex flex-col gap-1.5 justify-center">
                  <div className="h-[12px] w-[100px] rounded-[3px] shimmer" />
                  <div className="h-[9px] w-[60px] rounded-[2px] bg-[#edf0f5]" />
                </div>
                <div className="flex items-center">
                  <div className="h-[14px] w-[70px] rounded-[4px] shimmer" />
                </div>
                {i < 4 && <div className="col-span-2 col-start-2 mt-[10px] h-px bg-[#e3e3e3]" />}
              </div>
            ))}
          </div>
        ) : recentsForView.length === 0 ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center px-4 pt-6 text-center">
              <div className="text-[48px] mb-3">🏦</div>
              <p className="font-['SF_Compact_Rounded',sans-serif] text-[16px] font-semibold leading-[22px] text-[#283241]">
                No transactions yet
              </p>
              <p className="font-['SF_Compact_Rounded',sans-serif] text-[12px] leading-[18px] text-[#546982] mt-1">
                Connect your bank or make your first transaction 
                <br/>to start tracking your expenses.
              </p>
            </div>
        ) : (
          <div className="flex flex-col" data-node-id="545:1071">
            {recentsForView.map((transaction, index, items) => {
              let IconComponent = Utensils;
              let iconBg = 'bg-emerald-500/10 text-emerald-600';
              
              if (transaction.iconType === 'experience') {
                IconComponent = Compass;
                iconBg = 'bg-amber-500/10 text-amber-600';
              } else if (transaction.iconType === 'income') {
                IconComponent = Wallet;
                iconBg = 'bg-blue-500/10 text-blue-600';
              } else if (transaction.iconType === 'growth') {
                IconComponent = PiggyBank;
                iconBg = 'bg-purple-500/10 text-purple-600';
              } else if (transaction.iconType === 'living') {
                IconComponent = Home;
                iconBg = 'bg-indigo-500/10 text-indigo-600';
              } else if (transaction.iconType === 'future') {
                IconComponent = Target;
                iconBg = 'bg-teal-500/10 text-teal-600';
              }

              return (
                <div 
                  key={`${transaction.title}-${transaction.time}-${transaction.amount}-${index}`} 
                  className="grid grid-cols-[33px_1fr_auto] gap-x-[23px] py-[7px] cursor-pointer hover:bg-black/5 rounded-xl px-2 -mx-2 transition-colors"
                  onClick={() => setShowConnectZunoPopup(true)}
                >
                  <div className={`row-span-2 flex size-[33px] items-center justify-center rounded-full ${iconBg}`}>
                    <IconComponent className="size-[18px]" />
                  </div>
                  <p className="font-['SF_Compact_Rounded',sans-serif] text-[12px] font-semibold leading-[14px] text-black">
                    {transaction.title}
                  </p>
                  <p className={`font-['SF_Compact_Rounded',sans-serif] text-[13px] font-semibold leading-[15px] ${transaction.income ? "text-[#2e9b56]" : "text-[#111]"}`}>
                    {transaction.amount}
                  </p>
                  <p className="font-['SF_Compact_Rounded',sans-serif] text-[10px] leading-[12px] text-[#546982]">
                    {transaction.time}
                  </p>
                  {index < items.length - 1 ? <div className="col-span-2 col-start-2 mt-[10px] h-px bg-[#e3e3e3]" /> : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="absolute contents left-px top-[513px]" data-node-id="545:1169">
        <div className="absolute bg-[#f7f8fa] h-[85px] left-px rounded-[20px] shadow-[3px_3px_10px_0px_rgba(0,0,0,0.25)] top-[513px] w-[177px]" data-node-id="545:1170" />
        <div className="absolute contents left-[45.51px] top-[532px]" data-node-id="545:1171">
          <p className="-translate-x-1/2 absolute font-['SF_Compact_Rounded',sans-serif] font-semibold leading-[normal] left-[91.09px] not-italic text-[12px] text-black text-center top-[532px] w-[91.15px] whitespace-nowrap" data-node-id="545:1172">
            Weekly rewards
          </p>
        </div>
        <div className="absolute contents left-[7.36px] top-[573px]" data-node-id="545:1173">
          <div className="absolute bg-[#d9d9d9] h-[10px] left-[7.36px] rounded-[30px] top-[573px] w-[165.341px]" data-node-id="545:1174" />
          <div className="absolute bg-[#89e692] h-[10px] left-[7.36px] rounded-[30px] top-[573px]" data-node-id="545:1175" style={{ width: `${weeklyRewardProgress}px` }} />
        </div>
        <div className="absolute left-[12px] top-[530px] flex items-center justify-center text-rose-500" data-node-id="545:1176" data-name="Vector">
          <Gift className="size-[20px]" />
        </div>
        <p className="-translate-x-1/2 absolute font-[350.52398681640625] h-[14px] leading-[0] left-[81.55px] text-[0px] text-black text-center top-[548px] w-[74.192px] whitespace-nowrap" data-node-id="545:1177">
          <span className="font-['SF_Compact_Rounded',sans-serif] font-semibold leading-[normal] not-italic text-[15px]">{`${(weeklyRewardCurrent / 1000).toFixed(weeklyRewardCurrent >= 100000 ? 0 : 1).replace(".0", "")}K `}</span>
          <span className="font-['SF_Compact_Rounded',sans-serif] font-normal leading-[normal] not-italic text-[#546982] text-[15px]">/</span>
          <span className="leading-[normal] text-[15px]">{` `}</span>
          <span className="font-['SF_Compact_Rounded',sans-serif] font-normal leading-[normal] not-italic text-[#546982] text-[15px]">{`${Math.round(weeklyRewardGoal / 1000)}K`}</span>
        </p>
      </div>
      <div className="absolute contents left-[187px] top-[513px]" data-node-id="545:1178">
        <div className="absolute bg-[#f7f8fa] h-[85px] left-[187px] rounded-[20px] shadow-[3px_3px_10px_0px_rgba(0,0,0,0.25)] top-[513px] w-[177px]" data-node-id="545:1179" />
        <div className="absolute contents left-[235px] top-[532px]" data-node-id="545:1180">
          <p className="-translate-x-1/2 absolute font-['SF_Compact_Rounded',sans-serif] font-semibold leading-[normal] left-[277.5px] not-italic text-[12px] text-black text-center top-[532px] w-[85px] whitespace-nowrap" data-node-id="545:1181">
            Long-term goal
          </p>
        </div>
        <div className="absolute contents left-[193px] top-[573px]" data-node-id="545:1182">
          <div className="absolute bg-[#d9d9d9] h-[10px] left-[193.36px] rounded-[30px] top-[573px] w-[165.341px]" data-node-id="545:1183" />
          <div className="absolute bg-[#89e692] h-[10px] left-[193px] rounded-[30px] top-[573px] w-[33px]" data-node-id="545:1184" />
        </div>
        <p className="-translate-x-1/2 absolute font-[350.52398681640625] h-[14px] leading-[0] left-[264px] not-italic text-[0px] text-black text-center top-[549px] w-[62px] whitespace-nowrap" data-node-id="545:1185">
          <span className="font-['SF_Compact_Rounded',sans-serif] font-semibold leading-[normal] text-[15px]">{`2M `}</span>
          <span className="font-['SF_Compact_Rounded',sans-serif] font-normal leading-[normal] text-[#546982] text-[15px]">/</span>
          <span className="font-['SF_Compact_Rounded',sans-serif] font-normal leading-[normal] text-[15px]">{` `}</span>
          <span className="font-['SF_Compact_Rounded',sans-serif] font-normal leading-[normal] text-[#546982] text-[15px]">16M</span>
        </p>
        <div className="absolute left-[197.6px] top-[533px] flex items-center justify-center text-blue-500" data-node-id="545:1187" data-name="Vector">
          <Target className="size-[20px]" />
        </div>
      </div>
      <div className="absolute contents left-0 top-[615px]" data-node-id="545:1188">
        <div className="absolute bg-[#f7f8fa] h-[194px] left-0 rounded-[20px] shadow-[3px_3px_10px_0px_rgba(0,0,0,0.25)] top-[615px] w-[363px]" data-node-id="545:1189" />
        <div className="absolute contents left-[114px] not-italic text-[12px] text-black top-[631px]" data-node-id="545:1190">
          <p className="absolute font-['SF_Compact_Rounded',sans-serif] font-semibold leading-[14px] left-[114px] top-[631px] w-[218px] whitespace-normal" data-node-id="545:1191">
            Investment type: Installment savings deposit
          </p>
          <p className="absolute font-['SF_Compact_Rounded',sans-serif] font-medium leading-[0] left-[114px] top-[670px] w-[225px] whitespace-nowrap" data-node-id="545:1192">
            <span className="leading-[normal]">{`Terms: `}</span>
            <span className="leading-[normal] text-[#546982]">6 months</span>
          </p>
          <p className="absolute font-['SF_Compact_Rounded',sans-serif] font-medium leading-[0] left-[114px] top-[687px] w-[225px] whitespace-nowrap" data-node-id="545:1193">
            <span className="leading-[normal]">{`Interest: `}</span>
            <span className="leading-[normal] text-[#546982]">6.2%/year</span>
          </p>
          <p className="absolute font-['SF_Compact_Rounded',sans-serif] font-medium leading-[0] left-[114px] top-[703px] w-[233px] whitespace-nowrap" data-node-id="545:1194">
            <span className="leading-[normal]">{`Monthly deposit: `}</span>
            <span className="leading-[normal] text-[#546982]">250.000 VNĐ (5% savings)</span>
          </p>
        </div>
        <p className="-translate-x-1/2 absolute font-['SF_Compact_Rounded',sans-serif] font-semibold h-[17px] leading-[normal] left-[40.5px] not-italic text-[12px] text-black text-center top-[718px] w-[49px] whitespace-nowrap" data-node-id="545:1195">
          Progress
        </p>
        <div className="absolute left-[16px] top-[641px] flex size-[40px] items-center justify-center rounded-full bg-blue-500/10 text-blue-600" data-node-id="545:1196" data-name="image 6">
          <PiggyBank className="size-[24px]" />
        </div>
        <div className="absolute contents left-[16px] top-[740px]" data-node-id="545:1197">
          <div className="absolute bg-[#d9d9d9] h-[10px] left-[16px] rounded-[30px] top-[740px] w-[333px]" data-node-id="545:1198" />
          <div className="absolute bg-[#89e692] h-[10px] left-[16px] rounded-[30px] top-[740px] w-[103px]" data-node-id="545:1199" />
        </div>
        <p className="absolute font-[350.52398681640625] h-[14px] leading-[0] left-[255px] not-italic text-[0px] text-black text-right top-[718px] w-[94px] whitespace-nowrap" data-node-id="545:1200">
          <span className="font-['SF_Compact_Rounded',sans-serif] font-semibold leading-[normal] text-[12px]">55 days</span>
          <span className="font-['SF_Compact_Rounded',sans-serif] font-normal leading-[normal] text-[#546982] text-[12px]">/</span>
          <span className="font-['SF_Compact_Rounded',sans-serif] font-normal leading-[normal] text-[12px]">{` `}</span>
          <span className="font-['SF_Compact_Rounded',sans-serif] font-normal leading-[normal] text-[#546982] text-[12px]">180 days</span>
        </p>
        <p className="-translate-x-1/2 absolute font-['SF_Compact_Rounded',sans-serif] font-semibold h-[17px] leading-[normal] left-[60px] not-italic text-[12px] text-black text-center top-[761px] w-[88px] whitespace-nowrap" data-node-id="545:1201">
          Current amount
        </p>
        <div className="absolute contents left-[16px] top-[783px]" data-node-id="545:1202">
          <div className="absolute bg-[#d9d9d9] h-[10px] left-[16px] rounded-[30px] top-[783px] w-[333px]" data-node-id="545:1203" />
          <div className="absolute bg-[#89e692] h-[10px] left-[16px] rounded-[30px] top-[783px] w-[94px]" data-node-id="545:1204" />
        </div>
        <p className="absolute font-[350.52398681640625] h-[14px] leading-[0] left-[272px] not-italic text-[0px] text-black text-right top-[761px] w-[77px] whitespace-nowrap" data-node-id="545:1205">
          <span className="font-['SF_Compact_Rounded',sans-serif] font-semibold leading-[normal] text-[12px]">755.7K</span>
          <span className="font-['SF_Compact_Rounded',sans-serif] font-normal leading-[normal] text-[#546982] text-[12px]">/</span>
          <span className="font-['SF_Compact_Rounded',sans-serif] font-normal leading-[normal] text-[12px]">{` `}</span>
          <span className="font-['SF_Compact_Rounded',sans-serif] font-normal leading-[normal] text-[#546982] text-[12px]">1750K</span>
        </p>
        <CurrentAmountInfo className="absolute h-[15px] left-[110px] top-[761px] w-[14px]" />
      </div>
      <a className="absolute block cursor-pointer left-[160px] top-[646px] text-[#9db2c6]" data-node-id="545:1207" data-name="Current amount info">
        <Info className="size-[14px]" />
      </a>
      </div>
      <HomeCalendar
        isMonthOpen={isCalendarExpanded}
        onMonthOpenChange={setIsCalendarExpanded}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        calendarDays={calendarDayMap}
      />

      {showConnectZunoPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#112945]/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-[340px] shadow-2xl relative">
            <button 
              onClick={() => setShowConnectZunoPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="size-6" strokeWidth={2} />
            </button>
            
            <div className="flex size-14 items-center justify-center rounded-[14px] bg-[#2E5B8E] mb-5 shadow-inner">
              <Bot className="size-8 text-white" />
            </div>

            <h3 className="text-[18px] font-bold font-['Inter',sans-serif] text-[#112945] mb-3 leading-tight text-left">
              Are you overspending?
            </h3>
            <p className="text-[13px] text-[#546982] mb-4 font-['Inter',sans-serif] leading-[1.6] text-left">
              You are making transactions but your account is not linked to <span className="font-bold text-[#112945]">ZUNO Wallet</span>.
            </p>
            <p className="text-[13px] text-[#546982] font-['Inter',sans-serif] leading-[1.6] text-left">
              Connect to ZUNO now to let AI help you manage 5 budget funds and automatically warn you when spending exceeds the limit!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IPhone1415Pro1() {
  const [streak, setStreak] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    async function checkNotifications() {
      try {
        if (typeof window !== 'undefined') {
          const token = window.sessionStorage.getItem('zuno:auth-token');
          if (!token) return;
        }
        const monthString = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`;
        const notifs = await getNotifications(monthString);
        const readIds: string[] = JSON.parse(localStorage.getItem('zuno:read-notifications') || '[]');
        const unread = notifs.some(n => !n.isRead && !readIds.includes(n.id));
        setHasUnread(unread);
      } catch (err) {
        // silently ignore error
      }
    }
    checkNotifications();
    const intervalId = setInterval(checkNotifications, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="relative mx-auto min-h-[1540px] w-full max-w-[393px] overflow-x-hidden bg-[#f7f8fa] pb-[88px]" data-node-id="1:2121" data-name="iPhone 14 & 15 Pro - 1">
      <div className="absolute bg-gradient-to-b from-[#112945] h-[457px] left-0 to-[#f7f8fa] top-[-3px] via-[#4d78a8] via-[37.5%] w-[393px]" data-node-id="1:2122" />
      <div className="pointer-events-none absolute left-[88px] top-[48px] size-[3px] rounded-full bg-white/45 z-0" />
      <div className="pointer-events-none absolute left-[172px] top-[28px] size-[2px] rounded-full bg-white/45 z-0" />
      <div className="pointer-events-none absolute right-[56px] top-[50px] size-[2px] rounded-full bg-white/45 z-0" />
      <div className="pointer-events-none absolute right-[78px] top-[34px] size-[1.5px] rounded-full bg-white/45 z-0" />
      <Link href="/notifications" aria-label="Notifications" className="absolute left-[326px] top-[52px] z-20 flex size-[43px] items-center justify-center rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors">
        <Bell className="size-[21px] text-white" strokeWidth={2.1} />
        {hasUnread && <span className="absolute top-[8px] right-[10px] size-[10px] bg-red-500 rounded-full border border-white" />}
      </Link>
      {/* Figma background decoration nodes (removed broken image references) */}
      <div className="absolute left-[153.94px] size-[0.064px] top-[78.67px]" data-node-id="1:2124" />
      <div className="absolute h-[0.041px] left-[159.1px] top-[78.54px] w-0" data-node-id="1:2125" />
      <div className="absolute h-0 left-[148.54px] top-[89.5px] w-[0.041px]" data-node-id="1:2126" />
      <div className="absolute h-0 left-[163.37px] top-[87.63px] w-[0.043px]" data-node-id="1:2127" />
      <div className="absolute h-[0.047px] left-[91.22px] top-[120.33px] w-[0.144px]" data-node-id="1:2128" />
      <div className="absolute h-0 left-[92.45px] top-[123.29px] w-[0.04px]" data-node-id="1:2129" />
      <div className="absolute h-0 left-[87.15px] top-[119.95px] w-[0.043px]" data-node-id="1:2130" />
      <div className="absolute h-0 left-[83.49px] top-[127.67px] w-[0.041px]" data-node-id="1:2131" />
      <div className="absolute h-[0.212px] left-[256.13px] top-[79.63px] w-[0.106px]" data-node-id="1:2132" />
      <div className="absolute h-0 left-[262.98px] top-[79.38px] w-[0.096px]" data-node-id="1:2133" />
      <div className="absolute h-[0.088px] left-[313.77px] top-[95.47px] w-0" data-node-id="1:2134" />
      <div className="absolute h-[0.061px] left-[323.31px] top-[80.06px] w-[0.06px]" data-node-id="1:2135" />
      <div className="absolute left-[313.89px] size-[0.029px] top-[84.25px]" data-node-id="1:2136" />
      <p className="absolute font-['SF_Compact_Rounded',sans-serif] font-bold leading-[normal] left-[25px] not-italic text-[35px] text-white top-[51px] whitespace-nowrap" data-node-id="1:2137">
        Zuno
      </p>
      <p className="absolute font-['SF_Compact_Rounded',sans-serif] font-semibold leading-[normal] left-[269px] not-italic text-[30px] text-white top-[55px] whitespace-nowrap" data-node-id="1:2138">
        {streak}
      </p>
      <div className="absolute inset-[70.77%_5.09%_29.23%_4.83%]" data-node-id="1:2141" data-name="X Axis" />
      <div className="absolute left-[225px] top-[48px] z-20 flex items-center justify-center size-[40px] bg-orange-500/20 rounded-full" data-node-id="1:2312">
        <Flame className="size-6 text-orange-400 fill-orange-400" />
      </div>
      <BottomNav />
      <Component5 className="absolute h-[1310px] left-[13px] overflow-visible top-[121px] w-[380px]" onStreakChange={setStreak} />
    </div>
  );
}
