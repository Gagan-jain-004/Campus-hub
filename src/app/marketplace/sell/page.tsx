'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CATEGORIES, CONDITIONS } from '@/lib/constants';
import { ShoppingBag, Loader2, ArrowLeft, Building2 } from 'lucide-react';
import { ImageUpload } from '@/components/common/ImageUpload';
import Link from 'next/link';

export default function SellPage() {
  const router = useRouter();
  const { user, activeCollegeId, activeCollegeShortName, openAuthModal } = useAuth();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'TEXTBOOKS',
    price: '',
    condition: 'LIKE_NEW',
    negotiable: true,
    location: '',
  });

  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!activeCollegeId) {
      setError('Please select your campus first.');
      return;
    }
    if (!form.title || !form.description || !form.price || !form.location) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          images,
          userId: user.id,
          collegeId: activeCollegeId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/marketplace/${data.data.id}`);
      } else {
        setError(data.error || 'Failed to publish listing.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-primary mx-auto" />
        <h2 className="text-xl font-bold">Sign In Required</h2>
        <p className="text-xs text-slate-500">You must be logged in to post an item on the campus marketplace.</p>
        <button
          onClick={openAuthModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary rounded-xl"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Marketplace</span>
      </Link>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-6">
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-primary">
                <ShoppingBag className="w-5 h-5" />
              </span>
              <h1 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
                Create a Listing
              </h1>
            </div>

            {activeCollegeShortName && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-primary text-xs font-mono">
                <Building2 className="w-3.5 h-3.5" />
                <span>{activeCollegeShortName}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Sell or give away items exclusively to students on your campus.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Listing Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Engineering Mathematics 3rd Sem (BS Grewal)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none cursor-pointer"
              >
                {CATEGORIES.filter((c) => c.id !== 'ALL').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Condition *
              </label>
              <select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none cursor-pointer"
              >
                {CONDITIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & Negotiable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Price (₹ INR) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="1"
                placeholder="₹ 500"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
              />
            </div>

            <div className="pt-5">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer bg-slate-50 dark:bg-slate-950 text-xs">
                <input
                  type="checkbox"
                  checked={form.negotiable}
                  onChange={(e) => setForm({ ...form, negotiable: e.target.checked })}
                  className="rounded text-primary focus:ring-primary/20 accent-primary"
                />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Open to negotiation
                </span>
              </label>
            </div>
          </div>

          {/* Pickup Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Campus Pickup Location *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Hostel 3, Central Library, or Canteen"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Cloudinary Multiple Image Upload Component */}
          <div className="pt-1">
            <ImageUpload
              images={images}
              onChange={setImages}
              maxImages={6}
              folder="campushub_marketplace"
              label="Multiple Product Photos (Upload to Cloudinary)"
              description="Upload multiple photos (up to 6) showcasing different angles & condition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe the item condition, why you are selling it, edition/specs..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-subtle flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Publish Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
