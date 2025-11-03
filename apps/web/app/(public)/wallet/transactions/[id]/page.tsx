'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  Hash,
  FileText,
  CreditCard,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getTransactionById } from '@/lib/api/walletApi';
import { toast } from 'sonner';
import { TopupModal } from '@/components/TopupModal';

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params?.id ? parseInt(params.id as string) : 0;
  const [copied, setCopied] = useState(false);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);

  const {
    data: transaction,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => getTransactionById(transactionId),
    enabled: !!transactionId,
  });

  const formatAmount = (amount: string) => {
    return new Intl.NumberFormat('vi-VN').format(Math.abs(parseFloat(amount))) + ' Coin';
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(dateString));
  };

  const getTransactionType = () => {
    if (!transaction) return null;

    const isPositive = parseFloat(transaction.amount) > 0;
    return {
      type: isPositive ? 'deposit' : 'withdrawal',
      label: isPositive ? 'Nạp tiền' : 'Sử dụng',
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      bgColor: isPositive ? 'bg-green-50' : 'bg-red-50',
      badgeColor: isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
      borderColor: isPositive ? 'border-green-200' : 'border-red-200',
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Đã sao chép ID giao dịch');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="relative bg-[#1a2332] text-white overflow-hidden">
          <div className="relative container mx-auto px-4 py-12">
            <Skeleton className="h-8 w-64 bg-white/20" />
          </div>
        </section>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="relative bg-[#1a2332] text-white overflow-hidden">
          <div className="relative container mx-auto px-4 py-12">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </div>
        </section>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy giao dịch</h2>
                <p className="text-gray-600 mb-6">
                  Giao dịch không tồn tại hoặc bạn không có quyền truy cập.
                </p>
                <Button onClick={() => router.push('/wallet')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Về trang ví
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const transactionType = getTransactionType();
  if (!transactionType) return null;

  const TransactionIcon = transactionType.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="relative bg-[#1a2332] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#048C73] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#048C73] rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <Badge className="bg-[#048C73] text-white hover:bg-[#037060]">
              <Hash className="h-3 w-3 mr-1" />
              ID: {transaction.id}
            </Badge>
          </div>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Chi tiết giao dịch</h1>
            <p className="text-gray-300">Thông tin chi tiết về giao dịch của bạn</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Transaction Amount Card */}
        <Card className={`mb-6 border-2 ${transactionType.borderColor} ${transactionType.bgColor}`}>
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${transactionType.bgColor} ring-4 ring-white`}
              >
                <TransactionIcon className={`h-8 w-8 ${transactionType.color}`} />
              </div>
              <Badge className={`mb-4 ${transactionType.badgeColor}`}>
                {transactionType.label}
              </Badge>
              <p className={`text-5xl font-bold ${transactionType.color} mb-2`}>
                {parseFloat(transaction.amount) > 0 ? '+' : '-'} {formatAmount(transaction.amount)}
              </p>
              <p className="text-gray-600">Số tiền giao dịch</p>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Thông tin giao dịch
            </CardTitle>
            <CardDescription>Chi tiết đầy đủ về giao dịch này</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Transaction ID */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Hash className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Mã giao dịch</p>
                  <p className="font-semibold text-gray-900">#{transaction.id}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(transaction.id.toString())}
              >
                {copied ? (
                  <CheckCheck className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Date & Time */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Thời gian giao dịch</p>
                <p className="font-semibold text-gray-900">{formatDate(transaction.createdAt)}</p>
              </div>
            </div>

            {/* Description */}
            {transaction.description && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Mô tả</p>
                  <p className="font-semibold text-gray-900">{transaction.description}</p>
                </div>
              </div>
            )}

            {/* Service Type */}
            {transaction.serviceType && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <CreditCard className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Loại dịch vụ</p>
                  <p className="font-semibold text-gray-900">{transaction.serviceType.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Mã: {transaction.serviceType.code}</p>
                </div>
              </div>
            )}

            {/* User ID */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">ID người dùng</p>
                <p className="font-semibold text-gray-900">{transaction.walletUserId}</p>
              </div>
            </div>

            {/* Related Entity */}
            {transaction.relatedEntityType && transaction.relatedEntityId && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Liên quan đến</p>
                  <p className="font-semibold text-gray-900">{transaction.relatedEntityType}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {transaction.relatedEntityId}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-900 text-lg">Giao dịch thành công</p>
                <p className="text-sm text-green-700">
                  Giao dịch đã được xử lý và hoàn tất thành công
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => router.push('/wallet')}
            className="flex-1"
            variant="outline"
            size="lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Về trang ví
          </Button>
          <Button
            onClick={() => setIsTopupModalOpen(true)}
            className="flex-1 bg-[#048C73] hover:bg-[#037060] text-white shadow-lg"
            size="lg"
          >
            Nạp thêm coin
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Topup Modal */}
      <TopupModal isOpen={isTopupModalOpen} onClose={() => setIsTopupModalOpen(false)} />
    </div>
  );
}
