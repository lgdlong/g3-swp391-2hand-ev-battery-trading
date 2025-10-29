'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowLeft,
  ArrowRight,
  Wallet,
  CheckCircle,
  AlertCircle,
  Info,
  Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getMyWallet, getMyTransactions } from '@/lib/api/walletApi';
import { Skeleton } from '@/components/ui/skeleton';
import { TopupModal } from '@/components/TopupModal';

export default function WalletPage() {
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet', 'me'],
    queryFn: getMyWallet,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['wallet', 'transactions'],
    queryFn: () => getMyTransactions(50, 0),
  });

  const formatBalance = (balance: string) => {
    return new Intl.NumberFormat('vi-VN').format(parseFloat(balance));
  };

  const formatAmount = (amount: string) => {
    return new Intl.NumberFormat('vi-VN').format(Math.abs(parseFloat(amount)));
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getTransactionType = (transaction: { amount: string }) => {
    if (parseFloat(transaction.amount) > 0) {
      return {
        type: 'deposit',
        label: 'Nạp tiền',
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        badgeColor: 'bg-green-100 text-green-800',
      };
    } else {
      return {
        type: 'withdrawal',
        label: 'Sử dụng',
        icon: TrendingDown,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        badgeColor: 'bg-red-100 text-red-800',
      };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="relative bg-[#1a2332] text-white overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#048C73] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#048C73] rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-12">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Ví Coin của tôi</h1>
              <p className="text-gray-300">Quản lý số dư và lịch sử giao dịch</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Balance Card */}
        <Card className="mb-8 border-2 border-[#048C73]/20 shadow-xl bg-gradient-to-br from-white via-[#048C73]/5 to-[#048C73]/10">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#048C73] rounded-xl">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900">Số dư khả dụng</CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Dùng để thanh toán khi yêu cầu kiểm định bài đăng
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {walletLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <p className="text-5xl md:text-6xl font-bold text-[#048C73] mb-2">
                    {wallet ? `${formatBalance(wallet.balance)}` : '0'}
                    <span className="text-3xl md:text-4xl ml-2">₫</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Cập nhật lần cuối:{' '}
                    {wallet ? new Date(wallet.updatedAt).toLocaleString('vi-VN') : 'N/A'}
                  </p>
                </div>
                <Button
                  onClick={() => setIsTopupModalOpen(true)}
                  size="lg"
                  className="bg-[#048C73] hover:bg-[#037060] text-white shadow-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Nạp coin ngay
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction History Section */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#048C73]/5 to-[#048C73]/10 border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#048C73] rounded-lg">
                  <Receipt className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">Lịch sử giao dịch</CardTitle>
                  <CardDescription className="text-gray-600">
                    Xem tất cả giao dịch nạp và sử dụng coin
                  </CardDescription>
                </div>
              </div>
              {transactions && transactions.length > 0 && (
                <Badge className="bg-[#048C73] text-white hover:bg-[#037060]">
                  {transactions.length} giao dịch
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction) => {
                  const transactionType = getTransactionType(transaction);
                  const IconComponent = transactionType.icon;

                  return (
                    <Link
                      key={transaction.id}
                      href={`/wallet/transactions/${transaction.id}`}
                      className="block"
                    >
                      <div className="group flex items-center justify-between p-5 border-2 border-gray-200 rounded-xl hover:border-[#048C73]/50 hover:shadow-lg transition-all duration-200 bg-white cursor-pointer">
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className={`h-14 w-14 rounded-xl flex items-center justify-center ${transactionType.bgColor} shadow-sm`}
                          >
                            <IconComponent className={`h-7 w-7 ${transactionType.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <p className="font-bold text-gray-900 text-base">
                                {transaction.description || 'Giao dịch'}
                              </p>
                              <Badge className={`text-xs ${transactionType.badgeColor} border-0`}>
                                {transactionType.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{formatDate(transaction.createdAt)}</span>
                            </div>
                            {transaction.serviceType && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md w-fit">
                                <Info className="h-3 w-3" />
                                <span>Dịch vụ: {transaction.serviceType.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <div className="text-right">
                            <p
                              className={`text-xl font-bold ${transactionType.color} whitespace-nowrap`}
                            >
                              {parseFloat(transaction.amount) > 0 ? '+' : '-'}{' '}
                              {formatAmount(transaction.amount)} ₫
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#048C73] transition-colors flex-shrink-0" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-[#048C73]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-12 w-12 text-[#048C73]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Chưa có giao dịch</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Bạn chưa có giao dịch nào. Hãy nạp coin để sử dụng các dịch vụ kiểm định bài đăng.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => setIsTopupModalOpen(true)}
                    size="lg"
                    className="bg-[#048C73] hover:bg-[#037060] text-white shadow-lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Nạp coin ngay
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="border-2 border-gray-300 hover:border-[#048C73] hover:text-[#048C73]"
                  >
                    <Link href="/posts/create">
                      <ArrowRight className="h-5 w-5 mr-2" />
                      Tạo bài đăng
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-2 border-[#048C73]/20 shadow-lg bg-gradient-to-br from-[#048C73]/5 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#048C73] rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg text-gray-900">Cách sử dụng coin</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg border border-[#048C73]/10">
                  <CheckCircle className="h-5 w-5 text-[#048C73] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 font-medium">
                    Thanh toán phí kiểm định bài đăng
                  </span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg border border-[#048C73]/10">
                  <CheckCircle className="h-5 w-5 text-[#048C73] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 font-medium">
                    Nâng cấp bài đăng lên top
                  </span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg border border-[#048C73]/10">
                  <CheckCircle className="h-5 w-5 text-[#048C73] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 font-medium">
                    Các dịch vụ premium khác
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 shadow-lg bg-gradient-to-br from-orange-50/50 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg text-gray-900">Lưu ý quan trọng</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-200">
                  <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 font-medium">
                    Coin không thể hoàn lại sau khi sử dụng
                  </span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-200">
                  <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 font-medium">
                    Kiểm tra kỹ thông tin trước khi thanh toán
                  </span>
                </li>
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-200">
                  <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 font-medium">
                    Liên hệ hỗ trợ nếu có vấn đề
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Topup Modal */}
      <TopupModal isOpen={isTopupModalOpen} onClose={() => setIsTopupModalOpen(false)} />
    </div>
  );
}
