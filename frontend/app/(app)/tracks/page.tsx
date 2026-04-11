'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Search, BookOpen, Clock, Users, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api-client';
import { DifficultyBadge } from '@/components/ui/Badge';
import { TrackCardSkeleton } from '@/components/ui/Skeleton';
import type { Track, Difficulty } from '@/lib/types';

const DIFFICULTIES: { label: string; value: Difficulty | 'ALL' }[] = [
  { label: 'All Levels', value: 'ALL' },
  { label: 'Beginner', value: 'BEGINNER' },
  { label: 'Intermediate', value: 'INTERMEDIATE' },
  { label: 'Advanced', value: 'ADVANCED' },
  { label: 'Expert', value: 'EXPERT' },
];

function TrackCard({ track }: { track: Track }) {
  return (
    <Link
      href={`/tracks/${track.id}`}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-primary-200 transition-all group"
    >
      {track.coverImage ? (
        <img
          src={track.coverImage}
          alt={track.title}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
          <BookOpen className="w-12 h-12 text-primary-400" />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
            {track.title}
          </h3>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0 mt-0.5" />
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{track.description}</p>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {track.estimatedHours}h
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {track._count?.lessons ?? 0} lessons
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {track._count?.enrollments ?? 0}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-50">
          <DifficultyBadge difficulty={track.difficulty} />
          {track.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export default function TracksPage() {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['tracks', search, difficulty, page],
    queryFn: () =>
      api.tracks
        .getAll({
          search: search || undefined,
          difficulty: difficulty !== 'ALL' ? difficulty : undefined,
          page,
          limit: 9,
        })
        .then((r) => r.data),
    placeholderData: (prev: any) => prev,
  });

  const tracks: Track[] = data?.data ?? data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Learning Tracks</h1>
        <p className="text-gray-500 mt-1">Structured paths to master programming skills.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tracks..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {DIFFICULTIES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => { setDifficulty(value); setPage(1); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                difficulty === value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <TrackCardSkeleton key={i} />)}
        </div>
      ) : tracks.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tracks.map((track) => <TrackCard key={track.id} track={track} />)}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                disabled={!meta.hasPrevPage}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:border-primary-300 transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-500">
                {meta.page} / {meta.totalPages}
              </span>
              <button
                disabled={!meta.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:border-primary-300 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tracks found for your search.</p>
        </div>
      )}
    </div>
  );
}
