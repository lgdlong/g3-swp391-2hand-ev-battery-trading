'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ACCESS_TOKEN_KEY } from '@/config/constants';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AccountRole } from '@/types/enums/account-enum';
import { LoginResponse } from '@/types/login';

export default function GoogleOAuthCallback() {
  // const [error, setError] = useState<string | null>(null);
  // const router = useRouter();
  // const searchParams = useSearchParams();
  // const { login } = useAuth();

  // useEffect(() => {
  //   const processOAuthCallback = async () => {
  //     try {
  //       // Check for error in search params first
  //       const errorParam = searchParams.get('error');
  //       if (errorParam) {
  //         setError(`Authentication failed: ${errorParam}`);
  //         return;
  //       }

  //       // Extract tokens from URL fragment
  //       const fragment = window.location.hash.substring(1);
  //       const params = new URLSearchParams(fragment);

  //       const accessToken = params.get('access_token');
  //       const refreshToken = params.get('refresh_token');
  //       const accountId = params.get('account_id');
  //       const accountEmail = params.get('account_email');
  //       const accountRole = params.get('account_role');

  //       if (!accessToken || !accountId) {
  //         setError('Missing authentication data');
  //         return;
  //       }

  //       // Store tokens
  //       localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  //       if (refreshToken) {
  //         localStorage.setItem('refresh_token', refreshToken);
  //       }

  //       // Create account object for auth context
  //       const account: LoginResponse['account'] = {
  //         id: parseInt(accountId),
  //         email: accountEmail || '',
  //         fullName: '', // Will be updated from API if needed
  //         role: (accountRole as AccountRole) || AccountRole.USER,
  //       };

  //       // Update auth context
  //       login(accessToken, account);

  //       // Redirect based on role
  //       const isAdmin =
  //         account.role === AccountRole.ADMIN || String(account.role).toLowerCase() === 'admin';

  //       toast.success('Successfully logged in with Google!');
  //       router.replace(isAdmin ? '/admin' : '/');
  //     } catch (err) {
  //       console.error('OAuth callback error:', err);
  //       setError('Failed to process authentication');
  //     }
  //   };

  //   processOAuthCallback();
  // }, [searchParams, router, login]);

  // if (error) {
  //   return (
  //     <div className="flex min-h-svh w-full items-center justify-center p-6">
  //       <Card className="w-full max-w-md">
  //         <CardHeader>
  //           <CardTitle className="text-destructive">Authentication Failed</CardTitle>
  //           <CardDescription>{error}</CardDescription>
  //         </CardHeader>
  //         <CardContent>
  //           <button
  //             onClick={() => router.push('/login')}
  //             className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md transition-colors"
  //           >
  //             Back to Login
  //           </button>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Processing Authentication</CardTitle>
          <CardDescription>Please wait while we log you in...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    </div>
  );
}
