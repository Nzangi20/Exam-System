"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '@/lib/api';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

export default function TrainerExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/api/exams`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExams(res.data);
      } catch (error) {
        console.error("Failed to load exams");
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const deleteExam = async (id: string) => {
    if(!confirm("Are you sure you want to delete this exam?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/exams/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExams(exams.filter((e: any) => e.id !== id));
    } catch (err) {
      console.error("Failed to delete exam");
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Exams</h1>
          <p className="text-slate-500">Create, edit, and monitor your examinations.</p>
        </div>
        <Link 
          href="/trainer/exams/create"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Create Exam
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search exams..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Exam Title</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium">Marks</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No exams found. Click "Create Exam" to get started.
                  </td>
                </tr>
              ) : (
                exams.map((exam: any) => {
                  const now = new Date();
                  const startDate = new Date(exam.startDate);
                  const endDate = new Date(exam.endDate);
                  let status = 'Draft';
                  let statusColor = 'bg-gray-100 text-gray-700';
                  
                  if (now > endDate) {
                    status = 'Completed';
                    statusColor = 'bg-slate-100 text-slate-700';
                  } else if (now >= startDate && now <= endDate) {
                    status = 'Active';
                    statusColor = 'bg-emerald-100 text-emerald-700';
                  } else {
                    status = 'Upcoming';
                    statusColor = 'bg-blue-100 text-blue-700';
                  }

                  return (
                    <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{exam.title}</div>
                        <div className="text-xs text-slate-500">{exam.questions?.length || 0} Questions</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{exam.duration} mins</td>
                      <td className="px-6 py-4 text-slate-600">{exam.totalMarks}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex items-center justify-end gap-3">
                        <Link href={`/trainer/exams/${exam.id}`} className="p-2 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 rounded hover:bg-indigo-50 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteExam(exam.id)} className="p-2 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
