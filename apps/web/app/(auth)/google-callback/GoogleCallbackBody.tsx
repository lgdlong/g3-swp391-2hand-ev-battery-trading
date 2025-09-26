'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ACCESS_TOKEN_KEY } from '@/config/constants';

const API_URL = 'http://localhost:8000'; // Adjust as needed

export function GoogleCallbackBody() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      router.replace(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    const role = searchParams.get('role');
    const provider = searchParams.get('provider');

    // After Google OAuth, fetch /me to get the access_token and store it in localStorage
    async function fetchAndStoreToken() {
      try {
        const res = await fetch(`${API_URL}/me`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch user info');
        const data = await res.json();
        if (data.access_token) {
          localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
        }
      } catch (err) {
        console.error('Failed to fetch and store access token:', err);
        router.replace(
          `/login?error=${encodeURIComponent('Google login failed. Please try again.')}`,
        );
      }
    }

    fetchAndStoreToken().finally(() => {
      let redirectPath = '/';
      if (provider === 'google' && role) {
        if (role === 'admin') redirectPath = '/admin';
        else if (role === 'mod') redirectPath = '/mod';
      }
      setTimeout(() => {
        router.replace(redirectPath);
      }, 100);
    });
  }, [searchParams, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <span>Đang đăng nhập bằng Google...</span>
    </div>
  );
}
