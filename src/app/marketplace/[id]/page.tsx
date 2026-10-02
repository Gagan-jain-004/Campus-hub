'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { formatPrice, formatTimeAgo, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  MapPin,
  ShieldCheck,
  MessageSquare,
  Bookmark,
  Share2,
  Check,
  Flag,
  ArrowLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Tag,
} from 'lucide-react';
import { CATEGORIES, CONDITIONS } from '@/lib/constants';
import { ReportModal } from '@/components/common/ReportModal';
import { ImageUpload } from '@/components/common/ImageUpload';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [contacting, setContacting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('ELECTRONICS');
  const [editCondition, setEditCondition] = useState('GOOD');
  const [editNegotiable, setEditNegotiable] = useState(true);
  const [editLocation, setEditLocation] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadItem() {
      try {
        const res = await fetch(`/api/marketplace/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setListing(data.data);
          if (searchParams.get('edit') === 'true') {
            openEditModalWithData(data.data);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) loadItem();
  }, [params.id, searchParams]);

  const openEditModalWithData = (item: any) => {
    setEditTitle(item.title);
    setEditPrice(item.price.toString());
    setEditCategory(item.category);
    setEditCondition(item.condition);
    setEditNegotiable(item.negotiable);
    setEditLocation(item.location);
    setEditDescription(item.description);
    setEditStatus(item.status);
    setEditImages(item.images?.map((i: any) => i.url) || []);
    setIsEditOpen(true);
  };

  const handleOpenEdit = () => {
    if (listing) openEditModalWithData(listing);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editTitle.trim() || !editPrice || !editLocation.trim() || !editDescription.trim()) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/marketplace/${listing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: editTitle.trim(),
          price: parseFloat(editPrice),
          category: editCategory,
          condition: editCondition,
          negotiable: editNegotiable,
          location: editLocation.trim(),
          description: editDescription.trim(),
          status: editStatus,
          images: editImages,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setListing(data.data);
        setIsEditOpen(false);
      } else {
        alert(data.error || 'Failed to update listing.');
      }
    } catch (err) {
      console.error('Error updating listing:', err);
      alert('An error occurred while saving listing.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleSold = async () => {
    if (!user || !listing) return;
    const newStatus = listing.status === 'SOLD' ? 'ACTIVE' : 'SOLD';
    try {
      const res = await fetch(`/api/marketplace/${listing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setListing((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Error updating listing status:', err);
    }
  };

  const handleDeleteListing = async () => {
    if (!user || !listing) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/marketplace/${listing.id}?userId=${user.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        router.push('/marketplace');
      } else {
        alert(data.error || 'Failed to delete listing.');
      }
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert('An error occurred while deleting listing.');
    } finally {
      setIsDeleting(false);
    }
  };

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
  const isOwner = Boolean(user && (user.id === listing.userId || user.role === 'ADMIN'));

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

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: `Check out "${listing.title}" for ${formatPrice(listing.price)} on CampusHub:`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy', e);
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

            {/* Status Badge */}
            {listing.status === 'SOLD' && (
              <div className="absolute top-4 right-4 bg-rose-600/90 backdrop-blur-md text-white text-xs font-mono font-bold px-3 py-1 rounded-lg shadow-sm">
                SOLD OUT
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {listing.images && listing.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {listing.images.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImage === idx
                      ? 'border-primary ring-2 ring-primary/20 shadow-md scale-102'
                      : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img.url} alt={`${listing.title} preview ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Safety Notice Card */}
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 text-xs space-y-1.5 shadow-subtle">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Campus Trading Safety Rule</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
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
              {isOwner ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleOpenEdit}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover shadow-subtle flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Listing</span>
                    </button>

                    <button
                      onClick={handleToggleSold}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        listing.status === 'SOLD'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{listing.status === 'SOLD' ? 'Mark Available' : 'Mark as Sold'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setIsDeleteOpen(true)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Listing</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleMessageSeller}
                  disabled={contacting}
                  className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-elevated flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {contacting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                  <span>Message Seller In-App</span>
                </button>
              )}

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleSave}
                  className={`py-2 px-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    isSaved
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-primary'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className={`py-2 px-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    copied
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 hover:text-primary'
                  }`}
                  title="Share Listing"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Share</span>
                    </>
                  )}
                </button>

                {!isOwner ? (
                  <button
                    onClick={() => setIsReportOpen(true)}
                    className="py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Report</span>
                  </button>
                ) : (
                  <button
                    onClick={handleOpenEdit}
                    className="py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-400" />
                    <span>Edit</span>
                  </button>
                )}
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
                      {listing.user?.name?.[0] || 'S'}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                        {listing.user?.name}
                      </h4>
                      {listing.user?.isVerified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {listing.user?.branch || 'Student'} • {listing.college?.shortName}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono text-slate-400">
                  Joined {formatDate(listing.user?.createdAt)}
                </span>
              </div>
            </div>

            {/* Overview & Metadata Table */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Listing Specifications
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Category</span>
                  <p className="font-semibold text-slate-900 dark:text-white">{listing.category}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Condition</span>
                  <p className="font-semibold text-slate-900 dark:text-white">{conditionObj?.label || listing.condition}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Listed On</span>
                  <p className="font-semibold text-slate-900 dark:text-white">{formatDate(listing.createdAt)}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Views</span>
                  <p className="font-semibold text-slate-900 dark:text-white">{listing.views} campus visits</p>
                </div>
              </div>
            </div>

            {/* Description Area */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Seller's Description
              </span>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {listing.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Listing Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-primary flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                    Edit Marketplace Listing
                  </h3>
                  <p className="text-xs text-slate-500">Update item price, details, or photos</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Item Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g., Engineering Mathematics 1 Book (HK Dass)"
                  className="w-full px-3.5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Price & Negotiable */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="350"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={editNegotiable}
                      onChange={(e) => setEditNegotiable(e.target.checked)}
                      className="rounded text-primary focus:ring-primary/20 accent-primary"
                    />
                    <span>Price Negotiable</span>
                  </label>
                </div>
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {CATEGORIES.filter((c) => c.id !== 'ALL').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Condition *
                  </label>
                  <select
                    value={editCondition}
                    onChange={(e) => setEditCondition(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Pickup Location / Hostel *
                  </label>
                  <input
                    type="text"
                    required
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g., Hostel 3 or Main Canteen"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Listing Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="ACTIVE">ACTIVE (Available for sale)</option>
                    <option value="SOLD">SOLD OUT</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Describe your item, reason for selling, inclusions..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              {/* Photos */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Photos (Up to 4)
                </label>
                <ImageUpload
                  images={editImages}
                  onChange={(urls) => setEditImages(urls)}
                  maxImages={4}
                  label="Upload Item Photos"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isUpdating}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !editTitle.trim() || !editPrice || !editLocation.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-elevated transition-colors disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  Delete Listing?
                </h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              Are you sure you want to delete <span className="font-semibold text-slate-800 dark:text-slate-200">"{listing.title}"</span>? All saved bookmarks and inquiries will be permanently removed.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteListing}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
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
