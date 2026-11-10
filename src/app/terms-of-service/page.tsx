'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { FileText, ArrowLeft, Calendar, ShieldCheck, Scale, CheckCircle2 } from 'lucide-react';

export default function TermsOfServicePage() {
  const { legalPolicies } = useStore();
  const policy = legalPolicies?.termsOfService;

  const title = policy?.title || 'Terms of Service';
  const subtitle = policy?.subtitle || 'Student enrollment agreements, curriculum copyright, & academy code of conduct.';
  const lastUpdated = policy?.lastUpdated || 'March 2026';
  const content = policy?.content || '';

  // Render markdown-like sections cleanly
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
            <Scale className="w-3.5 h-3.5" />
            <span>Student & Academy Agreement</span>
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

      {/* Structured Content Sections */}
      <div className="space-y-6">
        {renderFormattedContent(content)}
      </div>

      {/* Support Contact Box */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 text-center space-y-3 shadow-inner">
        <h3 className="text-base font-bold text-white font-mono">Need Clarification on Academy Terms?</h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          Contact our student administration office for any enrollment or policy clarifications.
        </p>
        <a
          href="mailto:support@guitart.com"
          className="inline-block px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-md shadow-amber-950/40"
        >
          Email Academy Office (support@guitart.com)
        </a>
      </div>
    </div>
  );
}
