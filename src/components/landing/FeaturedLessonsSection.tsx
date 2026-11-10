'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Play, Clock, Sparkles, CheckCircle2 } from 'lucide-react';

export const FeaturedLessonsSection: React.FC = () => {
  const { lessons } = useStore();

  // Filter lessons that have been specifically ticked by admin to publish on homepage
  const publicLessons = lessons.filter((l) => l.isPublic);
  // Fallback if none ticked yet: show the first introductory lesson
  const featured = publicLessons.length > 0 ? publicLessons : lessons.filter((l) => l.lessonNumber === 1);

  return (
    <section id="lessons" className="py-24 bg-zinc-950 border-b border-zinc-800/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-widest px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Public Masterclass Previews</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Featured Academy <span className="text-amber-400">Lessons</span>
            </h2>
            <p className="text-zinc-400 text-base">
              Explore publicly unlocked curriculum lessons. Watch high-definition video masterclasses, stream audio practice tracks, and download professional TABs for free.
            </p>
          </div>
        </div>

        {featured.length === 0 ? (
          <div className="p-12 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-3">
            <p className="text-sm text-zinc-400">No public lessons are currently published on the homepage.</p>
          </div>
        ) : (
          <div
            className={`grid gap-8 ${
              featured.length === 1
                ? 'grid-cols-1 max-w-xl mx-auto'
                : featured.length === 2
                ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {featured.map((lesson) => (
              <div
                key={lesson.id}
                className="group rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between shadow-xl"
              >
                <div>
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={lesson.thumbnail}
                      alt={lesson.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                    <div className="absolute top-3 left-3">
                      <StatusBadge status={lesson.level} />
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Unlocked</span>
                      </span>
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-500 text-zinc-950 group-hover:scale-115 transition-transform shadow-lg shadow-amber-950/60">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                      <span>Lesson #{lesson.lessonNumber.toString().padStart(2, '0')}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> {lesson.durationMinutes} mins
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition leading-snug">
                      {lesson.title}
                    </h3>

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {lesson.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href={`/lessons/${lesson.id}`}
                    className="w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md shadow-amber-950/40 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Watch Unlocked Lesson</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
