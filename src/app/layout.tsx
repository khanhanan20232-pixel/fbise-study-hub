import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  verification: {
    google: 'i4hAmyTbmRvq117GDckb4pcpZcOFeACphugKJMkiSak',
  },
  title: 'FBISE Study Hub — Prepare Smart. Practice Better. Achieve More.',
  description:
    'The official comprehensive educational platform for FBISE (Federal Board Islamabad) students. Access past papers, model papers, daily chapter-wise quizzes, and AI paper checking with instant marking scheme evaluation.',
  keywords: [
    'FBISE',
    'Federal Board',
    'Study Hub',
    'Past Papers',
    'Model Papers',
    'Class 9',
    'Class 10',
    '1st Year',
    '2nd Year',
    'HSSC',
    'SSC',
    'AI Paper Checking',
    'Team Khan Hanan',
  ],
  authors: [{ name: 'Team Khan Hanan' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-700 selection:text-white">
        <AuthProvider>
          <AnalyticsTracker />
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
