'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Users,
  Search,
  PlusCircle,
  Building2,
  MapPin,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CATEGORIES } from '@/lib/constants';

export function Sidebar() {
  const pathname = usePathname();
  const { activeCollegeShortName, isAuthenticated, openAuthModal } = useAuth();

  const primaryLinks = [
    { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { href: '/communities', label: 'Communities & Feeds', icon: Users },
    { href: '/lost-found', label: 'Lost & Found Radar', icon: Search },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block space-y-6 pr-4">
      {/* Campus Banner Box */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-50/60 to-white dark:from-slate-900 dark:to-slate-950 space-y-2 shadow-card">
        <div className="flex items-center gap-1.5 text-xs font-mono text-primary font-semibold">
          <Building2 className="w-3.5 h-3.5" />
          <span>CAMPUS HUB</span>
        </div>
        <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white leading-tight">
          {activeCollegeShortName || 'Select Campus'}
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          All listings, communities and recovery tickets are isolated by college.
        </p>
      </div>

      {/* Primary Navigation */}
      <div className="space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 font-semibold">
          Navigation
        </span>
        {primaryLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-primary border border-indigo-200/80 dark:border-indigo-800/80'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Marketplace Categories */}
      <div className="space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 font-semibold">
          Categories
        </span>
        <div className="space-y-0.5">
          {CATEGORIES.slice(1, 6).map((cat) => (
            <Link
              key={cat.id}
              href={`/marketplace?category=${cat.id}`}
              className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <span>{cat.label}</span>
              <span className="text-[10px] font-mono text-slate-400">→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-center">
        <p className="text-xs font-semibold text-slate-900 dark:text-white">
          Selling an item or notes?
        </p>
        {isAuthenticated ? (
          <Link
            href="/marketplace/sell"
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-subtle transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Post Listing
          </Link>
        ) : (
          <button
            onClick={openAuthModal}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-subtle transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Sign In to Post
          </button>
        )}
      </div>
    </aside>
  );
}
