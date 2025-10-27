'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ACCESS_TOKEN_KEY } from '@/config/constants';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { AccountRole } from '@/types/enums/account-enum';
import { getCurrentUser } from '@/lib/api/accountApi';
import { Button } from '@/components/ui/button';

interface CallbackState {
  status: 'processing' | 'testing_api' | 'success' | 'error';
  message: string;
  details?: string[];
}

export function GoogleCallbackBody() {
  const [callbackState, setCallbackState] = useState<CallbackState>({
    status: 'processing',
    message: 'Processing Google authentication...',
  });
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
          setCallbackState({
            status: 'error',
            message: 'Authentication Failed',
            details: [`Google OAuth error: ${errorParam}`],
          });
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
          console.log('Token already exists, redirecting...');
          router.replace('/');
          return;
        }

        if (!accessToken) {
          setCallbackState({
            status: 'error',
            message: 'Missing Access Token',
            details: [
              'No access token found in the callback URL',
              'URL fragment: ' + (fragment || 'empty'),
              'Please try logging in again',
            ],
          });
          return;
        }

        // 3. Save access token to localStorage
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        console.log('✅ Access token saved to localStorage:', accessToken.substring(0, 20) + '...');

        setCallbackState({
          status: 'processing',
          message: 'Access token saved successfully!',
          details: ['Testing API connectivity...'],
        });

        // 4. Test the /accounts/me API endpoint
        setCallbackState({
          status: 'testing_api',
          message: 'Testing API connection...',
          details: ['Fetching user profile from /accounts/me'],
        });

        try {
          console.log(
            '🧪 Testing /accounts/me API with token:',
            accessToken.substring(0, 20) + '...',
          );
          const userProfile = await getCurrentUser();
          console.log('✅ API test successful, user profile:', userProfile);

          // 5. Update auth context with user data
          login(accessToken, {
            id: userProfile.id,
            email: userProfile.email || '',
            fullName: userProfile.fullName || '',
            role: userProfile.role || AccountRole.USER,
          });

          setCallbackState({
            status: 'success',
            message: 'Authentication Successful!',
            details: [
              '✅ Access token saved to localStorage',
              '✅ API connection successful',
              `✅ Welcome back, ${userProfile.fullName || userProfile.email}!`,
              `✅ Role: ${userProfile.role}`,
            ],
          });

          // Show success toast
          toast.success('Successfully logged in with Google!');

          // Clear the URL hash to prevent re-processing
          window.history.replaceState(null, '', window.location.pathname);

          // Redirect after a short delay
          setTimeout(() => {
            const isAdmin = userProfile.role === AccountRole.ADMIN;
            router.replace(isAdmin ? '/admin' : '/');
          }, 2000);
        } catch (apiError: any) {
          console.error('❌ API test failed:', apiError);
          console.error('Response:', apiError?.response?.data);

          setCallbackState({
            status: 'error',
            message: 'API Connection Failed',
            details: [
              '✅ Access token saved to localStorage',
              '❌ Failed to fetch user profile from API',
              `Status: ${apiError?.response?.status || 'Unknown'}`,
              `Error: ${apiError?.response?.data?.message || apiError?.message || 'Unknown API error'}`,
              'Token: ' + accessToken.substring(0, 20) + '...',
              'You may need to refresh the page or try logging in again',
            ],
          });
        }
      } catch (error: any) {
        console.error('Google callback processing error:', error);
        setCallbackState({
          status: 'error',
          message: 'Processing Error',
          details: [
            'An unexpected error occurred while processing the callback',
            `Error: ${error?.message || 'Unknown error'}`,
          ],
        });
      }
    };

    processGoogleCallback();
  }, [searchParams, router, login]);

  const getStatusIcon = () => {
    switch (callbackState.status) {
      case 'processing':
      case 'testing_api':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (callbackState.status) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'testing_api':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${getStatusColor()}`}>
            {getStatusIcon()}
            {callbackState.message}
          </CardTitle>
          <CardDescription>
            {callbackState.status === 'processing' && 'Please wait while we authenticate you...'}
            {callbackState.status === 'testing_api' && 'Verifying your account details...'}
            {callbackState.status === 'success' && 'Redirecting you to the application...'}
            {callbackState.status === 'error' && 'Something went wrong during authentication.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {callbackState.details && (
            <div className="space-y-2">
              {callbackState.details.map((detail, index) => (
                <div key={index} className="text-sm text-muted-foreground font-mono">
                  {detail}
                </div>
              ))}
            </div>
          )}

          {callbackState.status === 'error' && (
            <div className="space-y-2">
              <Button onClick={() => router.push('/login')} className="w-full" variant="default">
                Back to Login
              </Button>
              <Button onClick={() => window.location.reload()} className="w-full" variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {callbackState.status === 'success' && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Redirecting in 2 seconds...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
