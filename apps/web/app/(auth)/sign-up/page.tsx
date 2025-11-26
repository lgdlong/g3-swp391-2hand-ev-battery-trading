'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Phone, User, Lock, Battery, Car } from 'lucide-react';
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
      toast.success('Đã tạo tài khoản thành công! Vui lòng đăng nhập.');

      // navigate to login page after successful signup
      router.push('/login');
    } catch (e) {
      handleApiError(e, form, 'Create account failed');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
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
          {/* Sign Up Card */}
          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-semibold text-gray-900">Tạo tài khoản</CardTitle>
              <CardDescription className="text-gray-600">
                Nhập thông tin của bạn để tạo tài khoản
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
                  Số điện thoại
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
                              placeholder="Nhập email của bạn"
                              autoComplete="email"
                              className="h-11 border-gray-300 focus:border-[#048C73] focus:ring-2 focus:ring-[#048C73]/20 transition-all duration-200"
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
                            Số điện thoại
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="Nhập số điện thoại"
                              autoComplete="tel"
                              className="h-11 border-gray-300 focus:border-[#048C73] focus:ring-2 focus:ring-[#048C73]/20 transition-all duration-200"
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
                          Họ và tên
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập họ và tên"
                            autoComplete="name"
                            className="h-11 border-gray-300 focus:border-[#048C73] focus:ring-2 focus:ring-[#048C73]/20 transition-all duration-200"
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
                        <FormLabel className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Mật khẩu
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Nhập mật khẩu"
                              autoComplete="new-password"
                              className="h-11 border-gray-300 focus:border-[#048C73] focus:ring-2 focus:ring-[#048C73]/20 transition-all duration-200 pr-10"
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
                          Xác nhận mật khẩu
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Nhập lại mật khẩu"
                              autoComplete="new-password"
                              className="h-11 border-gray-300 focus:border-[#048C73] focus:ring-2 focus:ring-[#048C73]/20 transition-all duration-200 pr-10"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword((v) => !v)}
                              aria-label={
                                showConfirmPassword
                                  ? 'Hide confirm password'
                                  : 'Show confirm password'
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
                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#048C73] hover:bg-[#037A66] text-white font-medium transition-all duration-200"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Đang tạo tài khoản...
                      </span>
                    ) : (
                      'Tạo tài khoản'
                    )}
                  </Button>
                </form>
              </Form>

              {/* Footer */}
              <div className="space-y-4">
                <Separator />
                <p className="text-center text-sm text-gray-600">
                  Đã có tài khoản?{' '}
                  <Link
                    href="/login"
                    className="font-medium text-[#048C73] hover:text-[#037A66] transition-colors"
                  >
                    Đăng nhập
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
