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
import { loginApi } from '@/lib/api/authApi';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ACCESS_TOKEN_KEY } from '@/config/constants';
import { handleApiError } from '@/lib/handle-api-error';
import { FormRootError } from '@/components/FormRootError';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const mutation = useMutation<
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

      // get role from login api and convert to lowercase
      const role: string = data.account.role.toLowerCase() ?? 'user';

      // redirect admin, user base on roles
      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }

      toast.success('Logged in successfully');
    },
    onError: (error) => handleApiError(error, form, 'Login failed'),
  });

  const onSubmit = (values: LoginForm) => {
    mutation.mutate(values);
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn('flex flex-col gap-6')}>
          <Card>
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>Enter your email or phone and password</CardDescription>
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
                            placeholder="m@example.com or 09xxxxxxxx"
                            type="text"
                            autoComplete="username"
                            disabled={mutation.isPending}
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
                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                          >
                            Forgot your password?
                          </a>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              autoComplete="current-password"
                              disabled={mutation.isPending}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword((v) => !v)}
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-slate-500" />
                              ) : (
                                <Eye className="h-4 w-4 text-slate-500" />
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
                  <div className="flex flex-col gap-3">
                    <Button type="submit" className="w-full" disabled={mutation.isPending}>
                      {mutation.isPending ? 'Logging in…' : 'Login'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={mutation.isPending}
                    >
                      Login with Google
                    </Button>
                  </div>

                  {/* Footer */}
                  <div className="mt-2 text-center text-sm">
                    Don&apos;t have an account?{' '}
                    <a href="/sign-up" className="underline underline-offset-4">
                      Sign up
                    </a>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
