'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  Trophy,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Shield,
  Search,
  Flame,
  FileText,
  Home,
  Info,
  Phone,
  LayoutDashboard,
  LogIn,
  UserPlus,
} from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    // Check initial dark mode from document or localStorage
    const savedTheme = localStorage.getItem('fbise_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  // Close the drawer on route change, on Escape, and lock body scroll while open
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('fbise_theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('fbise_theme', 'dark');
      setIsDark(true);
    }
  };

  const navLinks = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Past Papers', href: '/past-papers', icon: BookOpen },
    { label: 'Model Papers', href: '/model-papers', icon: FileText },
    { label: 'Daily Quizzes', href: '/quizzes', icon: Sparkles },
    { label: 'AI Paper Checker', href: '/ai-paper-check', icon: Sparkles, highlight: true },
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { label: 'Announcements', href: '/announcements', icon: Bell },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'About', href: '/about', icon: Info },
    { label: 'Contact', href: '/contact', icon: Phone },
  ];

  const classSections = [
    { label: 'Class 9', sub: 'SSC Part 1', href: '/classes/class-9', chip: 'Part 1' },
    { label: 'Class 10', sub: 'SSC Part 2', href: '/classes/class-10', chip: 'Part 2' },
    { label: '1st Year — Class 11', sub: 'HSSC Part 1', href: '/classes/class-11', chip: 'Part 1' },
    { label: '2nd Year — Class 12', sub: 'HSSC Part 2', href: '/classes/class-12', chip: 'Part 2' },
  ];

  const drawerLinkClass = (href: string, highlight?: boolean) => {
    const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
    if (highlight) {
      return 'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors';
    }
    return `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
      isActive
        ? 'text-fbise-800 dark:text-fbise-300 bg-fbise-50 dark:bg-fbise-950/50'
        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-fbise-800 dark:hover:text-fbise-300'
    }`;
  };

  return (
    <>
      <header className="sticky top-0 z-50 shadow-md">
        {/* Board Name Strip — full official board name, like fbise.edu.pk */}
        <div className="bg-fbise-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-3">
            <p className="text-[11px] sm:text-xs font-semibold tracking-wide truncate">
              Federal Board of Intermediate &amp; Secondary Education, Islamabad
            </p>
            <p className="hidden md:block text-[11px] text-fbise-200 flex-shrink-0">
              H-8/4, Islamabad • fbise.edu.pk
            </p>
          </div>
        </div>

        {/* Main Slim Header Bar */}
        <div className="bg-fbise-600 dark:bg-fbise-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 sm:gap-3 h-14">
              {/* Hamburger — opens the LEFT slide-in menu (all navigation lives there) */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="p-2 -ml-2 rounded-lg hover:bg-white/15 transition-colors flex-shrink-0"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Logo + Title (kept compact so it never overlaps anything) */}
              <Link href="/" className="flex items-center gap-2.5 min-w-0 group">
                <span className="w-9 h-9 rounded-lg bg-white/15 border border-white/30 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-amber-300" />
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block font-extrabold text-base sm:text-lg tracking-tight truncate">
                    FBISE <span className="text-amber-300">Study Hub</span>
                  </span>
                  <span className="hidden sm:block text-[10px] uppercase tracking-wider font-semibold text-fbise-100">
                    SSC &amp; HSSC Preparation Portal
                  </span>
                </span>
              </Link>

              {/* Right-side actions */}
              <div className="ml-auto flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <Link
                  href="/search"
                  aria-label="Search"
                  className="p-2 rounded-lg hover:bg-white/15 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </Link>

                <button
                  onClick={toggleDarkMode}
                  aria-label="Toggle Theme"
                  className="p-2 rounded-lg hover:bg-white/15 transition-colors"
                >
                  {isDark ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5" />}
                </button>

                {user ? (
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 pl-1 pr-1 sm:pr-2.5 py-1 rounded-lg hover:bg-white/15 transition-colors"
                    title={user.name}
                  >
                    <span className="w-8 h-8 rounded-lg bg-white text-fbise-800 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {user.name.charAt(0)}
                    </span>
                    <span className="hidden md:block text-left leading-tight">
                      <span className="block text-xs font-bold truncate max-w-[110px]">{user.name}</span>
                      <span className="flex items-center gap-1 text-[10px] text-fbise-100 font-semibold">
                        {user.role === 'ADMIN' ? 'Admin' : `Class ${user.className}`}
                        {user.streak > 0 && (
                          <span className="flex items-center text-amber-300 font-bold">
                            <Flame className="w-3 h-3 fill-amber-300 text-amber-300" />
                            {user.streak}d
                          </span>
                        )}
                      </span>
                    </span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="inline-block px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-white/15 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="hidden sm:inline-block px-3.5 py-1.5 rounded-lg text-sm font-bold text-fbise-900 bg-amber-400 hover:bg-amber-300 shadow-sm transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* LEFT Slide-in Drawer — contains ALL navigation */}
      {/* Backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-[2px] z-[55] transition-opacity duration-300 ${
          drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      {/* Drawer panel */}
      <aside
        aria-hidden={!drawerOpen}
        className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl z-[60] flex flex-col transform transition-transform duration-300 ease-out ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="bg-fbise-700 dark:bg-fbise-950 text-white px-4 py-4 flex items-center gap-3 flex-shrink-0">
          <span className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-amber-300" />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="font-extrabold truncate">
              FBISE <span className="text-amber-300">Study Hub</span>
            </p>
            <p className="text-[10px] uppercase tracking-wider text-fbise-100 font-semibold">
              Federal Board • Islamabad
            </p>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="ml-auto p-2 rounded-lg hover:bg-white/15 transition-colors flex-shrink-0"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer links (scrollable) */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {/* Classes */}
          <div>
            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Classes
            </p>
            <div className="space-y-1">
              {classSections.map((cls) => (
                <Link
                  key={cls.href}
                  href={cls.href}
                  onClick={() => setDrawerOpen(false)}
                  className={drawerLinkClass(cls.href)}
                >
                  <GraduationCap className="w-4 h-4 text-fbise-700 dark:text-fbise-400 flex-shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="block truncate">{cls.label}</span>
                    <span className="block text-[11px] font-medium text-slate-400">{cls.sub}</span>
                  </span>
                  <span className="text-[10px] bg-fbise-50 dark:bg-fbise-950 px-2 py-0.5 rounded font-mono text-fbise-800 dark:text-fbise-300 flex-shrink-0">
                    {cls.chip}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800" />

          {/* Study resources / main navigation */}
          <div>
            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Study Resources
            </p>
            <div className="space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={drawerLinkClass(item.href, item.highlight)}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800" />

          {/* Account */}
          <div>
            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              My Account
            </p>
            {user ? (
              <div className="space-y-1">
                <div className="px-3 py-2">
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  <span className="inline-block mt-1 bg-fbise-100 dark:bg-fbise-950 text-fbise-800 dark:text-fbise-300 text-[10px] font-bold px-2 py-0.5 rounded">
                    {user.role === 'ADMIN' ? 'Administrator' : `Class ${user.className} Student`}
                  </span>
                </div>
                <Link href="/dashboard" onClick={() => setDrawerOpen(false)} className={drawerLinkClass('/dashboard')}>
                  <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                  <span>Student Dashboard</span>
                </Link>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" onClick={() => setDrawerOpen(false)} className={drawerLinkClass('/admin')}>
                    <Shield className="w-4 h-4 flex-shrink-0" />
                    <span>Admin Control Panel</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 px-1">
                <Link
                  href="/login"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-fbise-700 text-fbise-800 dark:text-fbise-300 dark:border-fbise-500 font-bold text-sm hover:bg-fbise-50 dark:hover:bg-fbise-950/50 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-fbise-600 hover:bg-fbise-700 text-white font-bold text-sm shadow-sm transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Free Account</span>
                </Link>
                <p className="flex items-center gap-1.5 px-2 pt-1 text-[11px] text-slate-400">
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Login ke baad dashboard, bookmarks aur AI reports milti hain.</span>
                </p>
              </div>
            )}
          </div>
        </nav>

        {/* Drawer footer */}
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex-shrink-0">
          Developed by <span className="font-bold text-fbise-700 dark:text-fbise-400">Team Khan Hanan</span>
        </div>
      </aside>
    </>
  );
}
