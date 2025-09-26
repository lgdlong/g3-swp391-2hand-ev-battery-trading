'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Account } from '@/types/account';
import { AccountRole as RoleEnum, AccountStatus as StatusEnum, AccountRole, AccountStatus } from '@/types/enums/account-enum';

// Mock data - sẽ thay thế bằng API call thực tế
const mockAccounts: Account[] = [
  {
    id: 1,
    email: 'admin@admin.com',
    phone: '0123456789',
    fullName: 'Admin User',
    avatarUrl: null,
    status: StatusEnum.ACTIVE,
    role: RoleEnum.ADMIN,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    email: 'user1@example.com',
    phone: '0987654321',
    fullName: 'Nguyễn Văn A',
    avatarUrl: null,
    status: StatusEnum.ACTIVE,
    role: RoleEnum.USER,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: 3,
    email: 'user2@example.com',
    phone: '0912345678',
    fullName: 'Trần Thị B',
    avatarUrl: null,
    status: StatusEnum.BANNED,
    role: RoleEnum.USER,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  },
  // Thêm nhiều dữ liệu mock hơn để test phân trang
  ...Array.from({ length: 47 }, (_, i) => ({
    id: i + 4,
    email: `user${i + 4}@example.com`,
    phone: `09${String(i + 4).padStart(8, '0')}`,
    fullName: `User ${i + 4}`,
    avatarUrl: null,
    status: i % 3 === 0 ? StatusEnum.BANNED : StatusEnum.ACTIVE,
    role: RoleEnum.USER,
    createdAt: `2024-01-${String(i + 4).padStart(2, '0')}T00:00:00Z`,
    updatedAt: `2024-01-${String(i + 4).padStart(2, '0')}T00:00:00Z`
  }))
];

const ITEMS_PER_PAGE = 10;

export default function AccountsManagement() {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>(mockAccounts);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AccountStatus | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<AccountRole | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Filter và search
  useEffect(() => {
    let filtered = accounts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(account =>
        account.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.phone?.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(account => account.status === statusFilter);
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(account => account.role === roleFilter);
    }

    setFilteredAccounts(filtered);
    setCurrentPage(1); // Reset về trang đầu khi filter
  }, [accounts, searchTerm, statusFilter, roleFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredAccounts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentAccounts = filteredAccounts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusToggle = (accountId: number) => {
    setAccounts(prev => prev.map(account =>
      account.id === accountId
        ? {
            ...account,
            status: account.status === StatusEnum.ACTIVE ? StatusEnum.BANNED : StatusEnum.ACTIVE,
            updatedAt: new Date().toISOString()
          }
        : account
    ));
  };

  const handleDeleteAccount = (accountId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      setAccounts(prev => prev.filter(account => account.id !== accountId));
    }
  };

  const getStatusBadge = (status: AccountStatus) => {
    return status === StatusEnum.ACTIVE
      ? <Badge className="bg-emerald-100 text-emerald-800">Hoạt động</Badge>
      : <Badge className="bg-red-100 text-red-800">Bị cấm</Badge>;
  };

  const getRoleBadge = (role: AccountRole) => {
    return role === RoleEnum.ADMIN
      ? <Badge className="bg-emerald-100 text-emerald-800">Admin</Badge>
      : <Badge className="bg-blue-100 text-blue-800">User</Badge>;
  };

  // Calculate statistics
  const totalUsers = accounts.length;
  const totalAdmins = accounts.filter(account => account.role === RoleEnum.ADMIN).length;
  const totalRegularUsers = accounts.filter(account => account.role === RoleEnum.USER).length;
  const blockedUsers = accounts.filter(account => account.status === StatusEnum.BANNED).length;
  const newPostsThisWeek = 38; // Mock data - sẽ thay thế bằng API call thực tế

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">Quản trị hệ thống</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Tổng người dùng</p>
                <p className="text-2xl font-bold text-green-900">{totalUsers}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">U</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Quản trị viên</p>
                <p className="text-2xl font-bold text-blue-900">{totalAdmins}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">A</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Người dùng</p>
                <p className="text-2xl font-bold text-purple-900">{totalRegularUsers}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm font-bold">U</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Bị chặn</p>
                <p className="text-2xl font-bold text-red-900">{blockedUsers}</p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm font-bold">B</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Tuần này</p>
                <p className="text-2xl font-bold text-orange-900">{newPostsThisWeek}</p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-sm font-bold">P</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm theo tên, email, SĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AccountStatus | 'all')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value={StatusEnum.ACTIVE}>Hoạt động</option>
                <option value={StatusEnum.BANNED}>Bị cấm</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Vai trò</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as AccountRole | 'all')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value={RoleEnum.USER}>User</option>
                <option value={RoleEnum.ADMIN}>Admin</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setRoleFilter('all');
                }}
                variant="outline"
                className="w-full"
              >
                <Filter className="mr-2 h-4 w-4" />
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Danh sách tài khoản ({filteredAccounts.length} tài khoản)
          </CardTitle>
          <CardDescription>
            Trang {currentPage} / {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Tên</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Vai trò</th>
                  <th className="text-left p-3 font-medium">Trạng thái</th>
                  <th className="text-left p-3 font-medium">Ngày tham gia</th>
                  <th className="text-left p-3 font-medium">Số bài đăng</th>
                  <th className="text-left p-3 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentAccounts.map((account) => {
                  // Mock số bài đăng - sẽ thay thế bằng API call thực tế
                  const postCount = Math.floor(Math.random() * 20) + 1;
                  
                  return (
                    <tr key={account.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {account.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium">{account.fullName}</span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600">{account.email}</td>
                      <td className="p-3">{getRoleBadge(account.role)}</td>
                      <td className="p-3">{getStatusBadge(account.status)}</td>
                      <td className="p-3 text-gray-600">
                        {new Date(account.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-3 text-gray-600">{postCount}</td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            // TODO: Implement dropdown menu
                            console.log('Actions for account:', account.id);
                          }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Hiển thị {startIndex + 1} đến {Math.min(endIndex, filteredAccounts.length)} trong tổng số {filteredAccounts.length} tài khoản
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
