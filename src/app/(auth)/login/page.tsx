'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { BrandIcon } from '@/components/shared/BrandLogo';
import {
  Music,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Check,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const queryEmail = searchParams.get('email');

  const { login, loginWithGoogle, currentUser, activeRole, isAuthLoading, adminName } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isNotRegistered, setIsNotRegistered] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    if (!isAuthLoading && currentUser) {
      if (currentUser.role === 'admin' || activeRole === 'admin') {
        router.replace(redirectUrl || '/admin/dashboard');
      } else if (currentUser.status === 'Active') {
        router.replace(redirectUrl || '/student/dashboard');
      } else if (currentUser.status === 'Pending') {
        router.replace('/waiting-approval');
      } else if (currentUser.status === 'Rejected') {
        router.replace('/waiting-approval?status=rejected');
      }
    }
  }, [currentUser, activeRole, isAuthLoading, redirectUrl, router]);

  // Check for remembered email or query parameter on mount
  useEffect(() => {
    try {
      const isRemembered = localStorage.getItem('guitart_remember_me');
      if (isRemembered !== null) {
        setRememberMe(isRemembered === 'true');
      }

      const savedEmail = localStorage.getItem('guitart_remembered_email');
      if (savedEmail) {
        if (savedEmail.includes('castle.local') || savedEmail.includes('admin@')) {
          localStorage.removeItem('guitart_remembered_email');
        } else if (savedEmail) {
          setEmail(savedEmail);
        }
      }
      if (queryEmail) {
        setEmail(queryEmail);
      }
    } catch (e) {
      console.warn('localStorage error', e);
    }
  }, [queryEmail]);

  // Detect Caps Lock
  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState('CapsLock')) {
      setIsCapsLockOn(true);
    } else {
      setIsCapsLockOn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsNotRegistered(false);

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(email.trim(), password, rememberMe);

      if (res.success) {
        setIsSuccess(true);

        setTimeout(() => {
          if (res.role === 'admin') {
            router.push(redirectUrl || '/admin/dashboard');
          } else if (res.status === 'Active') {
            router.push(redirectUrl || '/student/dashboard');
          } else if (res.status === 'Pending') {
            router.push('/waiting-approval');
          } else if (res.status === 'Rejected') {
            router.push('/waiting-approval?status=rejected');
          } else if (redirectUrl) {
            router.push(redirectUrl);
          } else {
            router.push('/student/dashboard');
          }
        }, 600);
      } else {
        setErrorMsg(res.error || 'Invalid email or password. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth sign-in via Firebase (only permitted if already registered)
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setIsNotRegistered(false);
    try {
      const res = await loginWithGoogle(rememberMe);
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          if (res.role === 'admin') {
            router.push(redirectUrl || '/admin/dashboard');
          } else if (res.status === 'Active') {
            router.push(redirectUrl || '/student/dashboard');
          } else if (res.status === 'Pending') {
            router.push('/waiting-approval');
          } else if (res.status === 'Rejected') {
            router.push('/waiting-approval?status=rejected');
          } else if (redirectUrl) {
            router.push(redirectUrl);
          } else {
            router.push('/student/dashboard');
          }
        }, 600);
      } else {
        if (res.notFound) {
          setIsNotRegistered(true);
        }
        setErrorMsg(res.error || 'Google sign-in could not be completed.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 py-8 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full bg-zinc-900/95 border border-zinc-800/90 p-8 sm:p-10 rounded-3xl backdrop-blur-xl shadow-2xl space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
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

          <div className="pt-2 space-y-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs text-zinc-400">
              Sign in to your Guitart account to access lessons, masterclasses & community.
            </p>
          </div>
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs font-medium space-y-2.5 animate-fade-in">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="flex-1 leading-relaxed">{errorMsg}</span>
            </div>
            {isNotRegistered && (
              <div className="pt-1">
                <Link
                  href="/signup"
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                >
                  <span>Fillup Form & Complete Enrollment</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}

        {isSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs font-medium flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Authentication successful! Launching dashboard...</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="login-email"
              className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider"
            >
              Email Address
            </label>
            <div className="relative group">
              <Mail className="w-4 h-4 text-zinc-400 group-focus-within:text-amber-400 absolute left-3.5 top-3.5 transition-colors pointer-events-none" />
              <input
                id="login-email"
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

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="block text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider"
              >
                Password
              </label>
              <Link
                href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                className="text-xs text-amber-400 hover:text-amber-300 transition font-medium hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative group">
              <Lock className="w-4 h-4 text-zinc-400 group-focus-within:text-amber-400 absolute left-3.5 top-3.5 transition-colors pointer-events-none" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                onKeyUp={handleKeyUp}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full pl-10 pr-11 py-3 rounded-xl bg-zinc-950/90 border border-zinc-700/80 text-white placeholder:text-zinc-500 text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 transition shadow-inner"
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

            {isCapsLockOn && (
              <p className="text-[11px] text-amber-400 flex items-center gap-1 font-mono pt-1">
                <span>⚠️</span> Caps Lock is active.
              </p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-300 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-amber-500 focus:ring-amber-500/20 focus:ring-offset-zinc-950 accent-amber-500 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <span>Remember me on this device</span>
                <span className="text-[10px] text-amber-400 font-mono font-medium">(10 days)</span>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-zinc-950 font-extrabold text-sm transition shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>Signing In...</span>
              </>
            ) : isSuccess ? (
              <>
                <Check className="w-4 h-4 text-zinc-950 stroke-[3]" />
                <span>Authenticated! Redirecting...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Social Sign-In */}
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

        {/* Enrollment Link */}
        <div className="text-center pt-2 border-t border-zinc-800">
          <p className="text-xs text-zinc-400">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-amber-400 font-bold hover:text-amber-300 hover:underline inline-flex items-center gap-1 ml-1"
            >
              <span>Enroll in Academy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-amber-400">
          <div className="flex items-center gap-2 text-sm font-mono">
            <span className="inline-block w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span>Loading Guitart Portal...</span>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
