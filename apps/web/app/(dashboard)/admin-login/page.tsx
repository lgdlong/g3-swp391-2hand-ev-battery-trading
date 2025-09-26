'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@admin.com');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleAdminLogin = async () => {
    setIsLoading(true);

    try {
      // Mock admin data
      const mockAdminData = {
        id: 1,
        email: 'admin@admin.com',
        phone: '0123456789',
        fullName: 'Admin User',
        avatarUrl: null,
        status: 'active',
        role: 'admin',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      const mockToken = 'mock-admin-token-' + Date.now();

      // Login with mock data
      login(mockToken, mockAdminData);

      toast.success('Đăng nhập admin thành công!');
      router.push('/admin');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đăng nhập');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Admin Login</CardTitle>
            <CardDescription>
              Đăng nhập với tài khoản admin để truy cập trang quản trị
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@admin.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="123456"
                disabled={isLoading}
              />
            </div>

            <Button
              onClick={handleAdminLogin}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập Admin'}
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Hoặc đăng nhập thông thường
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-2">Thông tin tài khoản Admin:</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <p><strong>Email:</strong> admin@admin.com</p>
              <p><strong>Password:</strong> 123456</p>
              <p><strong>Role:</strong> admin</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
