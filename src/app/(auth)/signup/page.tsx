'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { BrandIcon } from '@/components/shared/BrandLogo';
import { StudentLevel } from '@/lib/types';
import {
  Music,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  Calendar,
  Award,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Check,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signup, signupWithGoogle, currentUser, activeRole, isAuthLoading, adminName } = useStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('2002-05-15');
  const [level, setLevel] = useState<StudentLevel>('Beginner');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    if (!isAuthLoading && currentUser) {
      if (currentUser.role === 'admin' || activeRole === 'admin') {
        router.replace('/admin/dashboard');
      } else if (currentUser.status === 'Active') {
        router.replace('/student/dashboard');
      } else if (currentUser.status === 'Pending') {
        router.replace('/waiting-approval');
      } else if (currentUser.status === 'Rejected') {
        router.replace('/waiting-approval?status=rejected');
      }
    }
  }, [currentUser, activeRole, isAuthLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !mobile.trim() || !password || !confirmPassword) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await signup({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        mobile: mobile.trim(),
        dateOfBirth,
        level,
      });

      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/waiting-approval');
        }, 600);
      } else {
        setErrorMsg(res.error || 'Failed to complete registration. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await signupWithGoogle({
        level,
        mobile: mobile.trim(),
        dateOfBirth,
      });
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          if (res.role === 'admin') {
            router.push('/admin/dashboard');
          } else if (res.status === 'Active') {
            router.push('/student/dashboard');
          } else {
            router.push('/waiting-approval');
          }
        }, 600);
      } else {
        setErrorMsg(res.error || 'Google sign-up could not be completed.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google sign-up failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-zinc-950 flex items-center justify-center p-4 py-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-xl w-full bg-zinc-900/95 border border-zinc-800/90 p-6 sm:p-10 rounded-3xl backdrop-blur-xl shadow-2xl space-y-7 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <BrandIcon className="w-11 h-11 rounded-2xl group-hover:scale-105 transition-transform" iconClassName="w-6 h-6" />
            <div className="text-left">
              <span className="text-2xl font-black tracking-wider text-white font-mono block leading-tight">
                GUITART<span className="text-amber-400">.</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-medium tracking-widest uppercase">
                {adminName} Academy
              </span>
            </div>
          </Link>
          <div className="pt-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Join Guitart Academy
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Enroll as a student and unlock structured guitar curriculum & masterclasses
            </p>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs font-medium flex items-center gap-3 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {isSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs font-medium flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Student registration submitted! Redirecting to approval status page...</span>
          </div>
        )}

        {/* Enrollment Form */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
              Full Name <span className="text-amber-400 font-bold">*</span>
            </label>
            <div className="relative group">
              <User className="w-4 h-4 text-zinc-400 group-focus-within:text-amber-400 absolute left-3.5 top-3.5 transition-colors pointer-events-none" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="e.g. Mahfuz Hasan"
                autoComplete="off"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950/90 border border-zinc-700/80 text-white placeholder:text-zinc-500 text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 transition shadow-inner"
                required
              />
            </div>
          </div>

          {/* Email & Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
                Email Address <span className="text-amber-400 font-bold">*</span>
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-zinc-400 group-focus-within:text-amber-400 absolute left-3.5 top-3.5 transition-colors pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="name@example.com"
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950/90 border border-zinc-700/80 text-white placeholder:text-zinc-500 text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 transition shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
                Mobile Number <span className="text-amber-400 font-bold">*</span>
              </label>
              <div className="relative group">
                <Phone className="w-4 h-4 text-zinc-400 group-focus-within:text-amber-400 absolute left-3.5 top-3.5 transition-colors pointer-events-none" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="+880 1700-000000"
                  autoComplete="tel"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950/90 border border-zinc-700/80 text-white placeholder:text-zinc-500 text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 transition shadow-inner"
                  required
                />
              </div>
            </div>
          </div>

          {/* Date of Birth */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
              Date of Birth
            </label>
            <div className="relative group">
              <Calendar className="w-4 h-4 text-zinc-400 group-focus-within:text-amber-400 absolute left-3.5 top-3.5 transition-colors pointer-events-none" />
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950/90 border border-zinc-700/80 text-white text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 transition shadow-inner [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Current Guitar Level - Full Width with Complete Text Visibility */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
              Current Guitar Level <span className="text-amber-400 font-bold">*</span>
            </label>
            <div className="relative group">
              <Award className="w-4 h-4 text-zinc-400 group-focus-within:text-amber-400 absolute left-3.5 top-3.5 transition-colors pointer-events-none" />
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as StudentLevel)}
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-zinc-950/90 border border-zinc-700/80 text-white text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 transition shadow-inner appearance-none cursor-pointer [color-scheme:dark]"
              >
                <option value="Beginner" className="bg-zinc-900 text-white py-2">
                  Beginner (Open Chords / Basic Picking)
                </option>
                <option value="Intermediate" className="bg-zinc-900 text-white py-2">
                  Intermediate (CAGED / Pentatonic)
                </option>
                <option value="Advanced" className="bg-zinc-900 text-white py-2">
                  Advanced (Sweep / Legato / Lead Solos)
                </option>
              </select>
              <div className="absolute right-3.5 top-3.5 pointer-events-none text-zinc-400 group-focus-within:text-amber-400 transition-colors">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
                Password <span className="text-amber-400 font-bold">*</span>
              </label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-zinc-400 group-focus-within:text-amber-400 absolute left-3.5 top-3.5 transition-colors pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-zinc-950/90 border border-zinc-700/80 text-white placeholder:text-zinc-500 text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 transition shadow-inner"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
                Confirm Password <span className="text-amber-400 font-bold">*</span>
              </label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-zinc-400 group-focus-within:text-amber-400 absolute left-3.5 top-3.5 transition-colors pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-zinc-950/90 border border-zinc-700/80 text-white placeholder:text-zinc-500 text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 transition shadow-inner"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Match Status Hint */}
          {password && confirmPassword && (
            <div className="pt-0.5">
              {password === confirmPassword ? (
                <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-mono">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Passwords match</span>
                </p>
              ) : (
                <p className="text-[11px] text-rose-400 flex items-center gap-1.5 font-mono">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Passwords do not match</span>
                </p>
              )}
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-zinc-950 font-extrabold text-sm sm:text-base transition shadow-xl shadow-amber-950/50 flex items-center justify-center gap-2 mt-4 disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="inline-block w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>Processing Enrollment...</span>
              </>
            ) : isSuccess ? (
              <>
                <Check className="w-5 h-5 stroke-[3]" />
                <span>Enrolled Successfully!</span>
              </>
            ) : (
              <>
                <span>Complete Enrollment</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Social Sign-Up */}
        <div className="space-y-3 pt-1">
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-zinc-800" />
            <span className="bg-zinc-900 px-3 text-[11px] text-zinc-500 font-mono uppercase tracking-wider shrink-0">
              Or continue with
            </span>
            <div className="w-full border-t border-zinc-800" />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isSuccess}
              className="py-2.5 px-4 rounded-xl bg-zinc-950 border border-zinc-700/80 hover:border-zinc-500 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition hover:bg-zinc-900 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.4 7.5 23.5 12 23.5z"
                />
              </svg>
              <span>Google</span>
            </button>

          </div>
        </div>

        {/* Footer Navigation */}
        <div className="text-center pt-2 border-t border-zinc-800">
          <p className="text-xs text-zinc-400">
            Already have a student or admin account?{' '}
            <Link
              href="/login"
              className="text-amber-400 font-bold hover:text-amber-300 hover:underline inline-flex items-center gap-1 ml-1"
            >
              <span>Log in here</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
