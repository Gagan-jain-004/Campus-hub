'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { ImageUpload } from '@/components/common/ImageUpload';
import { formatPrice, formatDate, formatTimeAgo } from '@/lib/utils';
import {
  User,
  Building2,
  GraduationCap,
  BookOpen,
  Calendar,
  ShieldCheck,
  Edit3,
  ShoppingBag,
  Bookmark,
  MessageSquare,
  Search,
  CheckCircle2,
  Save,
  Loader2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  MapPin,
  Trash2,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, login } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  const [activeTab, setActiveTab] = useState<'overview' | 'edit' | 'listings' | 'saved' | 'posts'>(
    (initialTab as any) || 'overview'
  );

  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    course: '',
    branch: '',
    gradYear: '',
    bio: '',
    avatar: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profile?userId=${user?.id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setProfileData(json.data);
        setEditForm({
          name: json.data.name || '',
          username: json.data.username || '',
          course: json.data.course || '',
          branch: json.data.branch || '',
          gradYear: json.data.gradYear ? String(json.data.gradYear) : '',
          bio: json.data.bio || '',
          avatar: json.data.avatar || '',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: editForm.name,
          username: editForm.username,
          course: editForm.course,
          branch: editForm.branch,
          gradYear: editForm.gradYear,
          bio: editForm.bio,
          avatar: editForm.avatar,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setSaveSuccess(true);
        // Update user session in AuthContext
        login({
          ...user,
          name: json.data.name,
          username: json.data.username,
          course: json.data.course,
          branch: json.data.branch,
          gradYear: json.data.gradYear,
          avatar: json.data.avatar,
        });
        fetchProfile();
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorMessage(json.error || 'Failed to update profile.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-card space-y-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-primary flex items-center justify-center mx-auto">
            <User className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
            Please Sign In
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to view your verified student profile, your listings, saved items, and campus reputation.
          </p>
          <Link
            href="/sign-in?redirect_url=/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors shadow-subtle"
          >
            <span>Sign In to CampusHub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const profile = profileData || user;
  const listings = profileData?.listings || [];
  const savedListings = profileData?.savedListings || [];
  const communityPosts = profileData?.communityPosts || [];
  const lostFoundPosts = profileData?.lostFoundPosts || [];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 w-full min-w-0 space-y-6">
      {/* Student Profile Card Hero */}
      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card overflow-hidden">
        {/* Campus Header Banner */}
        <div className="h-32 sm:h-44 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 relative p-4 flex items-end justify-end">
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/30 backdrop-blur-md border border-white/20 text-white text-xs font-mono">
            <Building2 className="w-3.5 h-3.5 text-indigo-300" />
            <span>{profile?.collegeName || profile?.college?.name || 'Verified Campus Student'}</span>
          </div>
        </div>

        {/* Profile Details Container */}
        <div className="px-4 sm:px-8 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative">
                {profile?.avatar ? (
                  <Image
                    src={profile.avatar}
                    alt={profile.name || 'Student'}
                    width={96}
                    height={96}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-elevated bg-slate-100"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-indigo-100 text-primary border-4 border-white dark:border-slate-900 shadow-elevated flex items-center justify-center font-bold text-3xl">
                    {profile?.name?.[0] || 'S'}
                  </div>
                )}
                {profile?.isVerified && (
                  <div
                    className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-white shadow-sm"
                    title="Verified Student"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
                    {profile?.name}
                  </h1>
                  {profile?.role === 'ADMIN' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-primary font-bold border border-indigo-200">
                      ADMIN
                    </span>
                  )}
                  {profile?.isVerified && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 font-semibold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Campus Verified
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 font-mono">
                  {profile?.username ? `@${profile.username}` : profile?.email}
                </p>
              </div>
            </div>

            {/* Quick Action: Edit Profile */}
            <div className="flex items-center justify-center sm:justify-end gap-2">
              <button
                onClick={() => setActiveTab('edit')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-semibold transition-colors shadow-subtle"
              >
                <Edit3 className="w-3.5 h-3.5 text-primary" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Academic Badge Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
              <GraduationCap className="w-4 h-4 text-primary shrink-0" />
              <div className="truncate">
                <span className="block text-[10px] text-slate-400 uppercase font-mono">Course</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {profile?.course || 'Not specified (Edit Profile)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
              <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
              <div className="truncate">
                <span className="block text-[10px] text-slate-400 uppercase font-mono">Branch / Dept</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {profile?.branch || 'Not specified'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
              <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="truncate">
                <span className="block text-[10px] text-slate-400 uppercase font-mono">Batch / Grad Year</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {profile?.gradYear ? `Class of ${profile.gradYear}` : 'Class of 2026'}
                </span>
              </div>
            </div>
          </div>

          {/* Student Bio */}
          {profile?.bio && (
            <div className="mt-3 p-3 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 text-xs text-slate-700 dark:text-slate-300">
              <span className="font-mono text-[10px] text-indigo-500 font-bold block mb-0.5">BIO</span>
              {profile.bio}
            </div>
          )}
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'overview'
              ? 'bg-primary text-white shadow-subtle'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Activity & Stats</span>
        </button>

        <button
          onClick={() => setActiveTab('edit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'edit'
              ? 'bg-primary text-white shadow-subtle'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'listings'
              ? 'bg-primary text-white shadow-subtle'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>My Listings ({listings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'saved'
              ? 'bg-primary text-white shadow-subtle'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Items ({savedListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'posts'
              ? 'bg-primary text-white shadow-subtle'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Community Posts ({communityPosts.length})</span>
        </button>
      </div>

      {/* Tab 1: Overview & Metrics */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-1">
              <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">Listings Posted</span>
              <p className="text-2xl font-bold font-mono text-primary">{listings.length}</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-1">
              <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">Saved Items</span>
              <p className="text-2xl font-bold font-mono text-indigo-500">{savedListings.length}</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-1">
              <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">Community Posts</span>
              <p className="text-2xl font-bold font-mono text-emerald-600">{communityPosts.length}</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-1">
              <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">Recovery Tickets</span>
              <p className="text-2xl font-bold font-mono text-rose-600">{lostFoundPosts.length}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-950 border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                Ready to trade or connect on campus?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Post textbooks, bikes, hostel essentials or join campus discussion rooms.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                href="/marketplace/sell"
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors shadow-subtle"
              >
                Sell An Item
              </Link>
              <Link
                href="/communities"
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Explore Communities
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Edit Profile Form */}
      {activeTab === 'edit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-card max-w-3xl">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              Edit Student Profile
            </h3>
            <p className="text-xs text-slate-500">
              Keep your degree, branch, and contact identity up to date for campus peers.
            </p>
          </div>

          {saveSuccess && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Unique Username (@handle)
                </label>
                <input
                  type="text"
                  placeholder="e.g. gagan_rtu"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Degree / Course
                </label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech, MBA, M.Sc"
                  value={editForm.course}
                  onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Branch / Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science, Mechanical"
                  value={editForm.branch}
                  onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Graduation Year
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2026"
                  min="2020"
                  max="2032"
                  value={editForm.gradYear}
                  onChange={(e) => setEditForm({ ...editForm, gradYear: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Cloudinary Avatar Upload */}
            <div>
              <ImageUpload
                isAvatar={true}
                images={editForm.avatar ? [editForm.avatar] : []}
                onChange={(urls) => setEditForm({ ...editForm, avatar: urls[0] || '' })}
                folder="campushub_avatars"
                label="Student Profile Photo (Upload to Cloudinary)"
                description="Upload a clear profile photo (JPG, PNG or WEBP)"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                About / Bio
              </label>
              <textarea
                rows={3}
                placeholder="Tell fellow students what hostel you live in, what you study, or items you frequently sell..."
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold flex items-center gap-2 shadow-subtle transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: My Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {listings.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-card">
              <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-heading font-semibold text-slate-900 dark:text-white">
                No active listings yet
              </h3>
              <p className="text-xs text-slate-500">
                Post used textbooks, electronics, cycles or furniture for your campus.
              </p>
              <Link
                href="/marketplace/sell"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold"
              >
                <span>Sell First Item</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((item: any) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Saved Items */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedListings.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-card">
              <Bookmark className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-heading font-semibold text-slate-900 dark:text-white">
                No saved items yet
              </h3>
              <p className="text-xs text-slate-500">
                Bookmark items in the marketplace to compare or contact sellers later.
              </p>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold"
              >
                <span>Browse Marketplace</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedListings.map((save: any) => (
                <ListingCard key={save.id} listing={save.listing} isSavedInitial={true} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Community Posts */}
      {activeTab === 'posts' && (
        <div className="space-y-3">
          {communityPosts.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-card">
              <MessageSquare className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-heading font-semibold text-slate-900 dark:text-white">
                No community posts yet
              </h3>
              <p className="text-xs text-slate-500">
                Join campus discussion rooms, anonymous confession feeds, or exam prep hubs.
              </p>
              <Link
                href="/communities"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold"
              >
                <span>Go to Communities</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-card text-xs">
              {communityPosts.map((post: any) => (
                <div key={post.id} className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-primary bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded font-semibold">
                      #{post.community?.name || 'General'}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {formatTimeAgo(post.createdAt)}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                    {post.title}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                    {post.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
