'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  ShoppingBag,
  Users,
  Search,
  Building2,
  ArrowRight,
  ChevronRight,
  PackageOpen,
  Plus,
} from 'lucide-react';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { PostCard } from '@/components/communities/PostCard';
import { LostFoundCard } from '@/components/lostfound/LostFoundCard';

export default function HomePage() {
  const { activeCollegeShortName, activeCollegeId, openAuthModal, isAuthenticated } = useAuth();
  const [featuredListings, setFeaturedListings] = useState<any[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<any[]>([]);
  const [featuredLostFound, setFeaturedLostFound] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!activeCollegeId) return;
      setLoading(true);
      try {
        const [mRes, cRes, lRes] = await Promise.all([
          fetch(`/api/marketplace?collegeId=${activeCollegeId}`),
          fetch(`/api/communities/all/posts?collegeId=${activeCollegeId}`),
          fetch(`/api/lost-found?collegeId=${activeCollegeId}`),
        ]);
        const [mData, cData, lData] = await Promise.all([
          mRes.json(),
          cRes.json(),
          lRes.json(),
        ]);
        if (mData.success) setFeaturedListings(mData.data.slice(0, 3));
        if (cData.success) setFeaturedPosts(cData.data.slice(0, 2));
        if (lData.success) setFeaturedLostFound(lData.data.slice(0, 2));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeCollegeId]);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-indigo-50/40 via-white to-[#faf8ff] dark:from-slate-900/40 dark:via-slate-950 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Live Campus Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-indigo-200/80 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/60 shadow-subtle text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-800 dark:text-slate-200 font-semibold">
              Rajasthan Technical University (RTU Kota) • University Departments
            </span>
          </div>

          {/* Hero Headline */}
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
              RTU Kota Campus, <span className="text-primary underline decoration-indigo-300 underline-offset-8">online.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Buy & sell within RTU hostels, access semester notes & past papers, discover campus confession feeds, and recover lost items — built exclusively for RTU Kota students.
            </p>
          </div>

          {/* Primary CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-elevated hover:shadow-lg transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Marketplace</span>
            </Link>

            <Link
              href="/communities"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-subtle transition-all"
            >
              <Users className="w-4 h-4 text-indigo-600" />
              <span>RTU Discussion Hub</span>
            </Link>

            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Building2 className="w-4 h-4 text-primary" />
              <span>Set Up Student ID</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Trust Metric Chips */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-subtle">
              <span className="font-mono text-xs font-semibold text-primary block">01 / MARKETPLACE</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Zero commission student-to-student trade</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-subtle">
              <span className="font-mono text-xs font-semibold text-emerald-600 block">02 / VERIFIED ID</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Protected contact & hostel pickup zones</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-subtle">
              <span className="font-mono text-xs font-semibold text-indigo-600 block">03 / INCOGNITO</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Anonymous posting with admin safety</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-subtle">
              <span className="font-mono text-xs font-semibold text-rose-600 block">04 / RECOVERY</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Campus lost & found instant alert radar</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Section 1: Marketplace */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold uppercase tracking-wider mb-1">
              <ShoppingBag className="w-4 h-4" />
              <span>Campus Marketplace</span>
            </div>
            <h2 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
              {activeCollegeShortName ? `Latest on ${activeCollegeShortName}` : 'Marketplace Feed'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Textbooks, scientific calculators, gear cycles, electronics, and hostel essentials.
            </p>
          </div>

          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <span>View all items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Listings Grid */}
        {featuredListings.length === 0 ? (
          <div className="p-10 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <PackageOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No items listed yet {activeCollegeShortName ? `in ${activeCollegeShortName}` : ''}.
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Be the first student to post an item for sale or connect your database.
            </p>
            {isAuthenticated ? (
              <Link
                href="/marketplace/sell"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" /> Post First Item
              </Link>
            ) : (
              <button
                onClick={openAuthModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" /> Sign In to Post
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* Main Section 2: Communities & Lost & Found */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Campus Feeds & Confessions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                  Campus Feeds & Confessions
                </h3>
              </div>
              <Link href="/communities" className="text-xs font-semibold text-primary hover:underline">
                All feeds →
              </Link>
            </div>

            {featuredPosts.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 rounded-xl">
                <p className="text-xs text-slate-500">No discussions posted yet.</p>
                <Link href="/communities" className="text-xs font-semibold text-primary hover:underline mt-1 inline-block">
                  + Start a discussion thread
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {featuredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Lost & Found Radar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-rose-600" />
                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                  Lost & Found Recovery Radar
                </h3>
              </div>
              <Link href="/lost-found" className="text-xs font-semibold text-primary hover:underline">
                Report / View all →
              </Link>
            </div>

            {featuredLostFound.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 rounded-xl">
                <p className="text-xs text-slate-500">No lost or found items reported recently.</p>
                <Link href="/lost-found/new" className="text-xs font-semibold text-rose-600 hover:underline mt-1 inline-block">
                  + Report an item
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {featuredLostFound.map((item) => (
                  <LostFoundCard key={item.id} post={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
