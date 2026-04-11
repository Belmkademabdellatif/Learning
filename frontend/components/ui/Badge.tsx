import { clsx } from 'clsx';
import { Difficulty } from '@/lib/types';

interface BadgeProps { label: string; className?: string }

export function Badge({ label, className }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', className)}>
      {label}
    </span>
  );
}

const difficultyConfig: Record<Difficulty, { label: string; className: string }> = {
  BEGINNER:     { label: 'Beginner',     className: 'bg-green-100 text-green-700' },
  INTERMEDIATE: { label: 'Intermediate', className: 'bg-yellow-100 text-yellow-700' },
  ADVANCED:     { label: 'Advanced',     className: 'bg-orange-100 text-orange-700' },
  EXPERT:       { label: 'Expert',       className: 'bg-red-100 text-red-700' },
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const { label, className } = difficultyConfig[difficulty] ?? difficultyConfig.BEGINNER;
  return <Badge label={label} className={className} />;
}

const langColors: Record<string, string> = {
  JAVASCRIPT: 'bg-yellow-100 text-yellow-800',
  TYPESCRIPT: 'bg-blue-100 text-blue-800',
  PYTHON:     'bg-green-100 text-green-800',
  JAVA:       'bg-red-100 text-red-800',
  CPP:        'bg-purple-100 text-purple-800',
  GO:         'bg-cyan-100 text-cyan-800',
  RUST:       'bg-orange-100 text-orange-800',
};

export function LanguageBadge({ language }: { language: string }) {
  return (
    <Badge
      label={language.charAt(0) + language.slice(1).toLowerCase()}
      className={langColors[language] ?? 'bg-gray-100 text-gray-700'}
    />
  );
}
