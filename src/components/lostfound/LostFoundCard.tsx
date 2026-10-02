import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatDate, formatTimeAgo } from '@/lib/utils';
import {
  MapPin,
  Calendar,
  MessageSquare,
  Flag,
  ShieldCheck,
  Loader2,
  Share2,
  Check,
  Trash2,
  AlertTriangle,
  Pencil,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ReportModal } from '@/components/common/ReportModal';
import { ImageUpload } from '@/components/common/ImageUpload';
import { LOST_FOUND_CATEGORIES } from '@/lib/constants';
import { useRouter } from 'next/navigation';

interface LostFoundCardProps {
  post: {
    id: string;
    type: string; // LOST or FOUND
    title: string;
    description: string;
    category: string;
    location: string;
    dateLostFound: string | Date;
    status: string;
    contactInfo?: string | null;
    createdAt: string | Date;
    images?: { url: string }[];
    author: {
      id: string;
      name: string;
      username?: string | null;
      avatar?: string | null;
      isVerified?: boolean;
      branch?: string | null;
    };
    college?: {
      id: string;
      name: string;
      shortName: string;
    };
  };
  onDelete?: (id: string) => void;
  onUpdate?: (updatedPost: any) => void;
}

export function LostFoundCard({ post, onDelete, onUpdate }: LostFoundCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [contacting, setContacting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

  // Dynamic Post Data State
  const [currentType, setCurrentType] = useState(post.type);
  const [currentTitle, setCurrentTitle] = useState(post.title);
  const [currentDescription, setCurrentDescription] = useState(post.description);
  const [currentCategory, setCurrentCategory] = useState(post.category);
  const [currentLocation, setCurrentLocation] = useState(post.location);
  const [currentContactInfo, setCurrentContactInfo] = useState(post.contactInfo || '');
  const [currentStatus, setCurrentStatus] = useState(post.status);
  const [currentImages, setCurrentImages] = useState<{ url: string }[]>(post.images || []);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editType, setEditType] = useState(post.type);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editDescription, setEditDescription] = useState(post.description);
  const [editCategory, setEditCategory] = useState(post.category);
  const [editLocation, setEditLocation] = useState(post.location);
  const [editContactInfo, setEditContactInfo] = useState(post.contactInfo || '');
  const [editStatus, setEditStatus] = useState(post.status);
  const [editImages, setEditImages] = useState<string[]>(post.images?.map((i) => i.url) || []);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const isAuthor = Boolean(user && (user.id === post.author.id || user.role === 'ADMIN'));

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === `#post-${post.id}`) {
      setIsHighlighted(true);
      const timer = setTimeout(() => setIsHighlighted(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [post.id]);

  const isLost = currentType === 'LOST';
  const images = currentImages;
  const currentImageUrl = images[activeImageIndex]?.url || images[0]?.url;

  const handleShare = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${baseUrl}/lost-found#post-${post.id}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `[${currentType}] ${currentTitle}`,
          text: `Campus Hub Lost & Found item: "${currentTitle}"`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // Clipboard fallback
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

  const handleOpenEdit = () => {
    setEditType(currentType);
    setEditTitle(currentTitle);
    setEditDescription(currentDescription);
    setEditCategory(currentCategory);
    setEditLocation(currentLocation);
    setEditContactInfo(currentContactInfo);
    setEditStatus(currentStatus);
    setEditImages(currentImages.map((i) => i.url));
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editTitle.trim() || !editDescription.trim() || !editLocation.trim()) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/lost-found/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type: editType,
          title: editTitle.trim(),
          description: editDescription.trim(),
          category: editCategory,
          location: editLocation.trim(),
          contactInfo: editContactInfo.trim(),
          status: editStatus,
          images: editImages,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCurrentType(editType);
        setCurrentTitle(editTitle.trim());
        setCurrentDescription(editDescription.trim());
        setCurrentCategory(editCategory);
        setCurrentLocation(editLocation.trim());
        setCurrentContactInfo(editContactInfo.trim());
        setCurrentStatus(editStatus);
        setCurrentImages(data.data?.images || editImages.map((url) => ({ url })));
        setIsEditOpen(false);
        if (onUpdate) onUpdate(data.data);
      } else {
        alert(data.error || 'Failed to update item.');
      }
    } catch (err) {
      console.error('Error updating lost-found item:', err);
      alert('An error occurred while saving post.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleContact = async () => {
    if (!user) {
      alert('Please log in to contact this student.');
      return;
    }
    if (user.id === post.author.id) {
      alert('This is your own post.');
      return;
    }

    setContacting(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          recipientId: post.author.id,
          collegeId: user.collegeId,
          lostFoundPostId: post.id,
          initialMessage: `Hi ${post.author.name.split(' ')[0]}! I saw your ${post.type.toLowerCase()} item post regarding "${post.title}".`,
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

  const handleDeletePost = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/lost-found/${post.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setIsDeleted(true);
        setIsDeleteOpen(false);
        if (onDelete) onDelete(post.id);
      } else {
        alert(data.error || 'Failed to delete post.');
      }
    } catch (err) {
      console.error('Error deleting lost-found post:', err);
      alert('An error occurred while deleting post.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isDeleted) {
    return null;
  }

  return (
    <>
      <div
        id={`post-${post.id}`}
        className={`bg-white dark:bg-slate-900 border rounded-xl overflow-hidden transition-all shadow-card flex flex-col h-full scroll-mt-24 ${
          isHighlighted
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-elevated'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        {currentImageUrl && (
          <div className="relative aspect-[16/9] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <Image src={currentImageUrl} alt={post.title} fill className="object-cover" />
            {images.length > 1 && (
              <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1.5 z-10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(idx);
                    }}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'w-5 bg-white shadow-sm' : 'w-2 bg-white/60 hover:bg-white/90'
                    }`}
                    aria-label={`View photo ${idx + 1}`}
                  />
                ))}
              </div>
            )}
            {images.length > 1 && (
              <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md shadow-sm">
                <span>{activeImageIndex + 1}/{images.length}</span>
              </div>
            )}
          </div>
        )}

        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            {/* Tag Header */}
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${
                  isLost
                    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                }`}
              >
                ● {post.type}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleShare}
                  className={`p-1.5 rounded-lg transition-colors ${
                    copied
                      ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Share post link"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                </button>

                {isAuthor && (
                  <>
                    <button
                      onClick={handleOpenEdit}
                      className="text-slate-400 hover:text-primary dark:hover:text-indigo-400 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Item"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setIsDeleteOpen(true)}
                      className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete Post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                {!isAuthor && (
                  <button
                    onClick={() => setIsReportOpen(true)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Report post"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <h3 className="font-semibold text-base text-slate-900 dark:text-white leading-snug">
              {currentTitle}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
              {currentDescription}
            </p>

            {/* Meta Tags */}
            <div className="pt-2 space-y-1.5 text-xs text-slate-500 font-mono">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{currentLocation}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Reported: {formatDate(post.dateLostFound)}</span>
              </div>
              {currentContactInfo && (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="font-semibold">Contact:</span>
                  <span className="truncate">{currentContactInfo}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                {post.author.name}
              </span>
              {post.author.isVerified && (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              )}
            </div>

            <div className="flex items-center gap-2">
              {isAuthor && (
                <button
                  onClick={handleOpenEdit}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  title="Edit item details"
                >
                  <Pencil className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit</span>
                </button>
              )}

              <button
                onClick={handleShare}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg border transition-colors ${
                  copied
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
                title="Share post"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>

              {!isAuthor && (
                <button
                  onClick={handleContact}
                  disabled={contacting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-subtle transition-colors"
                >
                  {contacting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <MessageSquare className="w-3.5 h-3.5" />
                  )}
                  <span>Contact</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Lost & Found Item Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-primary flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                    Edit {currentType === 'LOST' ? 'Lost' : 'Found'} Item
                  </h3>
                  <p className="text-xs text-slate-500">Update item details, location or status</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Report Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditType('LOST')}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      editType === 'LOST'
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 shadow-xs'
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ● LOST ITEM
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditType('FOUND')}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      editType === 'FOUND'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 shadow-xs'
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ● FOUND ITEM
                  </button>
                </div>
              </div>

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
                  placeholder="e.g., Blue boAt Airdopes 141 in Library"
                  className="w-full px-3.5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Category & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {LOST_FOUND_CATEGORIES.filter((c) => c.id !== 'ALL').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Campus Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g., Main Canteen, Room 204"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Resolution Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ACTIVE">ACTIVE (Still Searching / Available)</option>
                  <option value="RESOLVED">RESOLVED (Item Recovered / Returned)</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Description & Identifying Marks *
                </label>
                <textarea
                  rows={4}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Details, color, scratch marks, hostel name..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              {/* Contact info */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Direct Contact Info (Optional)
                </label>
                <input
                  type="text"
                  value={editContactInfo}
                  onChange={(e) => setEditContactInfo(e.target.value)}
                  placeholder="Hostel Room No, WhatsApp or Instagram Handle"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Images */}
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
                  disabled={isUpdating || !editTitle.trim() || !editDescription.trim()}
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
                  Delete {currentType} Post?
                </h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              Are you sure you want to delete <span className="font-semibold text-slate-800 dark:text-slate-200">"{currentTitle}"</span>?
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
                onClick={handleDeletePost}
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

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="LOST_FOUND"
        targetId={post.id}
        itemTitle={currentTitle}
      />
    </>
  );
}
