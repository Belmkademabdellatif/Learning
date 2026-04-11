// ── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type Language = 'JAVASCRIPT' | 'PYTHON' | 'TYPESCRIPT' | 'JAVA' | 'CPP' | 'GO' | 'RUST';
export type SubmissionStatus = 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED' | 'ERROR' | 'TIMEOUT';
export type CertificateStatus = 'PENDING' | 'GENERATED' | 'FAILED';

// ── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ── Tracks ───────────────────────────────────────────────────────────────────

export interface Track {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage?: string;
  difficulty: Difficulty;
  estimatedHours: number;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  _count?: { lessons: number; enrollments: number };
}

export interface TrackDetail extends Track {
  lessons: LessonSummary[];
}

// ── Lessons ──────────────────────────────────────────────────────────────────

export interface LessonSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  orderIndex: number;
  estimatedMinutes: number;
}

export interface Lesson extends LessonSummary {
  content: string;
  videoUrl?: string;
  isCompleted: boolean;
  challenges: ChallengeSummary[];
  track: { id: string; title: string; slug: string };
}

// ── Challenges ────────────────────────────────────────────────────────────────

export interface ChallengeSummary {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  points: number;
  language: Language;
  orderIndex: number;
}

export interface Challenge extends ChallengeSummary {
  starterCode: string;
  hints: string[];
  testCases: TestCase[];
  lesson: { id: string; title: string; track: { id: string; title: string } };
}

export interface TestCase {
  input: any;
  expected?: any;
  description: string;
  isHidden: boolean;
}

// ── Submissions ───────────────────────────────────────────────────────────────

export interface Submission {
  id: string;
  code: string;
  language: Language;
  status: SubmissionStatus;
  score: number;
  executionTime?: number;
  testResults: any;
  errorMessage?: string;
  submittedAt: string;
  challenge?: { title: string; points: number };
}

// ── Code Review ───────────────────────────────────────────────────────────────

export interface CodeReview {
  id: string;
  complexityTime: string;
  complexitySpace: string;
  qualityScore: number;
  strengths: string[];
  improvements: string[];
  alternativeApproach?: string;
  summary: string;
  createdAt: string;
}

// ── Certificates ──────────────────────────────────────────────────────────────

export interface Certificate {
  id: string;
  verificationCode: string;
  qrCodeUrl?: string;
  pdfUrl?: string;
  status: CertificateStatus;
  issuedAt: string;
  generatedAt?: string;
  track: { title: string; difficulty: Difficulty };
}

// ── Progress ──────────────────────────────────────────────────────────────────

export interface Enrollment {
  id: string;
  trackId: string;
  enrolledAt: string;
  completedAt?: string;
  progress: { percentComplete: number };
}

export interface TrackProgress {
  completedLessons: string[];
  totalLessons: number;
  percentComplete: number;
  completedAt?: string;
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ── API Error ─────────────────────────────────────────────────────────────────

export interface ApiError {
  statusCode: number;
  error: string;
  message: string[];
  timestamp: string;
  path: string;
}
