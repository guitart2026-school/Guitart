'use client';

import React, { useState, useRef } from 'react';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmationModal } from '@/components/shared/ConfirmationModal';
import { Lesson, StudentLevel } from '@/lib/types';
import { BookOpen, Plus, Search, Edit3, Trash2, Video, Headphones, FileText, X, Upload, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { uploadImageToCloudinary, deleteImageFromCloudinary, isCloudinaryUrl } from '@/lib/uploadClient';
import { formatYouTubeEmbedUrl, formatGoogleDriveAudioUrl, formatGoogleDriveDownloadUrl } from '@/lib/utils';

export default function AdminLessonsPage() {
  const { lessons, createLesson, updateLesson, deleteLesson, adminName } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<StudentLevel>('Beginner');
  const [lessonNumber, setLessonNumber] = useState(1);
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [tabFileUrl, setTabFileUrl] = useState('');
  const [tabPreviewText, setTabPreviewText] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [instructorNotes, setInstructorNotes] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Image Upload states
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isDeletingThumbnail, setIsDeletingThumbnail] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLevel('Beginner');
    setLessonNumber(lessons.length + 1);
    setDurationMinutes(20);
    setVideoUrl('');
    setAudioUrl('');
    setTabFileUrl('');
    setTabPreviewText('');
    setThumbnail('');
    setInstructorNotes('');
    setIsPublic(false);
    setUploadError('');
    setEditingLesson(null);
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingThumbnail(true);
    setUploadError('');

    try {
      const res = await uploadImageToCloudinary(file, 'guitart_academy/lessons');
      if (res.url) {
        setThumbnail(res.url);
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to upload lesson thumbnail to Cloudinary.');
    } finally {
      setIsUploadingThumbnail(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveThumbnail = async () => {
    if (!thumbnail) return;

    setIsDeletingThumbnail(true);
    setUploadError('');

    try {
      if (isCloudinaryUrl(thumbnail)) {
        await deleteImageFromCloudinary(thumbnail);
      }
      setThumbnail('');
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to delete thumbnail from Cloudinary.');
    } finally {
      setIsDeletingThumbnail(false);
    }
  };

  const handleOpenEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setTitle(lesson.title);
    setDescription(lesson.description);
    setLevel(lesson.level);
    setLessonNumber(lesson.lessonNumber);
    setDurationMinutes(lesson.durationMinutes);
    setVideoUrl(lesson.videoUrl);
    setAudioUrl(lesson.audioUrl || '');
    setTabFileUrl(lesson.tabFileUrl || '');
    setTabPreviewText(lesson.tabPreviewText || '');
    setThumbnail(lesson.thumbnail || '');
    setInstructorNotes(lesson.instructorNotes || '');
    setIsPublic(!!lesson.isPublic);
    setIsCreateOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const normalizedVideoUrl = videoUrl?.trim() ? formatYouTubeEmbedUrl(videoUrl.trim()) : '';
    const normalizedAudioUrl = audioUrl?.trim() ? formatGoogleDriveAudioUrl(audioUrl.trim()) : '';
    const normalizedTabFileUrl = tabFileUrl?.trim() ? formatGoogleDriveDownloadUrl(tabFileUrl.trim()) : '';
    const normalizedTabPreviewText = tabPreviewText?.trim() || '';
    const normalizedInstructorNotes = instructorNotes?.trim() || '';

    if (editingLesson) {
      updateLesson(editingLesson.id, {
        title,
        description,
        level,
        lessonNumber: Number(lessonNumber),
        videoUrl: normalizedVideoUrl,
        audioUrl: normalizedAudioUrl,
        tabFileUrl: normalizedTabFileUrl,
        tabPreviewText: normalizedTabPreviewText,
        thumbnail,
        durationMinutes: Number(durationMinutes),
        instructorNotes: normalizedInstructorNotes,
        isPublic,
      });
    } else {
      createLesson({
        title,
        description,
        level,
        lessonNumber: Number(lessonNumber),
        videoUrl: normalizedVideoUrl,
        audioUrl: normalizedAudioUrl,
        tabFileUrl: normalizedTabFileUrl,
        tabPreviewText: normalizedTabPreviewText,
        thumbnail,
        durationMinutes: Number(durationMinutes),
        instructorNotes: normalizedInstructorNotes,
        isPublic,
      });
    }

    setIsCreateOpen(false);
    resetForm();
  };

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'All' || lesson.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Curriculum Lesson Management"
        subtitle="Create, update, and manage video masterclasses, audio backings, & TAB sheet attachments."
      />

      <div className="px-6 space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search curriculum modules..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <button
              onClick={() => {
                resetForm();
                setIsCreateOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-950/40 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Lesson</span>
            </button>
          </div>
        </div>

        {/* Lessons Table */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Academy Curriculum Modules ({filteredLessons.length})</span>
          </h3>

          {filteredLessons.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-8 h-8" />}
              title="No Lessons Found"
              description="No curriculum lessons match your filter query."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase tracking-wider">
                    <th className="pb-3 px-4 whitespace-nowrap">#</th>
                    <th className="pb-3 px-4">Title & Description</th>
                    <th className="pb-3 px-4 whitespace-nowrap">Level</th>
                    <th className="pb-3 px-4 whitespace-nowrap">Media Attachments</th>
                    <th className="pb-3 px-4 whitespace-nowrap">Duration</th>
                    <th className="pb-3 px-4 text-right whitespace-nowrap min-w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {filteredLessons.map((lesson) => (
                    <tr key={lesson.id} className="hover:bg-zinc-800/40 transition">
                      <td className="py-4 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                        #{lesson.lessonNumber.toString().padStart(2, '0')}
                      </td>
                      <td className="py-4 px-4 max-w-sm">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-white leading-snug">{lesson.title}</p>
                          {lesson.isPublic && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                              Homepage
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{lesson.description}</p>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={lesson.level} size="sm" />
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          {lesson.videoUrl && <span className="p-1 rounded bg-zinc-800 text-zinc-300">Video</span>}
                          {lesson.audioUrl && <span className="p-1 rounded bg-zinc-800 text-zinc-300">Audio</span>}
                          {lesson.tabFileUrl && <span className="p-1 rounded bg-zinc-800 text-zinc-300">TAB</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-zinc-300 whitespace-nowrap">{lesson.durationMinutes}m</td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(lesson)}
                            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 transition cursor-pointer"
                            title="Edit Lesson"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingLessonId(lesson.id)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                            title="Delete Lesson"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingLesson ? 'Edit Curriculum Lesson' : 'Create New Curriculum Lesson'}
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1">Lesson Number *</label>
                  <input
                    type="number"
                    value={lessonNumber}
                    onChange={(e) => setLessonNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1">Level Tier *</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as StudentLevel)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1">Lesson Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Minor Pentatonic Soloing & Pitch Bends"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1">Description *</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed breakdown of what students will learn..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1 text-xs">
                    YouTube Video URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    onBlur={(e) => {
                      if (e.target.value) {
                        setVideoUrl(formatYouTubeEmbedUrl(e.target.value));
                      }
                    }}
                    placeholder="https://www.youtube.com/watch?v=... (optional)"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Accepts standard YouTube watch links, shorts, or embed URLs. Auto-converted.
                  </p>
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1 text-xs">
                    Audio MP3 / Google Drive URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    onBlur={(e) => {
                      if (e.target.value) {
                        setAudioUrl(formatGoogleDriveAudioUrl(e.target.value));
                      }
                    }}
                    placeholder="https://drive.google.com/file/d/... or .mp3 URL (optional)"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Accepts Google Drive share links (set to Anyone with link) or direct MP3 files.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1 text-xs">
                    PDF TAB / Google Drive URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={tabFileUrl}
                    onChange={(e) => setTabFileUrl(e.target.value)}
                    onBlur={(e) => {
                      if (e.target.value) {
                        setTabFileUrl(formatGoogleDriveDownloadUrl(e.target.value));
                      }
                    }}
                    placeholder="https://drive.google.com/file/d/... or /tabs/file.pdf (optional)"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Accepts Google Drive PDF links (set to Anyone with link) or local /tabs/ files.
                  </p>
                </div>

                {/* Streamlined Thumbnail Cover Image Upload */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-zinc-400 font-bold uppercase tracking-wider text-xs">
                      Thumbnail Cover Image
                    </label>
                    {thumbnail && (
                      <button
                        type="button"
                        disabled={isDeletingThumbnail || isUploadingThumbnail}
                        onClick={handleRemoveThumbnail}
                        className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Remove thumbnail and delete from Cloudinary"
                      >
                        {isDeletingThumbnail ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin text-rose-400" />
                            <span>Removing...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3 h-3 text-rose-400" />
                            <span>Remove</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                  />

                  <div className="flex items-center gap-2.5">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt="Thumbnail"
                        className="w-9 h-9 rounded-xl object-cover border border-amber-500/40 shrink-0 bg-zinc-900 shadow-sm"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600 shrink-0">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}

                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={thumbnail}
                        onChange={(e) => setThumbnail(e.target.value)}
                        placeholder="https://res.cloudinary.com/..."
                        className="w-full pl-3 pr-24 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        disabled={isUploadingThumbnail}
                        onClick={() => thumbnailInputRef.current?.click()}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border border-zinc-700/60"
                      >
                        {isUploadingThumbnail ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3 h-3" />
                            <span>Upload</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-500 mt-1">
                    Upload directly to Cloudinary or paste a direct image URL.
                  </p>

                  {uploadError && (
                    <p className="text-[11px] text-rose-400 font-medium mt-1">{uploadError}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1 text-xs">
                  ASCII TAB Preview Notation (Optional)
                </label>
                <textarea
                  rows={3}
                  value={tabPreviewText}
                  onChange={(e) => setTabPreviewText(e.target.value)}
                  placeholder="E|------------------|\nB|------------------|\n..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-amber-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase tracking-wider mb-1 text-xs">
                  Instructor {adminName} Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={instructorNotes}
                  onChange={(e) => setInstructorNotes(e.target.value)}
                  placeholder="Key practice takeaways and tips for students..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs"
                />
              </div>

              {/* Homepage Public Preview Tick Box */}
              <div className="p-4 rounded-2xl bg-zinc-950/90 border border-amber-500/30 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <label htmlFor="isPublicLesson" className="text-xs font-bold text-white flex items-center gap-2 cursor-pointer">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Publish to Homepage (Public Free Preview)</span>
                  </label>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    When ticked, this lesson is showcased publicly on the Homepage and unlocked for all prospective students & visitors.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="isPublicLesson"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500/25 cursor-pointer accent-amber-500 shrink-0"
                />
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg"
                >
                  {editingLesson ? 'Save Changes' : 'Create Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingLessonId}
        title="Delete Curriculum Lesson"
        description="Are you sure you want to delete this lesson? This action cannot be undone."
        confirmText="Delete Lesson"
        isDestructive
        onConfirm={() => {
          if (deletingLessonId) deleteLesson(deletingLessonId);
        }}
        onClose={() => setDeletingLessonId(null)}
      />
    </div>
  );
}
