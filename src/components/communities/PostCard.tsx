'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatTimeAgo } from '@/lib/utils';
import { ArrowBigUp, MessageSquare, ShieldCheck, UserCircle2, Flag, Send, Loader2, Share2, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ReportModal } from '@/components/common/ReportModal';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    image?: string | null;
    isAnonymous: boolean;
    upvotes: number;
    createdAt: string | Date;
    author: {
      id: string;
      name: string;
      username?: string | null;
      avatar?: string | null;
      isVerified?: boolean;
      branch?: string | null;
    };
    community?: {
      id: string;
      name: string;
      slug: string;
    };
    comments: {
      id: string;
      content: string;
      isAnonymous: boolean;
      createdAt: string | Date;
      author: {
        id: string;
        name: string;
        username?: string | null;
        avatar?: string | null;
        isVerified?: boolean;
      };
    }[];
    reactions?: { type: string; userId: string }[];
  };
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(
    post.reactions?.some((r) => r.userId === user?.id) || false
  );
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [commentText, setCommentText] = useState('');
  const [isAnonymousComment, setIsAnonymousComment] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === `#post-${post.id}`) {
      setIsHighlighted(true);
      const timer = setTimeout(() => setIsHighlighted(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [post.id]);

  const handleShare = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${baseUrl}${post.community?.slug ? `/communities/${post.community.slug}` : '/communities'}#post-${post.id}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: `Check out this post on CampusHub: "${post.title}"`,
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
      console.error('Failed to copy link', e);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      alert('Please log in to upvote campus posts.');
      return;
    }
    const newStatus = !hasUpvoted;
    setHasUpvoted(newStatus);
    setUpvotes((prev) => (newStatus ? prev + 1 : prev - 1));

    try {
      await fetch(`/api/communities/posts/${post.id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, type: 'LIKE' }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;
    setCommentSubmitting(true);
    try {
      const res = await fetch(`/api/communities/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentText.trim(),
          isAnonymous: isAnonymousComment,
          authorId: user.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => [...prev, data.data]);
        setCommentText('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCommentSubmitting(false);
    }
  };

  return (
    <>
      <div
        id={`post-${post.id}`}
        className={`bg-white dark:bg-slate-900 border rounded-xl p-4 sm:p-5 transition-all shadow-card space-y-3.5 scroll-mt-24 ${
          isHighlighted
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-elevated'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        {/* Post Meta Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {post.isAnonymous ? (
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 font-mono text-xs">
                ?
              </div>
            ) : post.author?.avatar ? (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                {post.author?.name?.[0] || 'S'}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {post.isAnonymous ? 'Anonymous Student' : post.author.name}
                </span>

                {post.isAnonymous && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                    Incognito
                  </span>
                )}

                {post.author?.isVerified && !post.isAnonymous && (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                )}

                {user?.role === 'ADMIN' && post.isAnonymous && (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200" title="Visible only to Admins">
                    [Admin Trace: Protected]
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                {post.community && (
                  <span className="text-primary font-medium">#{post.community.name}</span>
                )}
                <span>•</span>
                <span>{formatTimeAgo(post.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className={`p-1.5 rounded-lg transition-colors ${
                copied
                  ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              title="Share Post Link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setIsReportOpen(true)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              title="Report Post"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Post Body */}
        <div className="space-y-2">
          <h3 className="font-semibold text-base text-slate-900 dark:text-white leading-snug">
            {post.title}
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>

          {post.image && (
            <div className="relative aspect-video w-full rounded-lg overflow-hidden mt-3 bg-slate-100">
              <Image src={post.image} alt={post.title} fill className="object-cover" />
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {/* Upvote Button */}
            <button
              onClick={handleUpvote}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono font-medium transition-all ${
                hasUpvoted
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-primary'
                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <ArrowBigUp className={`w-4 h-4 ${hasUpvoted ? 'fill-current text-primary' : ''}`} />
              <span>{upvotes}</span>
            </button>

            {/* Comments Toggle */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 font-mono font-medium transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>{comments.length} replies</span>
            </button>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono font-medium transition-all ${
              copied
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-primary'
            }`}
            title="Share post link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>

        {/* Expandable Comments Drawer */}
        {showComments && (
          <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in duration-150">
            {/* Existing Comments */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No replies yet. Be the first to join the conversation.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {c.isAnonymous ? 'Anonymous Student' : c.author?.name || 'Student'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {formatTimeAgo(c.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal">
                      {c.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="space-y-2 pt-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder={user ? 'Write a respectful campus reply...' : 'Log in to join the conversation'}
                  disabled={!user || commentSubmitting}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={!user || !commentText.trim() || commentSubmitting}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-primary text-white disabled:opacity-40 hover:bg-primary-hover"
                >
                  {commentSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>

              {user && (
                <div className="flex items-center justify-between text-[11px] px-1 text-slate-500">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymousComment}
                      onChange={(e) => setIsAnonymousComment(e.target.checked)}
                      className="rounded text-primary focus:ring-primary/20 accent-primary"
                    />
                    <span>Post anonymously</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Protected identity</span>
                </div>
              )}
            </form>
          </div>
        )}
      </div>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="COMMUNITY_POST"
        targetId={post.id}
        itemTitle={post.title}
      />
    </>
  );
}
