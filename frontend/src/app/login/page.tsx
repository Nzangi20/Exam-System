"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { API_BASE } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import CdamLogo from '@/components/CdamLogo';
import { inputClass } from '@/lib/ui';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();

  const onSubmit = async (data: any) => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, data);
      login(res.data.token, res.data.user);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center cdam-auth-bg p-4">
      <div className="w-full max-w-md cdam-card rounded-2xl overflow-hidden">
        <div className="cdam-accent-bar" />
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <CdamLogo size={72} showText={false} />
            <h1 className="text-xl font-bold text-violet-900 mt-4 text-center">
              Center for Data Analytics &amp; Modeling
            </h1>
            <p className="text-slate-600 text-sm mt-1 text-center">Online Examination System</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                className={inputClass}
                placeholder="Enter your password"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 cdam-btn-primary font-medium rounded-lg shadow-lg transition-all active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-violet-700 font-medium hover:text-violet-900">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
