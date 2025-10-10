import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Battery, Zap, Clock, Weight } from 'lucide-react';
import { displayValue, formatVnd, toNumberValue, toStringValue } from './utils';
import type { Post } from '@/types/api/post';

interface BatteryPostCardProps {
  item: Post;
  onTitleClick?: (title: string) => void;
}

export function BatteryPostCard({ item, onTitleClick }: BatteryPostCardProps) {
  const handleTitleClick = () => {
    if (onTitleClick) {
      onTitleClick(item.title);
    }
  };

  // Extract location information
  const location =
    [displayValue(item.districtNameCached), displayValue(item.provinceNameCached)]
      .filter((val) => val !== 'N/A')
      .join(', ') ||
    displayValue(item.addressTextCached) ||
    'Không rõ';

  // Extract battery details with flexible property access
  const batteryDetails = item.batteryDetails as unknown as Record<string, unknown>; // Safe type conversion

  // Try multiple possible field names for voltage
  const voltage =
    batteryDetails?.voltageV || batteryDetails?.voltage_v || batteryDetails?.voltage || null;
  const voltageValue = voltage ? toNumberValue(voltage) : null;

  // Try multiple possible field names for capacity
  const capacity =
    batteryDetails?.capacityAh ||
    batteryDetails?.capacity_ah ||
    batteryDetails?.capacity_kwh ||
    null;
  const capacityValue = capacity ? toNumberValue(capacity) : null;

  // Try multiple possible field names for charge time
  const chargeTime =
    batteryDetails?.chargeTimeHours ||
    batteryDetails?.charge_time_hours ||
    batteryDetails?.chargeTime ||
    null;
  const chargeTimeValue = chargeTime ? toNumberValue(chargeTime) : null;

  // Try multiple possible field names for weight
  const weight =
    batteryDetails?.weightKg || batteryDetails?.weight_kg || batteryDetails?.weight || null;
  const weightValue = weight ? toNumberValue(weight) : null;

  // Try multiple possible field names for chemistry
  const chemistry = batteryDetails?.chemistry || batteryDetails?.brand_name || null;
  const chemistryValue = chemistry ? toStringValue(chemistry) : null;

  // Try multiple possible field names for cycle life
  const cycleLife =
    batteryDetails?.cycleLife || batteryDetails?.cycle_life || batteryDetails?.cycles_used || null;
  const cycleLifeValue = cycleLife ? toNumberValue(cycleLife) : null;

  // Get the first image URL
  const imageUrl =
    (typeof item.images?.[0] === 'object' && item.images?.[0] && 'url' in item.images[0]
      ? (item.images[0] as { url: string }).url
      : undefined) || '/asset/phu-tung-o-to-27.png';

  return (
    <Card className="overflow-hidden border-0 hover:shadow-md transition-all duration-300 bg-white p-0 group">
      <CardContent className="p-0">
        {/* Image */}
        <Link
          href={`/posts/batteries/${item.id}?title=${encodeURIComponent(item.title)}`}
          className="block"
        >
          <div className="relative h-48 w-full bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
            <Image
              src={imageUrl}
              alt={item.title}
              fill
              sizes="(max-width:768px) 100vw, 33vw"
              className="object-contain group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute left-4 top-4">
              <Badge className="bg-green-600 text-white border-0">Pin EV</Badge>
            </div>
          </div>
        </Link>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <Link
            href={`/posts/batteries/${item.id}?title=${encodeURIComponent(item.title)}`}
            onClick={handleTitleClick}
            className="block"
          >
            <h3 className="font-semibold text-slate-900 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors">
              {item.title}
            </h3>
          </Link>

          {/* Battery Specifications */}
          <div className="space-y-2 mb-4 text-sm text-slate-600">
            {voltageValue && (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Điện áp: {voltageValue}V</span>
              </div>
            )}

            {capacityValue && (
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-blue-500" />
                <span>Dung lượng: {capacityValue}Ah</span>
              </div>
            )}

            {chargeTimeValue && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>Thời gian sạc: {chargeTimeValue}h</span>
              </div>
            )}

            {weightValue && (
              <div className="flex items-center gap-2">
                <Weight className="w-4 h-4 text-gray-500" />
                <span>Trọng lượng: {weightValue}kg</span>
              </div>
            )}

            {chemistryValue && (
              <div className="text-xs">
                <span className="bg-slate-100 px-2 py-1 rounded">{chemistryValue}</span>
              </div>
            )}

            {cycleLifeValue && (
              <div className="text-xs text-slate-500">
                Chu kỳ sạc: {cycleLifeValue.toLocaleString()}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-slate-500 mb-3">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{location}</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-green-600">
              {formatVnd(toNumberValue(item.priceVnd))}
            </div>
            {item.isNegotiable && (
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                Có thể thương lượng
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
