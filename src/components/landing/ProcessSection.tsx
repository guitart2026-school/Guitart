import React from 'react';
import { Pickaxe, Music2, Flame, Trophy } from 'lucide-react';

export const ProcessSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Foundational Mechanics',
      description: 'Master posture, wrist relaxation, strict alternate picking, and basic open chord transitions.',
      icon: Pickaxe,
      level: 'Beginner',
    },
    {
      number: '02',
      title: 'CAGED & Pentatonic Phrasing',
      description: 'Unlock fretboard visualization, minor pentatonic scale shapes, bending accuracy, and vibrato.',
      icon: Music2,
      level: 'Intermediate',
    },
    {
      number: '03',
      title: 'Legato & Expressive Lead',
      description: 'Fluid hammer-ons, pull-offs, modal improvisation (Dorian/Mixolydian), and blues-rock soloing.',
      icon: Flame,
      level: 'Intermediate - Advanced',
    },
    {
      number: '04',
      title: 'Virtuosity & Composition',
      description: '5-string sweep arpeggios, neoclassical tapping, composition dynamics, and stage performance.',
      icon: Trophy,
      level: 'Advanced',
    },
  ];

  return (
    <section id="curriculum" className="py-24 bg-zinc-950 border-b border-zinc-800/80 scroll-mt-20 relative">
      {/* Anchor for backwards compatibility with #process */}
      <div id="process" className="absolute -top-24 left-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-widest px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
            Curriculum Roadmap
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            The 4-Stage Path to <span className="text-amber-400">Guitar Virtuosity</span>
          </h2>
          <p className="text-zinc-400 text-base">
            Every lesson is structured to build upon the last. Clear benchmarks ensure you never feel lost or overwhelmed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-amber-500/50 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-mono font-extrabold text-zinc-700 group-hover:text-amber-400/30 transition">
                      {step.number}
                    </span>
                    <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-amber-400 group-hover:scale-110 transition">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition">
                    {step.title}
                  </h3>

                  <p className="text-xs text-zinc-400 leading-relaxed font-light mb-6">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-800/60">
                  <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {step.level}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
