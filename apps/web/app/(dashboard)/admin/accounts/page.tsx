'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Users,
  UserCheck,
  UserX,
  Shield,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Eye,
  Trash2,
  UserPlus,
  Ban,
  CheckCircle,
} from 'lucide-react';
import { Account } from '@/types/account';
import { AccountRole as RoleEnum, AccountStatus as StatusEnum } from '@/types/enums/account-enum';
import { getAccounts, updateAccount, deleteAccount, toggleBan, demoteAccount, promoteAccount } from '@/lib/api/accountApi';

const ITEMS_PER_PAGE = 10;

export default function AdminDashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusEnum | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<RoleEnum | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch accounts data
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAccounts();
        setAccounts(data);
      } catch (err) {
        setError('Không thể tải danh sách tài khoản');
        console.error('Error fetching accounts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  // Filter và search
  useEffect(() => {
    let filtered = accounts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (account) =>
          account.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.phone?.includes(searchTerm),
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((account) => account.status === statusFilter);
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((account) => account.role === roleFilter);
    }

    setFilteredAccounts(filtered);
    setCurrentPage(1);
  }, [accounts, searchTerm, statusFilter, roleFilter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setSelectedAccount(null);
    };

    if (selectedAccount) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [selectedAccount]);

  // Pagination
  const totalPages = Math.ceil(filteredAccounts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentAccounts = filteredAccounts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };



  // const handleDeleteAccount = async (accountId: number) => {
  //   if (confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
  //     try {
  //       await deleteAccount(accountId);
  //       setAccounts((prev) => prev.filter((account) => account.id !== accountId));
  //       alert('Tài khoản đã được xóa thành công');
  //     } catch (err) {
  //       console.error('Error deleting account:', err);
  //       alert('Không thể xóa tài khoản');
  //     }
  //   }
  // };

  // Promote
  const handlePromoteToAdmin = async (accountId: number) => {
    if (!confirm('Bạn có chắc muốn thăng cấp thành admin?')) return;
    try {
      const updated = await promoteAccount(accountId);
      setAccounts(prev => prev.map(a => (a.id === accountId ? updated : a)));
      alert('Đã thăng cấp thành admin');
    } catch (e) {
      console.error('Promote failed:', e);
      alert((e as Error).message || 'Không thể thăng cấp');
    }
  };

  // Demote
  const handleDemoteToMember = async (accountId: number) => {
    if (!confirm('Hạ quyền về Member?')) return;
    try {
      const updated = await demoteAccount(accountId);
      setAccounts(prev => prev.map(a => (a.id === accountId ? updated : a)));
      alert('Đã hạ quyền về Member');
    } catch (e) {
      console.error('Demote failed:', e);
      alert((e as Error).message || 'Không thể hạ quyền');
    }
  };

  // Ban / Unban
 const handleBanAccount = async (accountId: number) => {
  try {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return;
    const updated = await toggleBan(accountId, acc.status);
    setAccounts(prev => prev.map(a => (a.id === accountId ? updated : a)));
  } catch (e) {
    console.error('Toggle ban failed:', e);
    alert((e as Error).message || 'Không thể cập nhật trạng thái');
  }
};

  

  const handleViewDetails = (accountId: number) => {
    const account = accounts.find((acc) => acc.id === accountId);
    if (account) {
      alert(
        `Chi tiết tài khoản:\n\nTên: ${account.fullName}\nEmail: ${account.email}\nSĐT: ${account.phone}\nVai trò: ${account.role}\nTrạng thái: ${account.status}\nNgày tạo: ${new Date(account.createdAt).toLocaleDateString('vi-VN')}`,
      );
    }
  };

  const getStatusBadge = (status: StatusEnum) => {
    return status === StatusEnum.ACTIVE ? (
      <Badge className="bg-emerald-100 text-emerald-800">Hoạt động</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Bị cấm</Badge>
    );
  };

  const getRoleBadge = (role: RoleEnum) => {
    return role === RoleEnum.ADMIN ? (
      <Badge className="bg-emerald-100 text-emerald-800">Admin</Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-800">User</Badge>
    );
  };

  // Calculate statistics
  const totalUsers = accounts.length;
  const adminCount = accounts.filter((acc) => acc.role === RoleEnum.ADMIN).length;
  const userCount = accounts.filter((acc) => acc.role === RoleEnum.USER).length;
  const blockedCount = accounts.filter((acc) => acc.status === StatusEnum.BANNED).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Quản lý hệ thống và người dùng</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Quản lý hệ thống và người dùng</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-600 mb-2">❌</div>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Thử lại</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Quản lý hệ thống và người dùng</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">Total Users</CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">{totalUsers}</div>
            <p className="text-xs text-emerald-600">Tổng người dùng</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Admins</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{adminCount}</div>
            <p className="text-xs text-blue-600">Quản trị viên</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Users</CardTitle>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{userCount}</div>
            <p className="text-xs text-purple-600">Người dùng</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Blocked</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{blockedCount}</div>
            <p className="text-xs text-red-600">Bị chặn</p>
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
                onChange={(e) => setStatusFilter(e.target.value as StatusEnum | 'all')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                onChange={(e) => setRoleFilter(e.target.value as RoleEnum | 'all')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách tài khoản ({filteredAccounts.length} tài khoản)</CardTitle>
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
                  <th className="text-left p-3 font-medium">SĐT</th>
                  <th className="text-left p-3 font-medium">Vai trò</th>
                  <th className="text-left p-3 font-medium">Trạng thái</th>
                  <th className="text-left p-3 font-medium">Ngày tham gia</th>
                  <th className="text-left p-3 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentAccounts.map((account) => (
                  <tr key={account.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-emerald-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-emerald-800">
                            {account.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium">{account.fullName}</span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">{account.email}</td>
                    <td className="p-3 text-gray-600">{account.phone}</td>
                    <td className="p-3">{getRoleBadge(account.role)}</td>
                    <td className="p-3">{getStatusBadge(account.status)}</td>
                    <td className="p-3 text-gray-600">
                      {new Date(account.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-3">
                      <div className="relative">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setSelectedAccount(selectedAccount === account.id ? null : account.id)
                          }
                          className="p-2"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>

                        {selectedAccount === account.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  handleViewDetails(account.id);
                                  setSelectedAccount(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                see details
                              </button>

                              {account.role === RoleEnum.USER && (
                                <button
                                  onClick={() => {
                                    handlePromoteToAdmin(account.id);
                                    setSelectedAccount(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Promote Admin
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  handleBanAccount(account.id);
                                  setSelectedAccount(null);
                                }}
                                className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 ${account.status === StatusEnum.ACTIVE
                                    ? 'text-red-600 hover:bg-red-50'
                                    : 'text-green-600 hover:bg-green-50'
                                  }`}
                              >
                                {account.status === StatusEnum.ACTIVE ? (
                                  <>
                                    <Ban className="h-4 w-4 mr-2" />
                                    Ban account
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Unban account
                                  </>
                                )}
                              </button>

                              {/* KHONG XOA 
                              <button
                                onClick={() => {
                                  handleDeleteAccount(account.id);
                                  setSelectedAccount(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa tài khoản342
                              */}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Hiển thị {startIndex + 1} đến {Math.min(endIndex, filteredAccounts.length)} trong
                tổng số {filteredAccounts.length} tài khoản
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
                    let pageNum : number;
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
                        variant={currentPage === pageNum ? 'default' : 'outline'}
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
