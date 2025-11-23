'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { useComparison } from '@/hooks/useComparison';
import { getPostById } from '@/lib/api/postApi';
import Image from 'next/image';
import { CarModal } from './CarModal';
import { BikeModal } from './BikeModal';
import { BatteryModal } from './BatteryModal';
import { DEFAULT_IMAGE } from '@/constants/images';
import type { Post } from '@/types/post';

interface PostWithType extends Post {
  type: 'CAR' | 'BIKE' | 'BATTERY';
}

export function ComparePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { removeItem } = useComparison();
  const [currentImageIndices, setCurrentImageIndices] = useState<Record<string, number>>({});
  const [carModalOpen, setCarModalOpen] = useState(false);
  const [bikeModalOpen, setBikeModalOpen] = useState(false);
  const [batteryModalOpen, setBatteryModalOpen] = useState(false);

  const selectedIds = useMemo(() => {
    const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];
    return ids;
  }, [searchParams]);

  // Fetch all selected posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['comparePosts', selectedIds],
    queryFn: async () => {
      if (selectedIds.length === 0) return [];

      const postPromises = selectedIds.map((id) => getPostById(id));
      const results = await Promise.allSettled(postPromises);

      return results
        .filter((result) => result.status === 'fulfilled')
        .map((result: any) => {
          const post = result.value;
          return {
            ...post,
            type: post.postType === 'EV_CAR' ? 'CAR' : post.postType === 'EV_BIKE' ? 'BIKE' : 'BATTERY',
          };
        });
    },
    enabled: selectedIds.length > 0,
  });

  const handleRemove = (postId: string) => {
    removeItem(postId);
  };

  const getImageUrl = (post: PostWithType): string => {
    const imageIndex = currentImageIndices[post.id] || 0;
    if (post.images?.[imageIndex]?.url) {
      return post.images[imageIndex].url;
    }
    return DEFAULT_IMAGE;
  };

  if (selectedIds.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-8 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>

          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="mb-6">
              <svg
                className="h-16 w-16 text-gray-300 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có sản phẩm để so sánh</h2>
              <p className="text-gray-600 mb-8">
                Chọn sản phẩm từ danh sách để bắt đầu so sánh
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button
                  onClick={() => setCarModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 py-2 font-semibold"
                >
                  Thêm xe
                </Button>
                <Button
                  onClick={() => setBikeModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 py-2 font-semibold"
                >
                  Xe máy
                </Button>
                <Button
                  onClick={() => setBatteryModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 py-2 font-semibold"
                >
                  Pin
                </Button>
              </div>
            </div>
          </div>

          {/* Modals for empty state */}
          <CarModal open={carModalOpen} onOpenChange={setCarModalOpen} />
          <BikeModal open={bikeModalOpen} onOpenChange={setBikeModalOpen} />
          <BatteryModal open={batteryModalOpen} onOpenChange={setBatteryModalOpen} />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-lg font-medium">
              {posts.length} sản phẩm đã được so sánh
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>

        {/* Main Comparison Grid */}
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <tbody>
                {/* First Row: Images and Add Button */}
                <tr>
                  {/* Left column - Add product button */}
                  <td className="border-r border-b p-0 w-[200px] flex-shrink-0">
                    <div className="aspect-square bg-gray-50 flex flex-col items-center justify-center p-6 min-h-[280px]">
                      <p className="text-gray-700 text-sm mb-4 font-bold text-center">
                        {posts.length} xe đã được so sánh
                      </p>
                      <Button
                        onClick={() => setCarModalOpen(true)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full py-2 text-sm font-bold"
                      >
                        Thêm xe
                      </Button>
                    </div>
                  </td>

                  {/* Product Image Cells */}
                  {posts.map((post) => {
                    const imageCount = post.images?.length || 0;
                    const currentIndex = currentImageIndices[post.id] || 0;
                    const currentImage = getImageUrl(post);

                    return (
                      <td
                        key={post.id}
                        className="border-r border-b p-0 last:border-r-0"
                        style={{ width: '280px', height: '350px', verticalAlign: 'top' }}
                      >
                        <div className="relative w-full h-full flex flex-col">
                          {/* Close Button */}
                          <button
                            onClick={() => handleRemove(post.id)}
                            className="absolute top-3 right-3 p-1.5 bg-white rounded-full shadow-lg hover:bg-gray-100 z-10"
                            title="Xóa khỏi so sánh"
                          >
                            <X className="h-5 w-5 text-gray-600" />
                          </button>

                          {/* Product Image */}
                          <div className="w-full flex-shrink-0" style={{ height: '240px' }}>
                            <div className="w-full h-full bg-gray-50 flex items-center justify-center relative overflow-hidden">
                              {currentImage ? (
                                <Image
                                  src={currentImage}
                                  alt={post.title}
                                  fill
                                  className="object-contain p-4"
                                  sizes="280px"
                                  priority={false}
                                />
                              ) : (
                                <div className="text-center">
                                  <p className="text-gray-400 text-sm">Không có ảnh</p>
                                </div>
                              )}

                              {/* Image Navigation Arrows */}
                              {imageCount > 1 && (
                                <>
                                  <button
                                    onClick={() => {
                                      if (currentIndex > 0) {
                                        setCurrentImageIndices((prev) => ({
                                          ...prev,
                                          [post.id]: currentIndex - 1,
                                        }));
                                      }
                                    }}
                                    disabled={currentIndex === 0}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-white/90 rounded-full hover:bg-white disabled:opacity-50"
                                  >
                                    <ChevronLeft className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (currentIndex < imageCount - 1) {
                                        setCurrentImageIndices((prev) => ({
                                          ...prev,
                                          [post.id]: currentIndex + 1,
                                        }));
                                      }
                                    }}
                                    disabled={currentIndex === imageCount - 1}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-white/90 rounded-full hover:bg-white disabled:opacity-50"
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Product Title Below Image */}
                          <div className="w-full bg-white text-center border-t p-3 flex-shrink-0" style={{ height: '110px' }}>
                            <h3 className="font-bold text-gray-900 text-sm line-clamp-2">
                              {post.title}
                            </h3>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Specification Rows */}
                <ComparisonRow
                  label="Giá xe"
                  posts={posts}
                  getValue={(post) => `${Number(post.priceVnd).toLocaleString('vi-VN')} đ`}
                />

                {posts.some((p) => p.carDetails?.manufacture_year || p.bikeDetails?.manufacture_year) && (
                  <ComparisonRow
                    label="Đời xe"
                    posts={posts}
                    getValue={(post) => {
                      const year = post.carDetails?.manufacture_year || post.bikeDetails?.manufacture_year;
                      return year ? (typeof year === 'object' ? year.value?.toString() || 'N/A' : year.toString()) : 'N/A';
                    }}
                  />
                )}

                {posts.some((p) => p.carDetails?.body_style || p.bikeDetails?.bike_style) && (
                  <ComparisonRow
                    label="Dạng xe"
                    posts={posts}
                    getValue={(post) => post.carDetails?.body_style || post.bikeDetails?.bike_style || 'N/A'}
                  />
                )}

                {posts.some((p) => p.carDetails?.color || p.bikeDetails?.color) && (
                  <ComparisonRow
                    label="Màu sắc"
                    posts={posts}
                    getValue={(post) => post.carDetails?.color || post.bikeDetails?.color || 'N/A'}
                  />
                )}

                {posts.some((p) => p.carDetails?.origin || p.bikeDetails?.origin) && (
                  <ComparisonRow
                    label="Xuất xứ"
                    posts={posts}
                    getValue={(post) => {
                      const origin = post.carDetails?.origin || post.bikeDetails?.origin;
                      return origin === 'NOI_DIA' ? 'Nội địa' : origin === 'NHAP_KHAU' ? 'Nhập khẩu' : origin || 'N/A';
                    }}
                  />
                )}

                {posts.some((p) => p.carDetails?.seats) && (
                  <ComparisonRow
                    label="Số chỗ"
                    posts={posts}
                    getValue={(post) => {
                      const seats = post.carDetails?.seats;
                      return seats ? (typeof seats === 'object' ? seats.value?.toString() || 'N/A' : seats.toString()) : 'N/A';
                    }}
                  />
                )}

                {posts.some((p) => p.carDetails?.battery_capacity_kwh || p.bikeDetails?.battery_capacity_kwh) && (
                  <ComparisonRow
                    label="Dung lượng pin"
                    posts={posts}
                    getValue={(post) => {
                      const cap = post.carDetails?.battery_capacity_kwh || post.bikeDetails?.battery_capacity_kwh;
                      return cap ? (typeof cap === 'object' ? cap.value?.toString() || 'N/A' : cap.toString()) : 'N/A';
                    }}
                  />
                )}

                {posts.some((p) => p.carDetails?.range_km || p.bikeDetails?.range_km) && (
                  <ComparisonRow
                    label="Tầm hoạt động"
                    posts={posts}
                    getValue={(post) => {
                      const range = post.carDetails?.range_km || post.bikeDetails?.range_km;
                      return range ? (typeof range === 'object' ? range.value?.toString() || 'N/A' : range.toString()) : 'N/A';
                    }}
                  />
                )}

                {posts.some((p) => p.carDetails?.odo_km || p.bikeDetails?.odo_km) && (
                  <ComparisonRow
                    label="Quãng đường tổng thế"
                    posts={posts}
                    getValue={(post) => {
                      const odo = post.carDetails?.odo_km || post.bikeDetails?.odo_km;
                      const value = odo ? (typeof odo === 'object' ? odo.value : odo) : null;
                      return value ? Number(value).toLocaleString('vi-VN') : 'N/A';
                    }}
                  />
                )}

                {posts.some((p) => p.carDetails?.battery_health_pct) && (
                  <ComparisonRow
                    label="Sức khỏe pin"
                    posts={posts}
                    getValue={(post) => {
                      const health = post.carDetails?.battery_health_pct;
                      return health ? (typeof health === 'object' ? `${health.value || 'N/A'}%` : `${health}%`) : 'N/A';
                    }}
                  />
                )}

                {posts.some((p) => p.carDetails?.owners_count || p.bikeDetails?.owners_count) && (
                  <ComparisonRow
                    label="Số chủ sở hữu"
                    posts={posts}
                    getValue={(post) => {
                      const count = post.carDetails?.owners_count || post.bikeDetails?.owners_count;
                      return count ? (typeof count === 'object' ? count.value?.toString() || 'N/A' : count.toString()) : 'N/A';
                    }}
                  />
                )}

                {posts.some((p) => p.carDetails?.charge_ac_kw) && (
                  <ComparisonRow
                    label="Công suất AC (kW)"
                    posts={posts}
                    getValue={(post) => {
                      const power = post.carDetails?.charge_ac_kw;
                      return power ? (typeof power === 'object' ? power.value?.toString() || 'N/A' : power.toString()) : 'N/A';
                    }}
                  />
                )}

                {posts.some((p) => p.carDetails?.charge_dc_kw) && (
                  <ComparisonRow
                    label="Công suất DC (kW)"
                    posts={posts}
                    getValue={(post) => {
                      const power = post.carDetails?.charge_dc_kw;
                      return power ? (typeof power === 'object' ? power.value?.toString() || 'N/A' : power.toString()) : 'N/A';
                    }}
                  />
                )}

                {posts.some((p) => p.bikeDetails?.motor_power_kw) && (
                  <ComparisonRow
                    label="Công suất motor (kW)"
                    posts={posts}
                    getValue={(post) => {
                      const power = post.bikeDetails?.motor_power_kw;
                      return power ? (typeof power === 'object' ? power.value?.toString() || 'N/A' : power.toString()) : 'N/A';
                    }}
                  />
                )}

                {posts.some((p) => p.bikeDetails?.charge_ac_kw) && (
                  <ComparisonRow
                    label="Công suất sạc (kW)"
                    posts={posts}
                    getValue={(post) => {
                      const power = post.bikeDetails?.charge_ac_kw;
                      return power ? (typeof power === 'object' ? power.value?.toString() || 'N/A' : power.toString()) : 'N/A';
                    }}
                  />
                )}

                {posts.some((p) => p.batteryDetails?.chemistry) && (
                  <ComparisonRow
                    label="Hóa học pin"
                    posts={posts}
                    getValue={(post) => post.batteryDetails?.chemistry || 'N/A'}
                  />
                )}

                {posts.some((p) => p.batteryDetails?.weightKg) && (
                  <ComparisonRow
                    label="Cân nặng (kg)"
                    posts={posts}
                    getValue={(post) => post.batteryDetails?.weightKg?.toString() || 'N/A'}
                  />
                )}

                {posts.some((p) => p.batteryDetails?.cycleLife) && (
                  <ComparisonRow
                    label="Vòng đời pin"
                    posts={posts}
                    getValue={(post) => post.batteryDetails?.cycleLife?.toString() || 'N/A'}
                  />
                )}

                {posts.some((p) => p.batteryDetails?.rangeKm) && (
                  <ComparisonRow
                    label="Tầm hoạt động (km)"
                    posts={posts}
                    getValue={(post) => post.batteryDetails?.rangeKm?.toString() || 'N/A'}
                  />
                )}

                {posts.some((p) => p.batteryDetails?.compatibleNotes) && (
                  <ComparisonRow
                    label="Ghi chú tương thích"
                    posts={posts}
                    getValue={(post) => post.batteryDetails?.compatibleNotes || 'N/A'}
                  />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Product Modals */}
      <CarModal open={carModalOpen} onOpenChange={setCarModalOpen} />
      <BikeModal open={bikeModalOpen} onOpenChange={setBikeModalOpen} />
      <BatteryModal open={batteryModalOpen} onOpenChange={setBatteryModalOpen} />
    </div>
  );
}

interface ComparisonRowProps {
  label: string;
  posts: PostWithType[];
  getValue: (post: PostWithType) => string;
}

function ComparisonRow({ label, posts, getValue }: ComparisonRowProps) {
  return (
    <tr className="border-t">
      <td className="px-6 py-4 font-semibold text-gray-900 bg-gray-50 w-1/4 min-w-40">
        {label}
      </td>
      {posts.map((post) => (
        <td key={post.id} className="px-6 py-4 text-gray-600">
          {getValue(post)}
        </td>
      ))}
    </tr>
  );
}
