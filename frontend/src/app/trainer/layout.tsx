"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FileText, Users, Settings, LogOut, Loader2, Shield, FolderOpen } from 'lucide-react';
import { usePathname } from 'next/navigation';
import PortalTopBar from '@/components/PortalTopBar';
import PortalShell from '@/components/PortalShell';
export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center cdam-page-bg">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== 'TRAINER' && user.role !== 'SUPER_ADMIN')) {
    redirect('/login');
    return null;
  }

  const navItems = [
    { name: 'Dashboard', href: '/trainer', icon: LayoutDashboard },
    { name: 'Exams', href: '/trainer/exams', icon: FileText },
    { name: 'Students', href: '/trainer/students', icon: Users },
    { name: 'Materials', href: '/trainer/materials', icon: FolderOpen },
    { name: 'Settings', href: '/trainer/settings', icon: Settings },
    ...(user.role === 'SUPER_ADMIN'
      ? [{ name: 'Admin Portal', href: '/admin', icon: Shield }]
      : []),
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <PortalTopBar
        variant="light"
        logoHref="/trainer"
        userName={user.name}
        userSubtitle={user.role === 'SUPER_ADMIN' ? 'Super Administrator' : 'Trainer'}
        onLogout={logout}
      />

      <div className="flex flex-1 min-h-0">
        <aside className="w-64 cdam-nav-red text-white flex flex-col hidden md:flex shadow-lg shrink-0">
          <div className="p-4 border-b border-white/20">
            <p className="text-xs text-white/80 uppercase tracking-wide">Trainer Portal</p>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-white text-red-700 font-semibold shadow'
                      : 'text-white/95 hover:bg-white/15'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/20 md:hidden">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-2 text-white/90 hover:bg-white/10 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </aside>

        <PortalShell className="flex-1 overflow-auto pb-20 md:pb-0">
          <main className="p-6 md:p-8">{children}</main>
        </PortalShell>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 cdam-nav-red border-t border-white/20 flex justify-around py-2 z-30">
        {navItems.filter((i) => i.name !== 'Admin Portal').slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center p-2 text-[10px] ${isActive ? 'text-white font-bold' : 'text-white/70'}`}
            >
              <Icon className="w-5 h-5" />
              {item.name.split(' ')[0]}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
