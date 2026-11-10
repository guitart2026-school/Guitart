'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  CalendarCheck,
  ShoppingBag,
  User,
  LogOut,
  Music,
  ChevronRight,
  Store
} from 'lucide-react';
import { BrandIcon } from '@/components/shared/BrandLogo';

export const StudentSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, currentUser, users } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const studentInRoster = currentUser
    ? users.find(
        (u) =>
          u.id === currentUser.id ||
          (u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase())
      )
    : null;
  const currentSkillLevel = studentInRoster?.level || currentUser?.level || 'Beginner';

  const navItems = [
    { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Lessons', href: '/student/lessons', icon: BookOpen },
    { name: 'Progress Track', href: '/student/progress', icon: TrendingUp },
    { name: 'Attendance', href: '/student/attendance', icon: CalendarCheck },
    { name: 'Merchandise', href: '/student/merchandise', icon: Store },
    { name: 'My Orders', href: '/student/orders', icon: ShoppingBag },
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col min-h-screen shrink-0" suppressHydrationWarning>
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-800/80">
        <Link href="/" className="flex items-center gap-3 group">
          <BrandIcon className="w-9 h-9 rounded-xl group-hover:scale-105 transition-transform" iconClassName="w-4 h-4" />
          <div>
            <span className="text-lg font-bold tracking-wider text-white font-mono block leading-tight">
              GUITART
            </span>
            <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-widest">
              Student Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Student Badge Card — Clickable Avatar Section to Edit Profile */}
      {mounted && currentUser && (
        <Link
          href="/student/profile"
          className="mx-4 my-4 p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900 transition flex items-center gap-3 group cursor-pointer shadow-md"
          title="Click avatar section to edit your profile"
        >
          <img
            src={
              currentUser.avatarUrl ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80'
            }
            alt={currentUser.fullName || 'Student Avatar'}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80';
            }}
            className="w-10 h-10 rounded-xl object-cover border border-amber-500/40 group-hover:border-amber-400 group-hover:scale-105 transition-transform shrink-0"
          />
          <div className="overflow-hidden min-w-0">
            <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
              {currentUser.fullName}
            </p>
            <p className="text-[11px] text-amber-400 font-mono flex items-center gap-1.5">
              <span>{currentSkillLevel} Level</span>
              <span className="text-[9px] text-zinc-500 group-hover:text-amber-400/80 transition">Edit →</span>
            </p>
          </div>
        </Link>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto text-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href.includes('?') && pathname === item.href.split('?')[0]);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition ${
                isActive
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-amber-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Logout */}
      <div className="p-4 border-t border-zinc-800/80">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
