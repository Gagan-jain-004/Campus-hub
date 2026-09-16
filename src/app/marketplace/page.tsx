'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { CATEGORIES, CONDITIONS } from '@/lib/constants';
import {
  Search,
  Filter,
  Plus,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Loader2,
  PackageOpen,
  ArrowUpDown,
} from 'lucide-react';

export default function MarketplacePage() {
  const { activeCollegeId, activeCollegeShortName } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [condition, setCondition] = useState('ALL');
  const [sort, setSort] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchListings();
  }, [activeCollegeId, category, condition, sort, search]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCollegeId) params.set('collegeId', activeCollegeId);
      if (category !== 'ALL') params.set('category', category);
      if (condition !== 'ALL') params.set('condition', condition);
      if (sort) params.set('sort', sort);
      if (search) params.set('search', search);

      const res = await fetch(`/api/marketplace?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setListings(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 w-full min-w-0">
      <div className="flex gap-6 lg:gap-8 w-full max-w-full min-w-0">
        {/* Left Side Rail */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="min-w-0 flex-1 space-y-6 w-full max-w-full">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Marketplace — {activeCollegeShortName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Verified peer-to-peer student transactions with zero middlemen fees.
              </p>
            </div>

            <Link
              href="/marketplace/sell"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-subtle transition-all self-start sm:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Sell An Item</span>
            </Link>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="space-y-3 bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card w-full max-w-full min-w-0">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search textbooks, calculators, cycles, hostel gear..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-300 flex-1 sm:flex-initial">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="bg-transparent focus:outline-none text-xs font-medium cursor-pointer w-full"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="views">Most Viewed</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="hidden sm:flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-950 shrink-0">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-slate-800 text-primary shadow-subtle'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-slate-800 text-primary shadow-subtle'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs w-full max-w-full">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all shrink-0 ${
                      isSelected
                        ? 'bg-primary text-white shadow-subtle'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Listings Feed */}
          {loading ? (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-xs font-mono">Loading campus inventory...</span>
            </div>
          ) : listings.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-card">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-primary flex items-center justify-center mx-auto">
                <PackageOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-semibold text-base text-slate-900 dark:text-white">
                  No listings found for this filter
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Be the first student to post an item for sale in {activeCollegeShortName}.
                </p>
              </div>
              <Link
                href="/marketplace/sell"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-subtle transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Sell First Item</span>
              </Link>
            </div>
          ) : (
            <div
              className={`grid gap-4 sm:gap-5 w-full min-w-0 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-1'
              }`}
            >
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
