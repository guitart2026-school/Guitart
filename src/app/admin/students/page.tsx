'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { User, UserStatus, StudentLevel } from '@/lib/types';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate, isLessonUnlockedForStudent } from '@/lib/utils';
import {
  Users,
  Search,
  Filter,
  Lock,
  Unlock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Ban,
  ChevronDown,
  Loader2,
  UserCheck,
  UserX,
  Trash2,
  AlertTriangle,
  X,
  Clock,
  Download,
  Mail,
  Phone,
  Calendar,
  Award,
  BookOpen,
  TrendingUp,
  CalendarCheck,
  Copy,
  Check,
  ExternalLink,
  Shield,
} from 'lucide-react';

export default function AdminStudentsPage() {
  const {
    users,
    lessons,
    lessonAccess,
    lessonProgress,
    attendance,
    updateUserStatus,
    updateUser,
    deleteUser,
    approveUser,
    addToast,
  } = useStore();

  const allStudents = users.filter((u) => u.role === 'student');
  const enrolledStudents = allStudents.filter((u) => u.status !== 'Pending');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updatingLevelId, setUpdatingLevelId] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<User | null>(null);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const totalEnrolled = enrolledStudents.length;
  const activeCount = enrolledStudents.filter((s) => s.status === 'Active').length;
  const pendingCount = allStudents.filter((s) => s.status === 'Pending').length;
  const inactiveCount = enrolledStudents.filter((s) => s.status === 'Inactive' || s.status === 'Rejected').length;

  const filteredStudents = enrolledStudents.filter((std) => {
    const matchesSearch =
      std.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      std.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      std.mobile.includes(searchQuery) ||
      std.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'All' || std.level === selectedLevel;
    const matchesStatus = selectedStatus === 'All' || std.status === selectedStatus;

    return matchesSearch && matchesLevel && matchesStatus;
  });

  const handleStatusChange = async (studentId: string, newStatus: UserStatus) => {
    setUpdatingId(studentId);
    try {
      if (newStatus === 'Active') {
        await approveUser(studentId);
      } else {
        await updateUserStatus(studentId, newStatus);
      }
      if (selectedStudentForDetails && selectedStudentForDetails.id === studentId) {
        setSelectedStudentForDetails({ ...selectedStudentForDetails, status: newStatus });
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLevelChange = async (studentId: string, newLevel: StudentLevel) => {
    setUpdatingLevelId(studentId);
    try {
      await updateUser(studentId, { level: newLevel });
      if (selectedStudentForDetails && selectedStudentForDetails.id === studentId) {
        setSelectedStudentForDetails({ ...selectedStudentForDetails, level: newLevel });
      }
    } finally {
      setUpdatingLevelId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      await deleteUser(studentToDelete.id);
      if (selectedStudentForDetails && selectedStudentForDetails.id === studentToDelete.id) {
        setSelectedStudentForDetails(null);
      }
      setStudentToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast(`Copied ${key} to clipboard! 📋`, 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // CSV Export with all filled up user details
  const handleExportCSV = () => {
    const exportData = filteredStudents.length > 0 ? filteredStudents : enrolledStudents;

    if (exportData.length === 0) {
      addToast('No student data available to export.', 'error');
      return;
    }

    const headers = [
      'Student ID',
      'Full Name',
      'Email Address',
      'Mobile Number',
      'Date of Birth',
      'Guitar Skill Level',
      'Account Status',
      'Registration Date',
      'Role',
      'Unlocked Lessons Count',
      'Completed Lessons Count',
      'Total Number of Attendance',
      'Present Attendance Count',
    ];

    const rows = exportData.map((std) => {
      const unlockedCount = lessons.filter((l) => isLessonUnlockedForStudent(l, std, users, lessonAccess)).length;
      const completedCount = lessonProgress.filter((lp) => lp.studentId === std.id && lp.status === 'Completed').length;
      const studentAttendance = attendance.filter((a) => a.studentId === std.id);
      const totalAttendance = studentAttendance.length;
      const presentAttendance = studentAttendance.filter((a) => a.status === 'Present').length;

      return [
        std.id,
        std.fullName,
        std.email,
        std.mobile || '',
        std.dateOfBirth || 'N/A',
        std.level || 'Beginner',
        std.status,
        std.registrationDate ? formatDate(std.registrationDate) : 'N/A',
        std.role,
        unlockedCount,
        completedCount,
        totalAttendance,
        presentAttendance,
      ];
    });

    const csvContent = [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map((row) =>
        row.map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `guitart_students_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast(`Exported ${exportData.length} student records to CSV! 📥`, 'success');
  };

  return (
    <div className="space-y-8 pb-12">
      <DashboardHeader
        title="Student Roster Management"
        subtitle="Manage student profiles, live active/inactive status, enrollment levels, and lesson access permissions."
      />

      <div className="px-6 space-y-6">
        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => setSelectedStatus('All')}
            className={`p-4 rounded-2xl bg-zinc-900 border transition cursor-pointer flex items-center justify-between ${
              selectedStatus === 'All'
                ? 'border-amber-500/60 bg-amber-500/5 ring-1 ring-amber-500/40'
                : 'border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Total Enrolled
              </span>
              <p className="text-2xl font-extrabold text-white">{totalEnrolled}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <Link
            href="/admin/approvals"
            className="p-4 rounded-2xl bg-zinc-900 border border-amber-500/40 hover:border-amber-400 transition cursor-pointer flex items-center justify-between shadow-sm"
          >
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Pending Approvals
              </span>
              <p className="text-2xl font-extrabold text-amber-400">{pendingCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500 text-zinc-950 font-black text-xs">
              Review →
            </div>
          </Link>

          <div
            onClick={() => setSelectedStatus('Active')}
            className={`p-4 rounded-2xl bg-zinc-900 border transition cursor-pointer flex items-center justify-between ${
              selectedStatus === 'Active'
                ? 'border-emerald-500/60 bg-emerald-500/5 ring-1 ring-emerald-500/40'
                : 'border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Students
              </span>
              <p className="text-2xl font-extrabold text-white">{activeCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => setSelectedStatus('Inactive')}
            className={`p-4 rounded-2xl bg-zinc-900 border transition cursor-pointer flex items-center justify-between ${
              selectedStatus === 'Inactive'
                ? 'border-rose-500/60 bg-rose-500/5 ring-1 ring-rose-500/40'
                : 'border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                Inactive / Rejected
              </span>
              <p className="text-2xl font-extrabold text-white">{inactiveCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <UserX className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filters & Export Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, email, mobile, ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
            {/* Level Select */}
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400 font-mono text-[11px]">Level:</span>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 text-xs cursor-pointer"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Status Select */}
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400 font-mono text-[11px]">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 text-xs cursor-pointer"
              >
                <option value="All">All Enrolled ({totalEnrolled})</option>
                <option value="Active">Active ({activeCount})</option>
                <option value="Inactive">Inactive ({inactiveCount})</option>
              </select>
            </div>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-md hover:scale-105 active:scale-95 cursor-pointer ml-auto md:ml-0"
              title="Export student roster with complete details as CSV file"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Export CSV</span>
            </button>

            {(searchQuery || selectedLevel !== 'All' || selectedStatus !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLevel('All');
                  setSelectedStatus('All');
                }}
                className="text-[11px] font-mono text-amber-400 hover:text-amber-300 underline cursor-pointer ml-1"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Student Table */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Enrolled Students ({filteredStudents.length})</span>
            </h3>
            <span className="text-xs text-zinc-500 font-mono hidden md:inline-block">
              Select status to update & sync live with database
            </span>
          </div>

          {filteredStudents.length === 0 ? (
            <EmptyState
              icon={<Users className="w-8 h-8" />}
              title="No Students Found"
              description="No student accounts matched your search criteria."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase tracking-wider">
                    <th className="pb-3 px-4 whitespace-nowrap">Student Name</th>
                    <th className="pb-3 px-4 whitespace-nowrap">Email</th>
                    <th className="pb-3 px-4 whitespace-nowrap">Mobile</th>
                    <th className="pb-3 px-4 whitespace-nowrap">Level</th>
                    <th className="pb-3 px-4 whitespace-nowrap">Status & Sync</th>
                    <th className="pb-3 px-4 whitespace-nowrap">Enrolled</th>
                    <th className="pb-3 px-4 text-right whitespace-nowrap">Actions / Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {filteredStudents.map((student) => {
                    const isUpdating = updatingId === student.id;
                    const isActive = student.status === 'Active';

                    return (
                      <tr key={student.id} className="hover:bg-zinc-800/40 transition group">
                        {/* Clickable Student Name */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForDetails(student)}
                            className="flex items-center gap-3 text-left group/name cursor-pointer focus:outline-none"
                            title="Click to view all profile info filled up by this student"
                          >
                            <img
                              src={
                                student.avatarUrl ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
                              }
                              alt={student.fullName}
                              className="w-8 h-8 rounded-full object-cover border border-amber-500/30 group-hover/name:border-amber-400 group-hover/name:scale-105 transition shrink-0"
                            />
                            <span className="font-bold text-white group-hover/name:text-amber-300 transition whitespace-nowrap">
                              {student.fullName}
                            </span>
                          </button>
                        </td>

                        <td className="py-4 px-4 text-zinc-300 font-mono whitespace-nowrap">{student.email}</td>
                        <td className="py-4 px-4 text-zinc-300 font-mono whitespace-nowrap">{student.mobile}</td>
                        
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="inline-flex items-center">
                            {updatingLevelId === student.id ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-850 text-amber-400 border border-amber-500/30">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Level...</span>
                              </div>
                            ) : (
                              <div className="relative inline-flex items-center group">
                                <select
                                  value={student.level || 'Beginner'}
                                  onChange={(e) =>
                                    handleLevelChange(student.id, e.target.value as StudentLevel)
                                  }
                                  title="Change student level (syncs live to database)"
                                  className={`appearance-none cursor-pointer pl-6 pr-7 py-1 rounded-full text-xs font-semibold border transition outline-none shadow-sm ${
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
                        </td>

                        {/* Interactive Status Column */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="inline-flex items-center">
                            {isUpdating ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-850 text-amber-400 border border-amber-500/30">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Syncing...</span>
                              </div>
                            ) : (
                              <div className="relative inline-flex items-center group">
                                <select
                                  value={student.status}
                                  onChange={(e) =>
                                    handleStatusChange(student.id, e.target.value as UserStatus)
                                  }
                                  title="Change student status (syncs live to database)"
                                  className={`appearance-none cursor-pointer pl-6 pr-7 py-1 rounded-full text-xs font-semibold border transition outline-none shadow-sm ${
                                    isActive
                                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-900/60'
                                      : student.status === 'Pending'
                                      ? 'bg-amber-950/70 text-amber-300 border-amber-500/40 hover:border-amber-400 hover:bg-amber-900/60'
                                      : 'bg-rose-950/70 text-rose-300 border-rose-500/40 hover:border-rose-400 hover:bg-rose-900/60'
                                  }`}
                                >
                                  <option value="Active" className="bg-zinc-950 text-emerald-400 font-semibold py-1">
                                    Active
                                  </option>
                                  <option value="Inactive" className="bg-zinc-950 text-rose-400 font-semibold py-1">
                                    Inactive
                                  </option>
                                  <option value="Rejected" className="bg-zinc-950 text-rose-400 font-semibold py-1">
                                    Rejected
                                  </option>
                                </select>
                                <span
                                  className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none ${
                                    isActive
                                      ? 'bg-emerald-400 animate-pulse'
                                      : student.status === 'Pending'
                                      ? 'bg-amber-400 animate-pulse'
                                      : 'bg-rose-400'
                                  }`}
                                />
                                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-white transition" />
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4 text-zinc-400 font-mono whitespace-nowrap">
                          {formatDate(student.registrationDate)}
                        </td>

                        {/* Action Column: Inactive students get Delete option, Active students get Manage Access Matrix */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {isActive ? (
                              <Link
                                href={`/admin/students/${student.id}`}
                                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition inline-flex items-center gap-1 shadow-md hover:scale-105 active:scale-95"
                              >
                                <Lock className="w-3 h-3" /> Manage Access Matrix →
                              </Link>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setStudentToDelete(student)}
                                className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 hover:border-rose-600 text-rose-300 hover:text-white font-bold text-xs transition inline-flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Student</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Student Information Inspection Modal */}
      {selectedStudentForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Avatar and Basic Info */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-5">
              <div className="flex items-center gap-4">
                <img
                  src={
                    selectedStudentForDetails.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={selectedStudentForDetails.fullName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 shadow-lg shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-white leading-tight">
                      {selectedStudentForDetails.fullName}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      {selectedStudentForDetails.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                    <span>ID: {selectedStudentForDetails.id}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedStudentForDetails.id, 'ID')}
                      className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition"
                      title="Copy Student ID"
                    >
                      {copiedKey === 'ID' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudentForDetails(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Bar inside Modal */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-850 text-center">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                  Unlocked Lessons
                </span>
                <span className="text-lg font-black text-amber-400">
                  {lessons.filter((l) => isLessonUnlockedForStudent(l, selectedStudentForDetails, users, lessonAccess)).length} / {lessons.length}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-850 text-center">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                  Completed Lessons
                </span>
                <span className="text-lg font-black text-emerald-400">
                  {lessonProgress.filter((lp) => lp.studentId === selectedStudentForDetails.id && lp.status === 'Completed').length}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-850 text-center">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                  Attendance Recorded
                </span>
                <span className="text-lg font-black text-purple-400">
                  {attendance.filter((a) => a.studentId === selectedStudentForDetails.id && a.status === 'Present').length} Sessions
                </span>
              </div>
            </div>

            {/* Complete Filled Up Details Grid */}
            <div className="space-y-4 text-xs">
              <h4 className="font-mono font-bold text-zinc-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Student Profile & Contact Details</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Email Info */}
                <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase flex items-center gap-1">
                    <Mail className="w-3 h-3 text-amber-400" /> Email Address
                  </span>
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <span className="font-mono text-zinc-200 truncate">{selectedStudentForDetails.email}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedStudentForDetails.email, 'Email')}
                      className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition shrink-0"
                      title="Copy Email"
                    >
                      {copiedKey === 'Email' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Mobile Info */}
                <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase flex items-center gap-1">
                    <Phone className="w-3 h-3 text-amber-400" /> Mobile Number
                  </span>
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <span className="font-mono text-zinc-200">{selectedStudentForDetails.mobile || 'N/A'}</span>
                    {selectedStudentForDetails.mobile && (
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedStudentForDetails.mobile, 'Mobile')}
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition shrink-0"
                        title="Copy Mobile"
                      >
                        {copiedKey === 'Mobile' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-400" /> Date of Birth
                  </span>
                  <p className="text-zinc-200 font-semibold pt-0.5">
                    {selectedStudentForDetails.dateOfBirth
                      ? formatDate(selectedStudentForDetails.dateOfBirth)
                      : 'Not provided'}
                  </p>
                </div>

                {/* Registration Date */}
                <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> Enrolled / Registered Date
                  </span>
                  <p className="text-zinc-200 font-semibold pt-0.5">
                    {formatDate(selectedStudentForDetails.registrationDate)}
                  </p>
                </div>
              </div>

              {/* Live Status & Skill Level Administrative Controls */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
                <h5 className="font-mono font-bold text-zinc-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Administrative Controls & Classification</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase font-bold">
                      Guitar Skill Level (Live Sync)
                    </label>
                    <select
                      value={selectedStudentForDetails.level || 'Beginner'}
                      onChange={(e) => handleLevelChange(selectedStudentForDetails.id, e.target.value as StudentLevel)}
                      className="w-full py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-700 text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase font-bold">
                      Account Status (Live Sync)
                    </label>
                    <select
                      value={selectedStudentForDetails.status}
                      onChange={(e) => handleStatusChange(selectedStudentForDetails.id, e.target.value as UserStatus)}
                      className="w-full py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-bold text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Pending">Pending</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between flex-wrap gap-3">
              <Link
                href={`/admin/students/${selectedStudentForDetails.id}`}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition inline-flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Open Full Access Permissions Matrix →</span>
              </Link>

              <button
                type="button"
                onClick={() => setSelectedStudentForDetails(null)}
                className="px-4 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Inactive Student Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md bg-zinc-950 border border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2.5 text-rose-400 font-bold text-base">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span>Delete Inactive Student</span>
              </div>
              <button
                onClick={() => setStudentToDelete(null)}
                disabled={isDeleting}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-zinc-300 leading-relaxed">
                Are you sure you want to permanently delete this student from the academy database?
              </p>

              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                <img
                  src={
                    studentToDelete.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={studentToDelete.fullName}
                  className="w-10 h-10 rounded-xl object-cover border border-zinc-700 shrink-0"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{studentToDelete.fullName}</h4>
                  <p className="text-[11px] font-mono text-zinc-400">{studentToDelete.email}</p>
                  <p className="text-[10px] font-mono text-zinc-500">
                    Mobile: {studentToDelete.mobile} • Level: {studentToDelete.level}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] leading-tight">
                ⚠️ This will permanently remove the student&apos;s account, lesson permissions, and progress tracking. This action cannot be undone.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Student</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
