'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, HelpCircle, ChevronDown } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    className: '9',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const faqs = [
    {
      q: 'Are the past papers on FBISE Study Hub authentic?',
      a: 'Yes. All past papers are verified against official Federal Board Annual and Supplementary examination gazettes for SSC (Classes 9-10) and HSSC (Classes 11-12).',
    },
    {
      q: 'How does the AI Paper Checking system award marks?',
      a: 'The AI system is calibrated against official FBISE marking schemes and Student Learning Outcomes (SLOs). It analyzes your submitted text or handwritten answer sheets, matches key scientific terminology, assesses step-wise derivations and diagrams, and generates an official report with percentage, letter grade, and constructive examiner feedback.',
    },
    {
      q: 'Is FBISE Study Hub completely free for students?',
      a: 'Yes, full access to past papers, daily chapter MCQs, model papers, and AI evaluations is available to all registered students without any subscription fees.',
    },
    {
      q: 'How are daily streaks calculated?',
      a: 'Attempting at least one chapter quiz within 24 hours increments your daily streak. If you miss more than 48 hours, the streak resets to 1.',
    },
  ];

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
            Student Support & Inquiries
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Get in Touch with FBISE Study Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Have questions about syllabus materials, AI paper evaluation, or need technical assistance?
            We are here to help you achieve your academic goals.
          </p>
        </div>

        {/* Contact Grid: Form + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Interactive Contact Form */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Send Us a Message
            </h2>

            {submitted ? (
              <div className="p-8 text-center bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-extrabold text-lg text-emerald-900 dark:text-emerald-200">
                  Message Dispatched Successfully!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Thank you for contacting FBISE Study Hub. Our academic support coordinator will respond to your registered email shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', className: '9', subject: '', message: '' });
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Muhammad Ali"
                      className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-cream-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ali@student.fbise.edu.pk"
                      className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-cream-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Class Level
                    </label>
                    <select
                      value={formData.className}
                      onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                      className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-cream-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="9">Class 9 (SSC Part 1)</option>
                      <option value="10">Class 10 (SSC Part 2)</option>
                      <option value="11">1st Year (HSSC Part 1)</option>
                      <option value="12">2nd Year (HSSC Part 2)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Subject / Topic
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Model Paper question clarification"
                      className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-cream-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your inquiry or question in detail..."
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-cream-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center space-x-2 shadow-sm transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>

          {/* Right 1 Col: Location & Quick Info */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Official Information
              </h3>

              <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-emerald-700 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 dark:text-white">Federal Board Campus</strong>
                    <span>Sector H-8/4, Islamabad, Pakistan</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 dark:text-white">Helpdesk Lines</strong>
                    <span>+92 51 9269555 / +92 51 9269556</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 dark:text-white">Electronic Support</strong>
                    <span>support@fbise.edu.pk / info@studyhub.pk</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-950 dark:text-amber-200 space-y-1">
              <span className="font-bold block text-amber-800 dark:text-amber-400">
                Engineering & Platform Credits:
              </span>
              <p>Developed with excellence by <strong>Team Khan Hanan</strong> for the students of Pakistan.</p>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-emerald-700" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="space-y-1.5 p-4 rounded-2xl bg-cream-100 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  {faq.q}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
