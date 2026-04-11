'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ChevronLeft, CheckCircle, Clock, Zap, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { DifficultyBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Lesson } from '@/lib/types';

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: lesson, isLoading } = useQuery<Lesson>({
    queryKey: ['lesson', id],
    queryFn: () => api.lessons.getOne(id).then((r) => r.data),
  });

  const completeMutation = useMutation({
    mutationFn: () => api.lessons.markComplete(id),
    onSuccess: () => {
      toast.success('Lesson marked as complete!');
      queryClient.invalidateQueries({ queryKey: ['lesson', id] });
      queryClient.invalidateQueries({ queryKey: ['track-progress'] });
    },
    onError: () => toast.error('Could not mark lesson as complete.'),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className={`h-4 w-${['full', '5/6', '4/5', 'full', '3/4', 'full', '5/6', '4/5'][i]}`} />
          ))}
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Lesson not found.</p>
        <button onClick={() => router.back()} className="text-primary-600 hover:underline mt-2 block mx-auto">Go back</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/tracks" className="hover:text-gray-600">Tracks</Link>
        <span>/</span>
        <Link href={`/tracks/${lesson.track.id}`} className="hover:text-gray-600">{lesson.track.title}</Link>
        <span>/</span>
        <span className="text-gray-700 truncate">{lesson.title}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{lesson.estimatedMinutes} min read</span>
          {lesson.isCompleted && (
            <span className="flex items-center gap-1 text-green-600 font-medium">
              <CheckCircle className="w-4 h-4" />
              Completed
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{lesson.title}</h1>
        <p className="text-gray-500">{lesson.description}</p>

        {lesson.videoUrl && (
          <div className="mt-6 rounded-xl overflow-hidden">
            <video
              src={lesson.videoUrl}
              controls
              className="w-full rounded-xl"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 prose prose-sm max-w-none
        prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary-600
        prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
        prose-pre:bg-gray-900 prose-pre:text-gray-100
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {lesson.content}
        </ReactMarkdown>
      </div>

      {/* Challenges */}
      {lesson.challenges && lesson.challenges.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary-500" />
            Practice Challenges
          </h2>
          <div className="space-y-2">
            {lesson.challenges.map((ch) => (
              <Link
                key={ch.id}
                href={`/challenges/${ch.id}`}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{ch.title}</p>
                  <p className="text-sm text-gray-400 truncate">{ch.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <DifficultyBadge difficulty={ch.difficulty} />
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                    {ch.points} pts
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {!lesson.isCompleted && (
          <Button
            onClick={() => completeMutation.mutate()}
            loading={completeMutation.isPending}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark as Complete
          </Button>
        )}
      </div>
    </div>
  );
}
