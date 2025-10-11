import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Battery, Zap, Activity, TrendingUp, Hash } from 'lucide-react';
import { SpecItem } from './SpecItem';
import type { Post } from '@/types/api/post';

interface SpecificationsProps {
  post: Post;
}

/**
 * Battery Specifications Section Component
 */
export function Specifications({ post }: SpecificationsProps) {
  const batteryDetails = post.batteryDetails;

  if (!batteryDetails) return null;

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Battery className="h-5 w-5" />
          Thông số kỹ thuật pin
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SpecItem
            icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
            label="Năm sản xuất"
            value={batteryDetails.manufacture_year || 'N/A'}
          />
          <SpecItem
            icon={<Zap className="h-4 w-4 text-muted-foreground" />}
            label="Dung lượng pin"
            value={batteryDetails.capacity_kwh ? batteryDetails.capacity_kwh + ' kWh' : 'N/A'}
          />
          <SpecItem
            icon={<Battery className="h-4 w-4 text-muted-foreground" />}
            label="Hãng pin"
            value={batteryDetails.brand_name || 'N/A'}
          />
          <SpecItem
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
            label="Chu kỳ sạc"
            value={batteryDetails.cycles_used ? batteryDetails.cycles_used.toLocaleString() : 'N/A'}
          />
          <SpecItem
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            label="Tình trạng pin (SOH)"
            value={batteryDetails.health_percent ? batteryDetails.health_percent + '%' : 'N/A'}
          />
          {batteryDetails.compatible_models && batteryDetails.compatible_models.length > 0 && (
            <SpecItem
              icon={<Hash className="h-4 w-4 text-muted-foreground" />}
              label="Tương thích"
              value={batteryDetails.compatible_models.join(', ')}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
