'use client';

import React from 'react';
import { Award, Music, ShieldCheck, Flame, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { HomepageSection } from '@/lib/types';

export const InstructorSection: React.FC<{ data?: HomepageSection }> = ({ data }) => {
  const { adminName, cmsSections } = useStore();
  const sectionData = data || cmsSections.find((s) => s.id === 'sec-instructor');

  const imageUrl =
    sectionData?.imageUrl && sectionData.imageUrl.trim().length > 0
      ? sectionData.imageUrl
      : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';

  const rawTitle = sectionData?.title || `Meet Your Mentor — ${adminName}`;
  const title = rawTitle.replace(/Ershad Zaman/g, adminName);
  const rawSubtitle = sectionData?.subtitle || 'Instructor Spotlight';
  const subtitle = rawSubtitle.replace(/Ershad Zaman/g, adminName);
  const rawContent =
    sectionData?.content ||
    `Renowned for signature melodic solos, lightning alternate picking, and soulful bend vibrato, ${adminName} has influenced an entire generation of guitarists in Bangladesh and abroad.`;
  const content = rawContent.replace(/Ershad Zaman/g, adminName);

  const buttonText = sectionData?.buttonText;
  const buttonLink = sectionData?.buttonLink || '#testimonials';

  return (
    <section id="instructor" className="py-24 bg-gradient-to-b from-zinc-950 via-zinc-900/60 to-zinc-950 border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Portrait Image Left */}
          <div className="lg:col-span-5 relative">
            <div className="aspect-[3/4] rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl relative gold-border-glow bg-zinc-900">
              <img
                src={imageUrl}
                alt={`${adminName} Guitarist`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-500 text-zinc-950 text-xs font-black uppercase tracking-wider mb-2">
                  Founder & Lead Mentor
                </span>
                <h3 className="text-2xl font-black text-white">{adminName}</h3>
                <p className="text-xs text-amber-300 font-mono">Master Guitarist & Composer</p>
              </div>
            </div>
          </div>

          {/* Bio & Credentials Right */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-widest px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
              {subtitle}
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {title}
            </h2>

            <p className="text-base text-zinc-300 leading-relaxed font-light whitespace-pre-line">
              {content}
            </p>

            {buttonText && buttonLink && (
              <div className="pt-2">
                <Link
                  href={buttonLink}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition shadow-lg shadow-amber-950/40"
                >
                  <span>{buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Achievement Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Flame className="w-4 h-4" /> Signature Solos & Technique
                </div>
                <p className="text-xs text-zinc-400">
                  Master pentatonic phrasing, modal improvisation, and sweep picking directly from the author.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" /> Personalized Access Control
                </div>
                <p className="text-xs text-zinc-400">
                  Each student&apos;s lesson access is curated personally to ensure solid fundamentals before advancing.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Music className="w-4 h-4" /> High Definition Audio & Tabs
                </div>
                <p className="text-xs text-zinc-400">
                  Studio recorded backing tracks and pristine tab sheets for every single lesson module.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Award className="w-4 h-4" /> Recognized Excellence
                </div>
                <p className="text-xs text-zinc-400">
                  Join a community of dedicated guitarists performing on stage and recording studios.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
