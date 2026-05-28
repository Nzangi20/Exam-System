"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Users,
  Activity,
  BarChart3,
  Brain,
  Briefcase,
  Archive,
  ArrowRight,
} from 'lucide-react';

export default function AdminDashboard() {
  const [summary, setSummary] = useState({
    totalUsers: 0,
    activeLogins: 0,
    inactiveLogins: 0,
    pendingGrading: 0,
    archivedRecords: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [usage, inference, archive, users] = await Promise.all([
          api.get('/api/analytics/usage'),
          api.get('/api/analytics/inference'),
          api.get('/api/analytics/archive'),
          api.get('/api/users'),
        ]);
        setSummary({
          totalUsers: users.data.length,
          activeLogins: usage.data.summary.active,
          inactiveLogins: usage.data.summary.inactive,
          pendingGrading: inference.data.overview.pendingGrading,
          archivedRecords: archive.data.length,
        });
      } catch (err) {
        console.error('Failed to load admin overview', err);
      }
    };
    load();
  }, []);

  const cards = [
    { title: 'Total Users', value: summary.totalUsers, href: '/admin/users', icon: Users, color: 'text-violet-600', bg: 'bg-violet-100' },
    { title: 'Active Logins', value: summary.activeLogins, href: '/admin/usage', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Inactive Logins', value: summary.inactiveLogins, href: '/admin/usage', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Pending Grading', value: summary.pendingGrading, href: '/admin/inference', icon: Brain, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Archived Records', value: summary.archivedRecords, href: '/admin/archive', icon: Archive, color: 'text-slate-600', bg: 'bg-slate-100' },
  ];

  const sections = [
    { title: 'Manage Users', desc: 'View, change roles, and archive user accounts', href: '/admin/users', icon: Users },
    { title: 'Usage Analysis', desc: 'Active and inactive login patterns by role', href: '/admin/usage', icon: Activity },
    { title: 'Feature Usage', desc: 'Most used platform features and recent activity', href: '/admin/features', icon: BarChart3 },
    { title: 'Inference Data', desc: 'Pass rates, cheating signals, and grading backlog', href: '/admin/inference', icon: Brain },
    { title: 'Workload Analysis', desc: 'Trainer grading load and pending submissions', href: '/admin/workload', icon: Briefcase },
    { title: 'Archive', desc: 'Restore or permanently delete archived records', href: '/admin/archive', icon: Archive },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Super Admin Overview</h1>
        <p className="text-slate-500">System-wide analytics, user management, and archived data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-violet-300 transition-colors"
            >
              <div className={`w-10 h-10 rounded-full ${card.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-sm text-slate-500">{card.title}</p>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.title}
              href={section.href}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start gap-4 hover:border-violet-300 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-violet-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 group-hover:text-violet-700">{section.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{section.desc}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-violet-500 mt-1" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
