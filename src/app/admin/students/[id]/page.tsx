'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { StudentLevel } from '@/lib/types';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate, isLessonUnlockedForStudent } from '@/lib/utils';
import { Lock, Unlock, ArrowLeft, CheckSquare, Square, ShieldCheck, User, CheckCircle2, Ban, ChevronDown, Loader2 } from 'lucide-react';

export default function StudentAccessMatrixPage() {
  const params = useParams();
  const studentId = params.id as string;

  const { users, lessons, lessonAccess, toggleLessonAccess, bulkSetLessonAccess, updateUserStatus, updateUser } = useStore();

  const student = users.find((u) => u.id === studentId);

  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingLevel, setIsUpdatingLevel] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  if (!student) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Student Not Found</h2>
        <Link href="/admin/students" className="inline-block px-4 py-2 bg-amber-500 text-zinc-950 font-bold text-xs rounded-xl">
          Return to Student Roster
        </Link>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: 'Active' | 'Inactive') => {
    setStatusDropdownOpen(false);
    setIsUpdatingStatus(true);
    try {
      await updateUserStatus(student.id, newStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleLevelChange = async (newLevel: StudentLevel) => {
    setIsUpdatingLevel(true);
    try {
      await updateUser(student.id, { level: newLevel });
    } finally {
      setIsUpdatingLevel(false);
    }
  };

  const handleToggleSelect = (lessonId: string) => {
    if (selectedLessonIds.includes(lessonId)) {
      setSelectedLessonIds(selectedLessonIds.filter((id) => id !== lessonId));
    } else {
      setSelectedLessonIds([...selectedLessonIds, lessonId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedLessonIds.length === lessons.length) {
      setSelectedLessonIds([]);
    } else {
      setSelectedLessonIds(lessons.map((l) => l.id));
    }
  };

  const handleBulkUnlock = () => {
    if (!selectedLessonIds.length) return;
    bulkSetLessonAccess(student.id, selectedLessonIds, true);
    setSelectedLessonIds([]);
  };

  const handleBulkLock = () => {
    if (!selectedLessonIds.length) return;
    bulkSetLessonAccess(student.id, selectedLessonIds, false);
    setSelectedLessonIds([]);
  };

  return (
    <div className="space-y-8">
      <DashboardHeader
        title={`Access Permissions Matrix — ${student.fullName}`}
        subtitle={`Level: ${student.level} • Enrolled: ${formatDate(student.registrationDate)}`}
      />

      <div className="px-6 space-y-8 max-w-5xl mx-auto">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-400 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Student Roster
        </Link>

        {/* Student Overview Info Card */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <img
              src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
              alt={student.fullName}
              className="w-14 h-14 rounded-2xl object-cover border border-amber-500/40"
            />
            <div>
              <h2 className="text-lg font-bold text-white">{student.fullName}</h2>
              <p className="text-xs text-zinc-400 font-mono">{student.email} • {student.mobile}</p>
              <div className="flex items-center gap-2 pt-1.5">
                {/* Interactive Student Level Control */}
                <div className="inline-flex items-center">
                  {isUpdatingLevel ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-amber-400 border border-amber-500/30">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Level...</span>
                    </div>
                  ) : (
                    <div className="relative inline-flex items-center group">
                      <select
                        value={student.level || 'Beginner'}
                        onChange={(e) => handleLevelChange(e.target.value as StudentLevel)}
                        title="Change student level (syncs live to database)"
                        className={`appearance-none cursor-pointer pl-6 pr-7 py-0.5 rounded-full text-xs font-semibold border transition outline-none shadow-sm ${
                          student.level === 'Advanced'
                            ? 'bg-purple-950/70 text-purple-300 border-purple-500/40 hover:border-purple-400 hover:bg-purple-900/60'
                            : student.level === 'Intermediate'
                            ? 'bg-amber-950/70 text-amber-300 border-amber-500/40 hover:border-amber-400 hover:bg-amber-900/60'
                            : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-900/60'
                        }`}
                      >
                        <option value="Beginner" className="bg-zinc-950 text-emerald-400 font-semibold py-1">
                          Beginner
                        </option>
                        <option value="Intermediate" className="bg-zinc-950 text-amber-400 font-semibold py-1">
                          Intermediate
                        </option>
                        <option value="Advanced" className="bg-zinc-950 text-purple-400 font-semibold py-1">
                          Advanced
                        </option>
                      </select>
                      <span
                        className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none ${
                          student.level === 'Advanced'
                            ? 'bg-purple-400'
                            : student.level === 'Intermediate'
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                      />
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-white transition" />
                    </div>
                  )}
                </div>

                {/* Interactive Status Control */}
                <div className="inline-flex items-center">
                  {isUpdatingStatus ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-amber-400 border border-amber-500/30">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Syncing...</span>
                    </div>
                  ) : (
                    <div className="relative inline-flex items-center group">
                      <select
                        value={student.status}
                        onChange={(e) => handleStatusChange(e.target.value as 'Active' | 'Inactive')}
                        className={`appearance-none cursor-pointer pl-6 pr-7 py-0.5 rounded-full text-xs font-semibold border transition outline-none shadow-sm ${
                          student.status === 'Active'
                            ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-900/60'
                            : 'bg-rose-950/70 text-rose-300 border-rose-500/40 hover:border-rose-400 hover:bg-rose-900/60'
                        }`}
                      >
                        <option value="Active" className="bg-zinc-950 text-emerald-400 font-semibold py-1">
                          Active
                        </option>
                        <option value="Inactive" className="bg-zinc-950 text-rose-400 font-semibold py-1">
                          Inactive
                        </option>
                      </select>
                      <span
                        className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none ${
                          student.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                        }`}
                      />
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-white transition" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Access Control Toolbar */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={handleSelectAll}
            className="text-xs font-bold text-zinc-300 hover:text-amber-400 flex items-center gap-2"
          >
            {selectedLessonIds.length === lessons.length ? (
              <CheckSquare className="w-4 h-4 text-amber-400" />
            ) : (
              <Square className="w-4 h-4 text-zinc-500" />
            )}
            <span>Select All Lessons ({selectedLessonIds.length} selected)</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkUnlock}
              disabled={!selectedLessonIds.length}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition shadow-md flex items-center gap-1.5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unlock Selected</span>
            </button>

            <button
              onClick={handleBulkLock}
              disabled={!selectedLessonIds.length}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-md flex items-center gap-1.5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Selected</span>
            </button>
          </div>
        </div>

        {/* Lesson Access Matrix List */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Curriculum Modules Lock / Unlock Matrix</span>
          </h3>

          <div className="divide-y divide-zinc-800/80 text-xs">
            {lessons.map((lesson) => {
              const isUnlocked = isLessonUnlockedForStudent(lesson, student, users, lessonAccess);
              const isSelected = selectedLessonIds.includes(lesson.id);

              return (
                <div
                  key={lesson.id}
                  className={`py-4 flex items-center justify-between gap-4 px-2 rounded-xl transition ${
                    isSelected ? 'bg-amber-500/10 border border-amber-500/30' : 'hover:bg-zinc-800/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleSelect(lesson.id)}
                      className="text-zinc-400 hover:text-amber-400"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-600" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-zinc-400">
                          Lesson #{lesson.lessonNumber.toString().padStart(2, '0')}
                        </span>
                        <StatusBadge status={lesson.level} size="sm" />
                      </div>
                      <h4 className="text-sm font-bold text-white mt-0.5">{lesson.title}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <StatusBadge status={isUnlocked ? 'Unlocked' : 'Locked'} />

                    <button
                      onClick={() => toggleLessonAccess(student.id, lesson.id)}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-md ${
                        isUnlocked
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
                      }`}
                    >
                      {isUnlocked ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Lock Access</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Unlock Access</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
