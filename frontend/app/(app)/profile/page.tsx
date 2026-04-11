'use client';

import { useState, FormEvent } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { User, Mail, Shield, Save, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import type { User as UserType } from '@/lib/types';

const ROLE_LABEL: Record<string, string> = {
  STUDENT: 'Student',
  INSTRUCTOR: 'Instructor',
  ADMIN: 'Administrator',
};

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="text-center p-4 bg-gray-50 rounded-xl">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { data: stats } = useQuery({
    queryKey: ['profile-stats'],
    queryFn: async () => {
      const [certs, submissions] = await Promise.all([
        api.certificates.getAll(),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/submissions?limit=100`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        }).then((r) => r.json()),
      ]);
      const subList = submissions?.data ?? submissions ?? [];
      return {
        certificates: certs.data?.data?.length ?? certs.data?.length ?? 0,
        submissions: subList.length,
        passed: subList.filter((s: any) => s.status === 'PASSED').length,
      };
    },
  });

  const profileMutation = useMutation({
    mutationFn: (body: { firstName: string; lastName: string }) =>
      api.auth.getMe().then(async () => {
        // PATCH /auth/profile
        const { default: apiClient } = await import('@/lib/api-client');
        return apiClient.patch('/auth/profile', body);
      }),
    onSuccess: ({ data }) => {
      setUser(data);
      toast.success('Profile updated!');
    },
    onError: () => toast.error('Failed to update profile.'),
  });

  const passwordMutation = useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string }) =>
      import('@/lib/api-client').then(({ default: apiClient }) =>
        apiClient.patch('/auth/password', body)
      ),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message?.[0] ?? 'Failed to change password.');
    },
  });

  const handleProfile = (e: FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }
    profileMutation.mutate({ firstName: firstName.trim(), lastName: lastName.trim() });
  };

  const handlePassword = (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    passwordMutation.mutate({ currentPassword, newPassword });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account information and settings.</p>
      </div>

      {/* Avatar + info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-2xl font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          )}
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h2>
          <p className="text-gray-500 text-sm flex items-center gap-1.5 justify-center sm:justify-start mt-1">
            <Mail className="w-3.5 h-3.5" /> {user?.email}
          </p>
          <span className={`inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-xs font-medium ${
            user?.role === 'ADMIN' ? 'bg-red-50 text-red-600' :
            user?.role === 'INSTRUCTOR' ? 'bg-blue-50 text-blue-600' :
            'bg-green-50 text-green-600'
          }`}>
            <Shield className="w-3 h-3" />
            {ROLE_LABEL[user?.role ?? 'STUDENT'] ?? user?.role}
          </span>
        </div>

        <div className="sm:ml-auto grid grid-cols-3 gap-3 w-full sm:w-auto">
          <StatBox label="Certs" value={stats?.certificates ?? 0} />
          <StatBox label="Submissions" value={stats?.submissions ?? 0} />
          <StatBox label="Passed" value={stats?.passed ?? 0} />
        </div>
      </div>

      {/* Edit profile */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-5">Edit Profile</h3>
        <form onSubmit={handleProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>
          <Button type="submit" loading={profileMutation.isPending} className="mt-2">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-5">Change Password</h3>
        <form onSubmit={handlePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Min. 8 characters"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Button type="submit" variant="outline" loading={passwordMutation.isPending} className="mt-2">
            <Shield className="w-4 h-4 mr-2" />
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
