'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ChevronLeft, CheckCircle, XCircle, Clock, Zap,
  AlertCircle, ChevronDown, ChevronUp, Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { MonacoEditor } from '@/components/code-editor/MonacoEditor';
import { CodeReviewPanel } from '@/components/code-review/CodeReviewPanel';
import { DifficultyBadge, LanguageBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Challenge, Submission, SubmissionStatus } from '@/lib/types';

const LANG_MONACO: Record<string, string> = {
  JAVASCRIPT: 'javascript',
  TYPESCRIPT: 'typescript',
  PYTHON: 'python',
  JAVA: 'java',
  CPP: 'cpp',
  GO: 'go',
  RUST: 'rust',
};

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; color: string; icon: any }> = {
  PASSED:  { label: 'Passed',   color: 'text-green-600 bg-green-50',  icon: CheckCircle },
  FAILED:  { label: 'Failed',   color: 'text-red-600 bg-red-50',      icon: XCircle },
  PENDING: { label: 'Pending',  color: 'text-gray-500 bg-gray-50',    icon: Clock },
  RUNNING: { label: 'Running',  color: 'text-blue-600 bg-blue-50',    icon: Clock },
  ERROR:   { label: 'Error',    color: 'text-orange-600 bg-orange-50', icon: AlertCircle },
  TIMEOUT: { label: 'Timeout',  color: 'text-yellow-600 bg-yellow-50', icon: Clock },
};

function SubmissionResult({ submission }: { submission: Submission }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[submission.status] ?? STATUS_CONFIG.ERROR;
  const Icon = cfg.icon;
  const results = submission.testResults as { passed: boolean; description: string; error?: string }[] ?? [];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`flex items-center gap-3 px-5 py-4 ${cfg.color}`}>
        <Icon className="w-5 h-5" />
        <span className="font-semibold">{cfg.label}</span>
        {submission.score > 0 && (
          <span className="ml-auto text-sm font-medium">+{submission.score} points</span>
        )}
        {submission.executionTime && (
          <span className="text-xs opacity-70">{submission.executionTime}ms</span>
        )}
      </div>

      {submission.errorMessage && (
        <div className="px-5 py-3 bg-red-50 border-t border-red-100">
          <p className="text-sm text-red-700 font-mono whitespace-pre-wrap">{submission.errorMessage}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="px-5 py-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {results.filter((r) => r.passed).length}/{results.length} tests passed
          </button>

          {expanded && (
            <ul className="mt-3 space-y-2">
              {results.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  {r.passed
                    ? <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    : <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />}
                  <span className={r.passed ? 'text-gray-700' : 'text-red-700'}>
                    {r.description}
                    {r.error && <span className="block text-xs text-red-400 mt-0.5 font-mono">{r.error}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function ChallengePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showHints, setShowHints] = useState(false);
  const [latestSubmission, setLatestSubmission] = useState<Submission | null>(null);

  const { data: challenge, isLoading } = useQuery<Challenge>({
    queryKey: ['challenge', id],
    queryFn: () => api.challenges.getOne(id).then((r) => r.data),
  });

  const { data: submissions } = useQuery<Submission[]>({
    queryKey: ['challenge-submissions', id],
    queryFn: () => api.challenges.getSubmissions(id).then((r) => r.data),
    enabled: !!challenge,
  });

  const submitMutation = useMutation({
    mutationFn: (code: string) =>
      api.submissions.submit({
        challengeId: id,
        code,
        language: challenge!.language,
      }),
    onSuccess: ({ data }) => {
      setLatestSubmission(data);
      if (data.status === 'PASSED') {
        toast.success(`Challenge passed! +${data.score} points`);
      } else {
        toast.error('Some tests failed. Check the results below.');
      }
      queryClient.invalidateQueries({ queryKey: ['challenge-submissions', id] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message?.[0] ?? 'Submission failed. Please try again.');
    },
  });

  const displayedSubmission = latestSubmission ?? submissions?.[0] ?? null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Challenge not found.</p>
        <button onClick={() => router.back()} className="text-primary-600 hover:underline mt-2 block mx-auto">Go back</button>
      </div>
    );
  }

  const monacoLang = LANG_MONACO[challenge.language] ?? 'javascript';

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/tracks" className="hover:text-gray-600">Tracks</Link>
        <span>/</span>
        <Link href={`/tracks/${challenge.lesson.track.id}`} className="hover:text-gray-600">{challenge.lesson.track.title}</Link>
        <span>/</span>
        <Link href={`/lessons/${challenge.lesson.id}`} className="hover:text-gray-600">{challenge.lesson.title}</Link>
        <span>/</span>
        <span className="text-gray-700 truncate">{challenge.title}</span>
      </nav>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left: Problem description */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <DifficultyBadge difficulty={challenge.difficulty} />
              <LanguageBadge language={challenge.language} />
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                <Zap className="w-3 h-3 mr-1" />{challenge.points} pts
              </span>
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-3">{challenge.title}</h1>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{challenge.description}</p>
          </div>

          {/* Visible test cases */}
          {challenge.testCases.filter((t) => !t.isHidden).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm">Example Test Cases</h3>
              <div className="space-y-3">
                {challenge.testCases
                  .filter((t) => !t.isHidden)
                  .map((tc, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3 text-xs font-mono">
                      <div className="text-gray-500 mb-1">Input: <span className="text-gray-800">{JSON.stringify(tc.input)}</span></div>
                      {tc.expected !== undefined && (
                        <div className="text-gray-500">Expected: <span className="text-green-700">{JSON.stringify(tc.expected)}</span></div>
                      )}
                      {tc.description && <div className="text-gray-400 mt-1 italic">{tc.description}</div>}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Hints */}
          {challenge.hints && challenge.hints.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <button
                onClick={() => setShowHints(!showHints)}
                className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors w-full"
              >
                <Lightbulb className="w-4 h-4" />
                {showHints ? 'Hide hints' : `Show ${challenge.hints.length} hint${challenge.hints.length > 1 ? 's' : ''}`}
                {showHints ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
              </button>
              {showHints && (
                <ul className="mt-3 space-y-2">
                  {challenge.hints.map((hint, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="font-semibold text-amber-500">{i + 1}.</span>
                      {hint}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Right: Editor + results */}
        <div className="xl:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <MonacoEditor
              initialCode={challenge.starterCode}
              language={monacoLang}
              onRun={(code) => submitMutation.mutate(code)}
              isRunning={submitMutation.isPending}
            />
          </div>

          {displayedSubmission && (
            <SubmissionResult submission={displayedSubmission} />
          )}

          {displayedSubmission?.status === 'PASSED' && (
            <CodeReviewPanel submissionId={displayedSubmission.id} />
          )}

          {/* Previous submissions */}
          {submissions && submissions.length > 1 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Submission History</h3>
              <div className="space-y-2">
                {submissions.slice(0, 5).map((sub) => {
                  const cfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.ERROR;
                  const Icon = cfg.icon;
                  return (
                    <div key={sub.id} className="flex items-center gap-3 text-sm">
                      <Icon className={`w-4 h-4 ${cfg.color.split(' ')[0]}`} />
                      <span className="text-gray-600">{cfg.label}</span>
                      <span className="text-gray-400 ml-auto text-xs">
                        {new Date(sub.submittedAt).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
