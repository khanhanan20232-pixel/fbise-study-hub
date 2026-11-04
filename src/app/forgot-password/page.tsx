'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Mail, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 items-center justify-center text-white shadow-md border border-amber-400/40 mb-2">
          <GraduationCap className="w-8 h-8 text-amber-400" />
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Password Reset Link Sent
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We have dispatched a secure password reset link to <strong className="text-slate-800 dark:text-slate-200">{email}</strong>.
              Please check your inbox and spam folder.
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
        ) : (
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Reset Your Password
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Enter your registered student email address to receive password recovery instructions.
            </p>

            <form className="mt-6 space-y-4 text-left" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Registered Email Address
                </label>
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-900 hover:to-emerald-800 shadow-md shadow-emerald-900/20 focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all flex items-center justify-center space-x-2 text-sm"
              >
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4" />
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
        )}
      </div>
    </div>
  );
}
