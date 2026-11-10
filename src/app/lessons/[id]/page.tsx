'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Play,
  Pause,
  Download,
  CheckCircle2,
  Headphones,
  FileText,
  Video,
  Sparkles,
  Clock,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import {
  formatYouTubeEmbedUrl,
  formatGoogleDriveAudioUrl,
  formatGoogleDriveDownloadUrl,
} from '@/lib/utils';

export default function PublicLessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const { lessons, currentUser, adminName } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const lesson = lessons.find((l) => l.id === lessonId);

  // Audio Player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const formatAudioTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const toggleAudio = () => {
    if (!audioRef.current || !lesson?.audioUrl) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlayingAudio(true);
        })
        .catch((e) => {
          console.error('Audio play error:', e);
        });
    }
  };

  if (!lesson) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-4 pt-28">
        <h2 className="text-2xl font-bold text-white font-mono">Masterclass Not Found</h2>
        <p className="text-xs text-zinc-400">The lesson you are looking for does not exist or has been relocated.</p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-amber-500 text-zinc-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition"
        >
          Return to Homepage
        </Link>
      </div>
    );
  }

  // Optional Media Conditions
  const hasVideo = Boolean(lesson.videoUrl && lesson.videoUrl.trim().length > 0);
  const hasAudio = Boolean(lesson.audioUrl && lesson.audioUrl.trim().length > 0);
  const hasTabFile = Boolean(lesson.tabFileUrl && lesson.tabFileUrl.trim().length > 0);
  const hasTabText = Boolean(lesson.tabPreviewText && lesson.tabPreviewText.trim().length > 0);
  const hasTab = hasTabFile || hasTabText;
  const hasNotes = Boolean(lesson.instructorNotes && lesson.instructorNotes.trim().length > 0);

  const embedUrl = hasVideo && lesson.videoUrl ? formatYouTubeEmbedUrl(lesson.videoUrl) : '';
  const downloadUrl = hasTabFile && lesson.tabFileUrl ? formatGoogleDriveDownloadUrl(lesson.tabFileUrl) : '';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Masterclass Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
              Lesson #{lesson.lessonNumber.toString().padStart(2, '0')}
            </span>
            <StatusBadge status={lesson.level} />
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Publicly Unlocked</span>
            </span>
            <span className="text-xs font-mono text-zinc-500 flex items-center gap-1 ml-auto">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> {lesson.durationMinutes} Minutes
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {lesson.title}
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl">
            {lesson.description}
          </p>
        </div>

        {/* Video Masterclass Player — Only rendered if videoUrl is provided */}
        {hasVideo && embedUrl && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
              <Video className="w-4 h-4" />
              <span>High Definition Masterclass Video</span>
            </div>

            <div className="relative aspect-video rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl">
              <iframe
                src={embedUrl}
                title={lesson.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Audio Backing Track Player & ASCII TAB Sheet — Only rendered if Audio or Tab is provided */}
        {(hasAudio || hasTab) && (
          <div className={`grid grid-cols-1 ${hasAudio && hasTab ? 'lg:grid-cols-2' : ''} gap-8`}>
            {/* Audio Backing Track Module */}
            {hasAudio && lesson.audioUrl && (
              <div className="p-6 sm:p-7 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-5 shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                      <Headphones className="w-4 h-4" />
                      <span>Practice Audio Backing Track</span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500">MP3 Studio Quality</span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Play along with {adminName}&apos;s dedicated backing audio track to lock in your rhythm and groove.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-3">
                  <audio
                    ref={audioRef}
                    src={formatGoogleDriveAudioUrl(lesson.audioUrl)}
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                    onEnded={() => setIsPlayingAudio(false)}
                    preload="metadata"
                  />

                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={toggleAudio}
                      className="w-11 h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center font-black transition shadow-lg shadow-amber-950/60 cursor-pointer shrink-0"
                    >
                      {isPlayingAudio ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1 space-y-1">
                      <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={(e) => {
                          const newTime = Number(e.target.value);
                          setCurrentTime(newTime);
                          if (audioRef.current) audioRef.current.currentTime = newTime;
                        }}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                      <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                        <span>{formatAudioTime(currentTime)}</span>
                        <span>{formatAudioTime(duration)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructor Notes inside Audio card if present */}
                {hasNotes && (
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Instructor Tip • {adminName}</span>
                    </div>
                    <p className="text-xs text-zinc-300 italic leading-relaxed whitespace-pre-line">
                      &quot;{lesson.instructorNotes}&quot;
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB Notation Sheet & PDF Download */}
            {hasTab && (
              <div className="p-6 sm:p-7 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-5 shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                      <FileText className="w-4 h-4" />
                      <span>Curriculum TAB Notation</span>
                    </div>

                    {downloadUrl && (
                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-bold transition flex items-center gap-1.5 border border-zinc-700"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF TAB</span>
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Review guitar tablature notation, fretboard positioning, and fingering patterns below:
                  </p>
                </div>

                {/* ASCII Notation Viewer */}
                {hasTabText ? (
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-amber-300 overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                    {lesson.tabPreviewText}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 py-2">
                    PDF Tab sheet is attached above. Click the download button to open or print.
                  </p>
                )}

                <div className="text-[11px] font-mono text-zinc-500 flex items-center justify-between pt-2 border-t border-zinc-800">
                  <span>Standard Guitar Tuning</span>
                  <span className="text-amber-400">Tempo: 90-120 BPM</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fallback if lesson has no media attachments */}
        {!hasVideo && !hasAudio && !hasTab && !hasNotes && (
          <div className="p-12 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-3 shadow-xl">
            <BookOpen className="w-10 h-10 text-amber-400/60 mx-auto" />
            <h3 className="text-lg font-bold text-white">Curriculum Overview</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              {lesson.description || 'Lesson materials and media will be updated soon by the academy instructor.'}
            </p>
          </div>
        )}

        {/* Bottom Call to Action for Logged Out Visitors */}
        {!currentUser && (
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl gold-border-glow">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ready for the full experience?</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white">
                Unlock 100+ Structured Masterclasses & Live Mentorship
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Join Guitart Academy to track your lesson progress, submit videos for direct instructor critique, and receive physical masterclass attendance certification.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/login"
                className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs transition shadow-lg shadow-amber-950/60 flex items-center gap-2"
              >
                <span>Join Academy Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
