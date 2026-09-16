'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Building2,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Users,
  Search,
  BookOpen,
  Sparkles,
  ExternalLink,
  X,
} from 'lucide-react';

export function CollegeSwitcher() {
  const { activeCollegeName, activeCollegeShortName } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* RTU Kota Campus Badge Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/60 transition-all shadow-subtle group text-left cursor-pointer"
        aria-label="RTU Kota Campus Info"
        title="Rajasthan Technical University, Kota"
      >
        <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs font-mono shrink-0 shadow-xs">
          RTU
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[9px] uppercase font-mono tracking-wider text-primary font-bold leading-none flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Official Campus
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-sans group-hover:text-primary transition-colors truncate max-w-[130px] sm:max-w-[170px]">
            RTU Kota (UD Campus)
          </span>
        </div>
        <span className="text-[10px] text-slate-400 ml-0.5 shrink-0">ℹ️</span>
      </button>

      {/* RTU Kota Campus Hub Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-modal overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 cursor-default"
          >
            {/* Modal Hero Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white relative">
              <div className="flex items-center justify-between mb-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Verified Campus Portal</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="font-heading font-bold text-xl leading-tight">
                Rajasthan Technical University
              </h3>
              <p className="text-xs text-indigo-100 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Rawatbhata Road, Akelgarh, Kota, Rajasthan - 324010
              </p>
            </div>

            {/* Quick Hub Navigation Cards */}
            <div className="p-5 space-y-3.5 text-xs">
              <div className="text-slate-500 font-medium">
                CampusHub is exclusively built for RTU Kota students, hostelers & faculty.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/marketplace"
                  onClick={() => setIsOpen(false)}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-all flex flex-col gap-1 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white group-hover:text-primary">
                    Student Marketplace
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Trade cycles, textbooks & hostel items
                  </span>
                </Link>

                <Link
                  href="/communities"
                  onClick={() => setIsOpen(false)}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 transition-all flex flex-col gap-1 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600">
                    RTU Discussion Rooms
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Campus confessions & placement banter
                  </span>
                </Link>

                <Link
                  href="/lost-found"
                  onClick={() => setIsOpen(false)}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-rose-500/50 hover:bg-rose-50/50 dark:hover:bg-rose-950/40 transition-all flex flex-col gap-1 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Search className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white group-hover:text-rose-600">
                    Lost & Found Radar
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Report or recover lost items on campus
                  </span>
                </Link>

                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 hover:bg-purple-50/50 dark:hover:bg-purple-950/40 transition-all flex flex-col gap-1 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white group-hover:text-purple-600">
                    Student ID & Profile
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Manage your branch, degree & batch
                  </span>
                </Link>
              </div>

              {/* Department Highlights */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="font-mono text-[10px] text-slate-400 uppercase font-bold block mb-1.5">
                  Departments Covered (UD Campus)
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  CSE • IT • ECE • Electrical (EE) • Mechanical (ME) • Civil (CE) • Production (PI) • Aeronautical • AI & Data Science • MBA • MCA
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-500 font-mono text-[11px]">
                Rajasthan Technical University • Kota
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


