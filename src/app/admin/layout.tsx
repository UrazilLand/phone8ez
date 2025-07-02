'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { getUserByEmail, canManageUsers } from '@/lib/auth-server';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!user?.email) {
        router.push('/auth/login');
        return;
      }

      try {
        const dbUser = await getUserByEmail(user.email);
        if (!dbUser) {
          router.push('/auth/login');
          return;
        }

        if (!canManageUsers(dbUser.role)) {
          router.push('/');
          return;
        }

        setAuthorized(true);
      } catch (error) {
        console.error('권한 확인 오류:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">권한을 확인하는 중...</div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
} 