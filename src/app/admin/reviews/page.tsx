'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import {
  Star,
  Trash2,
  Search,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Filter,
  MessageSquare,
  Quote,
  TrendingUp,
  Award,
} from 'lucide-react';

export default function AdminReviewsPage() {
  const { reviews, deleteReview } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');

  // Stats
  const totalReviews = reviews.length;
  const fiveStarReviews = reviews.filter((r) => r.rating === 5).length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalReviews).toFixed(1)
      : '5.0';

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    return reviews
      .filter((r) => {
        const matchesSearch =
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.level && r.level.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesRating =
          ratingFilter === 'all' ? true : r.rating === parseInt(ratingFilter, 10);

        return matchesSearch && matchesRating;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        if (sortBy === 'highest') {
          return (b.rating || 5) - (a.rating || 5);
        }
        if (sortBy === 'lowest') {
          return (a.rating || 5) - (b.rating || 5);
        }
        return 0;
      });
  }, [reviews, searchQuery, ratingFilter, sortBy]);

  const handleDelete = async (id: string, studentName: string) => {
    if (confirm(`Are you sure you want to permanently delete the review by "${studentName}"?`)) {
      await deleteReview(id);
    }
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      <DashboardHeader
        title="Student Reviews Management"
        subtitle="Manage and moderate all student testimonials published on the live Guitart showcase."
      />

      <div className="px-6 space-y-6 max-w-7xl mx-auto">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Total Reviews
              </span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{totalReviews}</p>
            <p className="text-xs text-zinc-400">All submitted student reviews</p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Average Rating
              </span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-amber-400">{avgRating} <span className="text-sm text-zinc-400 font-mono">/ 5.0</span></p>
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> High Satisfaction Score
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                5-Star Ratings
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{fiveStarReviews}</p>
            <p className="text-xs text-zinc-400">
              {totalReviews > 0 ? Math.round((fiveStarReviews / totalReviews) * 100) : 100}% Top Masterclass Ratings
            </p>
          </div>
        </div>

        {/* Action Header & Live Showcase Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-amber-300 text-xs">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="leading-relaxed">
              <span className="font-bold">Live Showcase Sync:</span> All active reviews display directly in the continuous auto-scrolling marquee on the public website.
            </p>
          </div>

          <Link
            href="/#testimonials"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-400 hover:text-amber-300 text-xs font-bold transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <span>View Public Showcase</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Filter and Search Controls */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-lg">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, email, or review text..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="all">All Ratings</option>
                <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                <option value="3">⭐⭐⭐ (3 Stars)</option>
                <option value="2">⭐⭐ (2 Stars)</option>
                <option value="1">⭐ (1 Star)</option>
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="highest">Sort: Highest Rating</option>
              <option value="lowest">Sort: Lowest Rating</option>
            </select>
          </div>
        </div>

        {/* Reviews Grid */}
        {filteredReviews.length === 0 ? (
          <div className="p-12 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-3">
            <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto" />
            <h3 className="text-base font-bold text-white">No Reviews Found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              No student reviews match your current search query or rating filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition-all duration-200 flex flex-col justify-between space-y-6 shadow-xl relative group overflow-hidden"
              >
                {/* Top Corner Gradient */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />

                <div className="space-y-4">
                  {/* Rating Header & Delete Action */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current drop-shadow-[0_0_4px_rgba(245,158,11,0.4)]" />
                      ))}
                      <span className="text-xs font-mono font-bold text-zinc-400 ml-1.5">
                        {rev.rating}.0
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(rev.id, rev.name)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition cursor-pointer"
                      title="Delete Review from Showcase"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Review Text */}
                  <div className="relative">
                    <Quote className="w-6 h-6 text-zinc-800 absolute -top-1 -left-1 pointer-events-none opacity-50" />
                    <p className="text-xs sm:text-sm text-zinc-200 italic leading-relaxed pl-4">
                      "{rev.comment}"
                    </p>
                  </div>
                </div>

                {/* Author Info & Date */}
                <div className="pt-4 border-t border-zinc-800/80 space-y-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        rev.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={rev.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-amber-500/40 shadow-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1 truncate">
                        {rev.name} <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      </h4>
                      <p className="text-[11px] text-amber-400 font-mono truncate">{rev.level}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1">
                    <span className="truncate">{rev.studentEmail}</span>
                    <span>
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
