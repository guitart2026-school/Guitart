'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  TrendingUp,
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export default function StudentProgressPage() {
  const { lessons, currentUser, lessonAccess, lessonProgress } = useStore();

  const studentId = currentUser?.id || '';

  // 1. Total Unlocked Lessons across all categories
  const unlockedLessons = lessons.filter((l) => {
    const acc = lessonAccess.find((la) => la.studentId === studentId && la.lessonId === l.id);
    return acc ? acc.isUnlocked : l.lessonNumber === 1;
  });
  const totalUnlocked = unlockedLessons.length;

  // 2. Completed Lessons among unlocked
  const completed = unlockedLessons.filter((l) => {
    const lp = lessonProgress.find((p) => p.studentId === studentId && p.lessonId === l.id);
    return lp?.status === 'Completed';
  }).length;

  // 3. In Progress Lessons among unlocked
  const inProgress = unlockedLessons.filter((l) => {
    const lp = lessonProgress.find((p) => p.studentId === studentId && p.lessonId === l.id);
    return lp?.status === 'In Progress';
  }).length;

  // 4. Untouched Modules (Not completed, Not in progress)
  const untouched = Math.max(0, totalUnlocked - completed - inProgress);

  // 5. Level breakdowns (Depends on unlocked lessons of each category)
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const levelData = levels.map((lvl) => {
    const lvlUnlockedLessons = unlockedLessons.filter((l) => l.level === lvl);
    const lvlTotal = lvlUnlockedLessons.length;
    const lvlCompleted = lvlUnlockedLessons.filter((l) => {
      const lp = lessonProgress.find((p) => p.studentId === studentId && p.lessonId === l.id);
      return lp?.status === 'Completed';
    }).length;

    return {
      level: lvl,
      total: lvlTotal,
      completed: lvlCompleted,
      percentage: lvlTotal > 0 ? Math.round((lvlCompleted / lvlTotal) * 100) : 0,
    };
  });

  // 6. Chart Data: Completed, In Progress, Untouched
  const chartItems = [
    { name: 'Completed', value: completed, color: '#10b981' },
    { name: 'In Progress', value: inProgress, color: '#f59e0b' },
    { name: 'Untouched', value: untouched, color: '#6366f1' },
  ];

  // Active chart slices for recharts
  const pieData =
    totalUnlocked === 0
      ? [{ name: 'No Unlocked Lessons', value: 1, color: '#27272a' }]
      : chartItems.filter((item) => item.value > 0);

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Student Learning Progress"
        subtitle="Visual statistics & level completion metrics for your guitar curriculum journey."
      />

      <div className="px-6 space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
              Total Modules
            </span>
            <p className="text-3xl font-extrabold text-white">{totalUnlocked}</p>
            <p className="text-xs text-zinc-400">Unlocked curriculum</p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Completed Lessons
            </span>
            <p className="text-3xl font-extrabold text-white">{completed}</p>
            <p className="text-xs text-emerald-400 font-semibold">100% Validated</p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              In Progress
            </span>
            <p className="text-3xl font-extrabold text-white">{inProgress}</p>
            <p className="text-xs text-amber-400 font-semibold">Active learning</p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              Untouched Modules
            </span>
            <p className="text-3xl font-extrabold text-white">{untouched}</p>
            <p className="text-xs text-zinc-400">Not started yet</p>
          </div>
        </div>

        {/* Charts & Level Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Level Breakdown Progress Bars Left */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Curriculum Completion by Level</span>
            </h3>

            <div className="space-y-6">
              {levelData.map((lvl) => (
                <div key={lvl.level} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-white flex items-center gap-2">
                      <StatusBadge status={lvl.level} size="sm" />
                      <span>{lvl.level} Tier</span>
                    </span>
                    <span className="text-amber-400 font-mono">
                      {lvl.completed} / {lvl.total} Lessons ({lvl.percentage}%)
                    </span>
                  </div>

                  <div className="w-full bg-zinc-950 rounded-full h-3 p-0.5 border border-zinc-800">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-700"
                      style={{ width: `${lvl.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pie Chart Right */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl flex flex-col justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <span>Lesson Status Breakdown</span>
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={pieData.length > 1 ? 5 : 0}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs pt-2">
              {chartItems.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-zinc-300 font-medium">{item.name}:</span>
                  <span className="text-white font-mono font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
