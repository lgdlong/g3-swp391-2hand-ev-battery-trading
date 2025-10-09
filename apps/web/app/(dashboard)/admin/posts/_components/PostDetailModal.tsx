'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Post } from '@/types/api/post';
import { Check, X, Car, User, Calendar } from 'lucide-react';

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  onApprove: (postId: string) => void;
  onReject: (postId: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
}

export function PostDetailModal({
  isOpen,
  onClose,
  post,
  onApprove,
  onReject,
  isApproving = false,
  isRejecting = false
}: PostDetailModalProps) {
  if (!post) return null;

  // Debug log để kiểm tra dữ liệu
  console.log('PostDetailModal - Post data:', {
    id: post.id,
    title: post.title,
    description: post.description,
    images: post.images,
    imagesLength: post.images?.length,
    provinceNameCached: post.provinceNameCached,
    districtNameCached: post.districtNameCached,
    wardNameCached: post.wardNameCached,
    seller: post.seller,
    carDetails: post.carDetails,
    bikeDetails: post.bikeDetails
  });

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(numPrice);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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
      <Badge
        variant="outline"
        className={`${meta.cls} transition-all duration-200 hover:scale-105 cursor-default`}
      >
        <div className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse" />
        {meta.label}
      </Badge>
    );
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Chi tiết bài đăng</h2>
                  <p className="text-sm text-gray-600">Thông tin chi tiết về sản phẩm</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Debug Panel - Remove this in production hàm này đẻ ktra dữ liệu có thể xóa*/}
            <div className="bg-yellow-50 border-b border-yellow-200 p-4">
              <details className="text-xs">
                <summary className="cursor-pointer font-semibold text-yellow-800">🐛 Debug Data (Click to expand)</summary>
                <pre className="mt-2 p-2 bg-white rounded border text-xs overflow-auto max-h-40">
                  {JSON.stringify({
                    id: post.id,
                    title: post.title,
                    description: post.description,
                    descriptionLength: post.description?.length,
                    descriptionHasNewlines: post.description?.includes('\n'),
                    images: post.images,
                    imagesLength: post.images?.length,
                    imagesType: typeof post.images,
                    imagesIsArray: Array.isArray(post.images),
                    firstImage: post.images?.[0],
                    provinceNameCached: post.provinceNameCached,
                    districtNameCached: post.districtNameCached,
                    wardNameCached: post.wardNameCached,
                    seller: {
                      id: post.seller?.id,
                      email: post.seller?.email,
                      phone: post.seller?.phone,
                      fullName: post.seller?.fullName,
                      status: post.seller?.status,
                      role: post.seller?.role
                    },
                    carDetails: post.carDetails,
                    bikeDetails: post.bikeDetails
                  }, null, 2)}
                </pre>
              </details>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">

              {/* Hero Section - Main Info */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Hình ảnh */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Car className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Hình ảnh sản phẩm</h3>
                    </div>
                    {(() => {
                      // Debug images data
                      console.log('Images debug:', {
                        images: post.images,
                        isArray: Array.isArray(post.images),
                        length: post.images?.length,
                        firstImage: post.images?.[0]
                      });

                      const hasImages = post.images &&
                                      Array.isArray(post.images) &&
                                      post.images.length > 0 &&
                                      post.images.some(img => img !== null && img !== undefined);

                      if (hasImages) {
                        return (
                          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                            {post.images.map((image, index: number) => {
                              if (!image) return null;

                              const imageUrl = typeof image === 'string'
                                ? image
                                : (image as { url: string })?.url || (image as { publicId: string })?.publicId;

                              if (!imageUrl) return null;

                              return (
                                <div key={index} className="group relative overflow-hidden rounded-xl bg-gray-100">
                                  <Image
                                    src={imageUrl}
                                    alt={`${post.title} ${index + 1}`}
                                    width={200}
                                    height={150}
                                    className="w-full h-32 object-cover group-hover:scale-110 transition-all duration-500 ease-out"
                                    onError={(e) => {
                                      console.error('Image load error:', imageUrl);
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {index + 1}/{post.images.length}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      } else {
                        return (
                          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                            <div className="text-center">
                              <Car className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500">Chưa có hình ảnh</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {post.images ? `Dữ liệu: ${JSON.stringify(post.images)}` : 'Không có dữ liệu hình ảnh'}
                              </p>
                            </div>
                          </div>
                        );
                      }
                    })()}
                  </div>

                  {/* Thông tin cơ bản */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-gray-600 mb-1">Tiêu đề</div>
                        <div className="text-lg font-semibold text-gray-900 leading-tight">{post.title}</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-600 mb-1">Mô tả</div>
                        <div className="text-gray-700 leading-relaxed whitespace-pre-line break-words">
                          {(() => {
                            // Debug description data
                            console.log('Description debug:', {
                              description: post.description,
                              type: typeof post.description,
                              length: post.description?.length,
                              hasNewlines: post.description?.includes('\n'),
                              hasCarriageReturn: post.description?.includes('\r')
                            });

                            return post.description || 'Chưa có mô tả';
                          })()}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-600 mb-1">Giá bán</div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatPrice(post.priceVnd)}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-600 mb-1">Trạng thái</div>
                          {getStatusBadge(post.status)}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-600 mb-1">Địa chỉ</div>
                        <div className="text-gray-700">
                          {[
                            typeof post.wardNameCached === 'string' ? post.wardNameCached : '',
                            typeof post.districtNameCached === 'string' ? post.districtNameCached : '',
                            typeof post.provinceNameCached === 'string' ? post.provinceNameCached : ''
                          ].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Thông tin người bán */}
                <Card className="border-0 shadow-lg bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Thông tin người bán</h3>
                        <p className="text-sm text-gray-600">Chi tiết về người đăng tin</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Tên</span>
                        <span className="text-base font-semibold text-gray-900">{post.seller.fullName}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Email</span>
                        <span className="text-base font-semibold text-gray-900">{post.seller.email}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Số điện thoại</span>
                        <span className="text-base font-semibold text-gray-900">
                          {post.seller.phone || 'Chưa cập nhật'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Trạng thái</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                          {post.seller.status || 'active'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-sm font-medium text-gray-600">Vai trò</span>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                          {post.seller.role || 'user'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Thông tin thời gian */}
                <Card className="border-0 shadow-lg bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Thông tin thời gian</h3>
                        <p className="text-sm text-gray-600">Lịch sử hoạt động của tin đăng</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Ngày tạo</span>
                        <span className="text-base font-semibold text-gray-900">{formatDateTime(post.createdAt)}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Ngày duyệt</span>
                        <span className="text-base font-semibold text-gray-900">
                          {post.reviewedAt ? formatDateTime(String(post.reviewedAt)) : 'Chưa duyệt'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-sm font-medium text-gray-600">Cập nhật lần cuối</span>
                        <span className="text-base font-semibold text-gray-900">{formatDateTime(post.updatedAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chi tiết xe (nếu có) */}
              {(post.carDetails || post.bikeDetails) && (
                <Card className="border-0 shadow-lg bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Car className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Chi tiết xe</h3>
                        <p className="text-sm text-gray-600">Thông số kỹ thuật chi tiết</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {post.carDetails && (
                        <>
                          <div className="space-y-4">
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <h4 className="font-semibold text-blue-800 mb-2">Thông tin cơ bản</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Loại xe:</span>
                                  <span className="font-medium">Ô tô điện</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Kiểu dáng:</span>
                                  <span className="font-medium">{post.carDetails.body_style || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Màu sắc:</span>
                                  <span className="font-medium">{post.carDetails.color || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Nguồn gốc:</span>
                                  <span className="font-medium">{post.carDetails.origin || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="bg-green-50 p-3 rounded-lg">
                              <h4 className="font-semibold text-green-800 mb-2">Thông số kỹ thuật</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Năm sản xuất:</span>
                                  <span className="font-medium">{String(post.carDetails.manufacture_year || 'N/A')}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Số km đã chạy:</span>
                                  <span className="font-medium">{String(post.carDetails.odo_km || 'N/A')} km</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Số chỗ ngồi:</span>
                                  <span className="font-medium">{String(post.carDetails.seats || 'N/A')}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Số chủ sở hữu:</span>
                                  <span className="font-medium">{String(post.carDetails.owners_count || 'N/A')}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="bg-orange-50 p-3 rounded-lg">
                              <h4 className="font-semibold text-orange-800 mb-2">Thông tin pin</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Dung lượng pin:</span>
                                  <span className="font-medium">{String(post.carDetails.battery_capacity_kwh || 'N/A')} kWh</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Tầm hoạt động:</span>
                                  <span className="font-medium">{String(post.carDetails.range_km || 'N/A')} km</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Sức khỏe pin:</span>
                                  <span className="font-medium">{String(post.carDetails.battery_health_pct || 'N/A')}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Sạc AC:</span>
                                  <span className="font-medium">{String(post.carDetails.charge_ac_kw || 'N/A')} kW</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Sạc DC:</span>
                                  <span className="font-medium">{String(post.carDetails.charge_dc_kw || 'N/A')} kW</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {post.bikeDetails && (
                        <>
                          <div className="space-y-4">
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <h4 className="font-semibold text-blue-800 mb-2">Thông tin cơ bản</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Loại xe:</span>
                                  <span className="font-medium">Xe máy điện</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Kiểu dáng:</span>
                                  <span className="font-medium">{post.bikeDetails.bike_style || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Màu sắc:</span>
                                  <span className="font-medium">{post.bikeDetails.color || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Nguồn gốc:</span>
                                  <span className="font-medium">{post.bikeDetails.origin || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="bg-green-50 p-3 rounded-lg">
                              <h4 className="font-semibold text-green-800 mb-2">Thông số kỹ thuật</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Năm sản xuất:</span>
                                  <span className="font-medium">{String(post.bikeDetails.manufacture_year || 'N/A')}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Số km đã chạy:</span>
                                  <span className="font-medium">{String(post.bikeDetails.odo_km || 'N/A')} km</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Công suất motor:</span>
                                  <span className="font-medium">{String(post.bikeDetails.motor_power_kw || 'N/A')} kW</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Số chủ sở hữu:</span>
                                  <span className="font-medium">{String(post.bikeDetails.owners_count || 'N/A')}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="bg-orange-50 p-3 rounded-lg">
                              <h4 className="font-semibold text-orange-800 mb-2">Thông tin pin</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Dung lượng pin:</span>
                                  <span className="font-medium">{String(post.bikeDetails.battery_capacity_kwh || 'N/A')} kWh</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Tầm hoạt động:</span>
                                  <span className="font-medium">{String(post.bikeDetails.range_km || 'N/A')} km</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Sức khỏe pin:</span>
                                  <span className="font-medium">{String(post.bikeDetails.battery_health_pct || 'N/A')}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Sạc AC:</span>
                                  <span className="font-medium">{String(post.bikeDetails.charge_ac_kw || 'N/A')} kW</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Thông tin bổ sung */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {post.carDetails?.license_plate && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Biển số xe:</span>
                              <span className="font-medium">{String(post.carDetails.license_plate)}</span>
                            </div>
                          </div>
                        )}
                        {post.bikeDetails?.license_plate && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Biển số xe:</span>
                              <span className="font-medium">{String(post.bikeDetails.license_plate)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 -mx-6 mt-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {post.status === 'PENDING_REVIEW' && (
                      <>
                        <Button
                          onClick={() => {
                            onApprove(post.id);
                            onClose();
                          }}
                          disabled={isApproving}
                          size="lg"
                          className="bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 px-8"
                        >
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          {isApproving ? 'Đang duyệt...' : 'Duyệt bài đăng'}
                        </Button>
                        <Button
                          onClick={() => {
                            onReject(post.id);
                            onClose();
                          }}
                          disabled={isRejecting}
                          variant="destructive"
                          size="lg"
                          className="bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-200 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 px-8"
                        >
                          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                            <X className="w-3 h-3 text-red-600" />
                          </div>
                          {isRejecting ? 'Đang từ chối...' : 'Từ chối bài đăng'}
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    size="lg"
                    className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 px-8"
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
