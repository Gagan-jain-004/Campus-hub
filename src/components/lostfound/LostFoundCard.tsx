'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatDate, formatTimeAgo } from '@/lib/utils';
import { MapPin, Calendar, MessageSquare, Flag, ShieldCheck, Loader2, Share2, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ReportModal } from '@/components/common/ReportModal';
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
}

export function LostFoundCard({ post }: LostFoundCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [contacting, setContacting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === `#post-${post.id}`) {
      setIsHighlighted(true);
      const timer = setTimeout(() => setIsHighlighted(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [post.id]);

  const isLost = post.type === 'LOST';
  const images = post.images || [];
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
          title: `[${post.type}] ${post.title}`,
          text: `Campus Hub Lost & Found item: "${post.title}"`,
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

                <button
                  onClick={() => setIsReportOpen(true)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Report post"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <h3 className="font-semibold text-base text-slate-900 dark:text-white leading-snug">
              {post.title}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
              {post.description}
            </p>

            {/* Meta Tags */}
            <div className="pt-2 space-y-1.5 text-xs text-slate-500 font-mono">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{post.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Reported: {formatDate(post.dateLostFound)}</span>
              </div>
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
            </div>
          </div>
        </div>
      </div>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="LOST_FOUND"
        targetId={post.id}
        itemTitle={post.title}
      />
    </>
  );
}
