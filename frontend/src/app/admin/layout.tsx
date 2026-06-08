"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Activity,
  BarChart3,
  Archive,
  Brain,
  Briefcase,
  LogOut,
  Loader2,
  FileText,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import PortalTopBar from '@/components/PortalTopBar';
import PortalShell from '@/components/PortalShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center cdam-admin-page-bg">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'SUPER_ADMIN') {
    redirect('/login');
    return null;
  }

  const navItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Usage', href: '/admin/usage', icon: Activity },
    { name: 'Features', href: '/admin/features', icon: BarChart3 },
    { name: 'Inference', href: '/admin/inference', icon: Brain },
    { name: 'Workload', href: '/admin/workload', icon: Briefcase },
    { name: 'Archive', href: '/admin/archive', icon: Archive },
    { name: 'Trainer', href: '/trainer', icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <PortalTopBar
        variant="light"
        logoHref="/admin"
        userName={user.name}
        userSubtitle="Super Administrator"
        onLogout={logout}
      />

      <div className="flex flex-1 min-h-0">
        <aside className="w-64 bg-gradient-to-b from-violet-950 to-violet-900 text-white flex flex-col hidden md:flex shadow-lg shrink-0">
          <div className="p-4 border-b border-white/10">
            <p className="text-xs text-violet-300 uppercase tracking-wide">Super Admin</p>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-red-600 text-white font-semibold shadow'
                      : 'text-violet-100 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <PortalShell className="flex-1 overflow-auto">
          <main className="p-6 md:p-8">{children}</main>
        </PortalShell>
      </div>
    </div>
  );
}
