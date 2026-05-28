"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '@/lib/api';
import { CheckCircle, XCircle, Clock, Download, Trophy } from 'lucide-react';

export default function StudentResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/api/results`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResults(res.data);
      } catch (err) {
        console.error("Failed to fetch results");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  const totalExams = results.length;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const pending = results.filter(r => r.status === 'PENDING').length;
  const avgScore = totalExams > 0
    ? Math.round(results.reduce((acc, r) => acc + (r.score / r.exam.totalMarks) * 100, 0) / totalExams)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Results</h1>
        <p className="text-slate-500">View your examination performance and scores.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
          <Trophy className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">{totalExams}</p>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Exams</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm text-center">
          <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-emerald-700">{passed}</p>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Passed</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm text-center">
          <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-600">{failed}</p>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Failed</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm text-center">
          <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-amber-600">{pending}</p>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Pending</p>
        </div>
      </div>

      {/* Average Score */}
      {totalExams > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <p className="text-sm font-medium opacity-80 mb-1">Average Score Across All Exams</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold">{avgScore}%</span>
            <span className="text-sm opacity-70 mb-1">overall performance</span>
          </div>
          <div className="mt-3 bg-white/20 rounded-full h-3 overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${avgScore}%` }}></div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Detailed Results</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">#</th>
                <th className="px-6 py-3 font-medium">Exam Title</th>
                <th className="px-6 py-3 font-medium">Score</th>
                <th className="px-6 py-3 font-medium">Percentage</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    You haven't taken any exams yet.
                  </td>
                </tr>
              ) : (
                results.map((result: any, index: number) => {
                  const pct = Math.round((result.score / result.exam.totalMarks) * 100);
                  const statusStyle = result.status === 'PASS'
                    ? 'bg-emerald-100 text-emerald-700'
                    : result.status === 'FAIL'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700';
                  return (
                    <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500">{index + 1}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{result.exam.title}</td>
                      <td className="px-6 py-4 text-slate-700">{result.score} / {result.exam.totalMarks}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-2">
                            <div className={`h-full rounded-full ${pct >= 50 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }}></div>
                          </div>
                          <span className="text-sm text-slate-700 font-medium">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle}`}>
                          {result.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(result.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
