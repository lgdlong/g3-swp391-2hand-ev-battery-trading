import { Card, CardContent } from '@/components/ui/card';
import {
  Battery,
  Zap,
  Activity,
  TrendingUp,
  Hash,
  Clock,
  Weight,
  MapPin,
  Gauge,
} from 'lucide-react';
import { SpecItem } from './SpecItem';
import { PostUI } from '@/types/post';

interface SpecificationsProps {
  post: PostUI;
}

/**
 * Battery Specifications Section Component
 */
export function Specifications({ post }: SpecificationsProps) {
  const batteryDetails = post.batteryDetails;

  if (!batteryDetails) return null;

  // Helper function to format chemistry display
  const getChemistryDisplay = (chemistry: string | null) => {
    if (!chemistry) return 'N/A';
    const chemistryMap: Record<string, string> = {
      LFP: 'LiFePO4 (LFP)',
      NMC: 'Nickel Manganese Cobalt (NMC)',
      NCA: 'Nickel Cobalt Aluminum (NCA)',
      LMO: 'Lithium Manganese Oxide (LMO)',
      LCO: 'Lithium Cobalt Oxide (LCO)',
      OTHER: 'Khác',
    };
    return chemistryMap[chemistry] || chemistry;
  };

  // Helper function to format origin display
  const getOriginDisplay = (origin: string | null) => {
    if (!origin) return 'N/A';
    return origin === 'NOI_DIA' ? 'Nội địa' : 'Nhập khẩu';
  };

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Battery className="h-5 w-5" />
          Thông số kỹ thuật pin
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {batteryDetails.brandId && (
            <SpecItem
              icon={<Hash className="h-4 w-4 text-muted-foreground" />}
              label="ID Thương hiệu"
              value={batteryDetails.brandId.toString()}
            />
          )}

          {batteryDetails.voltageV && (
            <SpecItem
              icon={<Zap className="h-4 w-4 text-muted-foreground" />}
              label="Điện áp"
              value={`${batteryDetails.voltageV}V`}
            />
          )}

          {batteryDetails.capacityAh && (
            <SpecItem
              icon={<Battery className="h-4 w-4 text-muted-foreground" />}
              label="Dung lượng"
              value={`${batteryDetails.capacityAh}Ah`}
            />
          )}

          {batteryDetails.chargeTimeHours && (
            <SpecItem
              icon={<Clock className="h-4 w-4 text-muted-foreground" />}
              label="Thời gian sạc"
              value={`${batteryDetails.chargeTimeHours} giờ`}
            />
          )}

          <SpecItem
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
            label="Loại hóa học"
            value={getChemistryDisplay(batteryDetails.chemistry)}
          />

          <SpecItem
            icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
            label="Xuất xứ"
            value={getOriginDisplay(batteryDetails.origin)}
          />

          {batteryDetails.weightKg && (
            <SpecItem
              icon={<Weight className="h-4 w-4 text-muted-foreground" />}
              label="Trọng lượng"
              value={`${batteryDetails.weightKg}kg`}
            />
          )}

          {batteryDetails.cycleLife && (
            <SpecItem
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
              label="Tuổi thọ chu kỳ"
              value={`${batteryDetails.cycleLife.toLocaleString()} chu kỳ`}
            />
          )}

          {batteryDetails.rangeKm && (
            <SpecItem
              icon={<Gauge className="h-4 w-4 text-muted-foreground" />}
              label="Phạm vi hoạt động"
              value={`${batteryDetails.rangeKm}km`}
            />
          )}

          {batteryDetails.compatibleNotes && (
            <div className="md:col-span-2">
              <SpecItem
                icon={<Hash className="h-4 w-4 text-muted-foreground" />}
                label="Ghi chú tương thích"
                value={batteryDetails.compatibleNotes}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
