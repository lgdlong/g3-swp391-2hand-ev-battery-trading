'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginForm, loginSchema } from '@/validations/login-schema';
import { LoginResponse } from '@/types/login';
import { loginApi, initiateGoogleLogin } from '@/lib/api/authApi';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ACCESS_TOKEN_KEY } from '@/config/constants';
import { handleApiError } from '@/lib/handle-api-error';
import { FormRootError } from '@/components/FormRootError';
import { useState } from 'react';
import { Eye, EyeOff, Battery, Car, Zap } from 'lucide-react';
import { AccountRole } from '@/types/enums/account-enum';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const loginMutation = useMutation<
    LoginResponse,
    AxiosError<any>,
    // AxiosError<ApiError>,
    { identifier: string; password: string }
  >({
    mutationKey: ['login'],
    mutationFn: loginApi,
    onSuccess: (data) => {
      // lưu access_token vào localStorage
      if (data.accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
        console.log('[DEBUG] Token:', data.accessToken);
      }
      console.log('[DEBUG] Login successful:', data.account);

      // Update auth context
      login(data.accessToken, data.account);

      const isAdmin =
        data.account.role === AccountRole.ADMIN ||
        String(data.account.role).toLowerCase() === 'admin';
      router.replace(isAdmin ? '/admin' : '/');

      toast.success('Logged in successfully');
    },
    onError: (error) => handleApiError(error, form, 'Login failed'),
  });

  const onSubmit = (values: LoginForm) => {
    // Process the login mutation
    loginMutation.mutate(values);
  };

  const handleGoogleLogin = () => {
    initiateGoogleLogin();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col gap-8">
          {/* Logo and Branding */}
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Battery className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <Car className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">EV Trading</h1>
              <p className="text-gray-600 text-sm">Second-hand EV Battery Trading Platform</p>
            </div>
          </div>

          {/* Login Card */}
          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-semibold text-gray-900">Welcome back</CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Email or phone number*/}
                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email or Phone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your email or phone number"
                            type="text"
                            autoComplete="username"
                            disabled={mutation.isPending}
                            className="h-11 border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all duration-200"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel>Password</FormLabel>
                          <a
                            href="/forgot-password"
                            className="ml-auto inline-block text-sm text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline"
                          >
                            Forgot your password?
                          </a>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              autoComplete="current-password"
                              className="h-11 border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all duration-200 pr-10"
                              disabled={loginMutation.isPending}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-600"
                              onClick={() => setShowPassword((v) => !v)}
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Show form error */}
                  <FormRootError />

                  {/* Login buttons */}
                  <div className="flex flex-col gap-4">
                    <Button
                      type="submit"
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Signing in...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Login
                        </div>
                      )}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Or continue with</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={loginMutation.isPending}
                      onClick={handleGoogleLogin}
                      className="w-full h-11 border-gray-300 hover:bg-gray-50 transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                  </div>

                  {/* Footer */}
                  <div className="text-center text-sm space-y-2">
                    <p className="text-gray-600">
                      Don&apos;t have an account?{' '}
                      <Link
                        href="/sign-up"
                        className="text-blue-600 hover:text-blue-700 font-medium underline-offset-4 hover:underline"
                      >
                        Create account
                      </Link>
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <Link href="/about" className="hover:text-gray-700 transition-colors">
                About
              </Link>
              <Link href="/privacy" className="hover:text-gray-700 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-gray-700 transition-colors">
                Terms
              </Link>
              <Link href="/support" className="hover:text-gray-700 transition-colors">
                Support
              </Link>
            </div>
            <p className="text-xs text-gray-400">
              © 2024 EV Trading Platform. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
