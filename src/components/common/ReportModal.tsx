'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Flag, X, Check, Loader2 } from 'lucide-react';
import { REPORT_REASONS } from '@/lib/constants';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'LISTING' | 'COMMUNITY_POST' | 'COMMENT' | 'LOST_FOUND' | 'USER';
  targetId: string;
  itemTitle?: string;
}

export function ReportModal({ isOpen, onClose, targetType, targetId, itemTitle }: ReportModalProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState<string>(REPORT_REASONS[0].id);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: user.id,
          targetType,
          targetId,
          reason,
          description,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          onClose();
        }, 1500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-800 shadow-modal overflow-hidden p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <Flag className="w-5 h-5" />
            <h3 className="font-semibold text-base text-slate-900 dark:text-white font-heading">
              Report Content
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200">
            <Check className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-semibold text-emerald-900 dark:text-emerald-200 text-sm">Report Submitted</h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Thank you for keeping CampusHub safe. Our moderators will review this item.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {itemTitle && (
              <p className="text-xs text-slate-500 truncate">
                Reporting: <strong className="text-slate-700 dark:text-slate-300">{itemTitle}</strong>
              </p>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Select Reason *
              </label>
              <div className="space-y-1.5">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.id}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      reason === r.id
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 font-medium'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r.id}
                      checked={reason === r.id}
                      onChange={() => setReason(r.id)}
                      className="accent-primary"
                    />
                    {r.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Explain why this content violates community guidelines..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-subtle flex items-center gap-1.5"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
