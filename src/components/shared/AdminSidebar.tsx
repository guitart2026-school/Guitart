'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  CalendarCheck,
  Package,
  ShoppingBag,
  Sliders,
  Settings,
  LogOut,
  Shield,
  ChevronRight,
  ReceiptText,
  Star,
} from 'lucide-react';
import { BrandIcon } from '@/components/shared/BrandLogo';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, currentUser, users, orders, reviews, adminName } = useStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const pendingApprovals = users.filter((u) => u.status === 'Pending').length;
  const pendingPayments = orders.filter((o) => o.paymentStatus === 'Pending').length;

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Approvals', href: '/admin/approvals', icon: UserCheck, badge: pendingApprovals },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Lessons', href: '/admin/lessons', icon: BookOpen },
    { name: 'Attendance', href: '/admin/attendance', icon: CalendarCheck },
    { name: 'Merchandise', href: '/admin/merchandise', icon: Package },
    { name: 'Orders & bKash', href: '/admin/orders', icon: ShoppingBag, badge: pendingPayments },
    { name: 'Billings', href: '/admin/billings', icon: ReceiptText },
    { name: 'Student Reviews', href: '/admin/reviews', icon: Star, badge: reviews?.length || 0 },
    { name: 'Homepage CMS', href: '/admin/cms', icon: Sliders },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col min-h-screen shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-800/80">
        <Link href="/" className="flex items-center gap-3 group">
          <BrandIcon className="w-9 h-9 rounded-xl group-hover:scale-105 transition-transform" iconClassName="w-5 h-5" />
          <div>
            <span className="text-lg font-bold tracking-wider text-white font-mono block leading-tight">
              GUITART
            </span>
            <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-widest">
              Admin Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Admin Card — Clickable to Admin Profile & Settings */}
      <Link
        href="/admin/settings"
        className="mx-4 my-4 p-3 rounded-2xl bg-amber-950/25 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-950/40 transition flex items-center gap-3 group cursor-pointer shadow-md"
        title="Click to edit Administrator profile & settings"
      >
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div className="overflow-hidden min-w-0">
          <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
            {currentUser?.fullName || adminName}
          </p>
          <p className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
            <span>Academy Director</span>
            <span className="text-[9px] text-zinc-500 group-hover:text-amber-400/80 transition">Edit →</span>
          </p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto text-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin/dashboard');

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
              {item.badge ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-zinc-950">
                  {item.badge}
                </span>
              ) : isActive ? (
                <ChevronRight className="w-4 h-4 text-amber-400" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Footer Logout */}
      <div className="p-4 border-t border-zinc-800/80">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 border border-transparent transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Admin</span>
        </button>
      </div>
    </aside>
  );
};
