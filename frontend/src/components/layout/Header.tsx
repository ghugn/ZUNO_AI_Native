"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, AlertTriangle, Lightbulb, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import Link from "next/link";

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  actionHref?: string;
  createdAt: string;
}

export default function Header() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await apiClient.get<Notification[]>('/api/notifications');
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Click outside to close
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const markAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.put(`/api/notifications/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="w-full h-[120px] relative px-[25px] pt-[51px] flex justify-between items-start z-50">
      <h1 className="font-['SF_Compact_Rounded',sans-serif] font-bold text-[35px] text-white leading-none tracking-tight">
        Zuno
      </h1>
      
      <div className="flex items-center gap-3 mt-[4px]" ref={dropdownRef}>
        {/* Flame Icon + Points */}
        <div className="flex items-center gap-1">
          <span className="text-[24px]">🔥</span>
          <span className="font-['SF_Compact_Rounded',sans-serif] font-semibold text-[30px] text-white leading-none">
            50
          </span>
        </div>

        {/* Bell Button */}
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-[43px] h-[43px] rounded-full bg-[#738BA5] flex items-center justify-center text-white hover:bg-[#6B7A96] transition-all active:scale-95 cursor-pointer relative"
          >
            <Bell size={22} strokeWidth={2} fill="currentColor" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 size-[14px] bg-red-500 rounded-full border-2 border-[#112945]" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showDropdown && (
            <div className="absolute top-[50px] right-0 w-[320px] max-h-[400px] bg-white rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col z-[100] animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="font-['SF_Compact_Rounded',sans-serif] font-bold text-[#112945]">Thông báo</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[12px] font-semibold text-[#4D78A8] hover:text-[#112945]">
                    Đánh dấu đã đọc tất cả
                  </button>
                )}
              </div>

              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-[#546982] text-[13px] font-['SF_Compact_Rounded',sans-serif]">
                    Chưa có thông báo nào.
                  </div>
                ) : (
                  <div className="flex flex-col divide-y divide-gray-50">
                    {notifications.map(notification => {
                      const Icon = notification.type === 'suggestion' ? Lightbulb : (notification.type === 'overflow' || notification.type === 'urgent' ? AlertTriangle : Bell);
                      const iconColor = notification.type === 'overflow' ? 'text-orange-500 bg-orange-50' : (notification.type === 'urgent' ? 'text-red-500 bg-red-50' : 'text-blue-500 bg-blue-50');
                      
                      const content = (
                        <div className={`flex gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-[#f8fbff]' : ''}`}>
                          <div className={`shrink-0 size-[36px] rounded-full flex items-center justify-center ${iconColor}`}>
                            <Icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-[13px] font-semibold text-[#112945] mb-0.5 ${!notification.isRead ? 'font-bold' : ''}`}>
                              {notification.title}
                            </h4>
                            <p className="text-[12px] text-[#546982] leading-tight mb-1">
                              {notification.body}
                            </p>
                            <span className="text-[10px] text-gray-400 font-semibold">
                              {new Date(notification.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          {!notification.isRead && (
                            <button 
                              onClick={(e) => markAsRead(notification.id, e)}
                              className="shrink-0 text-blue-500 p-1 hover:bg-blue-100 rounded-full h-fit"
                              title="Đánh dấu đã đọc"
                            >
                              <div className="size-2 bg-blue-500 rounded-full" />
                            </button>
                          )}
                        </div>
                      );

                      if (notification.actionHref) {
                        return (
                          <Link key={notification.id} href={notification.actionHref} onClick={() => setShowDropdown(false)}>
                            {content}
                          </Link>
                        );
                      }
                      
                      return (
                        <div key={notification.id} onClick={(e) => markAsRead(notification.id, e as unknown as React.MouseEvent)}>
                          {content}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}