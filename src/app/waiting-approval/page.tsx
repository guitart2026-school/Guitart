'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { BrandIcon } from '@/components/shared/BrandLogo';
import {
  Music,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  ArrowRight,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  Sparkles,
  Ban,
  Check,
} from 'lucide-react';

function WaitingApprovalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitStatus = searchParams.get('status');

  const { currentUser, refreshCurrentUser, logout, activeRole, addToast, isAuthLoading, adminName } = useStore();
  const [isChecking, setIsChecking] = useState(false);
  const [checkCount, setCheckCount] = useState(0);
  const [justApproved, setJustApproved] = useState(false);

  // If user is already active or admin, immediately redirect to dashboard
  useEffect(() => {
    if (!isAuthLoading) {
      if (!currentUser) {
        router.replace('/login');
      } else if (activeRole === 'admin' || currentUser.role === 'admin') {
        router.replace('/admin/dashboard');
      } else if (currentUser.status === 'Active') {
        router.replace('/student/dashboard');
      }
    }
  }, [currentUser, activeRole, isAuthLoading, router]);

  // Periodic automatic status check every 5 seconds
  useEffect(() => {
    if (justApproved || currentUser?.status === 'Active' || currentUser?.status === 'Rejected') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const freshUser = await refreshCurrentUser();
        if (freshUser?.status === 'Active') {
          setJustApproved(true);
          addToast('🎉 Your account has been approved! Redirecting to dashboard...', 'success');
          setTimeout(() => {
            router.replace('/student/dashboard');
          }, 1200);
        }
      } catch (e) {
        // silent check
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [justApproved, currentUser?.status, refreshCurrentUser, router, addToast]);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      const freshUser = await refreshCurrentUser();
      setCheckCount((prev) => prev + 1);

      if (freshUser?.status === 'Active') {
        setJustApproved(true);
        addToast('🎉 Your account has been approved! Launching student portal...', 'success');
        setTimeout(() => {
          router.replace('/student/dashboard');
        }, 1000);
      }
    } catch (err) {
      console.warn('Status check notice:', err);
    } finally {
      setTimeout(() => {
        setIsChecking(false);
      }, 500);
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  const isRejected = explicitStatus === 'rejected' || currentUser?.status === 'Rejected';
  const isApproved = justApproved || currentUser?.status === 'Active';

  return (
    <div className="min-h-[calc(100vh-80px)] bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[300px] bg-amber-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full bg-zinc-900/95 border border-zinc-800/90 p-6 sm:p-10 rounded-3xl backdrop-blur-xl shadow-2xl space-y-7 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <BrandIcon className="w-12 h-12 rounded-2xl group-hover:scale-105 transition-transform" iconClassName="w-6 h-6" />
            <div className="text-left">
              <span className="text-2xl font-black tracking-wider text-white font-mono block leading-tight">
                GUITART<span className="text-amber-400">.</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-medium tracking-widest uppercase">
                {adminName} Academy
              </span>
            </div>
          </Link>
        </div>

        {/* State Banner: Approved */}
        {isApproved ? (
          <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/50">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                Application Approved!
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Welcome to Guitart Academy! 🎉
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto">
                Your student profile has been verified and activated by the academy director. Lesson 1 and your curriculum roadmap are now ready.
              </p>
            </div>

            <button
              onClick={() => router.push('/student/dashboard')}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-zinc-950 font-black text-sm sm:text-base transition shadow-xl shadow-amber-950/60 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Launch Student Portal</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : isRejected ? (
          /* State Banner: Rejected */
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/15 border-2 border-rose-500/40 flex items-center justify-center text-rose-400 shadow-xl">
              <Ban className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold">
                Enrollment Update
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Application Not Approved
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                We are unable to approve your enrollment application at this time. For enquiries regarding academy batches or eligibility, please reach out to our team.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-left space-y-2 text-xs">
              <p className="font-mono font-bold text-zinc-300">Academy Admissions Contact:</p>
              <p className="text-zinc-400 font-mono">Email: info@guitart.com / admissions@guitart.com</p>
              <p className="text-zinc-400 font-mono">Phone: +880 1711-000000 (10 AM - 8 PM)</p>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out & Try Another Account</span>
            </button>
          </div>
        ) : (
          /* State Banner: Pending (Default) */
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-2.5">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-950/40 relative">
                <Clock className="w-8 h-8 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full animate-ping" />
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Status: Waiting for Admin Approval
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Registration Submitted!
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                Thank you for joining Guitart Academy. Your student application has been queued and is waiting for review by <span className="text-amber-400 font-bold">{adminName}</span> and academy directors.
              </p>
            </div>

            {/* Profile Snapshot Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                  Submitted Profile Summary
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-500/30">
                  Pending Review
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Student Name</span>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentUser?.fullName || 'Student Applicant'}</span>
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Email Address</span>
                  <p className="font-mono text-zinc-300 flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span className="truncate">{currentUser?.email || 'Registered Email'}</span>
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Selected Guitar Level</span>
                  <p className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentUser?.level || 'Beginner'} Level</span>
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Mobile Contact</span>
                  <p className="font-mono text-zinc-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentUser?.mobile || 'Verified Mobile'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 3-Step Visual Progress Stepper */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/80">
              <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                Approval Roadmap
              </span>

              <div className="space-y-3">
                {/* Step 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xs shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-300">1. Account Created & Form Submitted</p>
                    <p className="text-[11px] text-zinc-500">Your profile and skill preferences have been saved.</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xs shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-300">2. Academy Admin Review (In Progress)</p>
                    <p className="text-[11px] text-zinc-400">Admin reviews batch allocations & approves your profile.</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 opacity-60">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-300">3. Portal Activation & Lesson Unlock</p>
                    <p className="text-[11px] text-zinc-500">Instant access to high-def video modules, audio, & tabs.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Check Status Button */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleCheckStatus}
                disabled={isChecking}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-zinc-950 font-black text-sm transition shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'Checking Live Approval Status...' : 'Check Approval Status'}</span>
              </button>

              {checkCount > 0 && !isApproved && (
                <p className="text-center text-[11px] text-zinc-400 font-mono animate-fade-in">
                  Checked live with database. Still pending admin verification. Auto-polling active.
                </p>
              )}
            </div>

            {/* Sign out and links */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
              <Link href="/" className="text-zinc-400 hover:text-amber-400 transition flex items-center gap-1">
                <span>← Academy Homepage</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="text-zinc-400 hover:text-rose-400 transition flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WaitingApprovalPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-amber-400">
          <div className="flex items-center gap-2 text-sm font-mono">
            <span className="inline-block w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span>Loading Guitart Academy Status...</span>
          </div>
        </div>
      }
    >
      <WaitingApprovalContent />
    </React.Suspense>
  );
}
