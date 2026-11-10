'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { Video, FileText, Headphones, Lock, RefreshCw, ShoppingBag } from 'lucide-react';

export const WhyUsSection: React.FC = () => {
  const { adminName } = useStore();

  const features = [
    {
      icon: Video,
      title: 'YouTube Unlisted HD Videos',
      description: 'High definition 4K multi-camera video breakdowns with close-up fingerboard angles and slow-motion picking reps.',
    },
    {
      icon: FileText,
      title: 'Downloadable PDF & TAB Notation',
      description: `Custom guitar tab sheets transcribed line-by-line by ${adminName} for every riff, solo, and exercise.`,
    },
    {
      icon: Headphones,
      title: 'Studio Backing Tracks',
      description: 'Jam along with backing tracks recorded in professional studio environments across multiple BPM tempos.',
    },
    {
      icon: Lock,
      title: 'Curated Lesson Unlocking',
      description: 'Admins curate your access step-by-step so you master each concept before advancing to complex solos.',
    },
    {
      icon: RefreshCw,
      title: 'Attendance & Progress Analytics',
      description: 'Track your weekly attendance percentage, completed module badges, and skill level milestones.',
    },
    {
      icon: ShoppingBag,
      title: 'Official Guitart Merchandise',
      description: 'Access signature Dunlop pick packs, genuine leather guitar straps, academy hoodies, and physical workbooks.',
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-zinc-950 via-zinc-900/40 to-zinc-950 border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-widest px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
            Platform Benefits
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Why Learn With <span className="text-amber-400">Guitart?</span>
          </h2>
          <p className="text-zinc-400 text-base">
            Designed specifically for Bangladesh's music community with local payment integration & premium learning tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 transition group backdrop-blur-sm space-y-4"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
