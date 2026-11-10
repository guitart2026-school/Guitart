'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  TrendingUp,
  CalendarCheck,
  Play,
  ArrowRight,
  Sparkles,
  Star,
  Quote,
  MessageSquarePlus,
  Edit3,
  Trash2,
} from 'lucide-react';
import { StudentReviewModal } from '@/components/shared/StudentReviewModal';

import { isLessonUnlockedForStudent } from '@/lib/utils';

export default function StudentDashboardPage() {
  const { currentUser, users, lessons, lessonAccess, lessonProgress, attendance, reviews, deleteReview, adminName } = useStore();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const studentId = currentUser?.id || '';

  const studentInRoster = currentUser
    ? users.find(
        (u) =>
          u.id === currentUser.id ||
          (u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase())
      )
    : null;
  const currentSkillLevel = studentInRoster?.level || currentUser?.level || 'Beginner';

  // Check if this student already gave a review
  const myReview = reviews.find(
    (r) =>
      (currentUser?.email && r.studentEmail?.toLowerCase() === currentUser.email.toLowerCase()) ||
      (currentUser?.id && r.studentId === currentUser.id)
  );

  // Stats calculation
  const totalLessons = lessons.length;

  // Unlocked lessons for this student across all categories
  const unlockedLessons = lessons.filter((l) =>
    isLessonUnlockedForStudent(l, currentUser, users, lessonAccess)
  );
  const unlockedCount = unlockedLessons.length;

  // Completed lessons strictly among unlocked modules
  const completedList = unlockedLessons.filter((l) => {
    const lp = lessonProgress.find((p) => p.studentId === studentId && p.lessonId === l.id);
    return lp?.status === 'Completed';
  });
  const completedCount = completedList.length;

  // Overall progress is the percentage of Total Completed Lessons among Total Unlocked Modules
  const progressPercentage = unlockedCount > 0 ? Math.round((completedCount / unlockedCount) * 100) : 0;

  // Attendance stats for student
  const studentAtt = attendance.filter((a) => a.studentId === studentId);
  const totalAttSessions = studentAtt.length || 1;
  const presentCount = studentAtt.filter((a) => a.status === 'Present' || a.status === 'Late').length;
  const attendanceRate = Math.round((presentCount / totalAttSessions) * 100) || 100;

  // Recent unlocked lessons
  const recentLessons = unlockedLessons;

  return (
    <div className="space-y-8 pb-12">
      <DashboardHeader
        title={`Welcome back, ${currentUser?.fullName || 'Student'}! 👋`}
        subtitle="Track your guitar learning progress, resume unlocked lessons, and view attendance history."
      />

      <div className="px-6 space-y-8">
        {/* Top Hero Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl gold-border-glow">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Current Status: {currentSkillLevel} Level Student</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ready to Practice Your Alternate Picking & Phrasing?
            </h2>
            <p className="text-sm text-zinc-300">
              You have completed <span className="text-amber-400 font-bold">{completedCount}</span> out of{' '}
              <span className="text-white font-bold">{unlockedCount}</span> unlocked curriculum lessons (
              {progressPercentage}%). Keep up the daily streak!
            </p>
          </div>

          <Link
            href="/student/lessons"
            className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition shadow-lg shadow-amber-950/60 flex items-center gap-2 shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume Next Lesson</span>
          </Link>
        </div>

        {/* 4 Primary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Unlocked Modules
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{unlockedCount}</p>
            <p className="text-xs text-zinc-400">Curated by {adminName}</p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Completed Lessons
              </span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{completedCount}</p>
            <p className="text-xs text-emerald-400 font-semibold">100% Validated</p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Overall Progress
              </span>
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{progressPercentage}%</p>
            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Attendance Rate
              </span>
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{attendanceRate}%</p>
            <p className="text-xs text-zinc-400">Academy Sessions</p>
          </div>
        </div>

        {/* Recent & Unlocked Lessons List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>Available Curriculum Lessons</span>
            </h3>
            <Link
              href="/student/lessons"
              className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentLessons.map((lesson) => {
              const prog = lessonProgress.find(
                (lp) => lp.studentId === studentId && lp.lessonId === lesson.id
              );
              const lessonStatus = prog?.status || 'Unlocked';

              return (
                <div
                  key={lesson.id}
                  className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition flex flex-col justify-between space-y-4 shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <StatusBadge status={lesson.level} />
                      <StatusBadge status={lessonStatus} />
                    </div>

                    <div className="aspect-video rounded-xl overflow-hidden relative">
                      <img
                        src={lesson.thumbnail}
                        alt={lesson.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-lg">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-mono text-zinc-500 block mb-1">
                        Lesson #{lesson.lessonNumber.toString().padStart(2, '0')} • {lesson.durationMinutes} mins
                      </span>
                      <h4 className="text-base font-bold text-white leading-snug line-clamp-1">
                        {lesson.title}
                      </h4>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                        {lesson.description}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/student/lessons/${lesson.id}`}
                    className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold text-xs text-center transition block"
                  >
                    Open Lesson Video & Tabs →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Student Review & Feedback Section */}
        <div className="space-y-6 pt-4 border-t border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span>Academy Experience & Student Review</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Share your journey with {adminName} and inspire fellow guitarists across the community
              </p>
            </div>

            <div className="flex items-center gap-3">
              {myReview ? (
                <>
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete your review?')) {
                        await deleteReview(myReview.id);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Review</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-lg shadow-amber-950/60 flex items-center gap-2 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit My Review</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-lg shadow-amber-950/60 flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Give Student Review ⭐</span>
                </button>
              )}
            </div>
          </div>

          {/* Current Student Review Card Preview if exists */}
          {myReview && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 border border-amber-500/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Your Review is Live on Showcase</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(myReview.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>

              <p className="text-sm text-zinc-200 italic leading-relaxed">
                "{myReview.comment}"
              </p>

              <div className="flex items-center justify-between text-xs text-zinc-400 pt-3 border-t border-zinc-800">
                <span>Published as: <strong className="text-white">{myReview.name}</strong> ({myReview.level})</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal Dialog */}
      <StudentReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </div>
  );
}
