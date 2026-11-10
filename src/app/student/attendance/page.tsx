'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate } from '@/lib/utils';
import { CalendarCheck, CheckCircle2, XCircle, Clock, AlertCircle, Calendar } from 'lucide-react';

export default function StudentAttendancePage() {
  const { attendance, currentUser, adminName } = useStore();

  const studentId = currentUser?.id || '';

  // Filter attendance for student
  const studentAtt = studentId ? attendance.filter((a) => a.studentId === studentId) : [];

  const totalSessions = studentAtt.length;
  const present = studentAtt.filter((a) => a.status === 'Present').length;
  const late = studentAtt.filter((a) => a.status === 'Late').length;
  const absent = studentAtt.filter((a) => a.status === 'Absent').length;
  const excused = studentAtt.filter((a) => a.status === 'Excused').length;

  const attendanceRate = totalSessions > 0 ? Math.round(((present + late) / totalSessions) * 100) : 100;

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Academy Attendance Log"
        subtitle="Track your physical & live online masterclass session attendance records."
      />

      <div className="px-6 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              Attendance Rate
            </span>
            <p className="text-3xl font-extrabold text-white">{attendanceRate}%</p>
            <p className="text-xs text-zinc-400">Total sessions: {studentAtt.length}</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Present
            </span>
            <p className="text-3xl font-extrabold text-white">{present}</p>
            <p className="text-xs text-zinc-400">On time</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
            <span className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-wider">
              Late
            </span>
            <p className="text-3xl font-extrabold text-white">{late}</p>
            <p className="text-xs text-zinc-400">Recorded late</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
            <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
              Absent
            </span>
            <p className="text-3xl font-extrabold text-white">{absent}</p>
            <p className="text-xs text-zinc-400">Unexcused</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
              Excused
            </span>
            <p className="text-3xl font-extrabold text-white">{excused}</p>
            <p className="text-xs text-zinc-400">Notified</p>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span>Attendance History Log</span>
          </h3>

          {studentAtt.length === 0 ? (
            <EmptyState
              icon={<CalendarCheck className="w-8 h-8" />}
              title="No Attendance Logs Yet"
              description={`Your attendance logs will appear here once recorded by ${adminName}.`}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase tracking-wider">
                    <th className="pb-3 px-4">Session Date</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 px-4">Instructor Feedback Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {studentAtt.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/40 transition">
                      <td className="py-4 px-4 font-mono text-zinc-200">
                        {formatDate(item.date)}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-4 px-4 text-zinc-300">
                        {item.notes || '—'}
                      </td>
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
