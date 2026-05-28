"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '@/lib/api';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TrainerDashboard() {
  const [stats, setStats] = useState({
    totalExams: 0,
    totalStudents: 0,
    totalResults: 0
  });

  const [resultsData, setResultsData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch exams
        const examsRes = await axios.get(`${API_BASE}/api/exams`, { headers });
        const exams = examsRes.data;

        // Fetch results
        const resultsRes = await axios.get(`${API_BASE}/api/results`, { headers });
        const results = resultsRes.data;

        setStats({
          totalExams: exams.length,
          totalStudents: new Set(results.map((r: any) => r.studentId)).size || 0, // Approx distinct students
          totalResults: results.length
        });

        // Prepare chart data
        const passFailData = [
          { name: 'Passed', count: results.filter((r:any) => r.status === 'PASS').length, fill: '#10b981' },
          { name: 'Failed', count: results.filter((r:any) => r.status === 'FAIL').length, fill: '#ef4444' },
          { name: 'Pending', count: results.filter((r:any) => r.status === 'PENDING').length, fill: '#f59e0b' },
        ];
        
        setResultsData(passFailData as any);
      } catch (err) {
        console.error("Failed to load dashboard data");
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { title: 'Total Exams', value: stats.totalExams, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Students Participated', value: stats.totalStudents, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { title: 'Submissions', value: stats.totalResults, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Active Sessions', value: 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back! Here's what's happening with your exams today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pass/Fail Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Overall Performance Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resultsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity (Placeholder) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 py-2 border-b border-slate-100">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-sm font-medium text-slate-900">New exam created: Midterm Evaluation</p>
                <p className="text-xs text-slate-500">2 hours ago</p>
              </div>
            </div>
             <div className="flex items-center gap-4 py-2 border-b border-slate-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <div>
                <p className="text-sm font-medium text-slate-900">John Doe submitted Advanced Physics</p>
                <p className="text-xs text-slate-500">4 hours ago</p>
              </div>
            </div>
             <div className="flex items-center gap-4 py-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <div>
                <p className="text-sm font-medium text-slate-900">15 pending submissions to grade</p>
                <p className="text-xs text-slate-500">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
