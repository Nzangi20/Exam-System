"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { API_BASE } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Code2, BarChart3 } from 'lucide-react';
import { inputClass } from '@/lib/ui';
import CdamLogo from '@/components/CdamLogo';

const CATEGORY_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  PYTHON: { label: 'Python', icon: <Code2 className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700 border-blue-300' },
  R:      { label: 'R Language', icon: <BarChart3 className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
};

const LEVELS = [
  { value: 'BEGINNER',      label: 'Beginner',      desc: 'Just starting out' },
  { value: 'INTERMEDIATE',  label: 'Intermediate',  desc: 'Some experience' },
  { value: 'PROFESSIONAL',  label: 'Professional',  desc: 'Advanced practitioner' },
];

export default function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<any>({
    defaultValues: { role: 'STUDENT', examCategory: 'PYTHON', examLevel: 'BEGINNER' }
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const selectedRole = watch('role');
  const selectedCategory = watch('examCategory');
  const selectedLevel = watch('examLevel');

  const onSubmit = async (data: any) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const payload: any = {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
      };
      if (data.role === 'STUDENT') {
        payload.examCategory = data.examCategory;
        payload.examLevel = data.examLevel;
      }
      const res = await axios.post(`${API_BASE}/api/auth/register`, payload);
      login(res.data.token, res.data.user);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center cdam-auth-bg p-4">
      <div className="w-full max-w-lg cdam-card rounded-2xl overflow-hidden">
        <div className="cdam-accent-bar" />
        <div className="p-8 pt-6">
          <div className="flex flex-col items-center mb-6">
            <CdamLogo size={72} showText={false} />
            <h1 className="text-xl font-bold text-violet-900 mt-4 text-center">Create Your Account</h1>
            <p className="text-slate-600 text-sm mt-1 text-center">CDAM Examination System</p>
          </div>
          {errorMsg && (
            <div className="mb-5 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className={inputClass}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className={inputClass}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                className={inputClass}
                placeholder="Enter your password"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ value: 'STUDENT', label: 'Student' }, { value: 'TRAINER', label: 'Trainer' }].map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all font-medium text-sm
                      ${selectedRole === r.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    <input type="radio" value={r.value} {...register('role')} className="sr-only" />
                    {r.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Student-only: Category & Level */}
            {selectedRole === 'STUDENT' && (
              <div className="space-y-5 border-t border-slate-100 pt-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Choose Your Track <span className="text-blue-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(CATEGORY_LABELS).map(([val, meta]) => (
                      <label
                        key={val}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all
                          ${selectedCategory === val ? `border-current ${meta.color} font-semibold` : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'}`}
                      >
                        <input type="radio" value={val} {...register('examCategory')} className="sr-only" />
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedCategory === val ? 'bg-white/60' : 'bg-slate-100'}`}>
                          {meta.icon}
                        </div>
                        <span className="text-sm">{meta.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Your Level <span className="text-blue-600">*</span>
                  </label>
                  <div className="space-y-2">
                    {LEVELS.map((lvl) => (
                      <label
                        key={lvl.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                          ${selectedLevel === lvl.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <input type="radio" value={lvl.value} {...register('examLevel')} className="sr-only" />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                          ${selectedLevel === lvl.value ? 'border-blue-600' : 'border-slate-300'}`}>
                          {selectedLevel === lvl.value && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${selectedLevel === lvl.value ? 'text-blue-700' : 'text-slate-700'}`}>{lvl.label}</p>
                          <p className="text-xs text-slate-500">{lvl.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 cdam-btn-primary font-semibold rounded-lg shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
