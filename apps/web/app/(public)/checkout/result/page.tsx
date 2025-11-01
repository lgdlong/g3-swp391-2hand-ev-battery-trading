'use client';

import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { getTransactionByOrderCode, type WalletTransaction } from '@/lib/api/walletApi';

function CheckoutResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderCode = searchParams.get('orderCode');
  const paymentStatus = searchParams.get('status');
  const paymentCode = searchParams.get('code');
  const cancelFlag = searchParams.get('cancel');

  // Validate orderCode
  const isValidOrderCode = !!orderCode && orderCode.trim().length > 0;

  // Determine if payment was successful based on URL params
  const isPaymentSuccessful =
    paymentStatus === 'PAID' && paymentCode === '00' && cancelFlag === 'false';

  // Fetch transaction details by orderCode
  const {
    data: transaction,
    isLoading,
    error,
  } = useQuery<WalletTransaction>({
    queryKey: ['transaction', 'orderCode', orderCode],
    queryFn: () => getTransactionByOrderCode(orderCode!),
    enabled: isValidOrderCode,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">
              Đang tải thông tin giao dịch...
            </h1>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (!isValidOrderCode || error || (!isLoading && !transaction)) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-2">
              Không thể tải thông tin giao dịch
            </h1>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">
              {!isValidOrderCode
                ? `Mã đơn hàng &quot;${orderCode || 'không có'}&quot; không hợp lệ.`
                : `Giao dịch với mã đơn hàng &quot;${orderCode}&quot; không tồn tại hoặc bạn không có quyền truy cập.`}
            </p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format amount for display
  const formatAmount = (amount: string) => {
    const num = Math.abs(parseFloat(amount));
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  };

  // Early return if no transaction data
  if (!transaction) {
    return null; // This should not happen due to earlier error checks, but TypeScript needs it
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Tiêu đề chính */}
        <div className="text-center">
          <h1
            className={`text-3xl font-bold mb-2 ${isPaymentSuccessful ? 'text-green-600' : 'text-orange-600'}`}
          >
            {isPaymentSuccessful ? 'Thanh toán thành công' : 'Trạng thái thanh toán'}
          </h1>
          {paymentStatus && (
            <p className="text-sm text-gray-600">
              Trạng thái: <span className="font-medium">{paymentStatus}</span>
              {paymentCode && ` (Mã: ${paymentCode})`}
            </p>
          )}
        </div>

        {/* Khối Chi tiết đơn hàng */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-lg font-bold">Chi tiết đơn hàng</h2>
          </div>
          <div className="p-5 space-y-3">
            {orderCode && (
              <div className="text-gray-600">
                Mã đơn hàng: <strong className="text-black">{orderCode}</strong>
              </div>
            )}
            <div className="text-gray-600">
              Mã giao dịch: <strong className="text-black">{transaction.id}</strong>
            </div>
            <div className="text-gray-600">
              Tổng số tiền:{' '}
              <strong className="text-black">{formatAmount(transaction.amount)}</strong>
            </div>
            <div className="text-gray-600">
              Loại dịch vụ:{' '}
              <strong className="text-black">
                {transaction.serviceType?.name || 'Không xác định'}
              </strong>
            </div>
            {transaction.description && (
              <div className="text-gray-600">
                Mô tả: <strong className="text-black">{transaction.description}</strong>
              </div>
            )}
            <div className="text-gray-600">
              Thời gian:{' '}
              <strong className="text-black">
                {new Date(transaction.createdAt).toLocaleString('vi-VN')}
              </strong>
            </div>
          </div>
        </div>

        {/* Khối Chi tiết dịch vụ */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-lg font-bold">Chi tiết dịch vụ cho đơn hàng {transaction.id}</h2>
          </div>
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Nội dung</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Mã dịch vụ</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Số tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-3 px-2 text-gray-900">
                      {transaction.serviceType?.name || 'Không xác định'}
                    </td>
                    <td className="py-3 px-2 text-gray-500">
                      {transaction.serviceType?.code || 'N/A'}
                    </td>
                    <td className="py-3 px-2 text-gray-900 font-medium">
                      {formatAmount(transaction.amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Các nút hành động */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            onClick={() => router.push(`/wallet/transactions/${transaction.id}`)}
            className="flex-1 py-3 px-6 border border-orange-500 text-orange-500 rounded-md font-medium uppercase hover:bg-orange-50 transition-colors"
          >
            CHI TIẾT GIAO DỊCH
          </button>
          <button
            onClick={() => router.push('/my-posts')}
            className="flex-1 py-3 px-6 border border-orange-500 text-orange-500 rounded-md font-medium uppercase hover:bg-orange-50 transition-colors"
          >
            QUẢN LÝ TIN ĐĂNG
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-100 py-8 px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-blue-600 mb-2">
                Đang tải thông tin giao dịch...
              </h1>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          </div>
        </div>
      }
    >
      <CheckoutResultContent />
    </Suspense>
  );
}
