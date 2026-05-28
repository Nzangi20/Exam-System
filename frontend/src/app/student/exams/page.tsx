"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '@/lib/api';
import { Clock, FileText, Search } from 'lucide-react';
import Link from 'next/link';

export default function StudentExamsListPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
        console.error("Failed to fetch exams");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  const now = new Date();

  const categorized = exams.map((exam: any) => {
    const start = new Date(exam.startDate);
    const end = new Date(exam.endDate);
    const isSubmitted = results.some((r: any) => r.examId === exam.id);
    let status = 'upcoming';
    if (now > end) status = 'completed';
    else if (now >= start && now <= end) status = isSubmitted ? 'submitted' : 'active';
    return { ...exam, status };
  });

  const filtered = categorized.filter((e) =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeExams = filtered.filter(e => e.status === 'active');
  const upcomingExams = filtered.filter(e => e.status === 'upcoming');
  const submittedExams = filtered.filter(e => e.status === 'submitted');
  const completedExams = filtered.filter(e => e.status === 'completed');

  const ExamCard = ({ exam }: { exam: any }) => {
    const statusColors: Record<string, string> = {
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
      submitted: 'bg-amber-100 text-amber-700 border-amber-200',
      completed: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    const statusLabels: Record<string, string> = {
      active: 'Available Now',
      upcoming: 'Upcoming',
      submitted: 'Submitted',
      completed: 'Closed',
    };

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-slate-900 text-lg">{exam.title}</h3>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[exam.status]}`}>
            {statusLabels[exam.status]}
          </span>
        </div>
        {exam.description && (
          <p className="text-slate-500 text-sm mb-3 line-clamp-2">{exam.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {exam.duration} mins</span>
          <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {exam.totalMarks} marks</span>
          <span>Pass: {exam.passingMarks}</span>
        </div>
        <div className="text-xs text-slate-400 mb-4">
          {new Date(exam.startDate).toLocaleDateString()} — {new Date(exam.endDate).toLocaleDateString()}
        </div>
        {exam.status === 'active' && (
          <Link
            href={`/student/exams/${exam.id}`}
            className="inline-block w-full text-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Start Exam
          </Link>
        )}
        {exam.status === 'submitted' && (
          <span className="block w-full text-center px-4 py-2.5 bg-slate-100 text-slate-500 text-sm font-medium rounded-lg">
            Already Submitted
          </span>
        )}
      </div>
    );
  };

  const Section = ({ title, exams, emptyMsg }: { title: string; exams: any[]; emptyMsg: string }) => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">{title} ({exams.length})</h2>
      {exams.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-6 text-center">
          <p className="text-slate-500 text-sm">{emptyMsg}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => <ExamCard key={exam.id} exam={exam} />)}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Available Exams</h1>
          <p className="text-slate-500">Browse and take your assigned examinations.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <Section title="Active Exams" exams={activeExams} emptyMsg="No active exams right now." />
      <Section title="Upcoming Exams" exams={upcomingExams} emptyMsg="No upcoming exams scheduled." />
      <Section title="Submitted" exams={submittedExams} emptyMsg="You haven't submitted any exams yet." />
      <Section title="Past Exams" exams={completedExams} emptyMsg="No past exams." />
    </div>
  );
}
