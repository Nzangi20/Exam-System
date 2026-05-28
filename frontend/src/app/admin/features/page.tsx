"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminFeaturesPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/api/analytics/features').then((res) => setData(res.data)).catch(console.error);
  }, []);

  if (!data) {
    return <div className="text-slate-400">Loading feature usage...</div>;
  }

  const chartData = data.features.map((f: any) => ({
    name: f.feature.replace(/_/g, ' '),
    count: f.count,
    percentage: f.percentage,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Most Used Features</h1>
        <p className="text-slate-500">Platform feature usage based on tracked events ({data.totalEvents} total).</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Feature Popularity</h3>
        {chartData.length === 0 ? (
          <p className="text-slate-400 text-sm">No feature usage recorded yet. Usage is tracked on login, exam creation, and submissions.</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any, _: any, item: any) => [`${v} (${item.payload.percentage}%)`, 'Uses']} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {chartData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 font-semibold">Recent Activity</div>
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {data.recentActivity.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-400 text-center">No recent activity</p>
          ) : (
            data.recentActivity.map((a: any) => (
              <div key={a.id} className="px-4 py-3 flex justify-between text-sm">
                <div>
                  <p className="font-medium text-slate-900">{a.feature.replace(/_/g, ' ')}</p>
                  <p className="text-slate-500">{a.user.name} ({a.user.role})</p>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(a.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
