'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  BookOpen, Clock, CheckCircle, Lock, PlayCircle,
  ChevronLeft, Users, Award, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { DifficultyBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import type { TrackDetail, TrackProgress, LessonSummary } from '@/lib/types';

function LessonRow({
  lesson,
  index,
  isCompleted,
}: {
  lesson: LessonSummary;
  index: number;
  isCompleted: boolean;
}) {
  return (
    <Link
      href={`/lessons/${lesson.id}`}
      className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-primary-200 hover:shadow-sm transition-all group"
    >
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold ${
          isCompleted
            ? 'bg-green-100 text-green-600'
            : 'bg-gray-100 text-gray-500 group-hover:bg-primary-50 group-hover:text-primary-600'
        }`}
      >
        {isCompleted ? <CheckCircle className="w-5 h-5" /> : index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors truncate">
          {lesson.title}
        </p>
        <p className="text-sm text-gray-400 truncate">{lesson.description}</p>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-400 flex-shrink-0">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {lesson.estimatedMinutes}m
        </span>
        <PlayCircle className="w-4 h-4 text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
}

export default function TrackDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: track, isLoading: trackLoading } = useQuery<TrackDetail>({
    queryKey: ['track', id],
    queryFn: () => api.tracks.getOne(id).then((r) => r.data),
  });

  const { data: progress } = useQuery<TrackProgress>({
    queryKey: ['track-progress', id],
    queryFn: () => api.tracks.getProgress(id).then((r) => r.data),
    retry: false,
  });

  const enrollMutation = useMutation({
    mutationFn: () => api.tracks.enroll(id),
    onSuccess: () => {
      toast.success('Enrolled successfully! Start learning now.');
      queryClient.invalidateQueries({ queryKey: ['track-progress', id] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message?.[0] ?? 'Failed to enroll.');
    },
  });

  const isEnrolled = !!progress;
  const completedIds = new Set(progress?.completedLessons ?? []);

  if (trackLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Track not found.</p>
        <Link href="/tracks" className="text-primary-600 hover:underline mt-2 block">Back to tracks</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Tracks
      </button>

      {/* Hero */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {track.coverImage ? (
          <img src={track.coverImage} alt={track.title} className="w-full h-52 object-cover" />
        ) : (
          <div className="w-full h-52 bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center">
            <BookOpen className="w-20 h-20 text-white/40" />
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex flex-wrap gap-2 mb-3">
            <DifficultyBadge difficulty={track.difficulty} />
            {track.tags?.map((t) => (
              <span key={t} className="px-2.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">{t}</span>
            ))}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{track.title}</h1>
          <p className="text-gray-500 mb-6 max-w-3xl">{track.description}</p>

          <div className="flex flex-wrap gap-6 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary-500" />
              {track.estimatedHours} hours estimated
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-primary-500" />
              {track.lessons?.length ?? 0} lessons
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary-500" />
              {track._count?.enrollments ?? 0} students enrolled
            </span>
          </div>

          {isEnrolled ? (
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-xs">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-semibold text-primary-600">{progress?.percentComplete ?? 0}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-primary-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${progress?.percentComplete ?? 0}%` }}
                  />
                </div>
              </div>
              {progress?.percentComplete === 100 && (
                <div className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                  <Award className="w-4 h-4" />
                  Track Complete!
                </div>
              )}
            </div>
          ) : (
            <Button
              onClick={() => enrollMutation.mutate()}
              loading={enrollMutation.isPending}
              size="lg"
            >
              <Zap className="w-4 h-4 mr-2" />
              Enroll Now — It's Free
            </Button>
          )}
        </div>
      </div>

      {/* Lessons */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Curriculum ({track.lessons?.length ?? 0} lessons)
        </h2>
        {track.lessons?.length > 0 ? (
          <div className="space-y-2">
            {track.lessons.map((lesson, i) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                index={i}
                isCompleted={completedIds.has(lesson.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            No lessons available yet.
          </div>
        )}
      </section>
    </div>
  );
}
