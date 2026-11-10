'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Users,
  UserCheck,
  BookOpen,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  CalendarCheck,
  ArrowRight,
  ShieldAlert,
  TrendingUp,
  Activity,
  Clock,
  Check,
  Ban,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area
} from 'recharts';

export default function AdminDashboardPage() {
  const { users, lessons, orders, attendance, verifyBkashPayment, approveUser, denyUser } = useStore();

  const students = users.filter((u) => u.role === 'student');
  const pendingStudents = students.filter((s) => s.status === 'Pending');
  const activeStudents = students.filter((s) => s.status === 'Active').length;
  const totalLessons = lessons.length;
  const pendingPayments = orders.filter((o) => o.paymentStatus === 'Pending');
  const totalOrders = orders.length;

  const chartData = [
    { month: 'Jan', students: 12, revenue: 18500 },
    { month: 'Feb', students: 18, revenue: 26400 },
    { month: 'Mar', students: 29, revenue: 41200 },
    { month: 'Apr', students: 45, revenue: 68900 },
  ];

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Admin Control Center"
        subtitle="Academy student roster metrics, bKash payment verification, & lesson access management."
      />

      <div className="px-6 space-y-8">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <Link
            href="/admin/approvals"
            className="p-5 rounded-2xl bg-zinc-900 border border-amber-500/50 space-y-2 hover:border-amber-400 transition cursor-pointer shadow-lg shadow-amber-950/20"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                Pending Signups
              </span>
              <div className="p-1.5 rounded-xl bg-amber-500 text-zinc-950 font-black text-xs">
                {pendingStudents.length}
              </div>
            </div>
            <p className="text-3xl font-extrabold text-amber-400">{pendingStudents.length}</p>
            <p className="text-xs text-amber-300/80 font-semibold">Requires Approval →</p>
          </Link>

          <Link
            href="/admin/students"
            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 hover:border-zinc-700 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Total Students
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{students.length}</p>
            <p className="text-xs text-zinc-400">{activeStudents} Active Profiles</p>
          </Link>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Curriculum
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{totalLessons}</p>
            <p className="text-xs text-zinc-400">3 Level Tiers</p>
          </div>

          <Link
            href="/admin/orders"
            className="p-5 rounded-2xl bg-zinc-900 border border-amber-500/40 space-y-2 hover:border-amber-400 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                Pending bKash
              </span>
              <div className="p-1.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs">
                {pendingPayments.length}
              </div>
            </div>
            <p className="text-3xl font-extrabold text-amber-400">{pendingPayments.length}</p>
            <p className="text-xs text-amber-300 font-semibold">Verify Payments →</p>
          </Link>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Gear Orders
              </span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{totalOrders}</p>
            <p className="text-xs text-zinc-400">Store products</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Attendance
              </span>
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{attendance.length}</p>
            <p className="text-xs text-zinc-400">Recorded logs</p>
          </div>
        </div>

        {/* Highlight Section: Pending Registration Approvals */}
        {pendingStudents.length > 0 && (
          <div className="p-6 rounded-3xl bg-amber-950/25 border border-amber-500/50 space-y-4 shadow-2xl gold-border-glow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Clock className="w-5 h-5 animate-pulse" />
                <span>Action Required: Student Registration Approvals ({pendingStudents.length})</span>
              </div>
              <Link href="/admin/approvals" className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1">
                <span>View Approvals Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingStudents.slice(0, 4).map((student) => (
                <div
                  key={student.id}
                  className="p-4 rounded-2xl bg-zinc-900/95 border border-zinc-800 flex items-center justify-between gap-4 shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        student.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={student.fullName}
                      className="w-10 h-10 rounded-xl object-cover border border-amber-500/40 shrink-0"
                    />
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{student.fullName}</p>
                      <p className="text-[10px] text-zinc-400 font-mono truncate">{student.email}</p>
                      <div className="flex items-center gap-2 text-[10px] text-amber-400 font-mono">
                        <span>Level: {student.level || 'Beginner'}</span>
                        <span>•</span>
                        <span>{student.mobile || 'No Phone'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => approveUser(student.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition shadow-md flex items-center gap-1 cursor-pointer"
                      title="Approve student & unlock lesson 1"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={() => denyUser(student.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-bold transition cursor-pointer"
                      title="Deny registration"
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Highlight Section: Pending bKash Verification Actions */}
        {pendingPayments.length > 0 && (
          <div className="p-6 rounded-3xl bg-amber-950/20 border border-amber-500/40 space-y-4 shadow-2xl gold-border-glow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <ShieldAlert className="w-5 h-5" />
                <span>Action Required: bKash Payment Verifications ({pendingPayments.length})</span>
              </div>
              <Link href="/admin/orders" className="text-xs text-amber-400 hover:underline font-semibold">
                Manage All Orders →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingPayments.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">
                      Order #{order.id} — {order.customerName}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Amount: <span className="text-amber-400 font-mono font-bold">{formatCurrency(order.totalAmount)}</span>
                    </p>
                    {order.bKashTransactionId && (
                      <p className="text-[11px] font-mono text-zinc-300">
                        TxID: <span className="text-amber-400 font-bold">{order.bKashTransactionId}</span> ({order.bKashSenderMobile || 'No Mobile'})
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => verifyBkashPayment(order.id)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-md shrink-0 cursor-pointer"
                  >
                    Verify Payment ✓
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Academy Student Growth Trend</span>
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }} />
                  <Area type="monotone" dataKey="students" stroke="#f59e0b" fillOpacity={1} fill="url(#colorStudents)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Monthly Revenue (BDT)</span>
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Students & Recent Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Students */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Recent Students</span>
              </h3>
              <Link href="/admin/students" className="text-xs text-amber-400 hover:underline">
                Manage All →
              </Link>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {students.slice(0, 4).map((std) => (
                <div key={std.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={std.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                      alt={std.fullName}
                      className="w-9 h-9 rounded-full object-cover border border-amber-500/30"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{std.fullName}</p>
                      <p className="text-[10px] text-zinc-400">{std.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={std.level || 'Beginner'} size="sm" />
                    <Link
                      href={`/admin/students/${std.id}`}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-bold transition"
                    >
                      Access Matrix →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Recent Merchandise Orders</span>
              </h3>
              <Link href="/admin/orders" className="text-xs text-amber-400 hover:underline">
                View All →
              </Link>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {orders.slice(0, 4).map((order) => (
                <div key={order.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">{order.id} — {order.customerName}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      {formatCurrency(order.totalAmount)} ({order.paymentMethod})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={order.paymentStatus} size="sm" />
                    <StatusBadge status={order.orderStatus} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
