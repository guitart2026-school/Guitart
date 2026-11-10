'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { UserCheck, Shield, UserX, Sparkles, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export const RoleSwitcherBanner: React.FC = () => {
  const { activeRole, currentUser, switchUserRole, selectStudentUser, users } = useStore();
  const [isMinimized, setIsMinimized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-gradient-to-r from-zinc-900 via-amber-950/40 to-zinc-900 border-b border-amber-500/20 text-xs px-4 py-2 text-zinc-300 min-h-[41px] relative z-50" />
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="px-3 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-amber-400 border border-amber-500/40 text-[11px] font-mono shadow-xl backdrop-blur-md flex items-center gap-1.5 transition"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Demo Role Switcher</span>
          <ChevronDown className="w-3 h-3 text-zinc-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-zinc-900 via-amber-950/40 to-zinc-900 border-b border-amber-500/20 text-xs px-4 py-2 text-zinc-300 flex flex-wrap items-center justify-between gap-3 relative z-50 backdrop-blur-md">
      <div className="flex items-center gap-2 font-medium">
        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
        <span className="text-amber-400 font-semibold uppercase tracking-wider text-[11px]">Interactive Demo Mode</span>
        <span className="text-zinc-400 hidden sm:inline">| Session Status:</span>
        <span className="px-2 py-0.5 rounded bg-zinc-800 text-white font-semibold flex items-center gap-1.5 border border-zinc-700">
          {activeRole === 'admin' ? (
            <>
              <Shield className="w-3.5 h-3.5 text-amber-400" /> Admin ({currentUser?.fullName})
            </>
          ) : activeRole === 'student' && currentUser ? (
            <>
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Student ({currentUser?.fullName} - {currentUser?.level})
            </>
          ) : (
            <>
              <UserX className="w-3.5 h-3.5 text-zinc-400" /> Guest (Not Signed In)
            </>
          )}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-zinc-400 text-[11px]">Quick Switcher:</span>
        
        <button
          onClick={() => switchUserRole('student')}
          className={`px-2.5 py-1 rounded text-xs transition font-medium flex items-center gap-1 border ${
            activeRole === 'student'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
          }`}
        >
          <UserCheck className="w-3 h-3" /> Student
        </button>

        {activeRole === 'student' && (
          <select
            value={currentUser?.id || ''}
            onChange={(e) => selectStudentUser(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 text-zinc-200 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-amber-500"
          >
            {users.map((std) => (
              <option key={std.id} value={std.id}>
                {std.fullName} ({std.level})
              </option>
            ))}
          </select>
        )}

        <button
          onClick={() => switchUserRole('admin')}
          className={`px-2.5 py-1 rounded text-xs transition font-medium flex items-center gap-1 border ${
            activeRole === 'admin'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
          }`}
        >
          <Shield className="w-3 h-3" /> Admin
        </button>

        <button
          onClick={() => switchUserRole('guest')}
          className={`px-2.5 py-1 rounded text-xs transition font-medium flex items-center gap-1 border ${
            activeRole === 'guest'
              ? 'bg-zinc-700 text-white border-zinc-600'
              : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
          }`}
        >
          <UserX className="w-3 h-3" /> Guest (Logout)
        </button>

        <div className="h-4 w-px bg-zinc-700 mx-1 hidden sm:block"></div>

        <Link
          href={activeRole === 'admin' ? '/admin/dashboard' : activeRole === 'student' ? '/student/dashboard' : '/login'}
          className="text-amber-400 hover:text-amber-300 underline font-medium text-xs ml-1"
        >
          {activeRole === 'admin' ? 'Admin Portal →' : activeRole === 'student' ? 'Student Portal →' : 'Sign In →'}
        </Link>

        <button
          onClick={() => setIsMinimized(true)}
          className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition ml-1"
          title="Minimize Demo Banner"
          aria-label="Minimize Demo Banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

