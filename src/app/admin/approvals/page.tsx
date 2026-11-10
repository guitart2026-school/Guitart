'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { User, StudentLevel } from '@/lib/types';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';
import {
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Loader2,
  ArrowRight,
  Sparkles,
  Calendar,
  Phone,
  Mail,
  Award,
  X,
  Check,
  Ban,
  User as UserIcon,
  RefreshCw,
  Users,
} from 'lucide-react';

export default function AdminApprovalsPage() {
  const { users, setUsers, approveUser, denyUser } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal states
  const [userToDeny, setUserToDeny] = useState<User | null>(null);
  const [isDenying, setIsDenying] = useState(false);

  // Live Sync with database on mount
  const syncWithDatabase = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
        }
      }
    } catch (err) {
      console.warn('Sync users error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncWithDatabase();
  }, []);

  // Filter ONLY students with status === 'Pending'
  const pendingStudents = users.filter(
    (u) => u.role === 'student' && u.status === 'Pending'
  );

  const filteredPendingStudents = pendingStudents.filter((student) => {
    const matchesSearch =
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.mobile.includes(searchQuery);

    const matchesLevel = selectedLevel === 'All' || student.level === selectedLevel;

    return matchesSearch && matchesLevel;
  });

  const handleApprove = async (studentId: string) => {
    setProcessingId(studentId);
    try {
      await approveUser(studentId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmDeny = async () => {
    if (!userToDeny) return;
    setIsDenying(true);
    try {
      await denyUser(userToDeny.id);
      setUserToDeny(null);
    } finally {
      setIsDenying(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <DashboardHeader
        title="Student Registration Approvals"
        subtitle="Review new student enrollment applications. Approved students are automatically marked as Active and granted immediate access to Academy lessons."
      />

      <div className="px-6 space-y-6">
        {/* Top Control & Metric Bar */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-amber-500/30 space-y-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white">Pending Approval Queue</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-zinc-950 font-black text-xs">
                    {pendingStudents.length} Pending
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  New student registrations require your verification to unlock lesson curriculum.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={syncWithDatabase}
                disabled={isSyncing}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                title="Fetch latest student registrations from MongoDB database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
                <span>{isSyncing ? 'Syncing DB...' : 'Sync Database'}</span>
              </button>

              <Link
                href="/admin/students"
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white font-bold text-xs transition flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Enrolled Roster ({users.filter((u) => u.role === 'student' && u.status === 'Active').length}) →</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pending student by name, email, mobile..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex items-center gap-3 text-xs w-full md:w-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400 font-mono text-[11px]">Skill Level:</span>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 text-xs cursor-pointer"
              >
                <option value="All">All Skill Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {(searchQuery || selectedLevel !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLevel('All');
                }}
                className="text-[11px] text-amber-400 hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Pending Student Cards List */}
        {filteredPendingStudents.length === 0 ? (
          <div className="p-12 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center text-amber-400">
              <UserCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">
                {pendingStudents.length === 0
                  ? 'No Pending Student Approvals 🎉'
                  : 'No matching applicants found'}
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                {pendingStudents.length === 0
                  ? 'All student registrations have been reviewed. When new students register on Guitart Academy, they will appear here for your verification.'
                  : 'Try adjusting your search criteria or skill level filter.'}
              </p>
            </div>

            {pendingStudents.length === 0 && (
              <div className="pt-2">
                <Link
                  href="/admin/students"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition inline-flex items-center gap-1.5 shadow-md"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>View All Enrolled Students Roster →</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Showing {filteredPendingStudents.length} Pending {filteredPendingStudents.length === 1 ? 'Applicant' : 'Applicants'}
              </span>
              <span className="text-[11px] text-amber-400 font-mono">
                Clicking Approve activates account & unlocks Lesson 1
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredPendingStudents.map((student) => {
                const isProcessing = processingId === student.id;

                return (
                  <div
                    key={student.id}
                    className="p-5 sm:p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                  >
                    {/* Left Profile Info */}
                    <div className="flex items-start sm:items-center gap-4 min-w-0">
                      <img
                        src={
                          student.avatarUrl ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={student.fullName}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/30 shrink-0 shadow-md"
                      />

                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-extrabold text-white truncate">
                            {student.fullName}
                          </h3>
                          <StatusBadge status="Pending" size="sm" />
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-amber-400 font-bold">
                            {student.level || 'Beginner'} Level
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 font-mono">
                          <span className="flex items-center gap-1 text-zinc-300">
                            <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">{student.email}</span>
                          </span>

                          <span className="flex items-center gap-1 text-zinc-300">
                            <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{student.mobile || 'No Mobile Provided'}</span>
                          </span>

                          {student.dateOfBirth && (
                            <span className="flex items-center gap-1 text-zinc-400">
                              <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                              <span>DOB: {student.dateOfBirth}</span>
                            </span>
                          )}

                          <span className="flex items-center gap-1 text-zinc-400">
                            <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            <span>Registered: {formatDate(student.registrationDate)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex items-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-800">
                      {isProcessing ? (
                        <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 text-amber-400 font-bold text-xs border border-amber-500/30">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Activating...</span>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(student.id)}
                            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs transition shadow-md shadow-emerald-950/40 flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                            title="Approve student: sets status to Active and unlocks Lesson 1"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Approve Student</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setUserToDeny(student)}
                            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-rose-950/60 border border-zinc-700 hover:border-rose-500/40 text-zinc-300 hover:text-rose-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                            title="Deny registration"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Deny</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Deny Confirmation Modal */}
      {userToDeny && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-rose-500/40 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-rose-400 font-extrabold">
                <Ban className="w-5 h-5" />
                <span>Deny Student Registration</span>
              </div>
              <button
                onClick={() => setUserToDeny(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-zinc-300">
              <p>
                Are you sure you want to deny the registration application for{' '}
                <span className="font-bold text-white">{userToDeny.fullName}</span> ({userToDeny.email})?
              </p>
              <p className="text-zinc-500">
                Their account status will be set to <span className="text-rose-400 font-bold">Rejected</span> and they will not be granted curriculum access.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDeny(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDeny}
                disabled={isDenying}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isDenying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                <span>{isDenying ? 'Denying...' : 'Confirm Deny'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
