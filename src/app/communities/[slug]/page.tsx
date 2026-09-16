'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { PostCard } from '@/components/communities/PostCard';
import { ImageUpload } from '@/components/common/ImageUpload';
import { Users, ArrowLeft, Plus, Send, EyeOff, Loader2 } from 'lucide-react';

export default function SubCommunityPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user, activeCollegeId, activeCollegeShortName } = useAuth();

  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showPostCreator, setShowPostCreator] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [commRes, postsRes] = await Promise.all([
          fetch(`/api/communities?collegeId=${activeCollegeId}`),
          fetch(`/api/communities/${slug}/posts?collegeId=${activeCollegeId}`),
        ]);
        const [commData, postsData] = await Promise.all([
          commRes.json(),
          postsRes.json(),
        ]);
        if (commData.success) {
          const matched = commData.data.find((c: any) => c.slug === slug);
          setCommunity(matched);
        }
        if (postsData.success) setPosts(postsData.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (slug) loadData();
  }, [slug, activeCollegeId]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !postTitle.trim() || !postContent.trim() || !community) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/communities/${slug}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postTitle.trim(),
          content: postContent.trim(),
          image: postImage || null,
          isAnonymous,
          authorId: user.id,
          collegeId: activeCollegeId,
          communityId: community.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPostTitle('');
        setPostContent('');
        setPostImage('');
        setShowPostCreator(false);
        // Refresh feed
        const postsRes = await fetch(`/api/communities/${slug}/posts?collegeId=${activeCollegeId}`);
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <Link href="/communities" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary font-mono mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> All Communities
          </Link>
          <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
            {community ? `#${community.name}` : `#${slug}`}
          </h1>
          <p className="text-xs text-slate-500 max-w-xl">
            {community?.description || `Dedicated room for ${activeCollegeShortName}`}
          </p>
        </div>

        <button
          onClick={() => setShowPostCreator(!showPostCreator)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-subtle"
        >
          <Plus className="w-4 h-4" />
          <span>Post in #{slug}</span>
        </button>
      </div>

      {/* Post Creator Box */}
      {showPostCreator && (
        <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900 rounded-2xl p-5 shadow-elevated space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
              Create New Post in #{community?.name || slug}
            </span>
            <button onClick={() => setShowPostCreator(false)} className="text-xs text-slate-400">
              ✕
            </button>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-3">
            <input
              type="text"
              required
              placeholder="Post headline..."
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
            />
            <textarea
              rows={4}
              required
              placeholder="Share updates, queries, or discussion points..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white resize-none"
            />

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

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-primary accent-primary"
                />
                <span>Post incognito (anonymous)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Protected Author ID</span>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg flex items-center gap-1.5"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Publish Post
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts Feed */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-xs">Loading feed...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
          <p className="text-sm text-slate-500">No posts in this room yet.</p>
          <button
            onClick={() => setShowPostCreator(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-primary rounded-lg"
          >
            Start first thread
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
  );
}
