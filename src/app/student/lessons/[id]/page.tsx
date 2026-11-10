'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Play,
  Pause,
  Download,
  CheckCircle2,
  Check,
  Lock,
  ArrowLeft,
  Headphones,
  FileText,
  Video,
  Award,
  Phone,
  Clock,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import {
  formatYouTubeEmbedUrl,
  formatGoogleDriveAudioUrl,
  formatGoogleDriveDownloadUrl,
  isValidMobile,
  isLessonUnlockedForStudent,
} from '@/lib/utils';

export default function StudentLessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const { lessons, users, currentUser, lessonAccess, lessonProgress, markLessonProgress, addToast, adminName } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const studentId = currentUser?.id || '';
  const hasValidMobile = mounted ? isValidMobile(currentUser?.mobile || '') : true;
  const lesson = lessons.find((l) => l.id === lessonId);

  // Check access
  const isUnlocked = lesson ? isLessonUnlockedForStudent(lesson, currentUser, users, lessonAccess) : false;

  // Check progress
  const prog = lessonProgress.find((lp) => lp.studentId === studentId && lp.lessonId === lessonId);
  const currentStatus: 'Unlocked' | 'In Progress' | 'Completed' =
    (prog?.status as 'Unlocked' | 'In Progress' | 'Completed') || 'Unlocked';

  // Status dropdown state
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    if (!audioRef.current || !lesson?.audioUrl) {
      addToast('No audio backing track available for this lesson.', 'info');
      return;
    }
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlayingAudio(true);
        })
        .catch((err) => {
          setIsPlayingAudio(false);
          addToast('Could not play audio track. Please check file permissions or link.', 'info');
          console.warn('Audio playback notice:', err);
        });
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pos * duration;
  };

  if (!lesson) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Lesson Not Found</h2>
        <p className="text-xs text-zinc-400">The requested lesson does not exist in Guitart Academy.</p>
        <Link href="/student/lessons" className="inline-block px-4 py-2 bg-amber-500 text-zinc-950 font-bold text-xs rounded-xl">
          Return to Lessons List
        </Link>
      </div>
    );
  }

  // Mobile Contact Number Mandatory Check
  if (!hasValidMobile && currentUser?.role === 'student') {
    return (
      <div className="space-y-8">
        <DashboardHeader
          title="Mobile Number Verification Required"
          subtitle="Complete your student profile to access lessons"
        />
        <div className="max-w-2xl mx-auto px-6 py-16 text-center space-y-6 bg-zinc-900 border border-amber-500/40 rounded-3xl backdrop-blur-md shadow-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-950/40">
            <Phone className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
              Profile Action Required
            </span>
            <h2 className="text-2xl font-bold text-white">11-Digit Mobile Number Missing</h2>
            <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
              Academy policy requires all registered students to have a valid 11-digit mobile contact number before accessing curriculum masterclasses, streaming backing tracks, or downloading TAB notation.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/student/profile"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-lg shadow-amber-950/50 hover:scale-105 active:scale-95"
            >
              Update Mobile Number in Profile →
            </Link>
            <Link
              href="/student/lessons"
              className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition"
            >
              Back to Lessons Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="space-y-8">
        <DashboardHeader title={`Lesson 0${lesson.lessonNumber} — Locked`} />
        <div className="max-w-2xl mx-auto px-6 py-16 text-center space-y-6 bg-zinc-900 border border-rose-500/30 rounded-3xl backdrop-blur-md shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider">Access Restricted</span>
            <h2 className="text-2xl font-bold text-white">{lesson.title}</h2>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              This lesson is currently locked for your student profile. {adminName} unlocks lessons sequentially once earlier prerequisites are completed.
            </p>
          </div>
          <button
            onClick={() => router.push('/student/lessons')}
            className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition"
          >
            ← Back to Available Lessons
          </button>
        </div>
      </div>
    );
  }

  const handleDownloadTab = () => {
    if (!lesson.tabFileUrl) {
      addToast('No PDF tab document attached for this lesson.', 'info');
      return;
    }
    const downloadUrl = formatGoogleDriveDownloadUrl(lesson.tabFileUrl);
    window.open(downloadUrl, '_blank');
    addToast(`Opening ${lesson.title} Tab PDF...`, 'success');
  };

  // Optional Media Conditions
  const hasVideo = Boolean(lesson.videoUrl && lesson.videoUrl.trim().length > 0);
  const hasAudio = Boolean(lesson.audioUrl && lesson.audioUrl.trim().length > 0);
  const hasTabFile = Boolean(lesson.tabFileUrl && lesson.tabFileUrl.trim().length > 0);
  const hasTabText = Boolean(lesson.tabPreviewText && lesson.tabPreviewText.trim().length > 0);
  const hasTab = hasTabFile || hasTabText;
  const hasNotes = Boolean(lesson.instructorNotes && lesson.instructorNotes.trim().length > 0);

  return (
    <div className="space-y-8">
      <DashboardHeader
        title={`Lesson ${lesson.lessonNumber.toString().padStart(2, '0')} — ${lesson.title}`}
        subtitle={`${lesson.level} Level • ${lesson.durationMinutes} Minutes`}
      />

      <div className="px-6 space-y-8 max-w-6xl mx-auto">
        {/* Top Back & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/student/lessons"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-400 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Lessons Catalog
          </Link>

          <div className="flex items-center gap-3">
            <StatusBadge status={currentStatus} />

            {/* Status Dropdown Menu */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                type="button"
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition flex items-center gap-2 shadow-md shadow-amber-950/40 cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>Status</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    statusDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {statusDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 p-1.5 rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-2xl z-50 animate-fade-in backdrop-blur-xl space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                    Update Lesson Status
                  </div>

                  {/* Option: In Progress */}
                  <button
                    type="button"
                    onClick={() => {
                      markLessonProgress(lesson.id, 'In Progress');
                      setStatusDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                      currentStatus === 'In Progress'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white">In Progress</div>
                        <div className="text-[10px] text-zinc-400 font-normal">Currently practicing module</div>
                      </div>
                    </div>
                    {currentStatus === 'In Progress' && <Check className="w-4 h-4 text-amber-400 shrink-0 ml-2" />}
                  </button>

                  {/* Option: Completed */}
                  <button
                    type="button"
                    onClick={() => {
                      markLessonProgress(lesson.id, 'Completed');
                      setStatusDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                      currentStatus === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white">Completed</div>
                        <div className="text-[10px] text-zinc-400 font-normal">Lesson mastered & validated</div>
                      </div>
                    </div>
                    {currentStatus === 'Completed' && <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                  </button>

                  {/* Option: Unlocked (Not Started) */}
                  <button
                    type="button"
                    onClick={() => {
                      markLessonProgress(lesson.id, 'Unlocked');
                      setStatusDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                      currentStatus === 'Unlocked'
                        ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 shrink-0">
                        <Play className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-zinc-300">Unlocked</div>
                        <div className="text-[10px] text-zinc-500 font-normal">Not started yet</div>
                      </div>
                    </div>
                    {currentStatus === 'Unlocked' && <Check className="w-4 h-4 text-zinc-400 shrink-0 ml-2" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Video Player Section — Only rendered if videoUrl is provided */}
        {hasVideo && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              <Video className="w-4 h-4" />
              <span>High Definition Masterclass Breakdown</span>
            </div>

            <div className="aspect-video rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl relative gold-border-glow">
              <iframe
                className="w-full h-full"
                src={`${formatYouTubeEmbedUrl(lesson.videoUrl)}?autoplay=0`}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Audio Backing & TAB Notation Row — Only rendered if Audio or Tab is provided */}
        {(hasAudio || hasTab) && (
          <div className={`grid grid-cols-1 ${hasAudio && hasTab ? 'lg:grid-cols-2' : ''} gap-8`}>
            {/* Audio Player Card — Only rendered if audioUrl is provided */}
            {hasAudio && (
              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                      <Headphones className="w-4 h-4" />
                      <span>Audio Backing Track & Metronome</span>
                    </div>
                    <span className="text-[11px] text-zinc-500 font-mono">MP3 Audio</span>
                  </div>

                  <p className="text-xs text-zinc-400">
                    Practice along with studio backing track recorded specifically for {lesson.title}.
                  </p>
                </div>

                {/* Hidden HTML5 Audio Element */}
                <audio
                  ref={audioRef}
                  src={formatGoogleDriveAudioUrl(lesson.audioUrl!)}
                  onTimeUpdate={() => {
                    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
                  }}
                  onLoadedMetadata={() => {
                    if (audioRef.current) setDuration(audioRef.current.duration);
                  }}
                  onEnded={() => {
                    setIsPlayingAudio(false);
                    setCurrentTime(0);
                  }}
                  onError={() => {
                    setIsPlayingAudio(false);
                  }}
                  className="hidden"
                />

                {/* Custom Interactive Audio Controls */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={toggleAudio}
                    className="w-12 h-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg shadow-amber-950/50 shrink-0 cursor-pointer transition hover:scale-105 active:scale-95"
                  >
                    {isPlayingAudio ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                      <span>{formatAudioTime(currentTime)}</span>
                      <span>{duration > 0 ? formatAudioTime(duration) : 'Audio Stream'}</span>
                    </div>
                    <div
                      onClick={handleSeek}
                      className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden cursor-pointer relative"
                    >
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-150"
                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : isPlayingAudio ? 50 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Viewer & PDF Download Card — Only rendered if tabFileUrl or tabPreviewText is provided */}
            {hasTab && (
              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                    <FileText className="w-4 h-4" />
                    <span>Interactive Guitar TAB Sheet</span>
                  </div>

                  {hasTabFile && (
                    <button
                      onClick={handleDownloadTab}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-bold transition flex items-center gap-1.5 border border-zinc-700 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF Tab</span>
                    </button>
                  )}
                </div>

                {/* TAB ASCII Container */}
                {hasTabText ? (
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-amber-300 overflow-x-auto whitespace-pre leading-relaxed select-all">
                    {lesson.tabPreviewText}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 py-2">
                    PDF Tab sheet is attached above. Click the download button to open or print.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Instructor Notes — Only rendered if instructorNotes is provided */}
        {hasNotes && (
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>{adminName} Instructor Notes & Key Takeaways</span>
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed pl-7 whitespace-pre-line">
              {lesson.instructorNotes}
            </p>
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
      </div>
    </div>
  );
}
