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
  const [successMsg, setSuccessMsg] = useState('');
  const { login } = useAuth();

  // Tab state: 'login' | 'forgot'
  const [activeTab, setActiveTab] = useState<'login' | 'forgot'>('login');

  // Forgot password form states
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const onSubmitLogin = async (data: any) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, data);
      login(res.data.token, res.data.user);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error || 'Login failed');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setResetLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await axios.post(`${API_BASE}/api/auth/forgot-password`, {
        email: forgotEmail,
        newPassword: newPassword,
      });
      setSuccessMsg(res.data.message || 'Password reset successfully! Please sign in.');
      setForgotEmail('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setActiveTab('login');
        setSuccessMsg('');
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Password reset failed');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center cdam-auth-bg p-4">
      <div className="w-full max-w-md cdam-card rounded-2xl overflow-hidden">
        <div className="cdam-accent-bar" />
        <div className="p-8">
          <div className="flex flex-col items-center mb-6">
            <CdamLogo size={72} showText={false} />
            <h1 className="text-xl font-bold text-violet-900 mt-4 text-center">
              Center for Data Analytics &amp; Modeling
            </h1>
            <p className="text-slate-600 text-sm mt-1 text-center">Online Examination System</p>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'login'
                  ? 'border-violet-600 text-violet-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('forgot');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'forgot'
                  ? 'border-violet-600 text-violet-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Forgot Password
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-100">
              {successMsg}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleSubmit(onSubmitLogin)} className="space-y-5">
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
                className="w-full py-3 px-4 cdam-btn-primary font-medium rounded-lg shadow-lg transition-all active:scale-[0.98] cursor-pointer"
              >
                Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Confirm new password"
                />
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full py-3 px-4 cdam-btn-primary font-medium rounded-lg shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                {resetLoading ? 'Resetting password...' : 'Reset Password'}
              </button>
            </form>
          )}

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
