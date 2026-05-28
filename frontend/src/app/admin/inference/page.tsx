"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b'];

export default function AdminInferencePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/api/analytics/inference').then((res) => setData(res.data)).catch(console.error);
  }, []);

  if (!data) {
    return <div className="text-slate-400">Loading inference data...</div>;
  }

  const pieData = [
    { name: 'Passed', value: data.resultsBreakdown.pass },
    { name: 'Failed', value: data.resultsBreakdown.fail },
    { name: 'Pending', value: data.resultsBreakdown.pending },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Inference Data</h1>
        <p className="text-slate-500">Derived insights from exam results, grading status, and anti-cheat activity.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Users', value: data.overview.totalUsers },
          { label: 'Exams', value: data.overview.totalExams },
          { label: 'Submissions', value: data.overview.totalSubmissions },
          { label: 'Pass Rate', value: `${data.overview.passRate}%` },
          { label: 'Pending Grading', value: data.overview.pendingGrading },
          { label: 'Ungraded Answers', value: data.overview.ungradedEssayAnswers },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold mb-4">Results Distribution</h3>
          {pieData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No results yet</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold mb-4">Anti-Cheat Events</h3>
          {Object.keys(data.cheatingEvents).length === 0 ? (
            <p className="text-slate-400 text-sm">No suspicious activity recorded</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(data.cheatingEvents).map(([type, count]) => (
                <li key={type} className="flex justify-between text-sm py-2 border-b border-slate-100">
                  <span className="font-medium text-slate-700">{type.replace(/_/g, ' ')}</span>
                  <span className="text-red-600 font-semibold">{count as number}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold">Recent Suspicious Activity</div>
        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {data.recentSuspiciousActivity.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-400 text-center">None recorded</p>
          ) : (
            data.recentSuspiciousActivity.map((log: any) => (
              <div key={log.id} className="px-4 py-3 text-sm flex justify-between">
                <div>
                  <p className="font-medium">{log.eventType} — {log.exam.title}</p>
                  <p className="text-slate-500">{log.student.name}</p>
                </div>
                <span className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
