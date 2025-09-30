'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Calendar,
  MapPin,
  User,
  Car,
  Battery,
  Gauge,
  Hash,
  Clock,
  MessageCircle,
} from 'lucide-react';
import { Badge } from '@/app/(public)/posts/_components/Badge';
import type { Account } from '@/types/account';

interface Post {
  id: string;
  postType: 'EV_CAR' | 'EV_BIKE';
  title: string;
  description: string;
  priceVnd: string;
  isNegotiable: boolean;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  provinceNameCached: string | null;
  districtNameCached: string | null;
  wardNameCached: string | null;
  addressTextCached: string | null;
  seller?: {
    id: number;
    fullName: string;
  };
  images?: (string | null)[];
  carDetails?: {
    manufacture_year: number;
    odo_km: number;
    battery_capacity_kwh: string;
    battery_health_pct: string;
    charge_ac_kw?: string;
    charge_dc_kw?: string;
    range_km?: number;
    license_plate?: string;
    origin?: string;
  };
  bikeDetails?: {
    manufacture_year: number;
    odo_km: number;
    battery_capacity_kwh: string;
    battery_health_pct: string;
    motor_power_kw?: string;
    range_km?: number;
    license_plate?: string;
    origin?: string;
  };
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function EvDetailPage({ params }: Props) {
  const [id, setId] = useState<string>('');
  const [post, setPost] = useState<Post | null>(null);
  const [seller, setSeller] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Extract ID from params
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  // Fetch post data
  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/posts/${id}`);
        if (!response.ok) {
          throw new Error('Post not found');
        }
        const data = await response.json();
        setPost(data);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Fetch seller data when post is loaded
  useEffect(() => {
    if (!post?.seller?.id) return;

    const fetchSeller = async () => {
      setSellerLoading(true);
      try {
        const response = await fetch(`/api/accounts/${post.seller!.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch seller data');
        }
        const sellerData = await response.json();
        console.log('Seller API response:', sellerData);
        setSeller(sellerData);
      } catch (err) {
        console.error('Failed to fetch seller data:', err);
        setSeller(null);
      } finally {
        setSellerLoading(false);
      }
    };

    fetchSeller();
  }, [post?.seller]);

  // Helper functions
  const formatVnd = (amount: string): string => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const getStatusColor = (status: string): string => {
    const statusColors = {
      APPROVED: 'bg-green-100 text-green-800 border-green-200',
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      DRAFT: 'bg-gray-100 text-gray-800 border-gray-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.DRAFT;
  };

  const getStatusText = (status: string): string => {
    const statusTexts = {
      APPROVED: 'Đã duyệt',
      PENDING: 'Chờ duyệt',
      DRAFT: 'Nháp',
      REJECTED: 'Từ chối',
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  const getOriginText = (origin: string): string => {
    const originTexts = {
      NOI_DIA: 'Nội địa',
      NHAP_KHAU: 'Nhập khẩu',
    };
    return originTexts[origin as keyof typeof originTexts] || origin;
  };

  const getLocation = (): string => {
    if (!post) return 'Không rõ';

    const locationParts = [
      post.provinceNameCached,
      post.districtNameCached,
      post.wardNameCached,
    ].filter(Boolean);

    if (locationParts.length > 0) {
      return locationParts.join(', ');
    }

    return post.addressTextCached || 'Không rõ';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return `${Math.floor(diffDays / 365)} năm trước`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="h-80 bg-gray-200 rounded" />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="h-32 bg-gray-200 rounded" />
              <div className="h-48 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <h2 className="text-2xl font-bold mb-2">Lỗi tải dữ liệu</h2>
            <p className="text-gray-600">Không thể tải thông tin bài đăng. ID: {id}</p>
            <p className="text-sm text-gray-500 mt-2">Error: {error}</p>
          </div>
          <Link
            href="/posts/ev"
            className="inline-flex items-center text-[#048C73] hover:text-[#037A66] hover:underline"
          >
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  // No data
  if (!post) {
    return null;
  }

  // Determine post type and details
  const isCarPost = post.postType === 'EV_CAR';
  const details = post.carDetails || post.bikeDetails;
  const imageUrl = post.images?.[0] || '/asset/phu-tung-o-to-27.png';

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/posts/ev"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 hover:underline"
        >
          ← Quay lại danh sách
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image Section */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden shadow-lg">
            <CardContent className="p-0">
              <div className="relative h-80 w-full bg-gray-50">
                <Image
                  src={imageUrl}
                  alt={post.title}
                  fill
                  sizes="(max-width:768px) 100vw, 33vw"
                  className="object-contain p-8"
                />
                {/* Post type badge */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white border-0">
                    {isCarPost ? 'Ô tô điện' : 'Xe máy điện'}
                  </Badge>
                </div>
                {/* Status badge */}
                <div className="absolute top-4 right-4">
                  <Badge className={`border ${getStatusColor(post.status)}`}>
                    {getStatusText(post.status)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seller Info Box */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              {sellerLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              ) : seller ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-12 h-12 bg-gray-100 rounded-full overflow-hidden">
                      {seller.avatarUrl ? (
                        <Image
                          src={seller.avatarUrl}
                          alt={seller.fullName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#048C73] flex items-center justify-center text-white font-semibold">
                          {seller.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{seller.fullName}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <span className="capitalize">{seller.role.toLowerCase()}</span>
                        {seller.status === 'active' && (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                            Hoạt động
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Hoạt động {formatDate(seller.updatedAt)}</span>
                    </div>
                    {seller.email && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="truncate">{seller.email}</span>
                      </div>
                    )}
                    {seller.phone ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">📞</span>
                        <span>{seller.phone}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">📞</span>
                        <span className="text-gray-400">Không rõ</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{getLocation()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Tham gia {formatDate(seller.createdAt)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button className="w-full bg-[#048C73] hover:bg-[#037A66] text-white py-2 px-4 rounded-lg font-medium transition-colors">
                      <MessageCircle className="h-4 w-4 inline mr-2" />
                      Liên hệ người bán
                    </button>
                    {seller.phone ? (
                      <button className="w-full border border-[#048C73] text-[#048C73] hover:bg-[#048C73] hover:text-white py-2 px-4 rounded-lg font-medium transition-colors">
                        Gọi {seller.phone}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full border border-gray-300 text-gray-400 py-2 px-4 rounded-lg font-medium cursor-not-allowed"
                      >
                        Không có số điện thoại
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Không thể tải thông tin người bán</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
                  <div className="text-3xl font-bold text-[#048C73] mb-2">
                    {formatVnd(post.priceVnd)}
                    {post.isNegotiable && (
                      <span className="text-sm text-gray-500 ml-2">(Có thể thương lượng)</span>
                    )}
                  </div>
                </div>
                {details?.origin && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {getOriginText(details.origin)}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>Đăng bởi {post.seller?.fullName || 'Người dùng'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{getLocation()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Car className="h-5 w-5" />
                Thông số kỹ thuật
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic specs */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Năm sản xuất</div>
                    <div className="font-medium">{details?.manufacture_year || 'N/A'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Số km</div>
                    <div className="font-medium">
                      {details?.odo_km ? Number(details.odo_km).toLocaleString() : 'N/A'} km
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Battery className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Dung lượng pin</div>
                    <div className="font-medium">{details?.battery_capacity_kwh || 'N/A'} kWh</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Battery className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Tình trạng pin</div>
                    <div className="font-medium">{details?.battery_health_pct || 'N/A'}%</div>
                  </div>
                </div>

                {/* Car-specific specs */}
                {isCarPost && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Battery className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Sạc AC</div>
                      <div className="font-medium">{post.carDetails?.charge_ac_kw || 'N/A'} kW</div>
                    </div>
                  </div>
                )}

                {isCarPost && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Battery className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Sạc DC</div>
                      <div className="font-medium">{post.carDetails?.charge_dc_kw || 'N/A'} kW</div>
                    </div>
                  </div>
                )}

                {/* Bike-specific specs */}
                {!isCarPost && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Công suất động cơ</div>
                      <div className="font-medium">
                        {post.bikeDetails?.motor_power_kw || 'N/A'} kW
                      </div>
                    </div>
                  </div>
                )}

                {/* Range (both car and bike) */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Phạm vi hoạt động</div>
                    <div className="font-medium">{details?.range_km || 'N/A'} km</div>
                  </div>
                </div>

                {/* License plate */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Biển số</div>
                    <div className="font-medium">{details?.license_plate || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {post.description && (
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Mô tả chi tiết</h2>
                <p className="text-gray-700 leading-relaxed">{post.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
