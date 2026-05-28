"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  createdAt: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data.notifications || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleToggle = () => {
    if (!open) fetchNotifications();
    setOpen(!open);
  };

  const count = notifications.length;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2.5 rounded-full transition-colors hover:scale-105"
        title="Notifications"
        aria-label={`Notifications${count ? ` (${count})` : ''}`}
      >
        <span className="text-2xl leading-none drop-shadow-sm" role="img" aria-hidden="true">🔔</span>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold px-1">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          <div className="cdam-accent-bar" />
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-violet-50">
            <h3 className="font-semibold text-violet-900 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </h3>
            {count > 0 && (
              <span className="text-xs font-medium text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">
                {count} new
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-8 text-sm text-slate-400 text-center">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-sm text-slate-500 text-center">No notifications right now</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                  {n.link && (
                    <Link
                      href={n.link}
                      onClick={() => setOpen(false)}
                      className="text-xs text-violet-600 font-medium mt-1 inline-block hover:underline"
                    >
                      View details →
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
