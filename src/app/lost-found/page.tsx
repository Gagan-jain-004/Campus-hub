'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LostFoundCard } from '@/components/lostfound/LostFoundCard';
import { LOST_FOUND_CATEGORIES } from '@/lib/constants';
import {
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Building2,
  PackageCheck,
} from 'lucide-react';

export default function LostFoundPage() {
  const { activeCollegeId, activeCollegeShortName } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [type, setType] = useState<'ALL' | 'LOST' | 'FOUND'>('ALL');
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [activeCollegeId, type, category, search]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCollegeId) params.set('collegeId', activeCollegeId);
      if (type !== 'ALL') params.set('type', type);
      if (category !== 'ALL') params.set('category', category);
      if (search) params.set('search', search);

      const res = await fetch(`/api/lost-found?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPosts(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-wider mb-1">
            <Search className="w-4 h-4" />
            <span>Campus Recovery Dispatch</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
            Lost & Found — {activeCollegeShortName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Report misplaced student IDs, wallets, keys, calculators, and help fellow students recover items quickly.
          </p>
        </div>

        <Link
          href="/lost-found/new"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-subtle transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Report Lost / Found</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search wallet, ID card, keys, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Type Tabs: All / Lost / Found */}
          <div className="flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs w-full sm:w-auto">
            <button
              onClick={() => setType('ALL')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                type === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-subtle'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setType('LOST')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                type === 'LOST'
                  ? 'bg-rose-600 text-white shadow-subtle'
                  : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
              }`}
            >
              ● Lost Items
            </button>
            <button
              onClick={() => setType('FOUND')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                type === 'FOUND'
                  ? 'bg-emerald-600 text-white shadow-subtle'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
              }`}
            >
              ● Found Items
            </button>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {LOST_FOUND_CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold shadow-subtle'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Lost & Found Posts */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
          <span className="text-xs font-mono">Scanning campus recovery logs...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-card">
          <PackageCheck className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="font-heading font-semibold text-base text-slate-900 dark:text-white">
            Nothing reported recently in {activeCollegeShortName}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Hopefully that means no items are currently lost around campus!
          </p>
          <Link
            href="/lost-found/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-xl"
          >
            <Plus className="w-3.5 h-3.5" /> Report an Item
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((item) => (
            <LostFoundCard key={item.id} post={item} />
          ))}
        </div>
      )}
    </div>
  );
}
