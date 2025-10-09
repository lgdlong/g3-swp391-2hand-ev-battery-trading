import { Car } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Post } from '@/types/api/post';

interface PostVehicleDetailsProps {
  carDetails?: Post['carDetails'];
  bikeDetails?: Post['bikeDetails'];
}

export function PostVehicleDetails({ carDetails, bikeDetails }: PostVehicleDetailsProps) {
  if (!carDetails && !bikeDetails) return null;

  return (
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
          {carDetails && (
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
                      <span className="font-medium">{carDetails.body_style || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Màu sắc:</span>
                      <span className="font-medium">{carDetails.color || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nguồn gốc:</span>
                      <span className="font-medium">{carDetails.origin || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Thông tin chi tiết</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Năm sản xuất:</span>
                      <span className="font-medium">
                        {String(carDetails.manufacture_year || 'N/A')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số km đã chạy:</span>
                      <span className="font-medium">{String(carDetails.odo_km || 'N/A')} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số chỗ ngồi:</span>
                      <span className="font-medium">{String(carDetails.seats || 'N/A')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số chủ sở hữu:</span>
                      <span className="font-medium">
                        {String(carDetails.owners_count || 'N/A')}
                      </span>
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
                      <span className="font-medium">
                        {String(carDetails.battery_capacity_kwh || 'N/A')} kWh
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tầm hoạt động:</span>
                      <span className="font-medium">{String(carDetails.range_km || 'N/A')} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sức khỏe pin:</span>
                      <span className="font-medium">
                        {String(carDetails.battery_health_pct || 'N/A')}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sạc AC:</span>
                      <span className="font-medium">
                        {String(carDetails.charge_ac_kw || 'N/A')} kW
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sạc DC:</span>
                      <span className="font-medium">
                        {String(carDetails.charge_dc_kw || 'N/A')} kW
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {bikeDetails && (
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
                      <span className="font-medium">{bikeDetails.bike_style || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Màu sắc:</span>
                      <span className="font-medium">{bikeDetails.color || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nguồn gốc:</span>
                      <span className="font-medium">{bikeDetails.origin || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Thông tin chi tiết</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Năm sản xuất:</span>
                      <span className="font-medium">
                        {String(bikeDetails.manufacture_year || 'N/A')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số km đã chạy:</span>
                      <span className="font-medium">{String(bikeDetails.odo_km || 'N/A')} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Công suất motor:</span>
                      <span className="font-medium">
                        {String(bikeDetails.motor_power_kw || 'N/A')} kW
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số chủ sở hữu:</span>
                      <span className="font-medium">
                        {String(bikeDetails.owners_count || 'N/A')}
                      </span>
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
                      <span className="font-medium">
                        {String(bikeDetails.battery_capacity_kwh || 'N/A')} kWh
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tầm hoạt động:</span>
                      <span className="font-medium">
                        {String(bikeDetails.range_km || 'N/A')} km
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sức khỏe pin:</span>
                      <span className="font-medium">
                        {String(bikeDetails.battery_health_pct || 'N/A')}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sạc AC:</span>
                      <span className="font-medium">
                        {String(bikeDetails.charge_ac_kw || 'N/A')} kW
                      </span>
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
            {carDetails?.license_plate && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600">Biển số xe:</span>
                  <span className="font-medium">{String(carDetails.license_plate)}</span>
                </div>
              </div>
            )}
            {bikeDetails?.license_plate && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600">Biển số xe:</span>
                  <span className="font-medium">{String(bikeDetails.license_plate)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
