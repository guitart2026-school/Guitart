'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { BrandIcon } from '@/components/shared/BrandLogo';
import { ArrowRight } from 'lucide-react';
import { HomepageSection } from '@/lib/types';

export const CtaSection: React.FC<{ data?: HomepageSection }> = ({ data }) => {
  const { adminName, cmsSections } = useStore();
  const sectionData = data || cmsSections.find((s) => s.id === 'sec-cta');

  const rawTitle = sectionData?.title || 'Ready to Transform Your Guitar Technique?';
  const title = rawTitle.replace(/Ershad Zaman/g, adminName);
  const rawContent =
    sectionData?.content ||
    `Enroll today to get instant access to your student dashboard, level-based video modules, downloadable TAB sheets, and direct mentorship from ${adminName}.`;
  const content = rawContent.replace(/Ershad Zaman/g, adminName);
  const buttonText = sectionData?.buttonText || 'Join Guitart Academy';
  const buttonLink = sectionData?.buttonLink || '/signup';

  return (
    <section className="py-24 bg-zinc-950 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl bg-gradient-to-r from-zinc-900 via-amber-950/40 to-zinc-900 border border-amber-500/30 p-10 sm:p-16 text-center space-y-8 shadow-2xl gold-border-glow">
          <BrandIcon className="w-14 h-14 rounded-2xl mx-auto shadow-lg shadow-amber-950/60" iconClassName="w-7 h-7" />

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {title}
          </h2>

          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto font-light leading-relaxed whitespace-pre-line">
            {content}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href={buttonLink}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-zinc-950 font-extrabold text-base transition shadow-xl shadow-amber-950/60 flex items-center justify-center gap-2 group"
            >
              <span>{buttonText}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-base transition flex items-center justify-center"
            >
              Student Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
