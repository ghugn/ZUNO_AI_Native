'use client';

import { getNotifications } from "@/lib/zunoApi";
import type { NotificationKind, NotificationViewModel } from "@/types/zuno";
import { AlertTriangle, Bot, ChevronRight, CreditCard, Gift, MapPin, Settings, ShieldAlert, Utensils, X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { bootstrapAuth } from "@/lib/api/auth";
import { apiClient } from "@/lib/apiClient";

type NotificationTab = "System" | "AI assistant";

const tabs: NotificationTab[] = ["System", "AI assistant"];

function getCurrentMonthString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

type NotificationItem = {
  id?: string;
  action?: string;
  body: ReactNode;
  dateLabel: string;
  dotColor: string;
  icon: ReactNode;
  iconBg: string;
  kind: string;
  time: string;
  title: string;
  tone?: "alert";
  overflowAmount?: number;
  overflowLevel?: NotificationViewModel["overflowLevel"];
  penaltyPerDay?: number;
  transactionAmount?: number;
  isRead?: boolean;
};

const AI_ASSISTANT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "ai-location-nudge",
    body: (
      <p>
        You just entered Vincom MegaMall, one of your high-spend spots. Your Experience fund has only <strong>35.000đ</strong> left today.
      </p>
    ),
    dateLabel: formatDateLabel(new Date().toISOString()),
    dotColor: "bg-[#e11d48]",
    icon: <MapPin className="size-[23px] text-[#e11d48]" strokeWidth={2.25} />,
    iconBg: "bg-[#fff1f1]",
    kind: "AI assistant",
    time: "5:20 PM",
    title: "Location temptation alert",
    action: "View safe spending tips",
  },
  {
    id: "ai-subscription-alert",
    body: (
      <p>
        Netflix Premium <strong>260.000đ</strong> will renew in 7 days. Do you want to cancel or keep this subscription?
      </p>
    ),
    dateLabel: formatDateLabel(new Date().toISOString()),
    dotColor: "bg-[#f39a18]",
    icon: <CreditCard className="size-[23px] text-[#f39a18]" strokeWidth={2.25} />,
    iconBg: "bg-[#fff7ed]",
    kind: "AI assistant",
    time: "2:10 PM",
    title: "Subscription renewal alert",
    action: "Manage subscription",
  },
  {
    id: "ai-budget-rescue",
    body: (
      <p>
        ZUNO noticed weekend Food overspending for 3 weeks. A <strong>120.000đ</strong> Weekend Buffer from Experience may reduce overflow risk this week.
      </p>
    ),
    dateLabel: formatDateLabel(new Date().toISOString()),
    dotColor: "bg-[#2563eb]",
    icon: <Bot className="size-[24px] text-[#174f84]" strokeWidth={2.2} />,
    iconBg: "bg-[#eef6ff]",
    kind: "AI assistant",
    time: "11:45 AM",
    title: "Smart budget rescue",
    action: "Review plan",
  },
  {
    id: "ai-risk-intercept",
    body: (
      <p>
        A late-night transfer pattern looks unusual compared with your normal behavior. ZUNO can add an extra confirmation step before high-risk transfers.
      </p>
    ),
    dateLabel: formatDateLabel(new Date(Date.now() - 86400000).toISOString()),
    dotColor: "bg-[#e11d48]",
    icon: <ShieldAlert className="size-[24px] text-[#e11d48]" strokeWidth={2.2} />,
    iconBg: "bg-[#fff1f1]",
    kind: "AI assistant",
    time: "9:30 PM",
    title: "AI risk protection",
    action: "Check protection",
    isRead: true,
  },
];

function formatDateLabel(value: string) {
  const dateStr = value.includes("T") ? value.split("T")[0] : value;
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function formatTimeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return formatDateLabel(value);
  }

  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function getNotificationStyle(kind: NotificationKind, severity: NotificationViewModel["severity"]) {
  if (kind === "Alerts" || severity === "danger") {
    return {
      dotColor: "bg-[#e11d48]",
      icon: <AlertTriangle className="size-[23px] text-[#e11d48]" strokeWidth={2.25} />,
      iconBg: "bg-white",
      tagClassName: "bg-[#ffdada] text-[#e11d48]",
      tone: "alert" as const,
    };
  }

  if (kind === "Rewards") {
    return {
      dotColor: "bg-[#2563eb]",
      icon: <Gift className="size-[24px] text-[#7c3aed]" strokeWidth={2.2} />,
      iconBg: "bg-[#f5f3ff]",
      tagClassName: "bg-[#ede9fe] text-[#7c3aed]",
    };
  }

  if (kind === "Budget" || severity === "success") {
    return {
      dotColor: "bg-[#22c55e]",
      icon: <Utensils className="size-[25px] text-[#22c55e]" strokeWidth={2.35} />,
      iconBg: "bg-[#f0fdf4]",
      tagClassName: "bg-[#dcfce7] text-[#15803d]",
    };
  }

  return {
    dotColor: "bg-[#64748b]",
    icon: <Settings className="size-[24px] text-[#64748b]" strokeWidth={2.2} />,
    iconBg: "bg-[#eef2f7]",
    tagClassName: "bg-[#eef2f7] text-[#64748b]",
  };
}

function toNotificationItem(notification: NotificationViewModel): NotificationItem {
  const style = getNotificationStyle(notification.kind, notification.severity);

  return {
    id: notification.id,
    action: notification.actionLabel,
    body: <p>{notification.message}</p>,
    dateLabel: formatDateLabel(notification.date),
    dotColor: style.dotColor,
    icon: style.icon,
    iconBg: style.iconBg,
    kind: "System",
    time: formatTimeLabel(notification.time),
    title: notification.title,
    tone: style.tone,
    overflowAmount: notification.overflowAmount,
    overflowLevel: notification.overflowLevel,
    penaltyPerDay: notification.penaltyPerDay,
    transactionAmount: notification.transactionAmount,
    isRead: notification.isRead,
  };
}

function groupNotifications(notifications: NotificationViewModel[]) {
  const groups = new Map<string, NotificationItem[]>();

  notifications.forEach((notification) => {
    const dateLabel = formatDateLabel(notification.date);
    groups.set(dateLabel, [...(groups.get(dateLabel) ?? []), toNotificationItem(notification)]);
  });

  return Array.from(groups, ([date, items]) => ({ date, items }));
}

function groupNotificationItems(items: NotificationItem[]) {
  const groups = new Map<string, NotificationItem[]>();

  items.forEach((item) => {
    groups.set(item.dateLabel, [...(groups.get(item.dateLabel) ?? []), item]);
  });

  return Array.from(groups, ([date, groupedItems]) => ({ date, items: groupedItems }));
}

function NotificationCard({ item }: { item: NotificationItem }) {
  const isAlert = item.tone === "alert";
  const formatMoney = (value = 0) => `${value.toLocaleString("vi-VN")}đ`;
  const alertLevel = item.overflowLevel?.replace("level_", "") ?? "1";
  const alertBody = item.overflowLevel === "level_1"
    ? (
      <p>
        {item.penaltyPerDay && item.penaltyPerDay > 0
          ? <>Snack budget will be reduced by <strong>{formatMoney(item.penaltyPerDay)}</strong> per remaining day.</>
          : <>No snack budget remaining to reduce. System will try to adjust other budgets.</>}
      </p>
    )
    : (
      <p>
        You spent <strong>{formatMoney(item.transactionAmount)}</strong> on Food and Drinks, which is{" "}
        <strong>{formatMoney(item.overflowAmount)}</strong> over the daily limit.{" "}
        {item.overflowLevel === "level_3"
          ? "Please borrow from other jars and savings to make up for the overspent amount."
          : "Please borrow from another jar to make up for the overspent amount."}
      </p>
    );

  return (
    <article
      className={`relative w-full rounded-[24px] border ${
        isAlert ? "border-[#ffe4e4] bg-[#fff1f1]" : "border-[#f9fafb] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
      }`}
    >
      <div className={`flex gap-[14px] ${isAlert ? "items-start px-[18px] pb-[18px] pt-[16px]" : "items-start px-[18px] py-[18px] pr-[46px]"}`}>
        <div className={`flex size-12 shrink-0 items-center justify-center rounded-full ${item.iconBg}`}>
          {item.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className={`flex ${isAlert ? "items-start justify-between gap-[10px]" : "items-start justify-between gap-[12px]"}`}>
            <div className={`min-w-0 ${isAlert ? "flex-1 pr-[4px]" : "flex min-w-0 flex-1 items-start gap-[8px]"}`}>
              <h3 className="min-w-0 break-words font-['SF_Compact_Rounded',sans-serif] text-[16px] font-bold leading-[19px] text-[#0d1b3e]">
                {item.title}
              </h3>
            </div>
            <div className={`shrink-0 ${isAlert ? "flex flex-wrap items-center justify-end gap-[8px] pl-[6px]" : "flex items-center gap-[8px]"}`}>
              <span className="font-['SF_Compact_Rounded',sans-serif] text-[11px] leading-[13px] text-[#6b7280]">{item.time}</span>
              {!item.isRead && <span className={`size-2 shrink-0 rounded-full ${item.dotColor}`} />}
            </div>
          </div>
          <div className={`font-['SF_Compact_Rounded',sans-serif] ${isAlert ? "mt-[10px] pr-[34px] text-[13px] leading-[16px]" : "mt-[9px] text-[12px] leading-[16.5px]"} text-[#4b5563]`}>
            {isAlert ? (
              <>
                <p className="mb-[7px] font-bold text-[#0d1b3e]">{`${item.dateLabel} overspent level ${alertLevel}.`}</p>
                {alertBody}
              </>
            ) : item.body}
          </div>
          {item.action ? (
            <button
              type="button"
              className="mt-[10px] pr-[34px] font-['SF_Compact_Rounded',sans-serif] text-[14px] font-bold leading-[17px] text-[#e11d48] text-left hover:underline"
              onClick={async (e) => {
                e.preventDefault();
                if (item.action === "Confirm changes" && item.id) {
                  try {
                    await apiClient.put(`/api/overflows/${item.id}`, { status: "resolved" });
                    
                    // Automatically mark this notification as read
                    const existingReadIds: string[] = JSON.parse(localStorage.getItem('zuno:read-notifications') || '[]');
                    const newReadIds = Array.from(new Set([...existingReadIds, item.id]));
                    localStorage.setItem('zuno:read-notifications', JSON.stringify(newReadIds));

                    alert("Changes confirmed!");
                    window.location.reload();
                  } catch {
                    alert("Error confirming changes");
                  }
                }
              }}
            >
              {item.action}
            </button>
          ) : null}
        </div>
      </div>
      {item.action ? (
        <ChevronRight className="absolute bottom-[20px] right-[18px] size-5 shrink-0 text-[#9ca3af]" strokeWidth={1.9} />
      ) : null}
      {!isAlert && !item.action ? <ChevronRight className="absolute right-[18px] top-1/2 size-5 -translate-y-1/2 text-[#9ca3af]" strokeWidth={1.9} /> : null}
    </article>
  );
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<NotificationTab>("System");
  const [notifications, setNotifications] = useState<NotificationViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const systemGroups = groupNotifications(notifications);
  const aiGroups = groupNotificationItems(AI_ASSISTANT_NOTIFICATIONS);
  const visibleGroups = activeTab === "System" ? systemGroups : aiGroups;
  const unreadAiCount = AI_ASSISTANT_NOTIFICATIONS.filter((item) => !item.isRead).length;

  useEffect(() => {
    let isMounted = true;

    async function loadNotifications(showLoading = true) {
      if (showLoading) setIsLoading(true);
      setErrorMessage(null);

      try {
        const ok = await bootstrapAuth();
        if (!ok || !isMounted) return;

        const nextNotifications = await getNotifications(getCurrentMonthString());
        
        // Apply read status from localStorage
        const readIds: string[] = JSON.parse(localStorage.getItem('zuno:read-notifications') || '[]');
        const withReadStatus = nextNotifications.map(n => ({
          ...n,
          isRead: n.isRead || readIds.includes(n.id)
        }));

        if (isMounted) {
          setNotifications(withReadStatus);
        }
      } catch (error) {
        if (isMounted) {
          setNotifications([]);
          setErrorMessage(error instanceof Error ? error.message : "Unable to load notifications");
        }
      } finally {
        if (isMounted && showLoading) {
          setIsLoading(false);
        }
      }
    }

    loadNotifications();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadNotifications(false);
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      isMounted = false;
    };
  }, []);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[393px] overflow-x-hidden bg-[#f8f9fb] pb-10 font-['SF_Compact_Rounded',sans-serif]">
      <header className="flex h-[100px] items-end justify-between px-6 pb-[17px]">
        <div className="flex items-center gap-[12px]">
          <Link aria-label="Close notifications" className="flex size-8 items-center justify-center rounded-full text-[#0d1b3e] transition-colors hover:bg-white" href="/">
            <X className="size-5" strokeWidth={2.5} />
          </Link>
          <h1 className="text-[30px] font-bold leading-[36px] text-[#0d1b3e]">Notifications</h1>
        </div>
        <button
          className="pb-[4px] text-[14px] font-black leading-[17px] text-[#0047ab] transition-colors hover:text-[#0d1b3e]"
          type="button"
          onClick={async () => {
            try {
              await apiClient.put("/api/notifications/read-all");
              
              // mark all current ones as read locally
              const currentIds = notifications.map(n => n.id);
              const existingReadIds: string[] = JSON.parse(localStorage.getItem('zuno:read-notifications') || '[]');
              const newReadIds = Array.from(new Set([...existingReadIds, ...currentIds]));
              localStorage.setItem('zuno:read-notifications', JSON.stringify(newReadIds));
              
              setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            } catch (err) {
              console.error(err);
            }
          }}
        >
          Mark all as read
        </button>
      </header>

      <div className="h-[70px] overflow-x-auto pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-[8px] px-6">
          {tabs.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                className={`relative h-[38px] shrink-0 rounded-full px-6 text-[14px] font-medium leading-[17px] transition-colors ${
                  isActive ? "bg-[#0d3b66] text-white" : "border border-[#f3f4f6] bg-white text-[#6b7280]"
                }`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                <span className="inline-flex items-center gap-2">
                  {tab}
                  {tab === "AI assistant" && unreadAiCount > 0 ? (
                    <span className={`flex size-[18px] items-center justify-center rounded-full text-[10px] font-bold leading-none ${isActive ? "bg-white text-[#e11d48]" : "bg-[#e11d48] text-white"}`}>
                      {unreadAiCount}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-[26px] px-6 pt-[18px]">
        {isLoading ? (
          <div className="rounded-[18px] bg-white px-5 py-4 text-[14px] font-medium text-[#64748b]">Loading notifications...</div>
        ) : errorMessage ? (
          <div className="rounded-[18px] border border-[#ffe4e4] bg-[#fff1f1] px-5 py-4 text-[14px] font-medium leading-[18px] text-[#e11d48]">
            {errorMessage}
          </div>
        ) : visibleGroups.length === 0 ? (
          <div className="rounded-[18px] bg-white px-5 py-4 text-[14px] font-medium text-[#64748b]">No notifications yet.</div>
        ) : (
          visibleGroups.map((group) => (
            <section key={group.date}>
              <h2 className="mb-4 text-[14px] font-bold leading-[17px] text-[#0d1b3e]">{group.date}</h2>
              <div className="space-y-[10px]">
                {group.items.map((item, i) => (
                  <NotificationCard item={item} key={`${group.date}-${item.title}-${item.time}-${i}`} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </main>
  );
}
