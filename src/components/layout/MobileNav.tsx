'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Users, Search, PlusCircle, LayoutDashboard, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function MobileNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const links = [
    { href: '/marketplace', label: 'Market', icon: ShoppingBag },
    { href: '/communities', label: 'Feeds', icon: Users },
    { href: '/marketplace/sell', label: 'Sell', icon: PlusCircle, isAction: true },
    { href: '/lost-found', label: 'Lost/Found', icon: Search },
    { href: isAuthenticated ? '/dashboard' : '/messages', label: isAuthenticated ? 'Dashboard' : 'Chat', icon: isAuthenticated ? LayoutDashboard : MessageSquare },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 block md:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 shadow-lg">
      <div className="grid grid-cols-5 items-center justify-items-center">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          if (link.isAction) {
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center justify-center -mt-4 bg-primary text-white w-10 h-10 rounded-full shadow-md hover:bg-primary-hover transition-transform active:scale-95"
              >
                <Icon className="w-5 h-5" />
              </Link>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center py-1.5 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
