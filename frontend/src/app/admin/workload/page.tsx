"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminWorkloadPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/api/analytics/workload').then((res) => setData(res.data)).catch(console.error);
  }, []);

  if (!data) {
    return <div className="text-slate-400">Loading workload analysis...</div>;
  }

  const chartData = data.trainers.map((t: any) => ({
    name: t.name.split(' ')[0],
    pending: t.pendingGrading,
    ungraded: t.ungradedAnswers,
    score: t.workloadScore,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Workload Analysis</h1>
        <p className="text-slate-500">Trainer grading load, pending submissions, and ungraded answers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total Trainers</p>
          <p className="text-2xl font-bold">{data.summary.totalTrainers}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Pending Grading</p>
          <p className="text-2xl font-bold text-amber-600">{data.summary.totalPendingGrading}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Ungraded Answers</p>
          <p className="text-2xl font-bold text-red-600">{data.summary.totalUngradedAnswers}</p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold mb-4">Workload by Trainer</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pending" name="Pending Results" fill="#f59e0b" stackId="a" />
                <Bar dataKey="ungraded" name="Ungraded Answers" fill="#ef4444" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Trainer</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Exams</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Questions</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Submissions</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Pending</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Ungraded</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Load Score</th>
            </tr>
          </thead>
          <tbody>
            {data.trainers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">No trainers found</td>
              </tr>
            ) : (
              data.trainers.map((t: any) => (
                <tr key={t.trainerId} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.email}</p>
                  </td>
                  <td className="px-4 py-3">{t.examCount}</td>
                  <td className="px-4 py-3">{t.questionCount}</td>
                  <td className="px-4 py-3">{t.totalSubmissions}</td>
                  <td className="px-4 py-3 text-amber-600 font-medium">{t.pendingGrading}</td>
                  <td className="px-4 py-3 text-red-600 font-medium">{t.ungradedAnswers}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      t.workloadScore > 10 ? 'bg-red-100 text-red-700' :
                      t.workloadScore > 5 ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {t.workloadScore}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
