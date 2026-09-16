'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { formatPrice, formatTimeAgo, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  MapPin,
  ShieldCheck,
  MessageSquare,
  Bookmark,
  Share2,
  Flag,
  ArrowLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { CONDITIONS } from '@/lib/constants';
import { ReportModal } from '@/components/common/ReportModal';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    async function loadItem() {
      try {
        const res = await fetch(`/api/marketplace/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setListing(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) loadItem();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs font-mono text-slate-400">Loading item specification...</span>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold">Listing not found or has been sold.</h2>
        <Link href="/marketplace" className="text-xs font-semibold text-primary hover:underline">
          ← Return to Marketplace
        </Link>
      </div>
    );
  }

  const conditionObj = CONDITIONS.find((c) => c.id === listing.condition);
  const isOwner = user?.id === listing.userId;

  const handleMessageSeller = async () => {
    if (!user) {
      alert('Please sign in to message this seller.');
      return;
    }
    if (isOwner) {
      alert('This is your own listing.');
      return;
    }

    setContacting(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          recipientId: listing.userId,
          collegeId: listing.collegeId,
          listingId: listing.id,
          initialMessage: `Hi ${listing.user.name.split(' ')[0]}! I'm interested in buying your "${listing.title}" for ${formatPrice(listing.price)}. Is it still available?`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/messages?conversationId=${data.data.id}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setContacting(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      alert('Please sign in to save this listing.');
      return;
    }
    try {
      const res = await fetch('/api/marketplace/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, listingId: listing.id }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSaved(data.saved);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
        <Link href="/marketplace" className="hover:text-primary flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
        </Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300 truncate max-w-xs">{listing.title}</span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Gallery (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-card">
            <Image
              src={
                listing.images?.[selectedImage]?.url ||
                'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80'
              }
              alt={listing.title}
              fill
              className="object-cover"
              priority
            />

            {/* Inset Pickup Location Badge */}
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-mono px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-indigo-300" />
              <span>{listing.location}</span>
            </div>
          </div>

          {/* Thumbnails */}
          {listing.images && listing.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {listing.images.map((img: any, idx: number) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === idx
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Safety Notice Box */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Campus Safety Verified</span>
            </div>
            <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed">
              Always meet in public campus zones like the Central Library, Department lobbies, or Hostels common rooms. Inspect items thoroughly before handing over cash or UPI.
            </p>
          </div>
        </div>

        {/* Right Column: Specification & Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-card space-y-5">
            {/* Category & Condition */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {listing.category}
              </span>

              <span className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded border ${conditionObj?.badge}`}>
                {conditionObj?.label || listing.condition}
              </span>
            </div>

            {/* Title & Price */}
            <div className="space-y-2">
              <h1 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 dark:text-white leading-snug">
                {listing.title}
              </h1>

              <div className="flex items-baseline gap-3">
                <span className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white">
                  {formatPrice(listing.price)}
                </span>
                {listing.negotiable ? (
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                    Price Negotiable
                  </span>
                ) : (
                  <span className="text-xs font-mono text-slate-400">Fixed Price</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleMessageSeller}
                disabled={contacting || isOwner}
                className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-elevated flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {contacting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
                <span>{isOwner ? 'This is Your Listing' : 'Message Seller In-App'}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleSave}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    isSaved
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-primary'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save Item'}</span>
                </button>

                <button
                  onClick={() => setIsReportOpen(true)}
                  className="py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report</span>
                </button>
              </div>
            </div>

            {/* Seller Profile Card */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Verified Student Seller
              </span>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {listing.user?.avatar ? (
                    <Image
                      src={listing.user.avatar}
                      alt={listing.user.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-primary font-bold flex items-center justify-center text-sm">
                      {listing.user.name[0]}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                        {listing.user.name}
                      </h4>
                      {listing.user.isVerified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {listing.user.branch || 'Student'} • {listing.college?.shortName}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Meta Info */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-500">
              <div>
                <span className="block text-slate-400">POSTED</span>
                <span>{formatDate(listing.createdAt)}</span>
              </div>
              <div>
                <span className="block text-slate-400">VIEWS</span>
                <span>{listing.views} campus views</span>
              </div>
            </div>
          </div>

          {/* Description Block */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-card space-y-3">
            <h3 className="font-heading font-semibold text-base text-slate-900 dark:text-white">
              Item Description
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {listing.description}
            </p>
          </div>
        </div>
      </div>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="LISTING"
        targetId={listing.id}
        itemTitle={listing.title}
      />
    </div>
  );
}
