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
    // Prevent multiple executions
    if (processedRef.current) return;

    const processGoogleCallback = async () => {
      try {
        // Mark as processed to prevent re-runs
        processedRef.current = true;

        // 1. Check for errors in search parameters
        const errorParam = searchParams.get('error');
        if (errorParam) {
          toast.error('Đăng nhập Google thất bại');
          router.replace('/login');
          return;
        }

        // 2. Extract access token from URL fragment
        const fragment = window.location.hash.substring(1);
        const params = new URLSearchParams(fragment);
        const accessToken = params.get('access_token');

        // Check if we already have a token (to prevent re-processing)
        const existingToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (existingToken && !accessToken) {
          // We already processed this, redirect immediately
          router.replace('/');
          return;
        }

        if (!accessToken) {
          toast.error('Không tìm thấy token đăng nhập');
          router.replace('/login');
          return;
        }

        // 3. Save access token to localStorage
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

        // 4. Fetch user profile and login
        try {
          const userProfile = await getCurrentUser();

          // 5. Update auth context with user data
          login(accessToken, {
            id: userProfile.id,
            email: userProfile.email || '',
            fullName: userProfile.fullName || '',
            role: userProfile.role || AccountRole.USER,
          });

          // Show success toast
          toast.success('Đăng nhập Google thành công!');

          // Clear the URL hash to prevent re-processing
          window.history.replaceState(null, '', window.location.pathname);

          // Redirect immediately
          const isAdmin = userProfile.role === AccountRole.ADMIN;
          router.replace(isAdmin ? '/admin' : '/');
        } catch (apiError: unknown) {
          console.error('Lỗi khi lấy thông tin người dùng:', apiError);
          toast.error('Không thể lấy thông tin tài khoản');
          router.replace('/login');
        }
      } catch (error: unknown) {
        console.error('Lỗi xử lý callback Google:', error);
        toast.error('Có lỗi xảy ra khi đăng nhập');
        router.replace('/login');
      }
    };

    processGoogleCallback();
  }, [searchParams, router, login]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
        <p className="text-gray-600">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
}
