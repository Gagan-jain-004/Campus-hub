'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { PostCard } from '@/components/communities/PostCard';
import { ImageUpload } from '@/components/common/ImageUpload';
import {
  Users,
  MessageSquare,
  Plus,
  Flame,
  Clock,
  Sparkles,
  Send,
  Loader2,
  Lock,
  EyeOff,
  Building2,
} from 'lucide-react';

export default function CommunitiesPage() {
  const { user, activeCollegeId, activeCollegeShortName } = useAuth();
  const [communities, setCommunities] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'latest' | 'trending' | 'top'>('trending');

  // New Post Form State
  const [showPostCreator, setShowPostCreator] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState<string>('');
  const [postCommunityId, setPostCommunityId] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [commRes, postsRes] = await Promise.all([
          fetch(`/api/communities?collegeId=${activeCollegeId}`),
          fetch(`/api/communities/all/posts?collegeId=${activeCollegeId}&sort=${sort}`),
        ]);
        const [commData, postsData] = await Promise.all([
          commRes.json(),
          postsRes.json(),
        ]);
        if (commData.success) {
          setCommunities(commData.data);
          if (commData.data.length > 0 && !postCommunityId) {
            setPostCommunityId(commData.data[0].id);
          }
        }
        if (postsData.success) setPosts(postsData.data);
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
    if (!user || !postTitle.trim() || !postContent.trim()) return;

    setSubmitting(true);
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
          collegeId: activeCollegeId,
          communityId: postCommunityId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPostTitle('');
        setPostContent('');
        setPostImage('');
        setShowPostCreator(false);
        // Refresh feed
        const postsRes = await fetch(`/api/communities/all/posts?collegeId=${activeCollegeId}&sort=${sort}`);
        const postsData = await postsRes.json();
        if (postsData.success) setPosts(postsData.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Campus Communities</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
            Conversations & Feeds — {activeCollegeShortName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Join verified student groups, anonymous confession boards, tech clubs, and exam prep hubs.
          </p>
        </div>

        <button
          onClick={() => setShowPostCreator(!showPostCreator)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-subtle transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Campus Post</span>
        </button>
      </div>

      {/* Community Rooms Showcase Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {communities.map((comm) => (
          <Link
            key={comm.id}
            href={`/communities/${comm.slug}`}
            className="group block p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all shadow-card hover:shadow-elevated"
          >
            <div className="flex items-center gap-3 mb-2.5">
              {comm.image ? (
                <Image
                  src={comm.image}
                  alt={comm.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-primary flex items-center justify-center font-bold text-sm">
                  #
                </div>
              )}
              <div className="truncate flex-1">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
                  {comm.name}
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  {comm._count?.posts || 0} posts • {comm.postingMode === 'ANONYMOUS' ? 'Incognito' : 'Public'}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {comm.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Main Feed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Feed Posts Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Post Creator Drawer */}
          {showPostCreator && (
            <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900 rounded-2xl p-5 shadow-elevated space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span>Create Campus Post</span>
                </div>
                <button
                  onClick={() => setShowPostCreator(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Select Community Room *
                  </label>
                  <select
                    value={postCommunityId}
                    onChange={(e) => setPostCommunityId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {communities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.postingMode === 'ANONYMOUS' ? 'Incognito Mode' : 'General'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <input
                    type="text"
                    required
                    placeholder="Post headline / topic question..."
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <textarea
                    rows={4}
                    required
                    placeholder="What's happening on campus? Share advice, queries, or thoughts..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                {/* Attach Image/Photo (Optional) */}
                <div>
                  <ImageUpload
                    label="Attach Photo or Meme (Optional)"
                    helperText="Upload a screenshot, notice photo, or campus meme"
                    value={postImage ? [postImage] : []}
                    onChange={(urls) => setPostImage(urls[0] || '')}
                    maxFiles={1}
                    folder="campushub_community"
                  />
                </div>

                {/* Anonymous Toggle */}
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Post Anonymously
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Hides your name and avatar from students. Author is logged internally for safety.
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

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPostCreator(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !postTitle.trim()}
                    className="px-5 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-subtle flex items-center gap-1.5"
                  >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Publish Post
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Feed Filter Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setSort('trending')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  sort === 'trending'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-primary font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Trending</span>
              </button>

              <button
                onClick={() => setSort('latest')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  sort === 'latest'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-primary font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Latest</span>
              </button>

              <button
                onClick={() => setSort('top')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  sort === 'top'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-primary font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Top Upvoted</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-slate-400">
              {posts.length} campus discussions
            </span>
          </div>

          {/* Posts Feed List */}
          {loading ? (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-xs font-mono">Loading campus discussions...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No posts yet in {activeCollegeShortName}.
              </p>
              <button
                onClick={() => setShowPostCreator(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-primary rounded-lg"
              >
                Start first discussion
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* Right Info Rail (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Incognito Notice Box */}
          <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-3">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs font-mono">
              <EyeOff className="w-4 h-4" />
              <span>INCOGNITO SAFETY STANDARD</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Anonymous posts allow students to speak candidly about mess food, academics, and questions without fear of judgment. However, abusive, illegal, or harassing posts will be traced and sanctioned by campus admins.
            </p>
          </div>

          {/* Guidelines */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-card text-xs">
            <h4 className="font-heading font-semibold text-sm text-slate-900 dark:text-white">
              Campus Guidelines
            </h4>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Respect fellow students and faculty members.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>No spam, duplicate promotions, or phishing links.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Report suspicious or harmful content immediately.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
