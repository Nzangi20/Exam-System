"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AdminUsagePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/api/analytics/usage').then((res) => setData(res.data)).catch(console.error);
  }, []);

  if (!data) {
    return <div className="text-slate-400">Loading usage analysis...</div>;
  }

  const chartData = data.byRole.map((r: any) => ({
    role: r.role.replace('_', ' '),
    Active: r.active,
    Inactive: r.inactive,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Usage Analysis</h1>
        <p className="text-slate-500">
          Active logins within {data.summary.inactiveDaysThreshold} days vs inactive accounts.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: data.summary.total },
          { label: 'Active', value: data.summary.active, color: 'text-emerald-600' },
          { label: 'Inactive', value: data.summary.inactive, color: 'text-amber-600' },
          { label: 'Never Logged In', value: data.summary.neverLoggedIn, color: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color || 'text-slate-900'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Active vs Inactive by Role</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="role" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Active" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Inactive" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserList title="Active Users" users={data.activeUsers} empty="No active users" />
        <UserList title="Inactive Users" users={data.inactiveUsers} empty="No inactive users" />
      </div>
    </div>
  );
}

function UserList({ title, users, empty }: { title: string; users: any[]; empty: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 font-semibold text-slate-900">{title}</div>
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {users.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-400 text-center">{empty}</p>
        ) : (
          users.map((u: any) => (
            <div key={u.id} className="px-4 py-3 flex justify-between text-sm">
              <div>
                <p className="font-medium text-slate-900">{u.name}</p>
                <p className="text-slate-500">{u.email}</p>
              </div>
              <span className="text-xs text-slate-400 uppercase">{u.role}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
