'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function TestLoginPage() {
  const [email, setEmail] = useState('admin@admin.com');
  const [password, setPassword] = useState('123456');
  const { login } = useAuth();
  const router = useRouter();

  const handleTestLogin = () => {
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
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Test Admin Login</CardTitle>
          <CardDescription>
            Trang test để đăng nhập với tài khoản admin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@admin.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="123456"
            />
          </div>

          <Button
            onClick={handleTestLogin}
            className="w-full"
          >
            Đăng nhập Admin
          </Button>

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
            <p><strong>Thông tin test:</strong></p>
            <p>Email: admin@admin.com</p>
            <p>Password: 123456</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
