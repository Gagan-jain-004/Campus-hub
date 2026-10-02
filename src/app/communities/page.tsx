'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { PostCard } from '@/components/communities/PostCard';
import { ImageUpload } from '@/components/common/ImageUpload';
import {
  MessageSquare,
  Plus,
  Flame,
  Clock,
  Sparkles,
  Send,
  Loader2,
  EyeOff,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Image as ImageIcon,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

export default function DiscussionHubPage() {
  const { user, activeCollegeId, activeCollegeShortName, openAuthModal } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'latest' | 'trending' | 'top'>('trending');

  // New Post Form State
  const [showPostCreator, setShowPostCreator] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const postsRes = await fetch(`/api/communities/all/posts?collegeId=${activeCollegeId}&sort=${sort}`);
        const postsData = await postsRes.json();
        if (postsData.success) {
          setPosts(postsData.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeCollegeId, sort]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    const campusId = activeCollegeId || user.collegeId;
    if (!campusId) {
      setError('Please select your campus first.');
      return;
    }
    if (!postTitle.trim() || !postContent.trim()) {
      setError('Please fill in both a title and description for your discussion.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/communities/all/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postTitle.trim(),
          content: postContent.trim(),
          image: postImage || null,
          isAnonymous,
          authorId: user.id,
          userId: user.id,
          collegeId: campusId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPostTitle('');
        setPostContent('');
        setPostImage('');
        setIsAnonymous(false);
        setShowPostCreator(false);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3500);

        // Refresh feed
        const postsRes = await fetch(`/api/communities/all/posts?collegeId=${campusId}&sort=${sort}`);
        const postsData = await postsRes.json();
        if (postsData.success) setPosts(postsData.data);
      } else {
        setError(data.error || 'Failed to publish discussion.');
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred while publishing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold uppercase tracking-wider mb-1">
            <MessageSquare className="w-4 h-4" />
            <span>Campus Discussion Hub</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
            Campus Discussions — {activeCollegeShortName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Share updates, ask questions, discuss exams or campus life freely with fellow students.
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) {
              openAuthModal();
              return;
            }
            setShowPostCreator(!showPostCreator);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-subtle transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Start a Discussion</span>
        </button>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-100 dark:bg-emerald-900/80 rounded-xl text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs font-bold sm:text-sm">Discussion Published! 🎉</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Aapka post feed me live ho chuka hai.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSuccessToast(false)}
            className="p-1.5 hover:bg-emerald-200/50 dark:hover:bg-emerald-900/50 rounded-lg text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Feed Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Quick Post Box / Collapsible Creator */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-card space-y-4">
            {!showPostCreator ? (
              <div
                onClick={() => {
                  if (!user) {
                    openAuthModal();
                    return;
                  }
                  setShowPostCreator(true);
                }}
                className="flex items-center gap-3 cursor-pointer group"
              >
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950 text-primary font-bold flex items-center justify-center text-xs">
                    {user?.name?.[0] || '💬'}
                  </div>
                )}
                <div className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                  What&apos;s on your mind? Start a campus discussion, ask a doubt, or share updates...
                </div>
                <button
                  type="button"
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-primary rounded-xl shadow-subtle hidden sm:flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in zoom-in-98 duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <span>Create Discussion Post</span>
                  </div>
                  <button
                    onClick={() => setShowPostCreator(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                  >
                    ✕ Close
                  </button>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleCreatePost} className="space-y-3.5">
                  {/* Title */}
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Topic / Question title (e.g., End-sem prep notes, Mess feedback, Hackathon team)..."
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <textarea
                      rows={4}
                      required
                      placeholder="Write your discussion details, question, advice, or thoughts..."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  {/* Image upload */}
                  <div>
                    <ImageUpload
                      label="Attach Photo / Screenshot / Notice (Optional)"
                      description="Upload an image or meme to accompany your post"
                      images={postImage ? [postImage] : []}
                      onChange={(urls) => setPostImage(urls[0] || '')}
                      maxImages={1}
                      folder="campushub_community"
                    />
                  </div>

                  {/* Anonymous / Incognito Toggle */}
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-primary">
                        <EyeOff className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Post Anonymously (Incognito)
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Hides your name and avatar from students on the feed.
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded text-primary focus:ring-primary/20 accent-primary w-4 h-4 cursor-pointer"
                    />
                  </div>

                  {/* Form Action Buttons */}
                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPostCreator(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !postTitle.trim() || !postContent.trim()}
                      className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-subtle transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Publish Post</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Feed Filter Sort Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setSort('trending')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  sort === 'trending'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-primary font-semibold shadow-subtle'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Trending</span>
              </button>

              <button
                onClick={() => setSort('latest')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  sort === 'latest'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-primary font-semibold shadow-subtle'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Latest</span>
              </button>

              <button
                onClick={() => setSort('top')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  sort === 'top'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-primary font-semibold shadow-subtle'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Top Upvoted</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-slate-400">
              {posts.length} discussions
            </span>
          </div>

          {/* Posts Feed List */}
          {loading ? (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-xs font-mono">Loading campus discussions...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-card">
              <MessageSquare className="w-10 h-10 text-primary/60 mx-auto" />
              <h3 className="font-heading font-semibold text-base text-slate-900 dark:text-white">
                No discussions yet in {activeCollegeShortName}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Be the first to start a conversation, ask for advice, or share a campus update!
              </p>
              <button
                onClick={() => setShowPostCreator(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-primary rounded-xl shadow-subtle cursor-pointer"
              >
                Start First Discussion
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar Info (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Discussion Hub Card */}
          <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/60 via-white to-indigo-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 space-y-3 shadow-card">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs font-mono">
              <TrendingUp className="w-4 h-4" />
              <span>OPEN CAMPUS FEED</span>
            </div>
            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
              Direct & Open Discussions
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              No need to pick specific channels or communities. Any post you create reaches verified students across your entire campus directly.
            </p>
          </div>

          {/* Incognito Notice Box */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-card">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs font-mono">
              <EyeOff className="w-4 h-4" />
              <span>INCOGNITO SAFETY STANDARD</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Anonymous posts allow students to speak candidly about academics, faculties, and questions without fear of judgment. Abusive or harassing posts remain subject to admin review.
            </p>
          </div>

          {/* Guidelines */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-card text-xs">
            <h4 className="font-heading font-semibold text-sm text-slate-900 dark:text-white">
              Discussion Guidelines
            </h4>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Respect fellow students and campus staff.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Share helpful resources, doubts, and tips.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>No spam, repetitive promotional messages, or abuse.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
