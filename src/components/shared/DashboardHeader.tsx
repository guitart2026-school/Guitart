'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { Bell, ShoppingBag, Search, User as UserIcon, Shield, Menu } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onMobileMenuToggle?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  onMobileMenuToggle,
}) => {
  const { currentUser, activeRole, cart, adminName } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = mounted ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Cart */}
        <Link
          href="/student/cart"
          className="relative p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-amber-500/30 transition"
          aria-label="Cart"
        >
          <ShoppingBag className="w-4 h-4" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>

        {/* User Pill — Clickable to Profile / Settings */}
        <Link
          href={activeRole === 'admin' ? '/admin/settings' : '/student/profile'}
          className="flex items-center gap-3 pl-3 border-l border-zinc-800 hover:opacity-95 transition group cursor-pointer"
          title="View & Edit Profile / Settings"
        >
          <img
            src={
              currentUser?.avatarUrl ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80'
            }
            alt={currentUser?.fullName || 'User'}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80';
            }}
            className="w-9 h-9 rounded-xl object-cover border border-amber-500/40 group-hover:border-amber-400 group-hover:scale-105 transition-all shadow-md shrink-0"
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors leading-tight">
              {currentUser?.fullName || (activeRole === 'admin' ? adminName : 'Student')}
            </p>
            <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
              {activeRole === 'admin' ? (
                <>
                  <Shield className="w-3 h-3" /> Administrator
                </>
              ) : (
                <>
                  <UserIcon className="w-3 h-3 text-emerald-400" /> {currentUser?.level || 'Student'}
                </>
              )}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};
