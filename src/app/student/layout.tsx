'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { StudentSidebar } from '@/components/shared/StudentSidebar';
import { X, Loader2 } from 'lucide-react';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser, isAuthLoading } = useStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!currentUser) {
        router.replace('/login');
      } else if (currentUser.role === 'admin') {
        router.replace('/admin/dashboard');
      } else if (currentUser.role === 'student' && currentUser.status === 'Pending') {
        router.replace('/waiting-approval');
      } else if (currentUser.role === 'student' && currentUser.status === 'Rejected') {
        router.replace('/waiting-approval?status=rejected');
      }
    }
  }, [currentUser, isAuthLoading, router]);

  // If still resolving authentication or logged out, show sleek loading while redirecting
  if (isAuthLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-3 text-amber-400 font-mono text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{isAuthLoading ? 'Loading Guitart Academy...' : 'Redirecting to login...'}</span>
        </div>
      </div>
    );
  }

  // If student is pending/rejected, show temporary loading while redirecting
  if (currentUser.role === 'student' && currentUser.status !== 'Active') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-amber-400 font-mono text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Verifying academy approval status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <StudentSidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 bg-zinc-950 h-full shadow-2xl flex flex-col">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <StudentSidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
