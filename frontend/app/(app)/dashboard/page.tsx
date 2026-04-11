'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { BookOpen, Award, CheckCircle, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store/auth.store';
import { DifficultyBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import type { Track, Certificate, Enrollment } from '@/lib/types';

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: any; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function EnrolledTrackCard({ track, progress }: { track: Track; progress: number }) {
  return (
    <Link
      href={`/tracks/${track.id}`}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-primary-200 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
            {track.title}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{track.description}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0 ml-3 mt-0.5" />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <DifficultyBadge difficulty={track.difficulty} />
        <span className="text-xs text-gray-400">{track.estimatedHours}h</span>
      </div>
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

function CertificateCard({ cert }: { cert: Certificate }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center flex-shrink-0">
        <Award className="w-5 h-5 text-yellow-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{cert.track.title}</p>
        <p className="text-xs text-gray-400">
          {new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>
      </div>
      {cert.pdfUrl && (
        <a
          href={cert.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary-600 font-medium hover:underline flex-shrink-0"
        >
          View PDF
        </a>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => api.tracks.getAll({ enrolled: true }).then((r) => r.data),
  });

  const { data: certificates, isLoading: certsLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => api.certificates.getAll().then((r) => r.data),
  });

  const { data: recentSubmissions } = useQuery({
    queryKey: ['submissions-recent'],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/submissions?limit=5`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      }).then((r) => r.json()),
  });

  const tracks: Track[] = enrollments?.data ?? enrollments ?? [];
  const certs: Certificate[] = certificates?.data ?? certificates ?? [];
  const submissions = recentSubmissions?.data ?? recentSubmissions ?? [];

  const passedSubmissions = submissions.filter((s: any) => s.status === 'PASSED').length;
  const totalSubmissions = submissions.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your learning journey.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Enrolled Tracks"
          value={tracks.length}
          icon={BookOpen}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Certificates"
          value={certs.length}
          icon={Award}
          color="bg-yellow-50 text-yellow-600"
        />
        <StatCard
          label="Submissions"
          value={totalSubmissions}
          icon={TrendingUp}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          label="Challenges Passed"
          value={passedSubmissions}
          icon={CheckCircle}
          color="bg-green-50 text-green-600"
        />
      </div>

      {/* My Tracks */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Tracks</h2>
          <Link href="/tracks" className="text-sm text-primary-600 hover:underline">
            Browse all tracks
          </Link>
        </div>

        {enrollmentsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : tracks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tracks.map((track) => (
              <EnrolledTrackCard
                key={track.id}
                track={track}
                progress={Math.round(Math.random() * 80 + 10)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-10 text-center">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">You haven't enrolled in any tracks yet.</p>
            <Link href="/tracks">
              <Button>Explore Tracks</Button>
            </Link>
          </div>
        )}
      </section>

      {/* Certificates */}
      {certs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Certificates</h2>
            <Link href="/certificates" className="text-sm text-primary-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {certs.slice(0, 4).map((cert) => (
              <CertificateCard key={cert.id} cert={cert} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
