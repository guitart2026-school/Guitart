'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { BrandIcon } from '@/components/shared/BrandLogo';
import {
  Music,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Mail,
  Check,
  ShieldCheck,
  Clock,
  RotateCcw,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryToken = searchParams.get('token') || '';
  const queryEmail = searchParams.get('email') || '';

  const { verifyPasswordResetToken, completePasswordReset, adminName } = useStore();

  const [email, setEmail] = useState(queryEmail);
  const [token, setToken] = useState(queryToken);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(600);
  const [isExpired, setIsExpired] = useState(false);
  const [tokenError, setTokenError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validate Token on load
  useEffect(() => {
    let isMounted = true;

    async function checkToken() {
      if (!queryToken) {
        if (isMounted) {
          setIsVerifying(false);
          setIsTokenValid(false);
          setTokenError('No password reset link token provided.');
        }
        return;
      }

      try {
        const res = await verifyPasswordResetToken(queryToken, queryEmail);
        if (isMounted) {
          if (res.valid) {
            setIsTokenValid(true);
            if (res.email) setEmail(res.email);
            if (typeof res.remainingSeconds === 'number') {
              setRemainingSeconds(res.remainingSeconds);
            }
          } else {
            setIsTokenValid(false);
            if (res.error?.includes('expired')) {
              setIsExpired(true);
            }
            setTokenError(res.error || 'This password reset link is invalid or has expired.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setIsTokenValid(false);
          setTokenError('Could not verify reset token.');
        }
      } finally {
        if (isMounted) setIsVerifying(false);
      }
    }

    checkToken();
    return () => {
      isMounted = false;
    };
  }, [queryToken, queryEmail, verifyPasswordResetToken]);

  // Token expiration timeout
  useEffect(() => {
    if (!isTokenValid || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTokenValid(false);
          setIsExpired(true);
          setTokenError('This password reset link has expired. Please request a new one.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTokenValid, remainingSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please specify your registered email address.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your entries.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await completePasswordReset(token, email.trim().toLowerCase(), newPassword);

      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push(`/login?email=${encodeURIComponent(email.trim())}`);
        }, 1500);
      } else {
        setErrorMsg(res.error || 'Failed to update password. Please request a new reset link.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Password update failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 py-8 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full bg-zinc-900/95 border border-zinc-800/90 p-8 sm:p-10 rounded-3xl backdrop-blur-xl shadow-2xl space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <BrandIcon className="w-11 h-11 rounded-2xl group-hover:scale-105 transition-transform" iconClassName="w-6 h-6" />
            <div className="text-left">
              <span className="text-xl font-extrabold tracking-wider text-white font-mono block leading-none">
                GUITART<span className="text-amber-400">.</span>
              </span>
              <span className="block text-[10px] tracking-widest text-zinc-400 uppercase font-sans mt-1">
                {adminName} Academy
              </span>
            </div>
          </Link>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Set New Password
            </h1>
            <p className="text-xs text-zinc-400 font-light mt-1">
              Create a new secure password for your Guitart account.
            </p>
          </div>
        </div>

        {/* Loading Token Verification */}
        {isVerifying ? (
          <div className="p-8 text-center space-y-3">
            <span className="inline-block w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-400 font-mono">Verifying reset link...</p>
          </div>
        ) : !isTokenValid && !isSuccess ? (
          /* Invalid or Expired Token View */
          <div className="p-6 rounded-2xl bg-zinc-950/90 border border-rose-500/30 text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/40">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">
                {isExpired ? 'Reset Link Expired' : 'Invalid Reset Link'}
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {tokenError || 'This password reset link is invalid or has expired. Please request a new link.'}
              </p>
            </div>

            <div className="pt-3 space-y-2">
              <Link
                href="/forgot-password"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-zinc-950 font-extrabold text-sm transition shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Request New Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/login"
                className="block text-center py-2 text-xs text-zinc-400 hover:text-white transition font-medium"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : isSuccess ? (
          /* Success View */
          <div className="p-6 rounded-2xl bg-zinc-950/90 border border-zinc-800 text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Password Updated!</h3>
              <p className="text-xs text-zinc-400">
                Your password has been changed successfully. Redirecting to sign in...
              </p>
            </div>
          </div>
        ) : (
          /* Valid Token Reset Form */
          <div className="space-y-4">
            {/* Validity Badge */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Secure Reset Link Active</span>
              </div>
              <span className="font-mono font-bold bg-zinc-950 px-2.5 py-1 rounded-lg border border-emerald-500/20 text-emerald-300 text-[11px]">
                Single-Use Token Verified
              </span>
            </div>

            {/* Error Alert */}
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-3 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider mb-2">
                  Account Email
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950/50 border border-zinc-800 text-zinc-300 text-sm font-mono cursor-not-allowed select-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider mb-2">
                  New Password <span className="text-amber-400">*</span>
                </label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-zinc-400 group-focus-within:text-amber-400 absolute left-3.5 top-3.5 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="•••••••• (min 6 chars)"
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

              <div>
                <label className="block text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider mb-2">
                  Confirm New Password <span className="text-amber-400">*</span>
                </label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-zinc-400 group-focus-within:text-amber-400 absolute left-3.5 top-3.5 transition-colors" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="••••••••"
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-zinc-950 font-extrabold text-sm transition shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Save New Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="text-center pt-2 border-t border-zinc-800 space-y-2">
          <p className="text-xs text-zinc-400">
            Remembered your credentials?{' '}
            <Link
              href="/login"
              className="text-amber-400 font-bold hover:text-amber-300 hover:underline inline-flex items-center gap-1 ml-1"
            >
              <span>Back to Sign In</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-amber-400">
          <span className="inline-block w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
