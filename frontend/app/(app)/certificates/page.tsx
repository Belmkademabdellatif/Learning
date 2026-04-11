'use client';

import { useQuery } from '@tanstack/react-query';
import { Award, Download, ExternalLink, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api-client';
import { DifficultyBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Certificate } from '@/lib/types';

const STATUS_LABEL: Record<string, string> = {
  GENERATED: 'Ready',
  PENDING:   'Generating...',
  FAILED:    'Failed',
};

function CertCard({ cert }: { cert: Certificate }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Certificate preview header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-500 px-6 py-8 text-center text-white">
        <Award className="w-12 h-12 mx-auto mb-3 opacity-90" />
        <p className="text-sm font-medium opacity-80 uppercase tracking-widest mb-1">Certificate of Completion</p>
        <h3 className="text-lg font-bold">{cert.track.title}</h3>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <DifficultyBadge difficulty={cert.track.difficulty} />
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            cert.status === 'GENERATED' ? 'bg-green-50 text-green-600' :
            cert.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' :
            'bg-red-50 text-red-600'
          }`}>
            {cert.status === 'GENERATED' && <CheckCircle className="w-3 h-3 inline mr-1" />}
            {STATUS_LABEL[cert.status] ?? cert.status}
          </span>
        </div>

        <div className="text-xs text-gray-400 space-y-1">
          <div className="flex justify-between">
            <span>Issued</span>
            <span className="font-medium text-gray-600">
              {new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Verification</span>
            <span className="font-mono font-medium text-gray-600 text-xs">{cert.verificationCode}</span>
          </div>
        </div>

        {cert.status === 'GENERATED' && (
          <div className="flex gap-2 pt-1">
            {cert.pdfUrl && (
              <a
                href={cert.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            )}
            <a
              href={`/verify/${cert.verificationCode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-gray-200 text-gray-600 text-sm hover:border-primary-300 hover:text-primary-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Verify
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CertificatesPage() {
  const { data, isLoading } = useQuery<Certificate[]>({
    queryKey: ['certificates'],
    queryFn: () => api.certificates.getAll().then((r) => r.data?.data ?? r.data),
  });

  const certs: Certificate[] = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
        <p className="text-gray-500 mt-1">Your earned achievements and verifiable credentials.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : certs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certs.map((cert) => <CertCard key={cert.id} cert={cert} />)}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No certificates yet</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            Complete all lessons in a track to earn your certificate of completion.
          </p>
        </div>
      )}
    </div>
  );
}
