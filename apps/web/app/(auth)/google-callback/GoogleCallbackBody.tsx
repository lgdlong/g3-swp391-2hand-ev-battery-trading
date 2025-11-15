'use client';
import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ACCESS_TOKEN_KEY } from '@/config/constants';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AccountRole } from '@/types/enums/account-enum';
import { getCurrentUser } from '@/lib/api/accountApi';

export function GoogleCallbackBody() {
  const processedRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    if (processedRef.current) return;

    const processGoogleCallback = async () => {
      try {
        processedRef.current = true;

        const errorParam = searchParams.get('error');
        if (errorParam) {
          toast.error('Đăng nhập thất bại');
          router.replace('/login');
          return;
        }

        const fragment = window.location.hash.substring(1);
        const params = new URLSearchParams(fragment);
        const accessToken = params.get('access_token');

        const existingToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (existingToken && !accessToken) {
          router.replace('/');
          return;
        }

        if (!accessToken) {
          toast.error('Lỗi xác thực');
          router.replace('/login');
          return;
        }

        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

        try {
          const userProfile = await getCurrentUser();

          login(accessToken, {
            id: userProfile.id,
            email: userProfile.email || '',
            fullName: userProfile.fullName || '',
            role: userProfile.role || AccountRole.USER,
          });

          toast.success('Đăng nhập thành công');

          window.history.replaceState(null, '', window.location.pathname);

          const isAdmin = userProfile.role === AccountRole.ADMIN;
          router.replace(isAdmin ? '/admin' : '/');
        } catch {
          toast.error('Lỗi xác thực');
          router.replace('/login');
        }
      } catch {
        toast.error('Lỗi hệ thống');
        router.replace('/login');
      }
    };

    processGoogleCallback();
  }, [searchParams, router, login]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm text-muted-foreground">Đang xử lý...</p>
      </div>
    </div>
  );
}
