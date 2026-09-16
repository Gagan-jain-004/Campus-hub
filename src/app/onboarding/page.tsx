'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ImageUpload } from '@/components/common/ImageUpload';
import {
  GraduationCap,
  Building2,
  BookOpen,
  Calendar,
  Sparkles,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Home,
  User,
} from 'lucide-react';

const RTU_DEGREES = [
  'B.Tech (Bachelor of Technology)',
  'M.Tech (Master of Technology)',
  'MBA (Master of Business Admin)',
  'MCA (Master of Computer App)',
  'Ph.D / Research Scholar',
  'Dual Degree (B.Tech + M.Tech)',
];

const RTU_BRANCHES = [
  'Computer Science & Engineering (CSE)',
  'Information Technology (IT)',
  'Electronics & Communication (ECE)',
  'Electrical Engineering (EE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering (CE)',
  'Production & Industrial Engg (PI)',
  'Aeronautical Engineering',
  'Artificial Intelligence & Data Science',
  'Petroleum / Chemical Engineering',
  'Management & Business Studies',
  'Other / Interdisciplinary',
];

const GRAD_YEARS = ['2024', '2025', '2026', '2027', '2028', '2029'];

const HOSTELS = [
  'Raman Hostel (Boys)',
  'Aryabhatta Hostel (Boys)',
  'Bhabha Hostel (Boys)',
  'Gargi Hostel (Girls)',
  'Maitreyi Hostel (Girls)',
  'Day Scholar - Dadabari / Mahaveer Nagar',
  'Day Scholar - Vigyan Nagar / Talwandi',
  'Day Scholar - Other Kota Area',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, login, switchCollege } = useAuth();

  const [form, setForm] = useState({
    name: '',
    username: '',
    avatar: '',
    course: 'B.Tech (Bachelor of Technology)',
    branch: 'Computer Science & Engineering (CSE)',
    gradYear: '2026',
    hostel: 'Raman Hostel (Boys)',
    bio: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fetch or prefill user details and RTU college
  useEffect(() => {
    if (user?.name && !form.name) {
      setForm((prev) => ({
        ...prev,
        name: user.name || '',
        username: user.username || user.email?.split('@')[0] || '',
        course: user.course || 'B.Tech (Bachelor of Technology)',
        branch: user.branch || 'Computer Science & Engineering (CSE)',
        gradYear: user.gradYear ? String(user.gradYear) : '2026',
      }));
    }

    // Ensure RTU Kota college is activated
    fetch('/api/colleges')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.[0]) {
          const rtu = data.data[0];
          switchCollege({
            id: rtu.id,
            name: rtu.name,
            shortName: rtu.shortName,
          });
        }
      })
      .catch(console.error);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      // 1. Ensure RTU college is assigned
      const colRes = await fetch('/api/colleges');
      const colData = await colRes.json();
      const rtuId = colData.data?.[0]?.id || 'rtu_kota';

      // 2. Save profile details
      if (user?.id) {
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            name: form.name.trim(),
            username: form.username.trim(),
            avatar: form.avatar || undefined,
            course: form.course,
            branch: form.branch,
            gradYear: form.gradYear,
            bio: `${form.hostel ? `📍 ${form.hostel} | ` : ''}${form.bio.trim()}`,
          }),
        });

        const resData = await res.json();
        if (resData.success && resData.data) {
          login({
            ...user,
            ...resData.data,
            collegeId: rtuId,
            collegeName: 'Rajasthan Technical University (RTU Kota)',
            collegeShortName: 'RTU Kota',
          });
        }
      }

      switchCollege({
        id: rtuId,
        name: 'Rajasthan Technical University (RTU Kota)',
        shortName: 'RTU Kota',
      });

      router.push('/marketplace');
    } catch (err: any) {
      console.error('Error saving onboarding data:', err);
      router.push('/marketplace');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-indigo-50/40 via-[#faf8ff] to-white dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-modal overflow-hidden animate-in fade-in zoom-in-95">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          {/* RTU Campus Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-mono mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>RTU Kota Verified Campus</span>
          </div>

          <h1 className="font-heading font-bold text-2xl sm:text-3xl tracking-tight">
            Welcome to CampusHub RTU!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-md">
            The exclusive digital campus for Rajasthan Technical University students. Set up your academic badge to unlock peer marketplace & student rooms.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Campus Indicator (Locked to RTU) */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-sm">
                RTU
              </div>
              <div>
                <span className="text-[10px] font-mono text-primary font-bold uppercase block leading-none">
                  Designated Campus
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                  Rajasthan Technical University, Kota
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md font-semibold shrink-0">
              ✓ Connected
            </span>
          </div>

          {/* Profile Picture Upload */}
          <div className="pt-1">
            <ImageUpload
              label="Student Profile Picture (Optional)"
              helperText="Upload your face or avatar for peer recognition on RTU campus"
              value={form.avatar ? [form.avatar] : []}
              onChange={(urls) => setForm({ ...form, avatar: urls[0] || '' })}
              maxFiles={1}
              isAvatar={true}
              folder="campushub_avatars"
            />
          </div>

          {/* Student Name & Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Gagan Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Student Username (@handle)
              </label>
              <input
                type="text"
                placeholder="e.g. gagan_rtu"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Degree & Branch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Degree Program *
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {RTU_DEGREES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Branch / Department *
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={form.branch}
                  onChange={(e) => setForm({ ...form, branch: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary truncate"
                >
                  {RTU_BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Grad Year & Hostel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Graduation Batch Year
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={form.gradYear}
                  onChange={(e) => setForm({ ...form, gradYear: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {GRAD_YEARS.map((y) => (
                    <option key={y} value={y}>
                      Class of {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hostel / Residence (Optional)
              </label>
              <div className="relative">
                <Home className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={form.hostel}
                  onChange={(e) => setForm({ ...form, hostel: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary truncate"
                >
                  {HOSTELS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-2xl bg-primary hover:bg-primary-hover text-white font-semibold flex items-center justify-center gap-2 shadow-subtle hover:shadow-elevated transition-all text-sm cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Enter RTU Kota CampusHub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

