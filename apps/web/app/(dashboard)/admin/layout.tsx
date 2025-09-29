'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        router.push('/login');
        return;
      }
      if (userRole !== 'admin') {
        router.push('/');
        return;
      }
    }
  }, [isLoggedIn, userRole, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isLoggedIn || userRole !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
