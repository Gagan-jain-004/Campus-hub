'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, formatTimeAgo } from '@/lib/utils';
import { MapPin, Bookmark, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CONDITIONS } from '@/lib/constants';

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    description: string;
    price: number;
    condition: string;
    negotiable: boolean;
    location: string;
    status: string;
    views: number;
    createdAt: string | Date;
    images?: { url: string }[];
    user?: {
      id: string;
      name: string;
      username?: string | null;
      avatar?: string | null;
      isVerified?: boolean;
      branch?: string | null;
      gradYear?: number | null;
    };
    college?: {
      id: string;
      name: string;
      shortName: string;
    };
    _count?: {
      savedBy: number;
    };
  };
  isSavedInitial?: boolean;
  onSaveToggle?: (listingId: string, saved: boolean) => void;
}

export function ListingCard({ listing, isSavedInitial = false, onSaveToggle }: ListingCardProps) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [saveLoading, setSaveLoading] = useState(false);

  const conditionObj = CONDITIONS.find((c) => c.id === listing.condition);
  const imageUrl =
    listing.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80';

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please log in to bookmark listings.');
      return;
    }
    setSaveLoading(true);
    try {
      const res = await fetch('/api/marketplace/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, listingId: listing.id }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSaved(data.saved);
        if (onSaveToggle) onSaveToggle(listing.id, data.saved);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <Link
      href={`/marketplace/${listing.id}`}
      className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-800 transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5 flex flex-col h-full"
    >
      {/* Image & Badges */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <Image
          src={imageUrl}
          alt={listing.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Pickup Zone Badge */}
        <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
          <MapPin className="w-2.5 h-2.5 text-indigo-300" />
          <span className="truncate max-w-[130px] uppercase">{listing.location}</span>
        </div>

        {/* Save / Bookmark Button */}
        <button
          onClick={handleSave}
          disabled={saveLoading}
          aria-label="Save listing"
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            isSaved
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 shadow-sm'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Multi-photo Indicator Badge */}
        {listing.images && listing.images.length > 1 && (
          <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
            <span>📷 {listing.images.length} photos</span>
          </div>
        )}

        {/* Condition Tag on Bottom Right */}
        <div className="absolute bottom-2.5 right-2.5">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border shadow-sm font-semibold ${conditionObj?.badge || 'bg-slate-100 text-slate-700'}`}>
            {conditionObj?.label.split(' ')[0] || listing.condition}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-lg font-bold font-mono tracking-tight text-slate-900 dark:text-white">
              {formatPrice(listing.price)}
            </span>
            {listing.negotiable && (
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                • Negotiable
              </span>
            )}
          </div>

          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {listing.title}
          </h4>
        </div>

        {/* Card Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 truncate max-w-[65%]">
            {listing.user?.isVerified ? (
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="truncate">{listing.user.name.split(' ')[0]}</span>
              </span>
            ) : (
              <span className="truncate text-slate-600 dark:text-slate-400 font-medium">
                {listing.user?.name || 'Student'}
              </span>
            )}
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="font-mono text-[10px] text-slate-400 truncate">
              {listing.college?.shortName}
            </span>
          </div>

          <span className="font-mono text-[10px] text-slate-400 shrink-0">
            {formatTimeAgo(listing.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
