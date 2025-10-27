'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Coins, Plus, TrendingUp, TrendingDown, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getMyWallet, getMyTransactions } from '@/lib/api/walletApi';
import { Skeleton } from '@/components/ui/skeleton';

export default function WalletPage() {
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Trang chủ
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Ví Coin của tôi</h1>
        </div>
        <Button asChild className="bg-amber-500 hover:bg-amber-600">
          <Link href="/wallet/topup">
            <Plus className="h-4 w-4 mr-2" />
            Nạp coin
          </Link>
        </Button>
      </div>

      {/* Balance Card */}
      <Card className="mb-8 bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Coins className="h-6 w-6" />
            Số dư khả dụng
          </CardTitle>
          <CardDescription>Dùng để thanh toán khi yêu cầu kiểm định bài đăng</CardDescription>
        </CardHeader>
        <CardContent>
          {walletLoading ? (
            <Skeleton className="h-12 w-64" />
          ) : (
            <p className="text-4xl font-bold text-amber-900">
              {wallet ? `${formatBalance(wallet.balance)} ₫` : '0 ₫'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Lịch sử giao dịch
          </CardTitle>
          <CardDescription>Xem tất cả giao dịch nạp và sử dụng coin</CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const isPositive = parseFloat(transaction.amount) > 0;
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          isPositive ? 'bg-green-100' : 'bg-red-100'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {transaction.description || 'Giao dịch'}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                        {transaction.serviceType && (
                          <p className="text-xs text-gray-400">{transaction.serviceType.name}</p>
                        )}
                      </div>
                    </div>
                    <p
                      className={`text-lg font-bold ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {isPositive ? '+' : '-'} {formatAmount(transaction.amount)} ₫
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Chưa có giao dịch</p>
              <p className="text-gray-400 text-sm mb-6">
                Nạp coin để sử dụng cho các dịch vụ
              </p>
              <Button asChild className="bg-amber-500 hover:bg-amber-600">
                <Link href="/wallet/topup">
                  <Plus className="h-4 w-4 mr-2" />
                  Nạp coin ngay
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

