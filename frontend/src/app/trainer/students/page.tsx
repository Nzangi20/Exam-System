"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '@/lib/api';
import { Search, Mail, Calendar, Eye, ChevronDown, ChevronUp, Trophy, XCircle, Clock } from 'lucide-react';

export default function TrainerStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/api/users/students`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudents(res.data);
      } catch (err) {
        console.error("Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="text-slate-500">View all registered students and their exam performance.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Total Students</p>
          <p className="text-2xl font-bold text-slate-900">{students.length}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500">
              {searchTerm ? 'No students match your search.' : 'No students registered yet.'}
            </div>
          ) : (
            filtered.map((student) => {
              const isExpanded = expandedId === student.id;
              const totalExams = student.results?.length || 0;
              const passed = student.results?.filter((r: any) => r.status === 'PASS').length || 0;
              const failed = student.results?.filter((r: any) => r.status === 'FAIL').length || 0;
              const pending = student.results?.filter((r: any) => r.status === 'PENDING').length || 0;

              return (
                <div key={student.id}>
                  <div
                    className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : student.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">{student.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <Mail className="w-3.5 h-3.5" />
                          {student.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="hidden sm:flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-emerald-600"><Trophy className="w-4 h-4" />{passed}</span>
                        <span className="flex items-center gap-1 text-red-500"><XCircle className="w-4 h-4" />{failed}</span>
                        <span className="flex items-center gap-1 text-amber-500"><Clock className="w-4 h-4" />{pending}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>{totalExams} exam{totalExams !== 1 ? 's' : ''}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-4 bg-slate-50">
                      <div className="ml-14 space-y-2">
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Joined {new Date(student.createdAt).toLocaleDateString()}
                        </p>

                        {student.results && student.results.length > 0 ? (
                          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mt-2">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                                  <th className="px-4 py-2 text-left font-medium">Exam</th>
                                  <th className="px-4 py-2 text-left font-medium">Score</th>
                                  <th className="px-4 py-2 text-left font-medium">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {student.results.map((result: any) => (
                                  <tr key={result.id}>
                                    <td className="px-4 py-2 text-slate-800">{result.exam.title}</td>
                                    <td className="px-4 py-2 text-slate-600">{result.score} / {result.exam.totalMarks}</td>
                                    <td className="px-4 py-2">
                                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                        result.status === 'PASS' ? 'bg-emerald-100 text-emerald-700' :
                                        result.status === 'FAIL' ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-700'
                                      }`}>
                                        {result.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400 italic">No exam submissions yet.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
