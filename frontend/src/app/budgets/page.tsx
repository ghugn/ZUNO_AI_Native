'use client';

import { getBudgetScreenData, getPersonalWallet, updatePersonalWallet } from "@/lib/zunoApi";
import type { BudgetAllocation, BudgetScreenData, FundType, PersonalWalletViewModel } from "@/types/zuno";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { bootstrapAuth } from "@/lib/api/auth";
import { AmountKeyboard } from "../../components/transaction/AddTransactionFigma";
import { apiClient } from "@/lib/apiClient";
import BottomNav from "@/components/layout/BottomNav";
import {
  BarChart2,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  Home,
  House,
  Landmark,
  Pencil,
  Plus,
  User,
  Wallet,
  X,
  Receipt,
  GraduationCap,
  UtensilsCrossed,
  PiggyBank,
  Compass,
  Soup,
  Cookie,
  Target,
} from "lucide-react";

const imgFixedBill = "https://www.figma.com/api/mcp/asset/4ca32f54-53b9-4777-b3c5-6e58985a1438";
const imgDevelopment = "https://www.figma.com/api/mcp/asset/44a5385b-0036-4e38-a199-fd85479f47da";
const imgFoodDrinks = "https://www.figma.com/api/mcp/asset/1506c67e-a4ad-4fce-8a19-2a21af518702";
const imgExperience = "https://www.figma.com/api/mcp/asset/12200f7a-2f50-4ad0-a80a-a7415db1f6a6";
const imgSavings = "https://www.figma.com/api/mcp/asset/b779789a-c1fb-453e-ad8d-e2b8fba6bf7e";
const imgSavingsBg = "https://www.figma.com/api/mcp/asset/745b665e-3e07-4798-965b-c0d697b57a8e";
const imgLongTermGoals = "https://www.figma.com/api/mcp/asset/5819615b-a1b5-41f1-919c-2abfe1a420e4";
const imgMainMeals = "https://www.figma.com/api/mcp/asset/7bfe1948-8deb-4239-bde5-35b7de8d4099";
const imgSnacks = "https://www.figma.com/api/mcp/asset/139cf001-f91a-4655-abf6-19b5a3a94c0d";

const iconMap: Record<string, { component: any; color: string; bg: string }> = {
  [imgFixedBill]: { component: Receipt, color: "#005bed", bg: "#eef4ff" },
  [imgDevelopment]: { component: GraduationCap, color: "#00607f", bg: "#e6f5fa" },
  [imgFoodDrinks]: { component: UtensilsCrossed, color: "#529100", bg: "#f0f9e8" },
  [imgExperience]: { component: Compass, color: "#ff0048", bg: "#ffe6ec" },
  [imgSavings]: { component: PiggyBank, color: "#038954", bg: "#e6f8f0" },
  [imgMainMeals]: { component: Soup, color: "#b54023", bg: "#ffece8" },
  [imgSnacks]: { component: Cookie, color: "#ab8922", bg: "#fffbeb" },
};
const totalBudget = 5_000_000;

type BaseBudgetKey = "fixed" | "food" | "mainMeals" | "snacks" | "experience" | "development" | "savings";
type CustomBudgetKey = `custom-${number}`;
type BudgetKey = BaseBudgetKey | CustomBudgetKey;
type LifestyleKey = "dorm" | "renter" | "professional";
type SubBudgetCycle = "day" | "week";

type EditBudgetItem = {
  key: BudgetKey;
  label: string;
  description: string;
  color: string;
  icon?: string;
  bgIcon?: string;
  bgColor?: string;
  iconScale?: number;
  genericIcon?: boolean;
  largeIcon?: boolean;
  editableLabel?: boolean;
  subBudget?: boolean;
  nested?: boolean;
  unit: string;
  countsTowardTotal: boolean;
  presetPercent: number;
  presetAmount: number;
};

type LifestyleTemplate = {
  key: LifestyleKey;
  label: string;
  description: string;
  icon: typeof Building2;
  allocations: Record<BaseBudgetKey, number>;
};

const allocationItemStyles: Record<FundType, {
  label: string;
  color: string;
  icon: string;
  largeIcon?: boolean;
  bgIcon?: string;
}> = {
  living: {
    label: "Fixed bill",
    color: "#005bed",
    icon: imgFixedBill,
    largeIcon: true,
  },
  growth: {
    label: "Development",
    color: "#00607f",
    icon: imgDevelopment,
  },
  food: {
    label: "Food and Drinks",
    color: "#529100",
    icon: imgFoodDrinks,
  },
  future: {
    label: "Savings",
    color: "#038954",
    icon: imgSavings,
    bgIcon: imgSavingsBg,
  },
  experience: {
    label: "Experience",
    color: "#ff0048",
    icon: imgExperience,
  },
};

const DEFAULT_ALLOCATION_STYLE = {
  label: "Custom Category",
  color: "#6e97c8",
  icon: imgFixedBill,
};

type AllocationViewItem = {
  label: string;
  amount: string;
  percent: string;
  value: number;
  color: string;
  icon: string;
  largeIcon?: boolean;
  bgIcon?: string;
  spentAmount: number;
  remainingAmount: number;
  borrowAmount: number;
  fundType: FundType;
};

const lifestyleTemplates: LifestyleTemplate[] = [
  {
    key: "dorm",
    label: "Dorm Student",
    description: "Living in dorm",
    icon: Building2,
    allocations: {
      fixed: 7.5,
      food: 65,
      mainMeals: 60,
      snacks: 5,
      experience: 7.5,
      development: 10,
      savings: 10,
    },
  },
  {
    key: "renter",
    label: "Room Renter",
    description: "Living in rental",
    icon: House,
    allocations: {
      fixed: 20,
      food: 45,
      mainMeals: 35,
      snacks: 10,
      experience: 15,
      development: 10,
      savings: 10,
    },
  },
  {
    key: "professional",
    label: "Working Professional",
    description: "Full-time job",
    icon: BriefcaseBusiness,
    allocations: {
      fixed: 40,
      food: 25,
      mainMeals: 20,
      snacks: 5,
      experience: 15,
      development: 10,
      savings: 10,
    },
  },
];

const baseEditBudgetItems: EditBudgetItem[] = [
  {
    key: "fixed",
    label: "Fixed bill",
    description: "Rent, utility bill, service fee...",
    color: "#005bed",
    icon: imgFixedBill,
    iconScale: 1.35,
    unit: "/ month",
    countsTowardTotal: true,
    presetPercent: 7.5,
    presetAmount: 375_000,
  },
  {
    key: "food",
    label: "Food and Drinks",
    description: "Main meals + snacks",
    color: "#529100",
    icon: imgFoodDrinks,
    unit: "/ month",
    countsTowardTotal: true,
    presetPercent: 65,
    presetAmount: 3_250_000,
  },
  {
    key: "mainMeals",
    label: "Main meals",
    description: "",
    color: "#b54023",
    icon: imgMainMeals,
    bgColor: "#ffc4b5",
    iconScale: 0.76,
    subBudget: true,
    unit: "/ day",
    countsTowardTotal: false,
    presetPercent: 60,
    presetAmount: 100_000,
  },
  {
    key: "snacks",
    label: "Snacks",
    description: "",
    color: "#ab8922",
    icon: imgSnacks,
    bgColor: "#f6e37a",
    iconScale: 0.82,
    subBudget: true,
    unit: "/ day",
    countsTowardTotal: false,
    presetPercent: 5,
    presetAmount: 8_300,
  },
  {
    key: "experience",
    label: "Experience",
    description: "Films, cafe, games, travel...",
    color: "#ff0048",
    icon: imgExperience,
    unit: "/ month",
    countsTowardTotal: true,
    presetPercent: 10,
    presetAmount: 500_000,
  },
  {
    key: "development",
    label: "Development",
    description: "Books, courses, stationaries...",
    color: "#00607f",
    icon: imgDevelopment,
    unit: "/ month",
    countsTowardTotal: true,
    presetPercent: 7.5,
    presetAmount: 375_000,
  },
  {
    key: "savings",
    label: "Savings",
    description: "Saving for future plans",
    color: "#038954",
    icon: imgSavings,
    bgIcon: imgSavingsBg,
    unit: "/ month",
    countsTowardTotal: true,
    presetPercent: 10,
    presetAmount: 500_000,
  },
];

function formatVnd(amount: number) {
  return `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;
}

function formatInputAmount(amount: number) {
  return `${new Intl.NumberFormat("vi-VN").format(amount)}đ`;
}

function formatPercent(value: number) {
  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`;
}

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


function BudgetIcon({
  icon,
  bgIcon,
  bgColor,
  genericIcon,
  iconScale,
  largeIcon,
  size = 40,
}: {
  icon?: string;
  bgIcon?: string;
  bgColor?: string;
  genericIcon?: boolean;
  iconScale?: number;
  largeIcon?: boolean;
  size?: number;
}) {
  const mapped = icon ? iconMap[icon] : null;
  const finalBgColor = bgColor || mapped?.bg || "#f0f2f5";
  const finalIconColor = mapped?.color || "#174f84";
  const IconComponent = mapped?.component;

  return (
    <div
      className="relative flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size, backgroundColor: finalBgColor }}
    >
      {IconComponent ? (
        <IconComponent style={{ width: size * 0.55, height: size * 0.55, color: finalIconColor }} strokeWidth={2.2} />
      ) : genericIcon ? (
        <Wallet className="text-[#174f84]" style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={1.9} />
      ) : null}
    </div>
  );
}

function AllocationItem({ item }: { item: AllocationViewItem }) {
  return (
    <div className="grid grid-cols-[40px_1fr] gap-3">
      <BudgetIcon icon={item.icon} bgIcon={item.bgIcon} largeIcon={item.largeIcon} />
      <div className="min-w-0 pt-[2px]">
        <div className="mb-[7px] flex items-start justify-between gap-2">
          <p className="max-w-[76px] text-[11px] leading-[13px] text-black">{item.label}</p>
          <p className="shrink-0 text-right text-[8px] leading-[12px] text-black">{item.amount}</p>
        </div>
        <div className="relative h-[12px]">
          <div className="absolute left-0 right-0 top-[3px] h-[7px] rounded-full bg-[#d9d9d9]" />
          <div
            className="absolute left-0 top-[3px] h-[7px] rounded-full"
            style={{ width: `${item.value}%`, backgroundColor: item.color }}
          />
          <p className="absolute right-0 top-1/2 -translate-y-1/2 text-[8px] leading-none" style={{ color: item.color }}>
            {item.percent}
          </p>
        </div>
      </div>
    </div>
  );
}

function EditBudgetRow({
  item,
  amount,
  percent,
  cycle,
  hint,
  onAmountFocus,
  onCycleChange,
  onLabelChange,
}: {
  item: EditBudgetItem;
  amount: number;
  percent: number;
  cycle?: SubBudgetCycle;
  hint?: string;
  isLocked?: boolean;
  onAmountFocus: () => void;
  onCycleChange?: () => void;
  onLabelChange?: (label: string) => void;
}) {
  return (
    <div className={`grid gap-x-3 ${item.subBudget || item.nested ? "grid-cols-[32px_1fr] pl-[56px]" : "grid-cols-[40px_1fr]"}`}>
      <BudgetIcon icon={item.icon} bgIcon={item.bgIcon} bgColor={item.bgColor} genericIcon={item.genericIcon} iconScale={item.iconScale} largeIcon={item.largeIcon} size={item.subBudget || item.nested ? 32 : 40} />
      <div className="min-w-0">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            {item.editableLabel && onLabelChange ? (
              <input
                aria-label={`${item.label} name`}
                className="h-[18px] w-full rounded-[4px] border border-transparent bg-transparent px-0 text-[12px] leading-[15px] text-black outline-none focus:border-[#b8cbe4] focus:bg-white focus:px-[4px]"
                onChange={(event) => onLabelChange(event.target.value)}
                value={item.label}
              />
            ) : (
              <p className="text-[12px] leading-[15px] text-black">{item.label}</p>
            )}
            {item.description ? (
              <p
                className="mt-[1px] max-w-[95px] overflow-hidden text-[10px] leading-[11px] text-[#546982]"
                style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2 }}
              >
                {item.description}
              </p>
            ) : null}
            {hint ? <p className="mt-[1px] text-[9px] leading-[11px] text-[#ab8922]">{hint}</p> : null}
          </div>
          <div className="flex shrink-0 items-center gap-[6px] pt-[2px] text-[12px] text-black">
            <input
              aria-label={`${item.label} amount`}
              className="h-5 w-[76px] rounded-[5px] border border-[#d1dceb] bg-[#f7f8fa] px-[6px] text-right text-[12px] outline-none focus:border-[#005bed]"
              inputMode="numeric"
              onClick={onAmountFocus}
              readOnly
              value={formatInputAmount(amount)}
            />
            {item.subBudget && cycle && onCycleChange ? (
              <button
                aria-label={`Switch ${item.label} cycle`}
                className="min-w-[51px] rounded-full border border-[#b8cbe4] bg-[#edf4ff] px-[6px] py-[2px] text-[11px] text-[#174f84]"
                onClick={onCycleChange}
                type="button"
              >
                / {cycle}
              </button>
            ) : (
              <span>{item.unit}</span>
            )}
          </div>
          <p className="w-[31px] shrink-0 pt-[3px] text-right text-[12px] leading-[15px] text-[#112945]">{formatPercent(percent)}</p>
        </div>
        <div className="mt-[11px] h-[5px] rounded-full bg-[#d9d9d9]">
          <div className="h-full rounded-full" style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: item.color }} />
        </div>
      </div>
    </div>
  );
}

function EditBudgetScreen({
  allocations,
  budgetItems,
  selectedLifestyle,
  subBudgetCycles,
  onAddCategory,
  onAmountChange,
  onCategoryLabelChange,
  onLifestyleChange,
  onSubBudgetCycleChange,
  onClose,
  onSave,
  isLocked,
  isLifestyleLocked,
  currentTotalBudget,
}: {
  allocations: Record<string, number>;
  budgetItems: EditBudgetItem[];
  selectedLifestyle: LifestyleKey;
  subBudgetCycles: Record<"mainMeals" | "snacks", SubBudgetCycle>;
  onAddCategory: () => void;
  onAmountChange: (key: BudgetKey, amount: number) => void;
  onCategoryLabelChange: (key: BudgetKey, label: string) => void;
  onLifestyleChange: (lifestyle: LifestyleKey) => void;
  onSubBudgetCycleChange: (key: "mainMeals" | "snacks") => void;
  onClose: () => void;
  onSave: () => void;
  isLocked?: boolean;
  isLifestyleLocked?: boolean;
  currentTotalBudget: number;
}) {
  const totalAllocatedPercent = budgetItems
    .filter((item) => item.countsTowardTotal)
    .reduce((sum, item) => sum + (allocations[item.key] ?? 0), 0);
  const totalAllocatedAmount = Math.round((currentTotalBudget * totalAllocatedPercent) / 100);
  const unallocatedAmount = Math.max(currentTotalBudget - totalAllocatedAmount, 0);
  const isOverAllocated = totalAllocatedPercent > 100;
  const [selectedDate, setSelectedDate] = useState(() => parseDateValue("2026-04-26"));
  const [activeAmountKey, setActiveAmountKey] = useState<BudgetKey | null>(null);
  const [shouldReplaceActiveAmount, setShouldReplaceActiveAmount] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const getAmount = (item: EditBudgetItem) => {
    const monthlyAmount = Math.round((currentTotalBudget * (allocations[item.key] ?? 0)) / 100);
    if (!item.subBudget) {
      return monthlyAmount;
    }

    const cycle = subBudgetCycles[item.key as "mainMeals" | "snacks"];
    const dailyAmount = Math.round(monthlyAmount / 30);
    return cycle === "week" ? dailyAmount * 7 : dailyAmount;
  };
  const activeAmountItem = budgetItems.find((item) => item.key === activeAmountKey);
  const activeAmountValue = activeAmountItem ? String(getAmount(activeAmountItem)) : "";
  const updateActiveAmount = (nextAmountValue: string) => {
    if (!activeAmountKey) {
      return;
    }

    onAmountChange(activeAmountKey, Number(nextAmountValue) || 0);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-[393px] overflow-x-hidden bg-[#f7f8fa] font-['SF_Compact_Rounded',sans-serif] text-black">
      <section className="relative min-h-screen bg-[linear-gradient(180deg,#112945_0%,#4d78a8_37.5%,#f7f8fa_100%)] px-[15px] pb-[22px] pt-[68px]">
        <div className="pointer-events-none absolute left-[172px] top-[28px] size-[2px] rounded-full bg-white/45" />
        <div className="pointer-events-none absolute right-[55px] top-[51px] size-[2px] rounded-full bg-white/45" />
        <button aria-label="Close edit budget" className="absolute left-[15px] top-[69px] text-white" onClick={onClose}>
          <X className="size-[25px]" strokeWidth={2.1} />
        </button>
        <button
          aria-label="Choose budget date"
          className="absolute left-[58px] top-[68px] flex h-7 items-center gap-[8px] rounded-full bg-white/20 px-[15px] text-white"
          onClick={() => openNativeDatePicker(dateInputRef.current)}
          type="button"
        >
          <Calendar className="size-[14px]" />
          <span className="text-[12px] font-medium">{formatDateDisplay(selectedDate)}</span>
        </button>
        <input
          aria-hidden
          className="absolute left-[58px] top-[68px] h-0 w-0 opacity-0"
          onChange={(event) => setSelectedDate(parseDateValue(event.target.value))}
          ref={dateInputRef}
          tabIndex={-1}
          type="date"
          value={formatDateValue(selectedDate)}
        />
        <button
          aria-label="Open bank fund setup"
          className="absolute right-[17px] top-[84px] flex size-[84px] items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-[0px_25px_50px_rgba(42,68,106,0.4)] backdrop-blur-[2px]"
          onClick={() => undefined}
          type="button"
        >
          <span className="absolute inset-[6px] rounded-full border border-white/10 bg-white/10" />
          <Landmark className="relative size-[42px]" strokeWidth={1.7} />
        </button>

        <header className="mt-[42px] text-white">
          <h1 className="text-[25px] font-medium leading-none">Edit budget allocation</h1>
          <p className="mt-[14px] text-[12px] leading-[15px]">Allocating budget by percentage.</p>
        </header>

        <section className="mt-[16px] flex h-[50px] items-center rounded-[20px] bg-[#f7f8fa] px-[20px] shadow-[0px_10px_30px_rgba(0,0,20,0.08)]">
          <Wallet className="mr-[28px] size-[22px] text-[#174f84]" strokeWidth={1.8} />
          <p className="flex-1 text-[12px] font-semibold text-[#174f84]">Total budget</p>
          <p className="text-[12px] font-semibold text-[#2e9b56]">{formatVnd(currentTotalBudget)}</p>
        </section>

        <section className="mt-[11px] rounded-[20px] bg-[#f7f8fa] px-[10px] pb-[13px] pt-[14px] shadow-[0px_10px_30px_rgba(0,0,20,0.08)]">
          <div className="mb-[10px] flex items-center justify-between px-[5px]">
            <h2 className="text-[12px] font-semibold leading-[15px] text-[#174f84]">Choose your lifestyle</h2>
            <p className="text-[9px] leading-[12px] text-[#546982]">
              {isLifestyleLocked ? "Resolve overflows in Inbox to unlock" : "We'll suggest the best allocation."}
            </p>
          </div>
          <div className="mb-[14px] grid grid-cols-3 gap-[5px]">
            {lifestyleTemplates.map((template) => {
              const Icon = template.icon;
              const isSelected = selectedLifestyle === template.key;
              const disabled = isLifestyleLocked && !isSelected;
              return (
                <button
                  className={`relative flex min-h-[72px] flex-col items-center justify-center rounded-[8px] border px-[3px] py-[7px] text-center transition-colors ${isSelected ? "border-[#005bed] bg-[#edf4ff]" : "border-[#d1dceb] bg-white"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  key={template.key}
                  disabled={disabled}
                  onClick={() => onLifestyleChange(template.key)}
                  type="button"
                >
                  {isSelected ? <CheckCircle2 className="absolute right-[4px] top-[4px] size-[14px] fill-[#005bed] text-white" /> : null}
                  <Icon className={`mb-[4px] size-[23px] ${isSelected ? "text-[#005bed]" : "text-[#174f84]"}`} strokeWidth={1.7} />
                  <span className={`text-[10px] font-semibold leading-[11px] ${isSelected ? "text-[#005bed]" : "text-[#174f84]"}`}>{template.label}</span>
                  <span className="mt-[2px] text-[8px] leading-[9px] text-[#546982]">{template.description}</span>
                </button>
              );
            })}
          </div>
          <div className="space-y-[17px] px-[7px] pb-[4px]">
            {budgetItems.map((item) => (
              <EditBudgetRow
                key={item.key}
                item={item}
                amount={getAmount(item)}
                percent={allocations[item.key] ?? 0}
                cycle={item.subBudget ? subBudgetCycles[item.key as "mainMeals" | "snacks"] : undefined}
                hint={item.key === "snacks" && selectedLifestyle === "renter" ? "~3 milk teas / week" : undefined}
                onAmountFocus={() => {
                  if (isLocked) return;
                  setActiveAmountKey(item.key);
                  setShouldReplaceActiveAmount(true);
                }}
                onCycleChange={item.subBudget ? () => onSubBudgetCycleChange(item.key as "mainMeals" | "snacks") : undefined}
                onLabelChange={item.editableLabel ? (label) => onCategoryLabelChange(item.key, label) : undefined}
              />
            ))}
            <button className="mx-auto flex h-[26px] w-[240px] items-center justify-center gap-2 rounded-[5px] border border-dashed border-[#6e97c8] bg-white text-[12px] text-[#112945]" onClick={onAddCategory} type="button">
              <Plus className="size-[14px]" />
              Add category
            </button>
          </div>
        </section>

        <section className="mt-[10px] rounded-[20px] border border-[#42a959] bg-gradient-to-b from-[rgba(191,230,195,0.5)] to-[rgba(245,247,251,0.5)] px-[20px] py-[17px] shadow-[0px_10px_30px_rgba(0,0,20,0.08)]">
          <div className="flex items-center justify-between">
            <p className="text-[16px] font-semibold">Total allocated</p>
            <p className={`text-[16px] font-bold ${isOverAllocated ? "text-[#d7373f]" : "text-[#2e9b56]"}`}>{formatPercent(totalAllocatedPercent)}</p>
          </div>
          <div className="mt-[9px] flex items-center justify-between">
            <p className="text-[14px] font-medium">Unallocated amount <span className="ml-1 inline-flex size-[14px] items-center justify-center rounded-full border border-[#c5c5c5] text-[8px] text-[#c5c5c5]">i</span></p>
            <p className={`text-[14px] font-medium ${isOverAllocated ? "text-[#d7373f]" : "text-[#2e9b56]"}`}>{isOverAllocated ? `-${formatVnd(totalAllocatedAmount - currentTotalBudget)}` : formatVnd(unallocatedAmount)}</p>
          </div>
        </section>

        <button
          className={`mx-auto mt-[15px] flex h-[45px] w-[280px] items-center justify-center rounded-[20px] text-[20px] font-semibold text-white shadow-[2px_2px_10px_rgba(0,0,0,0.2)] ${isOverAllocated || isLifestyleLocked || isLocked ? "cursor-not-allowed bg-[#a7adb7]" : "bg-[#174f84]"}`}
          disabled={isOverAllocated || isLifestyleLocked || isLocked}
          onClick={onSave}
        >
          {isLifestyleLocked ? "Resolve Overflows to Save" : "Save"}
        </button>
      </section>
      {activeAmountKey ? (
        <div className="fixed inset-0 z-50 mx-auto max-w-[393px]">
          <button aria-label="Close amount keyboard" className="absolute inset-0 cursor-default border-0 bg-transparent p-0" onClick={() => setActiveAmountKey(null)} type="button" />
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <AmountKeyboard
              amountValue={activeAmountValue}
              onClose={() => setActiveAmountKey(null)}
              onDeletePress={() => {
                setShouldReplaceActiveAmount(false);
                updateActiveAmount(activeAmountValue.slice(0, -1));
              }}
              onDigitPress={(digit) => {
                setShouldReplaceActiveAmount(false);
                updateActiveAmount(shouldReplaceActiveAmount ? digit : `${activeAmountValue}${digit}`);
              }}
              onSuggestionPress={(nextAmountValue) => {
                setShouldReplaceActiveAmount(false);
                updateActiveAmount(nextAmountValue);
              }}
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default function BudgetControlPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [budgetData, setBudgetData] = useState<BudgetScreenData | null>(null);
  const isLifestyleLocked = budgetData?.hasPendingOverflows ?? false;
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedLifestyle, setSelectedLifestyle] = useState<LifestyleKey>("dorm");
  const [currentResidenceType, setCurrentResidenceType] = useState<string>("dorm");
  const [customBudgetItems, setCustomBudgetItems] = useState<EditBudgetItem[]>([]);
  const budgetItems = [...baseEditBudgetItems, ...customBudgetItems];
  const [editAllocations, setEditAllocations] = useState<Record<string, number>>(() => lifestyleTemplates[0].allocations);
  const [subBudgetCycles, setSubBudgetCycles] = useState<Record<"mainMeals" | "snacks", SubBudgetCycle>>({
    mainMeals: "day",
    snacks: "day",
  });

  // Personal Wallet state
  const [wallet, setWallet] = useState<PersonalWalletViewModel | null>(null);
  const [isWalletEditing, setIsWalletEditing] = useState(false);
  const [walletInput, setWalletInput] = useState("");
  const [walletNote, setWalletNote] = useState("");
  const [walletSaving, setWalletSaving] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!isLoading && !budgetData?.bankAccountId) {
      const dismissed = sessionStorage.getItem("zuno:dismissed-onboarding");
      if (!dismissed) {
        setShowOnboarding(true);
      }
    }
  }, [isLoading, budgetData?.bankAccountId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const channel = new BroadcastChannel('zuno-demo-channel');
    channel.onmessage = (event) => {
      if (event.data.type === 'reset' || event.data.type === 'disconnect') {
        window.location.reload();
      }
    };
    return () => {
      channel.close();
    };
  }, []);

  // Poll database connection state every 3 seconds to sync cross-origin tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const interval = setInterval(async () => {
      try {
        const profileData = await apiClient.get<any>("/api/profile").catch(() => null);
        if (profileData) {
          const hasBank = !!profileData.bankAccountId;
          const uiConnected = !!budgetData?.bankAccountId;
          if (hasBank !== uiConnected) {
            window.location.reload();
          }
        }
      } catch (e) { /* ignore */ }
    }, 3000);

    return () => clearInterval(interval);
  }, [budgetData]);

  const handleSave = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const fundTypeMap: Record<string, string> = {
        fixed: "living",
        food: "food",
        development: "growth",
        experience: "experience",
        savings: "future",
      };

      const targetResidenceType = selectedLifestyle === "renter" ? "rent" : selectedLifestyle;
      const residenceTypeChanged = targetResidenceType !== currentResidenceType;

      // 1. Update the profile first to ensure correct residence type for redistribution logic
      if (residenceTypeChanged) {
        await apiClient.put("/api/profile", { residenceType: targetResidenceType });
        setCurrentResidenceType(targetResidenceType);
      }

      // 2. Perform updates to backend funds in parallel
      await Promise.all(
        (budgetData?.allocations ?? []).map(async (allocation) => {
          const matchingKey = Object.keys(fundTypeMap).find(
            (key) => fundTypeMap[key] === allocation.fundType
          );

          if (!matchingKey) return;

          const newPercent = editAllocations[matchingKey];
          if (newPercent === undefined) return;

          // Force update the food fund if the residence type changed so that daily budget redistribution runs with the new ratio
          const isFood = allocation.fundType === "food";
          if (newPercent === allocation.percentage && !(isFood && residenceTypeChanged)) {
            // We removed the early return here to guarantee the database always receives the update
            // because initial allocation percentages (0%) might bypass the state comparisons.
          }

          await apiClient.put(`/api/funds/${allocation.id}`, {
            allocatedPercent: newPercent,
          });
        })
      );

      // Refresh the screen with updated database state
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      const nextBudgetData = await getBudgetScreenData(currentMonth);
      setBudgetData(nextBudgetData);
      setIsEditing(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save budget allocations");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    let isMounted = true;

    async function loadBudgetOverview() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const ok = await bootstrapAuth();
        if (!ok || !isMounted) return;

        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

        // Fetch budget overview data and wallet in parallel
        const [nextBudgetData, walletData] = await Promise.all([
          getBudgetScreenData(currentMonth),
          getPersonalWallet().catch(() => null),
        ]);

        if (isMounted) {
          setBudgetData(nextBudgetData);
          if (walletData) {
            setWallet(walletData);
            setWalletInput(String(walletData.balance));
            setWalletNote(walletData.note ?? "");
          }
          const profileData = nextBudgetData;
          if (profileData) {
            const dbType = profileData.residenceType || "dorm";
            setCurrentResidenceType(dbType);
            const lifestyleKey = dbType === "rent" ? "renter" : dbType as LifestyleKey;
            setSelectedLifestyle(lifestyleKey);
            setSubBudgetCycles({
              mainMeals: lifestyleKey === "dorm" ? "day" : "week",
              snacks: lifestyleKey === "dorm" ? "day" : "week",
            });
            // Update edit allocations state with fetched database values as base
            const initialAllocations: Record<string, number> = {};
            const fundTypeMap: Record<string, string> = {
              fixed: "living",
              food: "food",
              development: "growth",
              experience: "experience",
              savings: "future",
            };

            const totalAllocated = (nextBudgetData?.allocations ?? []).reduce((sum, a) => sum + (a.percentage || 0), 0);
            const isZeroAllocation = totalAllocated === 0;
            const templateAllocations = lifestyleTemplates.find(t => t.key === lifestyleKey)?.allocations;

            if (isZeroAllocation && templateAllocations) {
              Object.assign(initialAllocations, templateAllocations);
            } else {
              (nextBudgetData?.allocations ?? []).forEach((allocation) => {
                const key = Object.keys(fundTypeMap).find(
                  (k) => fundTypeMap[k] === allocation.fundType
                );
                if (key) {
                  initialAllocations[key] = allocation.percentage;
                }
              });
              // Ensure mainMeals and snacks percentages are set
              initialAllocations.mainMeals = initialAllocations.mainMeals ?? (templateAllocations?.mainMeals ?? 60);
              initialAllocations.snacks = initialAllocations.snacks ?? (templateAllocations?.snacks ?? 5);
            }

            setEditAllocations((prev) => ({ ...prev, ...initialAllocations }));
          }
        }
      } catch (error) {
        if (isMounted) {
          setBudgetData(null);
          setErrorMessage(error instanceof Error ? error.message : "Unable to load budget overview");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadBudgetOverview();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentTotalBudget = budgetData?.totalBudget || 0;
  const allocationItems = (budgetData?.allocations ?? []).map((allocation: BudgetAllocation) => {
    const style = allocationItemStyles[allocation.fundType] ?? DEFAULT_ALLOCATION_STYLE;
    const remainingPct = currentTotalBudget > 0 ? (allocation.remainingAmount / currentTotalBudget) * 100 : 0;
    return {
      ...style,
      amount: formatInputAmount(allocation.remainingAmount),
      percent: formatPercent(remainingPct),
      value: remainingPct,
      spentAmount: allocation.spentAmount,
      remainingAmount: allocation.remainingAmount,
      borrowAmount: allocation.borrowAmount,
      fundType: allocation.fundType,
    };
  });
  const overviewTotalBudget = budgetData?.totalBudget ?? 0;
  const overviewTotalSpent = budgetData?.totalSpent ?? 0;
  const overviewRemaining = budgetData?.totalRemaining ?? 0;
  const overviewSpentPercent = overviewTotalBudget > 0 ? Math.min(100, Math.max(0, (overviewTotalSpent / overviewTotalBudget) * 100)) : 0;
  const overviewRemainingPercent = overviewTotalBudget > 0 ? (overviewRemaining / overviewTotalBudget) * 100 : 0;
  const overviewIsOverBudget = overviewRemaining < 0;
  const overviewTone = overviewIsOverBudget ? "#d7373f" : "#2e9b56";
  const overviewStatus = overviewIsOverBudget ? `${Math.abs(overviewRemainingPercent).toFixed(0)}%` : `+${overviewRemainingPercent.toFixed(0)}%`;
  const overviewMessage = overviewIsOverBudget
    ? <>You&apos;re <span style={{ color: overviewTone }}>{Math.abs(overviewRemainingPercent).toFixed(0)}%</span> over budget.</>
    : <>You&apos;re <span style={{ color: overviewTone }}>{overviewRemainingPercent.toFixed(0)}%</span> under budget. Great job!</>;
  const addCustomCategory = () => {
    const nextIndex = customBudgetItems.length + 1;
    const nextKey: CustomBudgetKey = `custom-${Date.now()}`;
    setCustomBudgetItems((current) => [
      ...current,
      {
        key: nextKey,
        label: `New category ${nextIndex}`,
        description: "Custom budget category",
        color: "#6e97c8",
        bgColor: "#edf4ff",
        genericIcon: true,
        editableLabel: true,
        unit: "/ month",
        countsTowardTotal: true,
        presetPercent: 0,
        presetAmount: 0,
      },
    ]);
    setEditAllocations((current) => ({ ...current, [nextKey]: 0 }));
  };

  if (isEditing) {
    return (
      <EditBudgetScreen
        allocations={editAllocations}
        budgetItems={budgetItems}
        selectedLifestyle={selectedLifestyle}
        subBudgetCycles={subBudgetCycles}
        onAddCategory={addCustomCategory}
        onCategoryLabelChange={(key, label) => {
          setCustomBudgetItems((current) => current.map((item) => (item.key === key ? { ...item, label } : item)));
        }}
        onAmountChange={(key, amount) => {
          const item = budgetItems.find((candidate) => candidate.key === key);
          if (!item) {
            return;
          }

          setEditAllocations((current) => {
            if (item.subBudget) {
              const cycle = subBudgetCycles[key as "mainMeals" | "snacks"];
              const monthlyAmount = cycle === "week" ? (amount * 30) / 7 : amount * 30;
              const percent = currentTotalBudget > 0 ? (monthlyAmount / currentTotalBudget) * 100 : 0;
              const next = { ...current, [key]: percent };
              return { ...next, food: next.mainMeals + next.snacks };
            }

            const percent = currentTotalBudget > 0 ? (amount / currentTotalBudget) * 100 : 0;
            if (key !== "food") {
              return { ...current, [key]: percent };
            }

            const currentFood = current.mainMeals + current.snacks;
            if (currentFood === 0) {
              return { ...current, food: percent, mainMeals: percent, snacks: 0 };
            }

            const scale = percent / currentFood;
            return {
              ...current,
              food: percent,
              mainMeals: current.mainMeals * scale,
              snacks: current.snacks * scale,
            };
          });
        }}
        onLifestyleChange={(lifestyle) => {
          const template = lifestyleTemplates.find((item) => item.key === lifestyle);
          if (!template) {
            return;
          }
          setSelectedLifestyle(lifestyle);
          setEditAllocations((current) => {
            const customAllocations = Object.fromEntries(customBudgetItems.map((item) => [item.key, current[item.key] ?? 0]));
            return { ...template.allocations, ...customAllocations };
          });
          setSubBudgetCycles({
            mainMeals: lifestyle === "dorm" ? "day" : "week",
            snacks: lifestyle === "dorm" ? "day" : "week",
          });
        }}
        onSubBudgetCycleChange={(key) => {
          setSubBudgetCycles((current) => ({
            ...current,
            [key]: current[key] === "day" ? "week" : "day",
          }));
        }}
        onClose={() => setIsEditing(false)}
        onSave={handleSave}
        isLocked={false}
        isLifestyleLocked={isLifestyleLocked}
        currentTotalBudget={currentTotalBudget}
      />
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[393px] overflow-x-hidden bg-[#f7f8fa] pb-[82px] font-['SF_Compact_Rounded',sans-serif] text-black">
      <section className="relative min-h-screen bg-[linear-gradient(180deg,#112945_0%,#4d78a8_37.5%,#f7f8fa_100%)] px-[15px] pt-[64px]">
        <div className="pointer-events-none absolute left-[88px] top-[48px] size-[3px] rounded-full bg-white/45" />
        <div className="pointer-events-none absolute left-[172px] top-[28px] size-[2px] rounded-full bg-white/45" />
        <div className="pointer-events-none absolute right-[56px] top-[50px] size-[2px] rounded-full bg-white/45" />
        <div className="pointer-events-none absolute right-[78px] top-[34px] size-[1.5px] rounded-full bg-white/45" />

        <header className="px-[18px] text-white">
          <h1 className="text-[25px] font-medium leading-none">Budget Control</h1>
          <p className="mt-[17px] text-[12px] leading-[15px]">Set your budget allocation by percentage.</p>
        </header>

        {isLoading ? (
          <section className="mt-[24px] rounded-[20px] bg-[#f7f8fa] px-5 py-4 text-[14px] font-medium text-[#64748b] shadow-[0px_10px_30px_rgba(0,0,20,0.08)]">
            Loading budget overview...
          </section>
        ) : errorMessage ? (
          <section className="mt-[24px] rounded-[20px] bg-red-50 px-5 py-4 text-[14px] font-medium text-red-600 shadow-[0px_10px_30px_rgba(0,0,20,0.08)]">
            {errorMessage}
          </section>
        ) : !budgetData?.bankAccountId ? (
          <section className="mt-[24px] rounded-[20px] bg-[#f7f8fa] px-[20px] pb-[16px] pt-[20px] shadow-[0px_10px_30px_rgba(0,0,20,0.08)]">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-3">
                <Landmark className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-[16px] font-semibold text-[#112945]">Account Setup Required</h2>
              <p className="mt-2 text-[13px] text-[#546982]">
                Your account is almost ready. Connect your bank to sync your current balance and start setting up your budgets.
              </p>
              <Link href="/connect-bank" className="mt-4 flex h-10 w-full max-w-[200px] items-center justify-center rounded-full bg-[#174f84] text-[14px] font-semibold text-white transition-opacity hover:opacity-90">
                Connect Bank Account
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="mt-[24px] rounded-[20px] bg-[#f7f8fa] px-[37px] py-[18px] shadow-[0px_10px_30px_rgba(0,0,20,0.08)]">
              <div className="grid grid-cols-[1fr_90px] items-center gap-5">
                <div>
                  <p className="text-[12px] leading-[15px]">Overall status</p>
                  <p className="mt-[14px] text-[45px] font-semibold leading-[45px]" style={{ color: overviewTone }}>{overviewStatus}</p>
                  <p className="mt-[8px] text-[12px] leading-[15px]" style={{ color: overviewTone }}>{formatInputAmount(Math.abs(overviewRemaining))} {overviewIsOverBudget ? "over budget" : "remaining"}</p>
                </div>
                <div className="relative size-[90px] rounded-full" style={{ background: `conic-gradient(${overviewTone} 0deg ${overviewSpentPercent * 3.6}deg, #d9d9d9 ${overviewSpentPercent * 3.6}deg 360deg)` }}>
                  <div className="absolute inset-[11px] flex items-center justify-center rounded-full bg-[#f7f8fa] text-center text-[12px] leading-[14px]">
                    {Math.round(overviewSpentPercent)}% of<br />budget
                  </div>
                </div>
              </div>
              <p className="mt-[13px] text-center text-[13px] leading-[21px] text-[#546982]">
                {overviewMessage}
              </p>
            </section>
          </>
        )}

        <section className="mt-[18px] rounded-[20px] bg-[#f7f8fa] px-[19px] pb-[24px] pt-[14px] shadow-[0px_10px_30px_rgba(0,0,20,0.08)]">
          <div className="mb-[17px] flex items-center justify-between">
            <h2 className="text-[12px] font-semibold leading-[15px]">Budget allocation</h2>
            {budgetData?.bankAccountId && (
              <button
                className={`flex items-center gap-[5px] text-[10px] leading-none ${isLifestyleLocked ? "text-gray-400 cursor-pointer" : "text-[#546982]"}`}
                onClick={() => {
                  if (isLifestyleLocked) {
                    alert("Please resolve the overflow in the inbox first.");
                    return;
                  }
                  const initialAllocations: Record<string, number> = {};
                  const fundTypeMap: Record<string, string> = {
                    fixed: "living",
                    food: "food",
                    development: "growth",
                    experience: "experience",
                    savings: "future",
                  };

                  (budgetData?.allocations ?? []).forEach((allocation) => {
                    const key = Object.keys(fundTypeMap).find(
                      (k) => fundTypeMap[k] === allocation.fundType
                    );
                    if (key) {
                      initialAllocations[key] = allocation.percentage;
                    }
                  });

                  const lifestyleKey = currentResidenceType === "rent" ? "renter" : currentResidenceType as LifestyleKey;
                  setSelectedLifestyle(lifestyleKey);
                  setSubBudgetCycles({
                    mainMeals: lifestyleKey === "dorm" ? "day" : "week",
                    snacks: lifestyleKey === "dorm" ? "day" : "week",
                  });

                  initialAllocations.mainMeals = editAllocations.mainMeals ?? (lifestyleTemplates.find(t => t.key === lifestyleKey)?.allocations.mainMeals ?? 60);
                  initialAllocations.snacks = editAllocations.snacks ?? (lifestyleTemplates.find(t => t.key === lifestyleKey)?.allocations.snacks ?? 5);

                  setEditAllocations((prev) => ({ ...prev, ...initialAllocations }));
                  setIsEditing(true);
                }}>
                <Pencil className="size-[14px]" fill="currentColor" strokeWidth={0} />
                {isLifestyleLocked ? "Locked" : "Edit"}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-[17px]">
            {budgetData?.bankAccountId && (
              allocationItems.map((item) => (
                <AllocationItem key={item.label} item={item} />
              ))
            )}
          </div>
        </section>

        {/* Personal Money Card */}
        <section className="mt-[18px] rounded-[20px] bg-[#f7f8fa] px-[19px] pb-[20px] pt-[14px] shadow-[0px_10px_30px_rgba(0,0,20,0.08)]">
          <div className="mb-[14px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-[28px] items-center justify-center rounded-full bg-[#e8f0fb]">
                <Wallet className="size-[15px] text-[#174f84]" strokeWidth={2} />
              </div>
              <h2 className="text-[12px] font-semibold leading-[15px]">Personal Money</h2>
            </div>
            {!isWalletEditing && (
              <button
                className="flex items-center gap-[5px] text-[10px] leading-none text-[#546982]"
                onClick={() => {
                  setWalletInput(wallet ? String(wallet.balance) : "0");
                  setWalletNote(wallet?.note ?? "");
                  setWalletError(null);
                  setIsWalletEditing(true);
                }}
              >
                <Pencil className="size-[13px]" fill="currentColor" strokeWidth={0} />
                Update
              </button>
            )}
          </div>

          {!isWalletEditing ? (
            <div className="flex flex-col gap-[6px]">
              <div className="flex items-baseline gap-[4px]">
                <span className="text-[24px] font-bold leading-none text-[#0d1b3e]">
                  {(wallet?.balance ?? 0).toLocaleString("vi-VN")}
                </span>
                <span className="text-[12px] font-medium text-[#546982]">₫</span>
              </div>
              {wallet?.note ? (
                <p className="text-[11px] leading-[14px] text-[#8095ae] italic">"{wallet.note}"</p>
              ) : (
                <p className="text-[11px] leading-[14px] text-[#b0bac8]">No note added.</p>
              )}
              <p className="mt-[2px] text-[10px] text-[#b0bac8]">
                Tracked separately from your 5 main funds and bank account.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-[10px]">
              <div>
                <label className="mb-[4px] block text-[11px] font-medium text-[#546982]">Amount (₫)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  className="w-full rounded-[10px] border border-[#d4dce7] bg-white px-[12px] py-[9px] text-[14px] font-semibold text-[#0d1b3e] outline-none focus:border-[#174f84]"
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-[4px] block text-[11px] font-medium text-[#546982]">Note (optional)</label>
                <input
                  type="text"
                  className="w-full rounded-[10px] border border-[#d4dce7] bg-white px-[12px] py-[9px] text-[13px] text-[#0d1b3e] outline-none focus:border-[#174f84]"
                  value={walletNote}
                  onChange={(e) => setWalletNote(e.target.value)}
                  placeholder="e.g. Cash from parents, freelance income…"
                />
              </div>
              {walletError && <p className="text-[11px] text-red-500">{walletError}</p>}
              <div className="flex gap-[8px]">
                <button
                  className="flex-1 rounded-[10px] border border-[#d4dce7] bg-white py-[9px] text-[13px] font-medium text-[#546982]"
                  onClick={() => setIsWalletEditing(false)}
                  disabled={walletSaving}
                >
                  Cancel
                </button>
                <button
                  className={`flex-1 rounded-[10px] py-[9px] text-[13px] font-semibold text-white ${walletSaving ? "bg-[#a7adb7]" : "bg-[#174f84]"}`}
                  disabled={walletSaving}
                  onClick={async () => {
                    const parsed = parseFloat(walletInput.replace(/,/g, ""));
                    if (Number.isNaN(parsed) || parsed < 0) {
                      setWalletError("Please enter a valid non-negative amount.");
                      return;
                    }
                    setWalletSaving(true);
                    setWalletError(null);
                    try {
                      const updated = await updatePersonalWallet(parsed, walletNote);
                      setWallet(updated);
                      setIsWalletEditing(false);
                    } catch {
                      setWalletError("Failed to save. Please try again.");
                    } finally {
                      setWalletSaving(false);
                    }
                  }}
                >
                  {walletSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="mt-[18px] rounded-[20px] bg-[#f7f8fa] px-[21px] pb-[10px] pt-[15px] shadow-[0px_10px_30px_rgba(0,0,20,0.08)]">
          <div className="mb-[10px] flex items-center justify-between">
            <h2 className="text-[12px] font-semibold leading-[15px]">Long-term goals</h2>
            <button className="flex h-[19px] items-center gap-[5px] rounded-[5px] border border-[#6e97c8] px-[6px] text-[10px] leading-none text-[#174f84]">
              <Plus className="size-[10px]" strokeWidth={2} />
              Add goals
            </button>
          </div>
          <div className="flex h-[135px] flex-col items-center justify-center rounded-[10px] bg-[rgba(233,235,244,0.64)] px-4">
            <div className="mb-[8px] flex size-[48px] items-center justify-center rounded-full bg-[#174f84]/15 text-[#174f84]">
              <Target className="size-[24px]" strokeWidth={2.2} />
            </div>
            <p className="text-center text-[12px] leading-[14px] text-[#546982]">No long-term goals set yet. Add now!</p>
          </div>
        </section>
      </section>

      <BottomNav />

      {showOnboarding && (
        <OnboardingModal
          onClose={() => {
            setShowOnboarding(false);
            sessionStorage.setItem("zuno:dismissed-onboarding", "true");
          }}
        />
      )}
    </main>
  );
}

function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"funds" | "overspent">("funds");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setAnimate(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 280); // match transition duration
  };

  return (
    <div className={`fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[393px] z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-out ${
      animate ? "bg-black/50" : "bg-black/0 pointer-events-none"
    }`}>
      <div className={`relative w-full max-w-[350px] overflow-hidden rounded-[28px] bg-white border border-[#edf4ff] shadow-[0_24px_50px_rgba(17,41,69,0.25)] transition-all duration-300 ease-out ${
        animate ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-6"
      }`}>
        
        {/* Decorative Header Gradient */}
        <div className="h-[90px] bg-gradient-to-br from-[#112945] via-[#174f84] to-[#4d78a8] px-5 pt-6 relative text-white flex flex-col justify-end pb-3">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 flex size-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Close guide"
          >
            <X className="size-4" />
          </button>
          <h3 className="font-['SF_Compact_Rounded',sans-serif] text-[18px] font-bold tracking-tight">ZUNO User Guide</h3>
          <p className="text-[11px] text-white/80">Smart expense management with AI</p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#edf0f4] p-1 bg-[#f8fafc]">
          <button
            onClick={() => setActiveTab("funds")}
            className={`flex-1 py-2 text-center text-[12px] font-bold rounded-xl transition-all ${
              activeTab === "funds"
                ? "bg-white text-[#174f84] shadow-sm"
                : "text-[#64748b] hover:text-[#174f84]"
            }`}
          >
            📊 5-Fund Structure
          </button>
          <button
            onClick={() => setActiveTab("overspent")}
            className={`flex-1 py-2 text-center text-[12px] font-bold rounded-xl transition-all ${
              activeTab === "overspent"
                ? "bg-white text-[#174f84] shadow-sm"
                : "text-[#64748b] hover:text-[#174f84]"
            }`}
          >
            🚨 3-Level Protection
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 max-h-[360px] overflow-y-auto">
          {activeTab === "funds" ? (
            <div className="space-y-4">
              <p className="text-[12px] text-[#546982] leading-relaxed">
                ZUNO automatically categorizes your income and transactions into <strong>5 independent spending funds</strong>:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-[#eef4ff] border border-[#dbeafe]">
                  <span className="text-xl">🏠</span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-[#005bed]">Fixed Bill Fund</p>
                    <p className="text-[10px] text-[#546982] mt-0.5">Fixed bills, rent, utilities...</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-[#f0f9e8] border border-[#dcfce7]">
                  <span className="text-xl">🍔</span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-[#529100]">Food & Drinks Fund</p>
                    <p className="text-[10px] text-[#546982] mt-0.5">Daily meals, milk tea, coffee...</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-[#ffe6ec] border border-[#fecdd3]">
                  <span className="text-xl">✈️</span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-[#ff0048]">Experience Fund</p>
                    <p className="text-[10px] text-[#546982] mt-0.5">Entertainment, shopping, movies, travel...</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-[#e6f5fa] border border-[#e0f2fe]">
                  <span className="text-xl">📚</span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-[#00607f]">Growth Fund</p>
                    <p className="text-[10px] text-[#546982] mt-0.5">Books, courses, self-improvement...</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-[#e6f8f0] border border-[#d1fae5]">
                  <span className="text-xl">💎</span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-[#038954]">Savings Fund</p>
                    <p className="text-[10px] text-[#546982] mt-0.5">Long-term savings, emergency funds...</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[12px] text-[#546982] leading-relaxed">
                When any fund exceeds its spending limit, ZUNO activates a <strong>3-level protection mechanism</strong>:
              </p>

              <div className="space-y-4 pl-2 relative border-l border-slate-100">
                {/* Level 1 */}
                <div className="relative pl-6">
                  <div className="absolute left-[-13px] top-0.5 flex size-6 items-center justify-center rounded-full bg-[#fef3c7] text-[#d97706] text-xs font-bold border border-white">1</div>
                  <div>
                    <h4 className="text-[12px] font-bold text-[#b45309]">Level 1: Limit Reduction (Warning)</h4>
                    <p className="text-[10px] text-[#546982] mt-0.5 leading-relaxed">
                      <strong>Action:</strong> Spending exceeds the safe daily limit.<br/>
                      <strong>Solution:</strong> Automatically deduct the overspent amount (divided equally) from the food allowance of remaining days in the month.
                    </p>
                  </div>
                </div>

                {/* Level 2 */}
                <div className="relative pl-6">
                  <div className="absolute left-[-13px] top-0.5 flex size-6 items-center justify-center rounded-full bg-[#ffedd5] text-[#ea580c] text-xs font-bold border border-white">2</div>
                  <div>
                    <h4 className="text-[12px] font-bold text-[#c2410c]">Level 2: Auto-Compensation</h4>
                    <p className="text-[10px] text-[#546982] mt-0.5 leading-relaxed">
                      <strong>Action:</strong> Spending exceeds the entire daily snack allowance.<br/>
                      <strong>Solution:</strong> Visual warning and automatic compensation from unspent funds (Experience, Growth, Freedom, Non-interest Savings).
                    </p>
                  </div>
                </div>

                {/* Level 3 */}
                <div className="relative pl-6">
                  <div className="absolute left-[-13px] top-0.5 flex size-6 items-center justify-center rounded-full bg-[#fee2e2] text-[#dc2626] text-xs font-bold border border-white">3</div>
                  <div>
                    <h4 className="text-[12px] font-bold text-[#b91c1c]">Level 3: Benefit Limitation (Strict Block)</h4>
                    <p className="text-[10px] text-[#546982] mt-0.5 leading-relaxed">
                      <strong>Action:</strong> Exceeding the limits of all above funds, affecting Interest-bearing Savings.<br/>
                      <strong>Solution:</strong> Full red alert interface, locking weekend Chests and reducing reward point multipliers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#edf0f4] flex gap-3 bg-[#f8fafc]">
          <button
            onClick={handleClose}
            className="flex-1 py-3 text-center text-[13px] font-bold rounded-2xl bg-gradient-to-r from-[#174f84] to-[#4d78a8] text-white hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-[#174f84]/20"
          >
            Understood & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
