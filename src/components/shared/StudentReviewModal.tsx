'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import {
  Star,
  Quote,
  CheckCircle2,
  X,
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  MessageSquarePlus,
  Trash2,
} from 'lucide-react';

interface StudentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentReviewModal: React.FC<StudentReviewModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, activeRole, reviews, submitReview, deleteReview, adminName } = useStore();

  // Find if student already gave a review
  const existingReview = reviews.find(
    (r) =>
      (currentUser?.email && r.studentEmail?.toLowerCase() === currentUser.email.toLowerCase()) ||
      (currentUser?.id && r.studentId === currentUser.id)
  );

  const [rating, setRating] = useState<number>(existingReview?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 5);
      setComment(existingReview.comment || '');
    } else {
      setRating(5);
      setComment('');
    }
    setErrorMsg('');
    setSuccessMsg('');
  }, [existingReview, isOpen]);

  if (!isOpen) return null;

  const isStudent = activeRole === 'student' || currentUser?.role === 'student';
  const studentName = currentUser?.fullName || 'Guitart Student';
  const studentLevel = currentUser?.level ? `${currentUser.level} Student` : 'Guitar Student';
  const studentAvatar =
    currentUser?.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentUser?.email) {
      setErrorMsg('Please log in with your student account to submit a review.');
      return;
    }

    if (!comment.trim() || comment.trim().length < 5) {
      setErrorMsg('Please write at least 5 characters for your review.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitReview({
        studentId: currentUser.id,
        studentEmail: currentUser.email,
        name: studentName,
        level: studentLevel,
        avatar: studentAvatar,
        rating: rating,
        comment: comment.trim(),
      });

      if (res.success) {
        setSuccessMsg('Your review is live on the Guitart academy showcase! ⭐');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMsg(res.error || 'Failed to submit review.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error submitting review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Decorative ambient gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 relative">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                {existingReview ? 'Update Your Review' : 'Share Your Student Review'}
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-zinc-400">
                Inspire fellow guitarists with your {adminName} academy experience
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {!isStudent && !currentUser ? (
          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center space-y-4">
            <p className="text-sm text-zinc-300">
              Reviews can only be submitted by enrolled students with an active Guitart account.
            </p>
            <div className="flex justify-center gap-3">
              <a
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition"
              >
                Log In to Review
              </a>
              <a
                href="/signup"
                className="px-5 py-2.5 rounded-xl bg-zinc-800 text-zinc-200 font-bold text-xs hover:bg-zinc-700 transition"
              >
                Enroll as Student
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Student Preview Info */}
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-center gap-3.5">
              <img
                src={studentAvatar}
                alt={studentName}
                className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/40"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
                  {studentName} <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </h4>
                <p className="text-xs text-amber-400 font-mono">{studentLevel}</p>
                <p className="text-[11px] text-zinc-500 truncate">{currentUser?.email}</p>
              </div>
            </div>

            {/* Star Rating Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                Your Rating <span className="text-amber-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = (hoverRating || rating) >= star;
                  return (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 text-zinc-600 hover:scale-115 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          isActive
                            ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                            : 'text-zinc-700 hover:text-zinc-500'
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="text-xs font-mono font-bold text-amber-400 ml-2">
                  {rating === 5
                    ? '5.0 / 5.0 (Masterclass)'
                    : rating === 4
                    ? '4.0 / 5.0 (Great Experience)'
                    : rating === 3
                    ? '3.0 / 5.0 (Good)'
                    : `${rating}.0 / 5.0`}
                </span>
              </div>
            </div>

            {/* Review Comment */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                Review & Academy Experience <span className="text-amber-400">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={`Share how ${adminName}'s lessons, techniques, or tabs helped transform your guitar playing...`}
                rows={4}
                required
                className="w-full p-4 rounded-2xl bg-zinc-950 border border-zinc-700/80 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 transition resize-none leading-relaxed"
              />
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>Minimum 5 characters</span>
                <span>{comment.length} characters</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
              {existingReview ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete your review?')) {
                      setIsSubmitting(true);
                      await deleteReview(existingReview.id);
                      setIsSubmitting(false);
                      onClose();
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Review</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !comment.trim()}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs transition shadow-lg shadow-amber-950/60 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{existingReview ? 'Update Review' : 'Submit Review'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
