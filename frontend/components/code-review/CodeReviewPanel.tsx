'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

interface CodeReview {
  complexityTime: string;
  complexitySpace: string;
  qualityScore: number;
  strengths: string[];
  improvements: string[];
  alternativeApproach: string | null;
  summary: string;
  createdAt: string;
}

interface Props {
  submissionId: string;
}

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 80 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500';
  return (
    <div className={`text-4xl font-bold ${color}`}>
      {score}
      <span className="text-lg text-gray-400">/100</span>
    </div>
  );
}

export function CodeReviewPanel({ submissionId }: Props) {
  const { data, isLoading, isError } = useQuery<CodeReview | null>({
    queryKey: ['code-review', submissionId],
    queryFn: async () => {
      const res = await api.submissions.getReview(submissionId);
      return res.data ?? null;
    },
    // Poll every 5 s until the review is ready
    refetchInterval: (data) => (data ? false : 5000),
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500 animate-pulse">
          AI Mentor is reviewing your code...
        </p>
      </div>
    );
  }

  if (isError || data === undefined) {
    return null;
  }

  if (data === null) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-400">Review not available yet. Check back in a moment.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary-100 bg-white p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800 text-lg">AI Code Mentor</h3>
          <p className="text-xs text-gray-400 mt-0.5">Personalised feedback on your submission</p>
        </div>
        <ScoreRing score={data.qualityScore} />
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-700 leading-relaxed border-l-4 border-primary-400 pl-3 italic">
        {data.summary}
      </p>

      {/* Complexity */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-gray-50 p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Time Complexity</p>
          <p className="font-mono font-semibold text-gray-800">{data.complexityTime}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Space Complexity</p>
          <p className="font-mono font-semibold text-gray-800">{data.complexitySpace}</p>
        </div>
      </div>

      {/* Strengths */}
      <div>
        <h4 className="text-sm font-semibold text-green-600 mb-2">What you did well</h4>
        <ul className="space-y-1">
          {data.strengths.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-500 mt-0.5">✓</span>
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Improvements */}
      <div>
        <h4 className="text-sm font-semibold text-orange-500 mb-2">Areas to improve</h4>
        <ul className="space-y-1">
          {data.improvements.map((imp, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-orange-400 mt-0.5">→</span>
              {imp}
            </li>
          ))}
        </ul>
      </div>

      {/* Alternative approach */}
      {data.alternativeApproach && (
        <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
          <h4 className="text-xs font-semibold text-blue-600 mb-1">Hint: Another approach</h4>
          <p className="text-sm text-blue-800">{data.alternativeApproach}</p>
        </div>
      )}
    </div>
  );
}
