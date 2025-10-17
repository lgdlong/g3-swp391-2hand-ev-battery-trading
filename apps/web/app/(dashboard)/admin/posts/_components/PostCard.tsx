'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Post } from '@/types/api/post';
import { Eye, Check, X, Calendar, MapPin, User, Car, Shield } from 'lucide-react';
import { DEFAULT_IMAGE } from '@/constants/images';
import { RejectDialog } from './RejectDialog';
import { useState } from 'react';

interface PostCardProps {
  post: Post;
  onViewDetails: (post: Post) => void;
  onApprove: (postId: string) => void;
  onReject: (postId: string, reason: string) => void;
  onVerify?: (postId: string) => void;
  onRejectVerification?: (postId: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
  isVerifying?: boolean;
  isRejectingVerification?: boolean;
  currentFilter?: string; // Thêm prop để biết đang ở filter nào
}

export function PostCard({
  post,
  onViewDetails,
  onApprove,
  onReject,
  onVerify,
  onRejectVerification,
  isApproving = false,
  isRejecting = false,
  isVerifying = false,
  isRejectingVerification = false,
  currentFilter
}: PostCardProps) {
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(numPrice);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const META = {
    DRAFT: { label: 'Bản nháp', cls: 'bg-gray-50 text-gray-700 border-gray-200' },
    PENDING_REVIEW: { label: 'Chờ duyệt', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    PUBLISHED: { label: 'Đã đăng', cls: 'bg-green-50 text-green-700 border-green-200' },
    REJECTED: { label: 'Từ chối', cls: 'bg-red-50 text-red-700 border-red-200' },
    PAUSED: { label: 'Tạm dừng', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
    SOLD: { label: 'Đã bán', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
    ARCHIVED: { label: 'Lưu trữ', cls: 'bg-gray-50 text-gray-700 border-gray-200' },
  } as const;

  const getStatusBadge = (status: string) => {
    const meta = META[status as keyof typeof META] || { label: status, cls: '' };
    return (
      <Badge variant="outline" className={meta.cls}>
        {meta.label}
      </Badge>
    );
  };

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group">
      <CardContent className="p-0">
        <div className="flex">
          {/* Post Image */}
          <div className="flex-shrink-0 relative">
            {post.images && Array.isArray(post.images) && post.images.length > 0 ? (
              <div className="relative w-56 h-40 overflow-hidden">
                <Image
                  src={typeof post.images[0] === 'string' ? post.images[0] : DEFAULT_IMAGE}
                  alt={post.title}
                  width={224}
                  height={160}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ) : (
              <div className="w-56 h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <Car className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Chưa có hình</p>
                </div>
              </div>
            )}
          </div>

          {/* Post Details */}
          <div className="flex-1 p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors duration-200">
                  {post.title}
                </h3>
                <div className="text-sm text-gray-600 mb-3 leading-relaxed">
                  <p className="line-clamp-2">{post.description}</p>
                </div>
              </div>
              <div className="flex-shrink-0">{getStatusBadge(post.status)}</div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="font-medium">
                  {typeof post.provinceNameCached === 'string' ? post.provinceNameCached : ''}
                  {typeof post.districtNameCached === 'string'
                    ? `, ${post.districtNameCached}`
                    : ''}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                <User className="w-4 h-4 text-green-500" />
                <span className="font-medium">{post.seller.fullName}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span className="font-medium">{formatDate(post.createdAt)}</span>
              </div>
            </div>

            {/* Vehicle Details */}
            {(post.carDetails || post.bikeDetails) && (
              <div className=" px-4 py-2 rounded-lg ">
                <div className="text-sm  font-medium">
                  {post.carDetails && (
                    <span>
                      Xe ô tô • {String(post.carDetails.manufacture_year || 'N/A')} •{' '}
                      {String(post.carDetails.odo_km || 'N/A')} km
                    </span>
                  )}
                  {post.bikeDetails && (
                    <span>
                      Xe máy • {String(post.bikeDetails.manufacture_year || 'N/A')} •{' '}
                      {String(post.bikeDetails.odo_km || 'N/A')} km
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">{formatPrice(post.priceVnd)}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 bg-gray-50 p-6 flex flex-col justify-center gap-3 min-w-[180px]">
            <Button
              onClick={() => onViewDetails?.(post)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-sm border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
            >
              <Eye className="w-4 h-4" />
              Xem chi tiết
            </Button>

            {post.status === 'PENDING_REVIEW' && (
              <>
                <Button
                  onClick={() => onApprove(post.id)}
                  disabled={isApproving}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                >
                  <Check className="w-4 h-4" />
                  {isApproving ? 'Đang duyệt...' : 'Duyệt'}
                </Button>
                <RejectDialog
                  onReject={async (reason: string) => {
                    onReject(post.id, reason);
                  }}
                  triggerVariant="sm"
                />
              </>
            )}

            {/* Verification buttons - hiển thị khi đang ở filter VERIFICATION_PENDING hoặc VERIFICATION_REJECTED */}
            {currentFilter === 'VERIFICATION_PENDING' && onVerify && onRejectVerification && (
              <>
                <Button
                  onClick={() => onVerify(post.id)}
                  disabled={isVerifying}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                >
                  <Shield className="w-4 h-4" />
                  {isVerifying ? 'Đang kiểm định...' : 'Chấp nhận kiểm định'}
                </Button>
                <Button
                  onClick={() => onRejectVerification(post.id)}
                  disabled={isRejectingVerification}
                  variant="destructive"
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                >
                  <X className="w-4 h-4" />
                  {isRejectingVerification ? 'Đang từ chối...' : 'Từ chối kiểm định'}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
