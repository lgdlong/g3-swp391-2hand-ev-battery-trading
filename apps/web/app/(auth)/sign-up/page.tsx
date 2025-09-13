'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Phone, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { signupSchema, type SignupForm } from '@/validations/signup-schema';
import { createAccount } from '@/lib/api/accountApi';
import { Account, CreateAccountDto } from '@/types/account';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/handle-api-error';
import { FormRootError } from '@/components/FormRootError';

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    mode: 'onSubmit',
    defaultValues: {
      mode: 'email',
      email: '',
      phone: '',
      fullName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const activeTab = form.watch('mode');
  const isSubmitting = form.formState.isSubmitting;

  const handleTabChange = (tab: 'email' | 'phone') => {
    form.setValue('mode', tab, { shouldValidate: true });
    if (tab === 'email') form.clearErrors('phone');
    else form.clearErrors('email');
  };

  const onSubmit = async (data: SignupForm) => {
    try {
      const payload: CreateAccountDto =
        data.mode === 'email'
          ? {
              fullName: data.fullName.trim(),
              password: data.password,
              email: (data.email ?? '').trim(),
              phone: null,
            }
          : {
              fullName: data.fullName.trim(),
              password: data.password,
              email: null,
              phone: (data.phone ?? '').replace(/\s|-/g, ''),
            };

      // call api to create an account
      const account: Account = await createAccount(payload);

      // show success toast
      toast.success('Account created successfully! Please log in.');

      // navigate to login page after successful signup
      router.push('/login');

      console.log('[DEBUG] Account create successful: ', account);
    } catch (e) {
      handleApiError(e, form, 'Create account failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
          <CardDescription className="text-slate-600">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Tab Switcher */}
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => handleTabChange('email')}
              disabled={isSubmitting}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'email'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <Mail className="h-4 w-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('phone')}
              disabled={isSubmitting}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'phone'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <Phone className="h-4 w-4" />
              Phone
            </button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* giữ mode trong form để discriminatedUnion hoạt động */}
              <input type="hidden" {...form.register('mode')} />

              {/* Email / Phone */}
              {activeTab === 'email' ? (
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Enter your phone number"
                          autoComplete="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" autoComplete="name" {...field} />
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
                    <FormLabel className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          autoComplete="new-password"
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

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          autoComplete="new-password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          aria-label={
                            showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                          }
                        >
                          {showConfirmPassword ? (
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

              {/* Submit */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </Form>

          {/* Footer */}
          <div className="space-y-4">
            <Separator />
            <p className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
