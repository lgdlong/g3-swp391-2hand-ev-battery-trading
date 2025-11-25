import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Car, Battery, Gauge, Hash } from 'lucide-react';
import { SpecItem } from './SpecItem';
import type { PostUI } from '@/types/post';

interface SpecificationsProps {
  post: PostUI;
}

/**
 * Specifications Section Component
 */
export function Specifications({ post }: SpecificationsProps) {
  const isCarPost = post.postType === 'EV_CAR';
  const details = post.carDetails || post.bikeDetails;

  if (!details) return null;

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Car className="h-5 w-5" />
          Thông số kỹ thuật
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SpecItem
            icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
            label="Năm sản xuất"
            value={details.manufacture_year || 'N/A'}
          />
          <SpecItem
            icon={<Gauge className="h-4 w-4 text-muted-foreground" />}
            label="Số km"
            value={details.odo_km ? Number(details.odo_km).toLocaleString() + ' km' : 'N/A'}
          />
          <SpecItem
            icon={<Battery className="h-4 w-4 text-muted-foreground" />}
            label="Dung lượng pin"
            value={details.battery_capacity_kwh ? details.battery_capacity_kwh + ' kWh' : 'N/A'}
          />
          <SpecItem
            icon={<Battery className="h-4 w-4 text-muted-foreground" />}
            label="Tình trạng pin"
            value={details.battery_health_pct ? details.battery_health_pct + '%' : 'N/A'}
          />

          {/* Car-specific specs */}
          {isCarPost && post.carDetails && (
            <>
              {post.carDetails.charge_ac_kw && (
                <SpecItem
                  icon={<Battery className="h-4 w-4 text-muted-foreground" />}
                  label="Sạc AC"
                  value={post.carDetails.charge_ac_kw + ' kW'}
                />
              )}
              {post.carDetails.charge_dc_kw && (
                <SpecItem
                  icon={<Battery className="h-4 w-4 text-muted-foreground" />}
                  label="Sạc DC"
                  value={post.carDetails.charge_dc_kw + ' kW'}
                />
              )}
            </>
          )}

          {/* Bike-specific specs */}
          {!isCarPost && post.bikeDetails?.motor_power_kw && (
            <SpecItem
              icon={<Car className="h-4 w-4 text-muted-foreground" />}
              label="Công suất động cơ"
              value={post.bikeDetails.motor_power_kw + ' kW'}
            />
          )}

          {/* Range (both car and bike) */}
          {details.range_km && (
            <SpecItem
              icon={<Gauge className="h-4 w-4 text-muted-foreground" />}
              label="Phạm vi hoạt động"
              value={details.range_km + ' km'}
            />
          )}

          {/* License plate */}
          <SpecItem
            icon={<Hash className="h-4 w-4 text-muted-foreground" />}
            label="Biển số"
            value={details.license_plate || 'N/A'}
          />
        </div>

        {/* Bundled Battery Section */}
        {isCarPost && post.carDetails?.has_bundled_battery && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Battery className="h-5 w-5 text-blue-600" />
              Thông tin pin kèm theo
            </h3>
            <p className="text-sm text-gray-600">
              Xe này được bán kèm pin điện. Vui lòng liên hệ người bán để biết thêm chi tiết về pin.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
