'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { Play, Sparkles, ArrowRight, Music, Award, Users, BookOpen, X } from 'lucide-react';
import { HomepageSection } from '@/lib/types';

export const HeroSection: React.FC<{ data?: HomepageSection }> = ({ data }) => {
  const { adminName, cmsSections } = useStore();
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const sectionData = data || cmsSections.find((s) => s.id === 'sec-hero');
  const rawTitle = sectionData?.title || `Unlock Virtuosic Guitar Mastery with ${adminName}`;
  const title = rawTitle.replace(/Ershad Zaman/g, adminName);
  const rawSubtitle = sectionData?.subtitle || 'Structured video lessons, custom tab notation, and one-on-one mentorship tailored for acoustic & electric guitarists.';
  const subtitle = rawSubtitle.replace(/Ershad Zaman/g, adminName);
  const buttonText = sectionData?.buttonText || 'Explore Curriculum';
  let buttonLink = sectionData?.buttonLink || '#curriculum';

  // Automatically ensure Explore Curriculum navigates smoothly to the curriculum section
  if (
    buttonText.toLowerCase().includes('curriculum') &&
    (buttonLink === '/student/lessons' || !buttonLink || buttonLink === '#curriculum' || buttonLink === '#process' || buttonLink === '/#curriculum' || buttonLink === '/#process')
  ) {
    buttonLink = '#curriculum';
  }

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-12 pb-20 border-b border-zinc-800/80">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 subtle-fret-bg opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 z-10">
        {/* Top pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-amber-500/30 text-xs font-medium text-amber-300 shadow-xl gold-glow animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{adminName} Guitar Academy — Official Enrollment Open</span>
        </div>

        {/* Main Editorial Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-5xl mx-auto leading-[1.1]">
          {title.includes(adminName) ? (
            <>
              {title.split(adminName)[0]}
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent underline decoration-amber-500/40 decoration-4">
                {adminName}
              </span>
              {title.split(adminName)[1]}
            </>
          ) : (
            title
          )}
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-zinc-300 max-w-3xl mx-auto font-light leading-relaxed">
          {subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href={buttonLink}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-zinc-950 font-extrabold text-base transition shadow-xl shadow-amber-950/60 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>{buttonText}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </Link>

          <button
            onClick={() => setIsVideoOpen(true)}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-white font-bold text-base transition flex items-center justify-center gap-3 backdrop-blur-md cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </div>
            <span>Watch Academy Trailer</span>
          </button>
        </div>

        {/* Highlight Stats Row */}
        <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Students</span>
            </div>
            <p className="text-2xl font-bold text-white">500+ Guitarists</p>
            <p className="text-xs text-zinc-400">Across Bangladesh & Global</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Curriculum</span>
            </div>
            <p className="text-2xl font-bold text-white">50+ Video Modules</p>
            <p className="text-xs text-zinc-400">Beginner to Virtuoso</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Music className="w-4 h-4" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Tab Files</span>
            </div>
            <p className="text-2xl font-bold text-white">100% Custom TABs</p>
            <p className="text-xs text-zinc-400">PDF & Sheet Downloads</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Experience</span>
            </div>
            <p className="text-2xl font-bold text-white">20+ Years</p>
            <p className="text-xs text-zinc-400">Master Instructor Legacy</p>
          </div>
        </div>
      </div>

      {/* Trailer Video Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Play className="w-4 h-4 text-amber-400 fill-current" />
                <span>{adminName} Masterclass Trailer</span>
              </h3>
              <button
                onClick={() => setIsVideoOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full">
              <iframe
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Guitart Academy Trailer"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
