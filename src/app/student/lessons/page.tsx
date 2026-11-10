'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Search, BookOpen, Play, Clock, Headphones, FileText, Phone } from 'lucide-react';
import { isValidMobile, isLessonUnlockedForStudent } from '@/lib/utils';

function StudentLessonsContent() {
  const { lessons, users, currentUser, lessonAccess, lessonProgress } = useStore();
  const searchParams = useSearchParams();
  const filterType = searchParams.get('type');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const studentId = currentUser?.id || '';
  const hasValidMobile = mounted ? isValidMobile(currentUser?.mobile || '') : true;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');

  // Filter lessons - Only unlocked lessons are visible to the student
  const filteredLessons = lessons.filter((lesson) => {
    const isUnlocked = isLessonUnlockedForStudent(lesson, currentUser, users, lessonAccess);

    // Student can ONLY see unlocked lessons
    if (!isUnlocked) return false;

    const matchesSearch =
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'All' || lesson.level === selectedLevel;

    if (filterType === 'video') {
      return matchesSearch && matchesLevel && !!lesson.videoUrl;
    }
    if (filterType === 'audio') {
      return matchesSearch && matchesLevel && !!lesson.audioUrl;
    }
    if (filterType === 'tabs') {
      return matchesSearch && matchesLevel && !!lesson.tabFileUrl;
    }

    return matchesSearch && matchesLevel;
  });

  return (
    <div className="px-6 space-y-6">
      {/* Missing Mobile Number Warning Banner */}
      {!hasValidMobile && currentUser?.role === 'student' && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <Phone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>11-Digit Mobile Contact Number Required</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500 text-zinc-950 font-mono text-[10px] font-black uppercase">
                  Action Required
                </span>
              </h4>
              <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                You must update your 11-digit mobile number in your profile before you can visit and practice lessons.
              </p>
            </div>
          </div>

          <Link
            href="/student/profile"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shrink-0 whitespace-nowrap shadow-md hover:scale-105 active:scale-95"
          >
            Update Mobile in Profile →
          </Link>
        </div>
      )}
      {/* Search & Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        {/* Search bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search unlocked lessons by title or topic..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Level Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs">
          <span className="text-zinc-400 font-mono text-[11px] shrink-0 mr-1">Level:</span>
          {['All', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition shrink-0 ${
                selectedLevel === lvl
                  ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-md'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Lessons Grid */}
      {filteredLessons.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8" />}
          title="No Unlocked Lessons Found"
          description="You currently don't have any unlocked lessons matching your search criteria."
          actionText="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedLevel('All');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => {
            const prog = lessonProgress.find(
              (lp) => lp.studentId === studentId && lp.lessonId === lesson.id
            );
            const lessonStatus = prog?.status || 'Unlocked';

            return (
              <div
                key={lesson.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 hover:border-amber-500/40 overflow-hidden transition flex flex-col justify-between shadow-xl"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-zinc-950">
                    <img
                      src={lesson.thumbnail}
                      alt={lesson.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-black/20 to-transparent" />

                    <div className="absolute top-3 left-3">
                      <StatusBadge status={lesson.level} />
                    </div>

                    <div className="absolute top-3 right-3">
                      <StatusBadge status={lessonStatus} />
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-lg shadow-amber-950/60">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                      <span>Lesson #{lesson.lessonNumber.toString().padStart(2, '0')}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> {lesson.durationMinutes} mins
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug">
                      {lesson.title}
                    </h3>

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {lesson.description}
                    </p>

                    {/* Media Badges */}
                    <div className="flex items-center gap-2 pt-2">
                      {lesson.videoUrl && (
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 flex items-center gap-1">
                          <Play className="w-2.5 h-2.5 text-amber-400" /> Video
                        </span>
                      )}
                      {lesson.audioUrl && (
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 flex items-center gap-1">
                          <Headphones className="w-2.5 h-2.5 text-amber-400" /> Audio Track
                        </span>
                      )}
                      {lesson.tabFileUrl && (
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 flex items-center gap-1">
                          <FileText className="w-2.5 h-2.5 text-amber-400" /> TAB Sheet
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  {!hasValidMobile && currentUser?.role === 'student' ? (
                    <Link
                      href="/student/profile"
                      className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Add Mobile to Visit Lesson →</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/student/lessons/${lesson.id}`}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs text-center transition block shadow-md shadow-amber-950/40"
                    >
                      Watch & Practice Lesson →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function StudentLessonsPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Academy Curriculum Lessons"
        subtitle="Explore video masterclasses, audio backing tracks, and downloadable TAB notation."
      />
      <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500">Loading lessons...</div>}>
        <StudentLessonsContent />
      </Suspense>
    </div>
  );
}
