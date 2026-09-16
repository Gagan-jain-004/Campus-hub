'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ShoppingBag,
  Users,
  Search,
  Plus,
  MessageSquare,
  Shield,
  LayoutDashboard,
  LogOut,
  LogIn,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navLinks = [
    { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { href: '/communities', label: 'Communities', icon: Users },
    { href: '/lost-found', label: 'Lost & Found', icon: Search },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-mono font-bold text-sm shadow-subtle group-hover:bg-indigo-700 transition-colors">
              CH
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-base text-slate-900 dark:text-white tracking-tight leading-none">
                CampusHub
              </span>
              <span className="text-[10px] font-mono text-slate-400 leading-tight">
                RTU Kota Edition
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-primary border border-indigo-200/60 dark:border-indigo-800/60'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2.5">
          {/* New Post Button */}
          {isAuthenticated ? (
            <Link
              href="/marketplace/sell"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover shadow-subtle transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Sell / Post</span>
            </Link>
          ) : (
            <Link
              href="/sign-in?redirect_url=/marketplace/sell"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-hover shadow-subtle transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Sell / Post</span>
            </Link>
          )}

          {/* Messages */}
          {isAuthenticated && (
            <Link
              href="/messages"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors relative"
              title="In-App Messages"
            >
              <MessageSquare className="w-4 h-4" />
            </Link>
          )}

          {/* User Menu */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-primary font-bold text-xs flex items-center justify-center">
                    {user.name[0]}
                  </div>
                )}
                <span className="hidden lg:inline text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div
                    onClick={() => setShowUserMenu(false)}
                    className="fixed inset-0 z-40"
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-modal p-2 space-y-1 animate-in fade-in zoom-in-95 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 space-y-0.5">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 truncate">
                        {user.username ? `@${user.username}` : user.email}
                      </p>
                      <div className="pt-1 flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-primary font-bold">
                          {user.role}
                        </span>
                        {user.isVerified && (
                          <span className="text-[10px] font-mono text-emerald-600 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                      <span>View My Profile</span>
                    </Link>

                    <Link
                      href="/profile?tab=edit"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                      <span>Edit Profile</span>
                    </Link>

                    <Link
                      href="/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                      <span>Student Dashboard</span>
                    </Link>

                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                      >
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        <span>Admin Portal</span>
                      </Link>
                    )}

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={async () => {
                          setShowUserMenu(false);
                          await logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-primary" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
