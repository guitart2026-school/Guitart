'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { Target, Headphones } from 'lucide-react';
import { HomepageSection } from '@/lib/types';

export const AboutSection: React.FC<{ data?: HomepageSection }> = ({ data }) => {
  const { adminName, cmsSections } = useStore();
  const sectionData = data || cmsSections.find((s) => s.id === 'sec-about');

  const imageUrl =
    sectionData?.imageUrl && sectionData.imageUrl.trim().length > 0
      ? sectionData.imageUrl
      : 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=1000&q=80';

  const rawTitle = sectionData?.title || 'Tone, Touch, & Timing: Beyond Plain TAB Memorization';
  const title = rawTitle.replace(/Ershad Zaman/g, adminName);
  const rawSubtitle = sectionData?.subtitle || 'Academy Philosophy';
  const subtitle = rawSubtitle.replace(/Ershad Zaman/g, adminName);
  const rawContent =
    sectionData?.content ||
    `Guitart was created by ${adminName} to solve the fundamental flaw in online guitar instruction — generic videos without structural clarity or technique refinement.`;
  const content = rawContent.replace(/Ershad Zaman/g, adminName);

  return (
    <section id="about" className="py-24 bg-zinc-950 border-b border-zinc-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Editorial Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-widest px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
              {subtitle}
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {title}
            </h2>

            <p className="text-base sm:text-lg text-zinc-300 font-light leading-relaxed whitespace-pre-line">
              {content}
            </p>

            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Whether you are dialing in your first open chord transitions or sweeping through complex 6-string neoclassical arpeggios, Guitart provides an exact step-by-step framework to build musical fluency, wrist mechanics, and fingerboard freedom.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Targeted Precision</h4>
                  <p className="text-xs text-zinc-400 mt-1">Isolate weak fingers and eliminate tension in picking wrists.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Audio Backing Tracks</h4>
                  <p className="text-xs text-zinc-400 mt-1">Play along with studio-recorded backing tracks at multiple tempos.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Showcase Right */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl relative group bg-zinc-900">
              <img
                src={imageUrl}
                alt="Guitar Fretboard Technique"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-md">
                <p className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider mb-1">
                  Interactive Tab Engine
                </p>
                <p className="text-sm font-bold text-white">
                  Download HD PDF tabs and synchronize picking exercises directly from your student dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
