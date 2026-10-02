'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatDate, formatTimeAgo } from '@/lib/utils';
import {
  Shield,
  Users,
  Flag,
  Building2,
  CheckCircle,
  XCircle,
  Loader2,
  Lock,
  Mail,
  KeyRound,
  LogOut,
  Trash2,
  Search,
  AlertTriangle,
} from 'lucide-react';

export default function AdminPage() {
  const { user, login, logout } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeQueue, setActiveQueue] = useState<'reports' | 'colleges' | 'users'>('reports');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // User Deletion & Search State
  const [searchUser, setSearchUser] = useState('');
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Admin Login State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async (query?: string) => {
    setLoading(true);
    try {
      const q = query !== undefined ? query : searchUser;
      const url = q ? `/api/admin?search=${encodeURIComponent(q)}` : '/api/admin';
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete?.id) return;
    setDeleteLoading(true);
    setDeleteError('');
    setDeleteMessage('');

    try {
      const res = await fetch(`/api/admin?userId=${userToDelete.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (json.success) {
        setDeleteMessage(json.message || `User ${userToDelete.name} was permanently deleted.`);
        setUserToDelete(null);
        fetchAdminData();
        setTimeout(() => setDeleteMessage(''), 5000);
      } else {
        setDeleteError(json.error || 'Failed to delete user.');
      }
    } catch (err: any) {
      setDeleteError(err.message || 'An error occurred while deleting user.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail.trim(),
          password: adminPassword,
        }),
      });

      const json = await res.json();
      if (json.success) {
        login(json.data);
      } else {
        setLoginError(json.error || 'Invalid admin credentials');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleResolveReport = async (reportId: string, status: 'RESOLVED' | 'DISMISSED') => {
    setActionLoading(reportId);
    try {
      await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESOLVE_REPORT',
          id: reportId,
          status,
          adminNotes: `Resolved by ${user?.name || 'Superadmin'}`,
        }),
      });
      fetchAdminData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleModerateCollege = async (reqId: string, status: 'APPROVED' | 'REJECTED') => {
    setActionLoading(reqId);
    try {
      await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'MODERATE_COLLEGE_REQUEST',
          id: reqId,
          status,
        }),
      });
      fetchAdminData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  // If NOT Admin, render clean secure credentials login form
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-modal p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-sm">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
              CampusHub Admin Portal
            </h1>
            <p className="text-xs text-slate-500">
              Restricted area for platform administrators and campus moderators.
            </p>
          </div>

          {loginError && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@campushub.in"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-xl shadow-subtle flex items-center justify-center gap-2 transition-colors"
            >
              {loginLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              <span>Sign In to Admin Console</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const reports = data?.reports || [];
  const collegeRequests = data?.collegeRequests || [];
  const recentUsers = data?.recentUsers || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>CampusHub Trust & Safety Console</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
            Superadmin Moderation Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time content moderation, campus request provisioning, and reports dispatch.
          </p>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out of Admin</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-1">
          <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">Total Students</span>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{stats.totalUsers || 0}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-1">
          <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">Active Listings</span>
          <p className="text-2xl font-bold font-mono text-primary">{stats.activeListings || 0}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-1">
          <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">Community Rooms</span>
          <p className="text-2xl font-bold font-mono text-emerald-600">{stats.activeCommunities || 0}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card space-y-1">
          <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">Lost & Found Posts</span>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{stats.activeLostFound || 0}</p>
        </div>
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 shadow-card space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono text-rose-700 dark:text-rose-300 font-semibold uppercase">Pending Reports</span>
          <p className="text-2xl font-bold font-mono text-rose-600">{stats.pendingReportsCount || 0}</p>
        </div>
      </div>

      {/* Queue Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveQueue('reports')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeQueue === 'reports'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Moderation Reports ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveQueue('colleges')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeQueue === 'colleges'
              ? 'bg-indigo-50 text-primary border border-indigo-200'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>College Expansion Requests ({collegeRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveQueue('users')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeQueue === 'users'
              ? 'bg-slate-100 text-slate-900 font-bold'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Recent Students ({recentUsers.length})</span>
        </button>
      </div>

      {/* Queue Content */}
      {loading && !data ? (
        <div className="p-16 text-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
          <span className="text-xs">Loading moderation queue...</span>
        </div>
      ) : (
        <div>
          {/* Reports Table */}
          {activeQueue === 'reports' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-card">
              {reports.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No active reports in queue.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {reports.map((report: any) => (
                    <div key={report.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                            {report.reason}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            Target: {report.targetType} (#{report.targetId ? report.targetId.slice(0, 8) : ''})
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {formatTimeAgo(report.createdAt)}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">
                          {report.description || 'No additional notes provided.'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Reported by: {report.reporter?.name || 'Anonymous'} ({report.reporter?.email || 'N/A'})
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleResolveReport(report.id, 'RESOLVED')}
                          disabled={actionLoading === report.id}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-subtle flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Resolve
                        </button>
                        <button
                          onClick={() => handleResolveReport(report.id, 'DISMISSED')}
                          disabled={actionLoading === report.id}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* College Requests Table */}
          {activeQueue === 'colleges' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-card">
              {collegeRequests.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No new college requests in queue.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {collegeRequests.map((req: any) => (
                    <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-primary border border-indigo-200">
                            {req.shortName}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">{req.collegeName}</span>
                          <span className="text-slate-400 font-mono">• {req.city}, {req.state}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Requested by: {req.email} • Status: <strong className="uppercase">{req.status}</strong>
                        </p>
                      </div>

                      {req.status === 'PENDING' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleModerateCollege(req.id, 'APPROVED')}
                            disabled={actionLoading === req.id}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-subtle flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve & Launch Campus
                          </button>
                          <button
                            onClick={() => handleModerateCollege(req.id, 'REJECTED')}
                            disabled={actionLoading === req.id}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Users / Students Management */}
          {activeQueue === 'users' && (
            <div className="space-y-4">
              {/* User Search & Filter Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-card">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search students by name or email..."
                    value={searchUser}
                    onChange={(e) => {
                      setSearchUser(e.target.value);
                      fetchAdminData(e.target.value);
                    }}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <span className="text-xs font-mono text-slate-400 shrink-0">
                  {recentUsers.length} student accounts found
                </span>
              </div>

              {/* Delete feedback alert */}
              {deleteMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{deleteMessage}</span>
                </div>
              )}

              {deleteError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>{deleteError}</span>
                </div>
              )}

              {/* Students List */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-card divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {recentUsers.length === 0 ? (
                  <div className="p-10 text-center text-xs text-slate-500">
                    No students matching your search query.
                  </div>
                ) : (
                  recentUsers.map((u: any) => (
                    <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">
                            {u.name}
                          </span>
                          <span className="text-slate-400 font-mono text-xs">
                            ({u.email})
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-primary font-bold border border-indigo-200/60">
                            {u.role}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-mono">
                          <span>{u.college?.shortName || u.college?.name || 'No Campus Assigned'}</span>
                          <span>•</span>
                          <span>Joined {formatDate(u.createdAt)}</span>
                        </div>

                        {/* Counts badges */}
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            📦 {u._count?.listings || 0} Listings
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            💬 {u._count?.communityPosts || 0} Discussions
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            🔍 {u._count?.lostFoundPosts || 0} Lost/Found
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setUserToDelete(u)}
                          className="px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl border border-rose-200 dark:border-rose-900 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete User & Data</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-modal p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  Delete User & All Associated Data?
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Target: {userToDelete.name} ({userToDelete.email})
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 space-y-1.5">
              <p className="font-semibold">⚠️ Yeh action permanent hai aur undo nahi ho sakta:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>User ka pura account permanently delete ho jayega</li>
                <li>User ki sari Marketplace listings & photos delete ho jayengi</li>
                <li>Sari discussion posts, comments & reactions delete ho jayenge</li>
                <li>Sari Lost & Found recovery tickets delete ho jayengi</li>
                <li>In-app messages & conversations wipe ho jayengi</li>
              </ul>
            </div>

            {deleteError && (
              <div className="p-2.5 text-xs text-rose-700 bg-rose-50 rounded-lg">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => {
                  setUserToDelete(null);
                  setDeleteError('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteUser}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-subtle flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting User...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
