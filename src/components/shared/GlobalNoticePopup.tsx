'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { Megaphone, X, Sparkles, AlertCircle, Info } from 'lucide-react';

export const GlobalNoticePopup: React.FC = () => {
  const { noticeBoard } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !noticeBoard?.isActive || !noticeBoard?.title?.trim()) {
      setIsOpen(false);
      return;
    }

    // Check if current version was already dismissed by user in this session
    try {
      const noticeKey = `guitart_notice_dismissed_${noticeBoard.updatedAt || 'v1'}`;
      const dismissed = sessionStorage.getItem(noticeKey);
      if (!dismissed) {
        // Small 800ms delay so the initial page render is smooth before popup appears
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn('sessionStorage notice check notice:', e);
    }
  }, [mounted, noticeBoard]);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      const noticeKey = `guitart_notice_dismissed_${noticeBoard?.updatedAt || 'v1'}`;
      sessionStorage.setItem(noticeKey, 'true');
    } catch (e) {
      console.warn('Could not save notice dismissal', e);
    }
  };

  if (!isOpen || !noticeBoard?.isActive || !noticeBoard?.title?.trim()) {
    return null;
  }

  const getNoticeIcon = () => {
    switch (noticeBoard.type) {
      case 'event':
        return <Sparkles className="w-6 h-6 text-purple-400" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-rose-400" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-400" />;
      case 'announcement':
      default:
        return <Megaphone className="w-6 h-6 text-amber-400" />;
    }
  };

  const getBadgeStyle = () => {
    switch (noticeBoard.type) {
      case 'event':
        return 'bg-purple-500/15 border-purple-500/30 text-purple-300';
      case 'warning':
        return 'bg-rose-500/15 border-rose-500/30 text-rose-300';
      case 'info':
        return 'bg-blue-500/15 border-blue-500/30 text-blue-300';
      case 'announcement':
      default:
        return 'bg-amber-500/15 border-amber-500/30 text-amber-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-zinc-900/95 border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative gold-border-glow animate-scale-up">
        {/* Close (X) button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          aria-label="Close announcement"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto shadow-xl shadow-amber-950/40">
            {getNoticeIcon()}
          </div>

          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider ${getBadgeStyle()}`}>
            <span>{noticeBoard.type || 'Announcement'}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight">
            {noticeBoard.title}
          </h3>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
            {noticeBoard.message}
          </p>
        </div>
      </div>
    </div>
  );
};
