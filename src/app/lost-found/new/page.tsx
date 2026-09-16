'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LOST_FOUND_CATEGORIES } from '@/lib/constants';
import { Search, Loader2, ArrowLeft, Building2 } from 'lucide-react';
import { ImageUpload } from '@/components/common/ImageUpload';
import Link from 'next/link';

export default function NewLostFoundPage() {
  const router = useRouter();
  const { user, activeCollegeId, activeCollegeShortName, openAuthModal } = useAuth();

  const [form, setForm] = useState({
    type: 'LOST',
    title: '',
    description: '',
    category: 'WALLETS_KEYS',
    location: '',
    dateLostFound: new Date().toISOString().split('T')[0],
    contactInfo: '',
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
    if (!form.title || !form.description || !form.location) {
      setError('Please fill in title, description, and location.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/lost-found', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          images,
          userId: user.id,
          collegeId: activeCollegeId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/lost-found');
      } else {
        setError(data.error || 'Failed to submit report.');
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
        <Search className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-xl font-bold">Sign In Required</h2>
        <p className="text-xs text-slate-500">You must be logged in to report a lost or found item.</p>
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
        href="/lost-found"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Lost & Found</span>
      </Link>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600">
              <Search className="w-5 h-5" />
            </span>
            <h1 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
              Report Lost or Found Item
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Submit a verified campus recovery ticket to help peer students locate missing items.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Report Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: 'LOST' })}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  form.type === 'LOST'
                    ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>● I LOST an Item</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, type: 'FOUND' })}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  form.type === 'FOUND'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>● I FOUND an Item</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Item Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Black Leather Wallet, Student ID Card, Titan Watch"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Item Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
              >
                {LOST_FOUND_CATEGORIES.filter((c) => c.id !== 'ALL').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date Lost / Found *
              </label>
              <input
                type="date"
                value={form.dateLostFound}
                onChange={(e) => setForm({ ...form, dateLostFound: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Campus Location *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Central Library 2nd Floor, Workshop Block B, or Canteen"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Contact / WhatsApp */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Contact Info (Phone / WhatsApp / Room No.)
            </label>
            <input
              type="text"
              placeholder="e.g. +91 9876543210 / Hostel 2 Room 104"
              value={form.contactInfo}
              onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Cloudinary Multiple Image Upload Component */}
          <div className="pt-1">
            <ImageUpload
              images={images}
              onChange={setImages}
              maxImages={4}
              folder="campushub_lostfound"
              label="Multiple Item Photos (Upload to Cloudinary)"
              description="Upload multiple photos (up to 4) from different angles to assist identification"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description & Verification Clues *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Describe distinguishing marks, brand, color, approximate time..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-subtle flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Ticket...</span>
                </>
              ) : (
                <span>Submit Report</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
