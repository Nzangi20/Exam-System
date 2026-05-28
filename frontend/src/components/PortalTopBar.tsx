"use client";

import React from 'react';
import { LogOut } from 'lucide-react';
import CdamLogo from '@/components/CdamLogo';
import NotificationBell from '@/components/NotificationBell';

interface PortalTopBarProps {
  userName: string;
  userSubtitle: string;
  onLogout: () => void;
  logoHref?: string;
  variant?: 'light' | 'dark';
  /** Optional center content (e.g. nav links for student) */
  center?: React.ReactNode;
}

/**
 * Top bar with CDAM logo (left) and notification + user + logout (right corner).
 */
export default function PortalTopBar({
  userName,
  userSubtitle,
  onLogout,
  logoHref,
  variant = 'dark',
  center,
}: PortalTopBarProps) {
  const barClass =
    variant === 'light'
      ? 'bg-red-600 text-white border-red-700'
      : 'bg-white/95 backdrop-blur border-violet-100 text-slate-900';

  return (
    <header className={`sticky top-0 z-40 shadow-sm border-b ${barClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <CdamLogo href={logoHref} variant={variant} size={44} showText={true} />

          {center && <div className="flex-1 flex justify-center hidden md:flex">{center}</div>}

          <div className="flex items-center gap-2 sm:gap-4 ml-auto shrink-0">
            <div
              className={
                variant === 'light'
                  ? '[&_button]:text-white [&_button:hover]:bg-white/15'
                  : ''
              }
            >
              <NotificationBell />
            </div>
            <div className="flex flex-col items-end hidden sm:flex">
              <span
                className={`text-sm font-bold truncate max-w-[140px] ${
                  variant === 'light' ? 'text-white' : 'text-slate-900'
                }`}
              >
                {userName}
              </span>
              <span
                className={`text-xs truncate max-w-[140px] ${
                  variant === 'light' ? 'text-red-100' : 'text-slate-500'
                }`}
              >
                {userSubtitle}
              </span>
            </div>
            <button
              onClick={onLogout}
              className={`p-2 rounded-full transition-colors ${
                variant === 'light'
                  ? 'text-white hover:bg-white/15'
                  : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
              }`}
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
