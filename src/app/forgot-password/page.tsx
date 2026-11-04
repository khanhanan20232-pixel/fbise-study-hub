'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Mail, ArrowRight, CheckCircle, ArrowLeft, KeyRound, Lock, Loader2 } from 'lucide-react';

type Step = 'email' | 'reset' | 'done';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [sending, setSending] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resending, setResending] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || sending) return;
    setError('');
    setSending(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setNotice('If an account exists for this email address, a 6-digit verification code has been sent to it. The code is valid for 10 minutes.');
      setStep('reset');
    } catch {
      setError('Something went wrong. Please check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  const handleResendCode = async () => {
    if (!email || resending) return;
    setError('');
    setNotice('');
    setResending(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setNotice('A new code has been requested. Please allow a minute between requests, then check your inbox and spam folder.');
    } catch {
      setError('Could not request a new code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetting) return;
    setError('');

    if (!/^\d{6}$/.test(otp.trim())) {
      setError('Please enter the 6-digit verification code from your email.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Your new password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('The new password and confirmation do not match.');
      return;
    }

    setResetting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.trim(), newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not reset your password. Please try again.');
        return;
      }
      setStep('done');
    } catch {
      setError('Something went wrong. Please check your connection and try again.');
    } finally {
      setResetting(false);
    }
  };

  const inputClass =
    'w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700';
  const labelClass = 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1';

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 items-center justify-center text-white shadow-md border border-amber-400/40 mb-2">
          <GraduationCap className="w-8 h-8 text-amber-400" />
        </div>

        {step === 'done' ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Password Reset Successful
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <div className="pt-4">
              <Link
                href="/login"
                className="w-full py-2.5 px-4 rounded-xl font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition-colors inline-flex items-center justify-center space-x-2 text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        ) : step === 'email' ? (
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Reset Your Password
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Enter your registered email address and we will send you a 6-digit verification code.
            </p>

            <form className="mt-6 space-y-4 text-left" onSubmit={handleRequestCode}>
              <div>
                <label className={labelClass}>Registered Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className={inputClass}
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-900 hover:to-emerald-800 shadow-md shadow-emerald-900/20 focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-60"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Verification Code</span>}
                {!sending && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Enter Verification Code
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Enter the 6-digit code sent to <strong className="text-slate-800 dark:text-slate-200">{email}</strong> and choose a new password.
            </p>

            {notice && (
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-left">
                {notice}
              </p>
            )}

            <form className="mt-6 space-y-4 text-left" onSubmit={handleResetPassword}>
              <div>
                <label className={labelClass}>6-Digit Verification Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="otp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter the 6-digit code"
                    className={`${inputClass} tracking-[0.3em] font-bold`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    name="newPassword"
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className={inputClass}
                  />
                </div>
                {confirmPassword.length > 0 && (
                  <p className={`mt-1 text-[11px] font-semibold ${newPassword === confirmPassword ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                    {newPassword === confirmPassword ? 'Passwords match.' : 'Passwords do not match.'}
                  </p>
                )}
              </div>

              {error && (
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={resetting}
                className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-900 hover:to-emerald-800 shadow-md shadow-emerald-900/20 focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-60"
              >
                {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Reset Password</span>}
                {!resetting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setError('');
                  setNotice('');
                }}
                className="inline-flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Use a different email</span>
              </button>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resending}
                className="text-emerald-700 dark:text-emerald-400 hover:underline disabled:opacity-60"
              >
                {resending ? 'Sending…' : 'Resend code'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
