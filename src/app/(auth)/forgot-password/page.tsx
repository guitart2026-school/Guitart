'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { BrandIcon } from '@/components/shared/BrandLogo';
import {
  Music,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  Check,
  Clock,
  Copy,
  ExternalLink,
  KeyRound,
} from 'lucide-react';

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const queryEmail = searchParams.get('email') || '';
  const { requestPasswordResetLink, adminName } = useStore();

  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState('');
  const [token, setToken] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (queryEmail) {
      setEmail(queryEmail);
    }
  }, [queryEmail]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestPasswordResetLink(trimmed);
      if (res.success) {
        setIsSubmitted(true);
        if (res.resetUrl) setResetUrl(res.resetUrl);
        if (res.token) setToken(res.token);
        setResendCooldown(45);
      } else {
        setErrorMsg(res.error || 'Failed to generate reset link. Please verify your email.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to process password reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await requestPasswordResetLink(email.trim().toLowerCase());
      if (res.success) {
        if (res.resetUrl) setResetUrl(res.resetUrl);
        if (res.token) setToken(res.token);
        setResendCooldown(45);
      } else {
        setErrorMsg(res.error || 'Could not resend reset link. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to resend reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!resetUrl) return;
    const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${resetUrl}` : resetUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
              Reset Your Password
            </h1>
            <p className="text-xs text-zinc-400 font-light mt-1">
              Enter your registered email address to receive a secure password reset link.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium space-y-2 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="leading-snug">{errorMsg}</span>
            </div>
            {errorMsg.toLowerCase().includes('signed up') && (
              <div className="pt-1">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline"
                >
                  <span>Click here to Sign Up / Enroll now</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        )}

        {isSubmitted ? (
          <div className="p-6 rounded-2xl bg-zinc-950/90 border border-zinc-800 text-center space-y-5 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-950/40">
              <Mail className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Reset Email Dispatched</span>
              </div>
              <h3 className="text-xl font-bold text-white">Check Your Email</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                We have sent a secure password reset link to:
              </p>
              <p className="text-sm font-mono font-bold text-amber-400 bg-zinc-900 border border-zinc-800 py-1.5 px-3 rounded-lg inline-block">
                {email}
              </p>
              <p className="text-[11px] text-zinc-400 pt-2 leading-relaxed">
                Please open the email in your inbox and click the reset button to choose a new password. If you don&apos;t see it within a minute, please check your spam folder.
              </p>
            </div>

            <div className="pt-2 space-y-2.5">
              <Link
                href="/login"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-zinc-950 font-extrabold text-sm transition shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Back to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isLoading}
                className="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : 'Resend Reset Email'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Registered Email Address <span className="text-amber-400">*</span>
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-zinc-400 group-focus-within:text-amber-400 absolute left-3.5 top-3.5 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950/90 border border-zinc-700/80 text-white placeholder:text-zinc-500 text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 transition shadow-inner"
                  required
                />
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
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Instructions</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="text-center pt-2 border-t border-zinc-800 space-y-2">
          <p className="text-xs text-zinc-400">
            Remember your password?{' '}
            <Link
              href="/login"
              className="text-amber-400 font-bold hover:text-amber-300 hover:underline inline-flex items-center gap-1 ml-1"
            >
              <span>Sign in</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </p>

          <p className="text-xs text-zinc-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-zinc-300 hover:text-amber-400 font-semibold transition ml-1"
            >
              Enroll in Academy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-amber-400">
          <span className="inline-block w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
