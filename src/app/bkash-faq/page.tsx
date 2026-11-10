'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { HelpCircle, ArrowLeft, Calendar, Smartphone, Check, Copy, Info } from 'lucide-react';

export default function BkashFaqPage() {
  const { legalPolicies, platformSettings } = useStore();
  const [copied, setCopied] = React.useState(false);
  const policy = legalPolicies?.bkashFaq;

  const title = policy?.title || 'bKash Payment FAQ';
  const subtitle = policy?.subtitle || 'Step-by-step guidance for course enrollment payments, gear purchases, & TrxID verification.';
  const lastUpdated = policy?.lastUpdated || 'March 2026';
  const content = policy?.content || '';
  const bkashNumber = platformSettings?.bKashNumber || '01711-000000';

  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(bkashNumber.replace(/\s+/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Render markdown-like FAQ sections cleanly
  const renderFormattedContent = (rawText: string) => {
    const sections = rawText.split('### ');
    return sections.map((sec, idx) => {
      if (!sec.trim()) return null;
      const lines = sec.split('\n');
      const heading = lines[0];
      const body = lines.slice(1).join('\n').trim();

      return (
        <div key={idx} className="p-6 sm:p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4 shadow-xl">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-3 font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>{heading}</span>
          </h2>
          <div className="text-sm text-zinc-300 leading-relaxed font-light space-y-3 whitespace-pre-line">
            {body}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="space-y-4 border-b border-zinc-800/80 pb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-amber-400 transition px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="space-y-2 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Payment & Billing Helpdesk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-zinc-400">
            {subtitle}
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 pt-1">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Last Updated: <strong className="text-zinc-300 font-semibold">{lastUpdated}</strong></span>
          </div>
        </div>
      </div>

      {/* Official Merchant Badge */}
      <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <span className="text-xs text-zinc-400 block font-mono">Official Academy bKash Number:</span>
          <span className="text-2xl font-black font-mono text-white tracking-wider">
            {bkashNumber}
          </span>
          <span className="text-xs text-amber-400/90 block">Send Money / Merchant Payment Verified</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-amber-950/40 cursor-pointer self-start sm:self-auto"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-zinc-950" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy bKash Number</span>
            </>
          )}
        </button>
      </div>

      {/* Structured Content Sections */}
      <div className="space-y-6">
        {renderFormattedContent(content)}
      </div>

      {/* Support Contact Box */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 text-center space-y-3 shadow-inner">
        <h3 className="text-base font-bold text-white font-mono">Having trouble with a bKash transaction?</h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          Contact our billing helpline via phone or email for instantaneous verification assistance.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <a
            href={`tel:${platformSettings?.academyPhone || '+8801711000000'}`}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-md shadow-amber-950/40"
          >
            Call Billing Helpdesk ({platformSettings?.academyPhone || '+880 1711-000000'})
          </a>
          <Link
            href="/checkout"
            className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition"
          >
            Go to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
