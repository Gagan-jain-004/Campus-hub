'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, formatTimeAgo } from '@/lib/utils';
import {
  LayoutDashboard,
  ShoppingBag,
  Bookmark,
  Users,
  Search,
  Bell,
  Settings,
  ShieldCheck,
  Plus,
  CheckCircle,
  Trash2,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { LostFoundCard } from '@/components/lostfound/LostFoundCard';

export default function DashboardPage() {
  const { user, activeCollegeShortName } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'saved' | 'communities' | 'lostfound' | 'notifications'>('listings');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/dashboard?userId=${user.id}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSold = async (listingId: string) => {
    try {
      await fetch(`/api/marketplace/${listingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SOLD' }),
      });
      fetchDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await fetch(`/api/marketplace/${listingId}`, { method: 'DELETE' });
      fetchDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <LayoutDashboard className="w-10 h-10 text-primary mx-auto" />
        <h2 className="text-xl font-bold">Please log in</h2>
        <p className="text-xs text-slate-500">Log in to manage your campus listings and saved items.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Profile Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt=""
              width={64}
              height={64}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/20 shadow-sm"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-primary font-bold text-xl flex items-center justify-center">
              {user.name[0]}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                {user.name}
              </h1>
              {user.isVerified && (
                <span className="badge-edu">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Student
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500">
              {user.course} {user.branch} • Batch of {user.gradYear} • {activeCollegeShortName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/marketplace/sell"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-subtle"
          >
            <Plus className="w-4 h-4" />
            <span>Create Listing</span>
          </Link>
          <Link
            href="/lost-found/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200"
          >
            <Search className="w-4 h-4" />
            <span>Report Lost/Found</span>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('listings')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'listings'
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-primary font-bold border border-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>My Listings ({data?.myListings?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'saved'
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-primary font-bold border border-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved ({data?.savedListings?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('lostfound')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'lostfound'
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-primary font-bold border border-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>My Lost & Found ({data?.myLostFound?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-primary font-bold border border-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications ({data?.notifications?.length || 0})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
          <span className="text-xs">Loading dashboard items...</span>
        </div>
      ) : (
        <div>
          {/* My Listings */}
          {activeTab === 'listings' && (
            <div className="space-y-4">
              {data?.myListings?.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 rounded-2xl space-y-2">
                  <p className="text-xs text-slate-500">You haven't posted any items for sale yet.</p>
                  <Link href="/marketplace/sell" className="text-xs font-semibold text-primary hover:underline">
                    + Post your first item
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {data.myListings.map((listing: any) => (
                    <div key={listing.id} className="relative group flex flex-col">
                      <ListingCard listing={listing} />
                      <div className="mt-2 flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border text-xs">
                        {listing.status === 'ACTIVE' ? (
                          <button
                            onClick={() => handleMarkSold(listing.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200"
                          >
                            Mark as Sold
                          </button>
                        ) : (
                          <span className="text-[11px] font-mono font-bold text-slate-400">
                            [SOLD]
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteListing(listing.id)}
                          className="text-rose-600 hover:text-rose-700 p-1"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Saved Listings */}
          {activeTab === 'saved' && (
            <div>
              {data?.savedListings?.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 rounded-2xl">
                  <p className="text-xs text-slate-500">No saved listings yet. Bookmark items on the marketplace to view them here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {data.savedListings.map((listing: any) => (
                    <ListingCard key={listing.id} listing={listing} isSavedInitial={true} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Lost & Found */}
          {activeTab === 'lostfound' && (
            <div>
              {data?.myLostFound?.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 rounded-2xl">
                  <p className="text-xs text-slate-500">You haven't reported any lost or found items.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {data.myLostFound.map((item: any) => (
                    <LostFoundCard key={item.id} post={item} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 rounded-2xl divide-y">
              {data?.notifications?.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No new notifications.</div>
              ) : (
                data.notifications.map((n: any) => (
                  <div key={n.id} className="p-4 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-900 dark:text-white">{n.title}</p>
                      <p className="text-slate-600 dark:text-slate-300">{n.message}</p>
                      <span className="text-[10px] font-mono text-slate-400">{formatTimeAgo(n.createdAt)}</span>
                    </div>
                    {n.link && (
                      <Link href={n.link} className="text-primary font-medium hover:underline shrink-0">
                        View →
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
