"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '@/lib/api';
import { FileText, CheckCircle, Clock, ChevronRight, Code2, BarChart3, Layers } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  PYTHON: { label: 'Python', icon: <Code2 className="w-4 h-4" />, color: 'text-blue-600', bg: 'bg-blue-100' },
  R:      { label: 'R Language', icon: <BarChart3 className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-100' },
};

const LEVEL_META: Record<string, { label: string; color: string }> = {
  BEGINNER:     { label: 'Beginner',     color: 'bg-amber-100 text-amber-700' },
  INTERMEDIATE: { label: 'Intermediate', color: 'bg-blue-100 text-blue-700' },
  PROFESSIONAL: { label: 'Professional', color: 'bg-purple-100 text-purple-700' },
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [examsRes, resultsRes] = await Promise.all([
          axios.get(`${API_BASE}/api/exams`, { headers }),
          axios.get(`${API_BASE}/api/results`, { headers })
        ]);

        setExams(examsRes.data);
        setResults(resultsRes.data);
      } catch (err) {
        console.error("Failed to fetch student data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  const now = new Date();
  const availableExams = exams.filter((e: any) => {
    const startDate = new Date(e.startDate);
    const endDate = new Date(e.endDate);
    const isSubmitted = results.some((r: any) => r.examId === e.id);
    return now >= startDate && now <= endDate && !isSubmitted;
  });
  const upcomingExams = exams.filter((e: any) => new Date(e.startDate) > now);

  const catMeta = user?.examCategory ? CATEGORY_META[user.examCategory] : null;
  const lvlMeta = user?.examLevel ? LEVEL_META[user.examLevel] : null;

  return (
    <div className="space-y-8 text-slate-900">
      {/* Welcome Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-slate-500 mt-1">Keep track of your examinations and recent results.</p>
        </div>
        {catMeta && lvlMeta && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${catMeta.bg} ${catMeta.color} border border-current/20`}>
              {catMeta.icon} {catMeta.label}
            </span>
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${lvlMeta.color}`}>
              <Layers className="w-3.5 h-3.5" /> {lvlMeta.label}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Available to Take</p>
              <h3 className="text-3xl font-bold text-slate-900">{availableExams.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Upcoming Exams</p>
              <h3 className="text-3xl font-bold text-slate-900">{upcomingExams.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Completed Exams</p>
              <h3 className="text-3xl font-bold text-slate-900">{results.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Exams */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold text-slate-900">Ready to Take</h2>
            <Link href="/student/exams" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {availableExams.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center">
              <p className="text-slate-500">No active exams available for your track right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableExams.slice(0, 3).map((exam: any) => {
                const examCat = CATEGORY_META[exam.category];
                const examLvl = LEVEL_META[exam.level];
                return (
                  <div key={exam.id} className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 group-hover:w-2 transition-all" />
                    <div className="pl-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 truncate">{exam.title}</h3>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {examCat && (
                              <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${examCat.bg} ${examCat.color}`}>
                                {examCat.icon} {examCat.label}
                              </span>
                            )}
                            {examLvl && (
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${examLvl.color}`}>{examLvl.label}</span>
                            )}
                            <span className="text-xs text-slate-500"><Clock className="w-3 h-3 inline mr-0.5" />{exam.duration} mins</span>
                          </div>
                        </div>
                        <Link href={`/student/exams/${exam.id}`} className="ml-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition flex-shrink-0">
                          Start
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Results */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold text-slate-900">Recent Results</h2>
            <Link href="/student/results" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {results.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center">
              <p className="text-slate-500">You haven't completed any exams yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(results as any[]).slice(0, 3).map((result: any) => (
                <div key={result.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-900">{result.exam?.title}</h3>
                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${result.status === 'PASS' ? 'bg-emerald-100 text-emerald-700' : result.status === 'FAIL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {result.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">{result.score}</p>
                    <p className="text-xs text-slate-500">out of {result.exam?.totalMarks}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
