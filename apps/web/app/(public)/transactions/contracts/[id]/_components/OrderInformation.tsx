'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Car, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import type { PostUI } from '@/types/post';
import type { Contract } from '@/lib/api/transactionApi';

interface OrderInformationProps {
  post: PostUI | undefined;
  isLoadingPost: boolean;
  contract: Contract;
  formatDate: (dateString: string | null) => string;
}

export function OrderInformation({
  post,
  isLoadingPost,
  contract,
  formatDate,
}: OrderInformationProps) {
  const [mainImage, setMainImage] = useState<string>('');

  // Set main image when post loads
  useEffect(() => {
    if (post?.images?.[0]?.url) {
      setMainImage(post.images[0].url);
    } else if (post) {
      setMainImage('/asset/phu-tung-o-to-27.png');
    }
  }, [post]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Thông tin đơn hàng
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoadingPost ? (
          <div className="space-y-3">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : post ? (
          <>
            {/* Post Title */}
            <div>
              <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
            </div>

            {/* Post Images Gallery */}
            {post.images && post.images.length > 0 && (
              <div className="space-y-3">
                {/* Main Image */}
                <div className="relative w-full h-96 bg-gray-50 rounded-lg overflow-hidden">
                  <Image
                    src={mainImage || post.images[0].url || '/asset/phu-tung-o-to-27.png'}
                    alt={post.title}
                    fill
                    sizes="(max-width:768px) 100vw, 66vw"
                    className="object-contain p-4"
                  />
                </div>
                {/* Thumbnails Gallery */}
                {post.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {post.images
                      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                      .map((img, idx) => (
                        <Button
                          key={img.id || `thumb-${idx}`}
                          onClick={() => setMainImage(img.url)}
                          variant="ghost"
                          className={`relative h-20 w-28 border rounded overflow-hidden flex-shrink-0 p-0 ${
                            mainImage === img.url || (!mainImage && idx === 0)
                              ? 'ring-2 ring-[#048C73]'
                              : 'hover:ring-1 hover:ring-gray-300'
                          }`}
                        >
                          <Image
                            src={img.url}
                            alt={`Thumbnail ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </Button>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">Giá:</span>
              <span className="text-xl font-bold text-[#048C73]">
                {new Intl.NumberFormat('vi-VN').format(parseFloat(post.priceVnd))} ₫
              </span>
            </div>

            {/* Vehicle Details */}
            {(post.carDetails || post.bikeDetails || post.batteryDetails) && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Thông số kỹ thuật
                  </h4>

                  {/* Car Details */}
                  {post.carDetails && (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {post.carDetails.manufacture_year && (
                        <div>
                          <span className="text-gray-600">Năm sản xuất:</span>
                          <span className="ml-2 font-medium">
                            {post.carDetails.manufacture_year}
                          </span>
                        </div>
                      )}
                      {post.carDetails.odo_km && (
                        <div>
                          <span className="text-gray-600">Số km:</span>
                          <span className="ml-2 font-medium">
                            {Number(post.carDetails.odo_km).toLocaleString()} km
                          </span>
                        </div>
                      )}
                      {post.carDetails.battery_capacity_kwh && (
                        <div>
                          <span className="text-gray-600">Dung lượng pin:</span>
                          <span className="ml-2 font-medium">
                            {post.carDetails.battery_capacity_kwh} kWh
                          </span>
                        </div>
                      )}
                      {post.carDetails.battery_health_pct && (
                        <div>
                          <span className="text-gray-600">Tình trạng pin:</span>
                          <span className="ml-2 font-medium">
                            {post.carDetails.battery_health_pct}%
                          </span>
                        </div>
                      )}
                      {post.carDetails.charge_ac_kw && (
                        <div>
                          <span className="text-gray-600">Sạc AC:</span>
                          <span className="ml-2 font-medium">
                            {post.carDetails.charge_ac_kw} kW
                          </span>
                        </div>
                      )}
                      {post.carDetails.charge_dc_kw && (
                        <div>
                          <span className="text-gray-600">Sạc DC:</span>
                          <span className="ml-2 font-medium">
                            {post.carDetails.charge_dc_kw} kW
                          </span>
                        </div>
                      )}
                      {post.carDetails.range_km && (
                        <div>
                          <span className="text-gray-600">Tầm hoạt động:</span>
                          <span className="ml-2 font-medium">
                            {post.carDetails.range_km} km
                          </span>
                        </div>
                      )}
                      {post.carDetails.license_plate && (
                        <div>
                          <span className="text-gray-600">Biển số:</span>
                          <span className="ml-2 font-medium">
                            {post.carDetails.license_plate}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bike Details */}
                  {post.bikeDetails && (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {post.bikeDetails.manufacture_year && (
                        <div>
                          <span className="text-gray-600">Năm sản xuất:</span>
                          <span className="ml-2 font-medium">
                            {post.bikeDetails.manufacture_year}
                          </span>
                        </div>
                      )}
                      {post.bikeDetails.odo_km && (
                        <div>
                          <span className="text-gray-600">Số km:</span>
                          <span className="ml-2 font-medium">
                            {Number(post.bikeDetails.odo_km).toLocaleString()} km
                          </span>
                        </div>
                      )}
                      {post.bikeDetails.battery_capacity_kwh && (
                        <div>
                          <span className="text-gray-600">Dung lượng pin:</span>
                          <span className="ml-2 font-medium">
                            {post.bikeDetails.battery_capacity_kwh} kWh
                          </span>
                        </div>
                      )}
                      {post.bikeDetails.battery_health_pct && (
                        <div>
                          <span className="text-gray-600">Tình trạng pin:</span>
                          <span className="ml-2 font-medium">
                            {post.bikeDetails.battery_health_pct}%
                          </span>
                        </div>
                      )}
                      {post.bikeDetails.motor_power_kw && (
                        <div>
                          <span className="text-gray-600">Công suất động cơ:</span>
                          <span className="ml-2 font-medium">
                            {post.bikeDetails.motor_power_kw} kW
                          </span>
                        </div>
                      )}
                      {post.bikeDetails.range_km && (
                        <div>
                          <span className="text-gray-600">Tầm hoạt động:</span>
                          <span className="ml-2 font-medium">
                            {post.bikeDetails.range_km} km
                          </span>
                        </div>
                      )}
                      {post.bikeDetails.license_plate && (
                        <div>
                          <span className="text-gray-600">Biển số:</span>
                          <span className="ml-2 font-medium">
                            {post.bikeDetails.license_plate}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Battery Details */}
                  {post.batteryDetails && (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {post.batteryDetails.capacityAh && (
                        <div>
                          <span className="text-gray-600">Dung lượng:</span>
                          <span className="ml-2 font-medium">
                            {post.batteryDetails.capacityAh} Ah
                          </span>
                        </div>
                      )}
                      {post.batteryDetails.voltageV && (
                        <div>
                          <span className="text-gray-600">Điện áp:</span>
                          <span className="ml-2 font-medium">
                            {post.batteryDetails.voltageV} V
                          </span>
                        </div>
                      )}
                      {post.batteryDetails.chemistry && (
                        <div>
                          <span className="text-gray-600">Loại pin:</span>
                          <span className="ml-2 font-medium">
                            {post.batteryDetails.chemistry}
                          </span>
                        </div>
                      )}
                      {post.batteryDetails.chargeTimeHours && (
                        <div>
                          <span className="text-gray-600">Thời gian sạc:</span>
                          <span className="ml-2 font-medium">
                            {post.batteryDetails.chargeTimeHours} giờ
                          </span>
                        </div>
                      )}
                      {post.batteryDetails.weightKg && (
                        <div>
                          <span className="text-gray-600">Trọng lượng:</span>
                          <span className="ml-2 font-medium">
                            {post.batteryDetails.weightKg} kg
                          </span>
                        </div>
                      )}
                      {post.batteryDetails.cycleLife && (
                        <div>
                          <span className="text-gray-600">Chu kỳ sạc:</span>
                          <span className="ml-2 font-medium">
                            {post.batteryDetails.cycleLife} chu kỳ
                          </span>
                        </div>
                      )}
                      {post.batteryDetails.rangeKm && (
                        <div>
                          <span className="text-gray-600">Tầm hoạt động:</span>
                          <span className="ml-2 font-medium">
                            {post.batteryDetails.rangeKm} km
                          </span>
                        </div>
                      )}
                      {post.batteryDetails.origin && (
                        <div>
                          <span className="text-gray-600">Xuất xứ:</span>
                          <span className="ml-2 font-medium">
                            {post.batteryDetails.origin === 'NOI_DIA' ? 'Nội địa' : 'Nhập khẩu'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Contract Info */}
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ID hợp đồng:</span>
                <span className="font-mono">{contract.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ID bài đăng:</span>
                <span className="font-mono">{contract.listingId}</span>
              </div>
              {contract.feeRate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tỷ lệ phí:</span>
                  <span>{contract.feeRate}%</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Ngày tạo:</span>
                <span>{formatDate(contract.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cập nhật lần cuối:</span>
                <span>{formatDate(contract.updatedAt)}</span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">Không thể tải thông tin đơn hàng</p>
        )}
      </CardContent>
    </Card>
  );
}

