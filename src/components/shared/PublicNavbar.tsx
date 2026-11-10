'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { Music, ShoppingBag, Menu, X, User, Shield } from 'lucide-react';
import { BrandIcon } from '@/components/shared/BrandLogo';

export const PublicNavbar: React.FC = () => {
  const pathname = usePathname() || '';
  const { cart, activeRole, currentUser, adminName } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Do not render PublicNavbar on student or admin dashboard routes
  const isDashboard = pathname.startsWith('/admin') || pathname.startsWith('/student');
  if (isDashboard) {
    return null;
  }

  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(pathname);
  const cartCount = mounted ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-20">
            {/* Left: Logo */}
            <div className="flex items-center shrink-0 z-10">
              <Link href="/" className="flex items-center gap-3 group">
                <BrandIcon className="w-10 h-10 rounded-xl group-hover:scale-105 transition-transform" />
                <div>
                  <span className="text-xl font-extrabold tracking-wider text-white font-mono">
                    GUITART<span className="text-amber-400">.</span>
                  </span>
                  <span className="block text-[10px] tracking-widest text-zinc-400 uppercase font-sans">
                    {adminName} Academy
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Nav Links (Centrally locked across all pages) */}
            <nav className="hidden md:flex items-center gap-7 lg:gap-8 text-sm font-medium text-zinc-300 absolute left-1/2 -translate-x-1/2 pointer-events-auto">
              <Link href="/#about" className="hover:text-amber-400 transition whitespace-nowrap">
                About
              </Link>
              <Link href="/#instructor" className="hover:text-amber-400 transition whitespace-nowrap">
                {adminName}
              </Link>
              <Link href="/#curriculum" className="hover:text-amber-400 transition whitespace-nowrap">
                Curriculum
              </Link>
              <Link href="/#lessons" className="hover:text-amber-400 transition whitespace-nowrap">
                Lessons
              </Link>
              <Link href="/#testimonials" className="hover:text-amber-400 transition whitespace-nowrap">
                Reviews
              </Link>
              <Link href="/#merchandise" className="hover:text-amber-400 transition whitespace-nowrap">
                Merchandise
              </Link>
            </nav>

            {/* Right: Actions */}
            <div className="hidden md:flex items-center gap-4 z-10">
              <Link
                href="/cart"
                className="relative p-2 text-zinc-300 hover:text-amber-400 transition bg-zinc-900 border border-zinc-800 rounded-xl"
                aria-label="View Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-zinc-950 text-[11px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {mounted && activeRole === 'admin' ? (
                <Link
                  href="/admin/dashboard"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" /> Admin Portal
                </Link>
              ) : mounted && activeRole === 'student' && currentUser ? (
                <Link
                  href="/student/dashboard"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition flex items-center gap-2"
                >
                  <User className="w-4 h-4" /> Dashboard ({currentUser?.fullName?.split(' ')[0]})
                </Link>
              ) : !isAuthPage ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white transition"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition shadow-lg shadow-amber-950/40"
                  >
                    Join Academy
                  </Link>
                </div>
              ) : null}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-3 z-10">
              <Link
                href="/cart"
                className="relative p-2 text-zinc-300 hover:text-amber-400 bg-zinc-900 border border-zinc-800 rounded-xl"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer"
                aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-zinc-950 border-b border-zinc-800 px-4 pt-2 pb-6 space-y-3 animate-fade-in">
            <Link
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-zinc-300 hover:text-amber-400 rounded-lg hover:bg-zinc-900"
            >
              About Guitart
            </Link>
            <Link
              href="/#instructor"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-zinc-300 hover:text-amber-400 rounded-lg hover:bg-zinc-900"
            >
              {adminName}
            </Link>
            <Link
              href="/#curriculum"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-zinc-300 hover:text-amber-400 rounded-lg hover:bg-zinc-900"
            >
              Curriculum Roadmap
            </Link>
            <Link
              href="/#lessons"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-zinc-300 hover:text-amber-400 rounded-lg hover:bg-zinc-900"
            >
              Lessons
            </Link>
            <Link
              href="/#testimonials"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-zinc-300 hover:text-amber-400 rounded-lg hover:bg-zinc-900"
            >
              Student Reviews
            </Link>
            <Link
              href="/#merchandise"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-zinc-300 hover:text-amber-400 rounded-lg hover:bg-zinc-900"
            >
              Merchandise Store
            </Link>
            <div className="pt-4 border-t border-zinc-800 flex flex-col gap-2">
              {mounted && currentUser ? (
                <Link
                  href={currentUser.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-center text-sm"
                >
                  Go to Portal
                </Link>
              ) : !isAuthPage ? (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-xl font-medium text-sm"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center text-zinc-950 bg-amber-500 rounded-xl font-bold text-sm"
                  >
                    Join Academy
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        )}
      </header>
      <div className="h-20 shrink-0" aria-hidden="true" />
    </>
  );
};
