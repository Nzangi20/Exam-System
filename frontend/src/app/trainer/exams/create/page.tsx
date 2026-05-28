"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { API_BASE } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { inputClass } from '@/lib/ui';

export default function CreateExamPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      // Convert to integers
      data.duration = parseInt(data.duration);
      data.totalMarks = parseInt(data.totalMarks);
      data.allowedAttempts = parseInt(data.allowedAttempts);
      data.passingMarks = parseInt(data.passingMarks);

      const res = await axios.post(`${API_BASE}/api/exams`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push(`/trainer/exams/${res.data.id}`); // Redirect to edit questions
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error || 'Failed to create exam');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/trainer/exams" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create New Exam</h1>
          <p className="text-slate-500">Fill in the details to set up a new examination.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">General Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Exam Title</label>
              <input
                type="text"
                {...register('title', { required: 'Title is required' })}
                className={inputClass}
                placeholder="e.g., Midterm Evaluation: Advanced Physics"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className={`${inputClass} bg-white`}
                >
                  <option value="PYTHON">🐍 Python</option>
                  <option value="R">📊 R Language</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                <select
                  {...register('level', { required: 'Level is required' })}
                  className={`${inputClass} bg-white`}
                >
                  <option value="BEGINNER">🟢 Beginner</option>
                  <option value="INTERMEDIATE">🟡 Intermediate</option>
                  <option value="PROFESSIONAL">🔴 Professional</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                className={inputClass}
                placeholder="Brief description of the exam..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Instructions for Students</label>
              <textarea
                {...register('instructions')}
                rows={3}
                className={inputClass}
                placeholder="Important rules, e.g., 'Do not switch tabs. Calculators allowed...'"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Scheduling & Grading</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date & Time</label>
                <input
                  type="datetime-local"
                  {...register('startDate', { required: 'Start date is required' })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Date & Time</label>
                <input
                  type="datetime-local"
                  {...register('endDate', { required: 'End date is required' })}
                  className={inputClass}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  {...register('duration', { required: 'Duration is required', min: 1 })}
                  className={inputClass}
                  placeholder="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total Marks</label>
                <input
                  type="number"
                  {...register('totalMarks', { required: 'Total marks is required', min: 1 })}
                  className={inputClass}
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Passing Marks</label>
                <input
                  type="number"
                  {...register('passingMarks', { required: 'Passing marks required' })}
                  className={inputClass}
                  placeholder="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Allowed Attempts</label>
                <input
                  type="number"
                  defaultValue={1}
                  {...register('allowedAttempts')}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <Link href="/trainer/exams" className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-200 rounded-lg transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save & Continue
          </button>
        </div>
      </form>
    </div>
  );
}
