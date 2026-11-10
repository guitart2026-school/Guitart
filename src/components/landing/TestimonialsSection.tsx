'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import {
  Star,
  Quote,
  CheckCircle2,
  Sparkles,
  MessageSquarePlus,
} from 'lucide-react';
import { StudentReviewModal } from '@/components/shared/StudentReviewModal';
import { StudentReview } from '@/lib/types';

interface ReviewCardProps {
  review: StudentReview;
  isMarquee?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, isMarquee = false }) => {
  const { adminName } = useStore();
  const formattedComment = (review.comment || '').replace(/Ershad Zaman/g, adminName);

  return (
    <div
      className={`${
        isMarquee ? 'w-[320px] sm:w-[380px] shrink-0' : 'w-full'
      } p-6 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800/90 hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-2xl hover:shadow-amber-500/15 group relative overflow-hidden`}
    >
      {/* Top ambient gold corner */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full group-hover:bg-amber-500/10 transition-colors pointer-events-none" />

      <div className="space-y-4">
        {/* Stars & Quote */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(review.rating || 5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current drop-shadow-[0_0_4px_rgba(245,158,11,0.4)]" />
            ))}
          </div>
          <Quote className="w-7 h-7 text-zinc-800 group-hover:text-amber-500/20 transition-colors" />
        </div>

        {/* Comment Text */}
        <p className="text-sm text-zinc-300 italic leading-relaxed line-clamp-4">
          &quot;{formattedComment}&quot;
        </p>
      </div>

      {/* Student Identity */}
      <div className="flex items-center gap-3.5 pt-4 border-t border-zinc-800/80">
        <img
          src={
            review.avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
          }
          alt={review.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/40 group-hover:border-amber-400 transition shadow-md"
        />
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
            {review.name} <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          </h4>
          <p className="text-xs text-amber-400 font-mono font-medium truncate">{review.level}</p>
        </div>
      </div>
    </div>
  );
};

export const TestimonialsSection: React.FC = () => {
  const { reviews, currentUser, adminName } = useStore();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Filter approved reviews or fallback to all
  const displayReviews = reviews && reviews.length > 0 ? reviews : [];
  
  // Animate marquee only if 4 or more reviews are available
  const isAnimated = displayReviews.length >= 4;
  const marqueeItems = isAnimated ? [...displayReviews, ...displayReviews] : [];

  return (
    <section id="testimonials" className="py-24 bg-zinc-950 border-b border-zinc-800/80 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-amber-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Reviews & Testimonials</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Hear From Our <span className="text-amber-400">Guitarists</span>
            </h2>

            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Over 500+ aspiring & performing guitarists have refined their technique, tone, and musicality with {adminName}.
            </p>
          </div>

          {/* Action Header: Write Review Button */}
          <div className="flex items-center">
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs transition shadow-lg shadow-amber-950/60 flex items-center gap-2 cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>{currentUser?.role === 'student' ? 'Share Your Review' : 'Give a Review'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* REVIEWS DISPLAY: Marquee animation if >= 4 reviews, Still grid if < 4 reviews */}
      {isAnimated ? (
        <div className="relative w-full overflow-hidden pt-6 pb-10">
          {/* Subtle edge fade overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />

          <div className="flex gap-6 overflow-x-auto no-scrollbar animate-marquee">
            {marqueeItems.map((t: StudentReview, idx: number) => (
              <ReviewCard key={`${t.id}-${idx}`} review={t} isMarquee={true} />
            ))}
          </div>
        </div>
      ) : displayReviews.length > 0 ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6">
          <div
            className={`grid gap-6 ${
              displayReviews.length === 1
                ? 'grid-cols-1 max-w-lg mx-auto'
                : displayReviews.length === 2
                ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto'
                : 'grid-cols-1 md:grid-cols-3'
            }`}
          >
            {displayReviews.map((t: StudentReview) => (
              <ReviewCard key={t.id} review={t} isMarquee={false} />
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto px-4 text-center py-12">
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <Quote className="w-8 h-8 text-amber-500/40 mx-auto" />
            <p className="text-sm text-zinc-300">
              Be the first to share your learning experience with {adminName} at Guitart Academy!
            </p>
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition"
            >
              Write a Review ⭐
            </button>
          </div>
        </div>
      )}

      {/* Review Modal Dialog */}
      <StudentReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </section>
  );
};
