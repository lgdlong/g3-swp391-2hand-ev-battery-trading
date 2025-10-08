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

  // Debug: Log post data to console
  console.log('PostDetailModal - Post data:', {
    id: post.id,
    title: post.title,
    description: post.description,
    images: post.images,
    imagesLength: post.images?.length,
    wardNameCached: post.wardNameCached,
    districtNameCached: post.districtNameCached,
    provinceNameCached: post.provinceNameCached,
    fullPost: post
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
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(95vh - 140px)' }}>
              {/* Scroll indicator */}
              <div className="text-center text-xs text-gray-400 mb-4 bg-blue-50 p-2 rounded">
                📜 Có thể cuộn xuống để xem thêm thông tin chi tiết
              </div>

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
                    {post.images &&
                    Array.isArray(post.images) &&
                    post.images.length > 0 ? (
                      <div className="space-y-4">
                        {/* Debug info */}
                        <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                          Debug: Tìm thấy {post.images.length} hình ảnh
                          <br />
                          Raw images data: {JSON.stringify(post.images, null, 2)}
                        </div>
                        
                        {/* Grid hiển thị tất cả hình ảnh */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {post.images.map((image, index: number) => {
                            // Handle different image formats
                            const imageUrl = typeof image === 'string' 
                              ? image 
                              : (image as any)?.url || (image as any)?.publicId || '';
                            
                            return (
                          <div key={index} className="group relative overflow-hidden rounded-xl bg-gray-100">
                            <Image
                                  src={imageUrl}
                              alt={`${post.title} ${index + 1}`}
                              width={200}
                              height={150}
                              className="w-full h-32 object-cover group-hover:scale-110 transition-all duration-500 ease-out"
                                  onError={(e) => {
                                    console.error('Image load error:', imageUrl, e);
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
                        
                        {/* Thông tin tổng số hình */}
                        <div className="text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            Tổng cộng {post.images.length} hình ảnh
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <Car className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Chưa có hình ảnh</p>
                        </div>
                      </div>
                    )}
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
                        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {post.description || 'Chưa có mô tả'}
                          <div className="text-xs text-gray-400 mt-2">
                            Debug: Raw description length = {post.description?.length || 0}
                            <br />
                            Contains \n: {post.description?.includes('\\n') ? 'Yes' : 'No'}
                            <br />
                            Contains actual newlines: {post.description?.includes('\n') ? 'Yes' : 'No'}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-gray-600 mb-1">Giá bán</div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatPrice(post.priceVnd)}
                        </div>
                      </div>
                      
                        <div>
                          <div className="text-sm font-medium text-gray-600 mb-1">Trạng thái</div>
                          {getStatusBadge(post.status)}
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-gray-600 mb-1">Địa chỉ</div>
                        <div className="text-gray-700">
                          {(() => {
                            const addressParts = [
                              post.wardNameCached,
                              post.districtNameCached, 
                              post.provinceNameCached
                            ].filter(Boolean);
                            
                            if (addressParts.length === 0) {
                              return (
                                <div className="text-red-500 text-sm">
                                  Chưa có thông tin địa chỉ
                                  <div className="text-xs text-gray-400 mt-1">
                                    Debug: wardNameCached={String(post.wardNameCached)}, 
                                    districtNameCached={String(post.districtNameCached)}, 
                                    provinceNameCached={String(post.provinceNameCached)}
                                    <br />
                                    addressTextCached={String(post.addressTextCached)}
                                  </div>
                                </div>
                              );
                            }
                            
                            return addressParts.join(', ');
                          })()}
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
                        <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-200">
                          {post.seller.status || 'ACTIVE'}
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

              {/* Chi tiết xe đầy đủ (nếu có) */}
              {(post.carDetails || post.bikeDetails) && (
                <Card className="border-0 shadow-lg bg-white mt-6">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Car className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Chi tiết xe đầy đủ</h3>
                        <p className="text-sm text-gray-600">Thông số kỹ thuật chi tiết</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {post.carDetails && (
                        <>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Loại xe</span>
                            <p className="text-gray-900 font-semibold">Ô tô điện</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Năm sản xuất</span>
                            <p className="text-gray-900 font-semibold">
                              {String(post.carDetails.manufacture_year || 'N/A')}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Số km đã chạy</span>
                            <p className="text-gray-900 font-semibold">
                              {post.carDetails.odo_km ? `${post.carDetails.odo_km.toLocaleString()} km` : 'N/A'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Dung lượng pin</span>
                            <p className="text-gray-900 font-semibold">
                              {post.carDetails.battery_capacity_kwh ? `${post.carDetails.battery_capacity_kwh} kWh` : 'N/A'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Phạm vi hoạt động</span>
                            <p className="text-gray-900 font-semibold">
                              {post.carDetails.range_km ? `${post.carDetails.range_km} km` : 'N/A'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Sạc AC</span>
                            <p className="text-gray-900 font-semibold">
                              {post.carDetails.charge_ac_kw ? `${post.carDetails.charge_ac_kw} kW` : 'N/A'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Sạc DC</span>
                            <p className="text-gray-900 font-semibold">
                              {post.carDetails.charge_dc_kw ? `${post.carDetails.charge_dc_kw} kW` : 'N/A'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Sức khỏe pin</span>
                            <p className="text-gray-900 font-semibold">
                              {post.carDetails.battery_health_pct ? `${post.carDetails.battery_health_pct}%` : 'N/A'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Số chỗ ngồi</span>
                            <p className="text-gray-900 font-semibold">
                              {String(post.carDetails.seats || 'N/A')}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Biển số</span>
                            <p className="text-gray-900 font-semibold">
                              {String(post.carDetails.license_plate || 'Chưa có')}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Số đời chủ</span>
                            <p className="text-gray-900 font-semibold">
                              {String(post.carDetails.owners_count || 'N/A')}
                            </p>
                          </div>
                        </>
                      )}
                      {post.bikeDetails && (
                        <>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Loại xe</span>
                            <p className="text-gray-900 font-semibold">Xe máy điện</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Năm sản xuất</span>
                            <p className="text-gray-900 font-semibold">
                              {String(post.bikeDetails.manufacture_year || 'N/A')}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Số km đã chạy</span>
                            <p className="text-gray-900 font-semibold">
                              {post.bikeDetails.odo_km ? `${post.bikeDetails.odo_km.toLocaleString()} km` : 'N/A'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Dung lượng pin</span>
                            <p className="text-gray-900 font-semibold">
                              {post.bikeDetails.battery_capacity_kwh ? `${post.bikeDetails.battery_capacity_kwh} kWh` : 'N/A'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Phạm vi hoạt động</span>
                            <p className="text-gray-900 font-semibold">
                              {post.bikeDetails.range_km ? `${post.bikeDetails.range_km} km` : 'N/A'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Công suất động cơ</span>
                            <p className="text-gray-900 font-semibold">
                              {post.bikeDetails.motor_power_kw ? `${post.bikeDetails.motor_power_kw} kW` : 'N/A'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Sạc AC</span>
                            <p className="text-gray-900 font-semibold">
                              {post.bikeDetails.charge_ac_kw ? `${post.bikeDetails.charge_ac_kw} kW` : 'N/A'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Sức khỏe pin</span>
                            <p className="text-gray-900 font-semibold">
                              {post.bikeDetails.battery_health_pct ? `${post.bikeDetails.battery_health_pct}%` : 'N/A'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Biển số</span>
                            <p className="text-gray-900 font-semibold">
                              {String(post.bikeDetails.license_plate || 'Chưa có')}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Số đời chủ</span>
                            <p className="text-gray-900 font-semibold">
                              {String(post.bikeDetails.owners_count || 'N/A')}
                            </p>
                          </div>
                        </>
                      )}
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
                    {post.status === 'PUBLISHED' && (
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
