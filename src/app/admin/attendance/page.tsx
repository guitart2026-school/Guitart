'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate, exportToCSV } from '@/lib/utils';
import { AttendanceStatus } from '@/lib/types';
import { CalendarCheck, Plus, Download, Search, Filter, CheckCircle2, UserCheck, Calendar } from 'lucide-react';

export default function AdminAttendancePage() {
  const { attendance, users, recordAttendance } = useStore();

  const students = users.filter((u) => u.role === 'student');

  // New Record Form State
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attStatus, setAttStatus] = useState<AttendanceStatus>('Present');
  const [attNotes, setAttNotes] = useState('');

  // Filters State
  const [filterStudentId, setFilterStudentId] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterYear, setFilterYear] = useState('All');

  const handleRecordAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) return;

    recordAttendance({
      studentId: student.id,
      studentName: student.fullName,
      date: attDate,
      status: attStatus,
      notes: attNotes,
    });

    setAttNotes('');
  };

  const filteredAttendance = attendance.filter((item) => {
    const matchesStudent = filterStudentId === 'All' || item.studentId === filterStudentId;
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    const matchesYear = filterYear === 'All' || item.date.startsWith(filterYear);

    return matchesStudent && matchesStatus && matchesYear;
  });

  const handleExportCSV = () => {
    const rows = filteredAttendance.map((a) => ({
      ID: a.id,
      StudentName: a.studentName,
      StudentID: a.studentId,
      Date: a.date,
      Status: a.status,
      Notes: a.notes || '',
    }));
    exportToCSV(`Guitart_Attendance_Log_${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Academy Attendance Logger"
        subtitle="Record session attendance, add instructor comments, & export CSV reports."
      />

      <div className="px-6 space-y-8">
        {/* Record New Attendance Card */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>Mark Student Attendance Session</span>
          </h3>

          <form onSubmit={handleRecordAttendance} className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
            {/* Student Select */}
            <div className="sm:col-span-3">
              <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1">Select Student *</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                required
              >
                {students.map((std) => (
                  <option key={std.id} value={std.id}>
                    {std.fullName} ({std.level})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Select */}
            <div className="sm:col-span-3">
              <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1">Session Date *</label>
              <input
                type="date"
                value={attDate}
                onChange={(e) => setAttDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {/* Status Select */}
            <div className="sm:col-span-2">
              <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1">Status *</label>
              <select
                value={attStatus}
                onChange={(e) => setAttStatus(e.target.value as AttendanceStatus)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Excused">Excused</option>
              </select>
            </div>

            {/* Notes Input */}
            <div className="sm:col-span-3">
              <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1">Instructor Note</label>
              <input
                type="text"
                value={attNotes}
                onChange={(e) => setAttNotes(e.target.value)}
                placeholder="e.g. Mastered alternate picking exercises"
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-1 flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-md flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </form>
        </div>

        {/* Filter Toolbar & CSV Export */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
            <span className="text-zinc-400 font-mono text-[11px]">Filters:</span>

            <select
              value={filterStudentId}
              onChange={(e) => setFilterStudentId(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Students</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.fullName}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Excused">Excused</option>
            </select>

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold text-xs transition flex items-center gap-2 border border-zinc-700 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Report</span>
          </button>
        </div>

        {/* Attendance Records Table */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <CalendarCheck className="w-4 h-4 text-amber-400" />
            <span>Attendance Log Entries ({filteredAttendance.length})</span>
          </h3>

          {filteredAttendance.length === 0 ? (
            <EmptyState
              icon={<CalendarCheck className="w-8 h-8" />}
              title="No Attendance Logs"
              description="No attendance records match the selected filters."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase tracking-wider">
                    <th className="pb-3 px-4">Student Name</th>
                    <th className="pb-3 px-4">Session Date</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 px-4">Instructor Feedback Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {filteredAttendance.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/40 transition">
                      <td className="py-4 px-4 font-bold text-white">{item.studentName}</td>
                      <td className="py-4 px-4 font-mono text-zinc-300">{formatDate(item.date)}</td>
                      <td className="py-4 px-4">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-zinc-300">{item.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
