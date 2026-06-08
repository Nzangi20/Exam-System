"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FileText, CheckCircle, Settings, Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import PortalTopBar from '@/components/PortalTopBar';
import PortalShell from '@/components/PortalShell';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center cdam-student-page-bg">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'STUDENT') {
    redirect('/login');
    return null;
  }

  const navItems = [
    { name: 'Dashboard', href: '/student' },
    { name: 'Available Exams', href: '/student/exams' },
    { name: 'Notes & Revision', href: '/student/materials' },
    { name: 'My Results', href: '/student/results' },
    { name: 'Settings', href: '/student/settings' },
  ];

  const centerNav = (
    <nav className="space-x-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-white/20 text-white'
                : 'text-white/90 hover:bg-white/10'
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <PortalTopBar
        variant="light"
        logoHref="/student"
        userName={user.name}
        userSubtitle="Student Candidate"
        onLogout={logout}
        center={centerNav}
      />

      <nav className="md:hidden cdam-nav-red flex overflow-x-auto gap-1 px-2 py-2 shrink-0">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium ${
                isActive ? 'bg-white text-red-700' : 'text-white/90'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <PortalShell className="flex-1">
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </PortalShell>
    </div>
  );
}
