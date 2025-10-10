'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Battery } from 'lucide-react';
import { getBatteryBrands } from '@/lib/api/catalogApi';
import { BatteryFormData } from '@/types/form-data';
import { BATTERY_CHEMISTRY_LABELS, BATTERY_ORIGIN_LABELS, BatteryChemistry } from '@/types/enums';

const STALE_TIME_MS = 5 * 60 * 1000; // Cache for 5 minutes
const RETRY_TIMES = 2;

// Form field names (matching formData property names)
const FIELD_NAMES = {
  BRAND_ID: 'brand_id',
  VOLTAGE_V: 'voltageV',
  CAPACITY_AH: 'capacityAh',
  CHARGE_TIME_HOURS: 'chargeTimeHours',
  CHEMISTRY: 'chemistry',
  ORIGIN: 'origin',
  WEIGHT_KG: 'weightKg',
  CYCLE_LIFE: 'cycleLife',
  RANGE_KM: 'rangeKm',
  COMPATIBLE_NOTES: 'compatibleNotes',
} as const;

interface BatteryDetailsFormProps {
  formData: BatteryFormData;
  onInputChange: (field: string, value: string) => void;
}

export default function BatteryDetailsForm({ formData, onInputChange }: BatteryDetailsFormProps) {
  // Fetch battery brands using TanStack Query
  const {
    data: brands = [],
    isLoading: loadingBrands,
    isError,
    error,
  } = useQuery({
    queryKey: ['battery-brands'],
    queryFn: getBatteryBrands,
    staleTime: STALE_TIME_MS,
    retry: RETRY_TIMES,
  });

  // Log error if fetch fails
  if (isError) {
    console.error('Failed to fetch battery brands:', error);
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Battery className="h-5 w-5" />
          Thông tin pin EV
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Brand ID */}
          <div>
            <Label htmlFor={FIELD_NAMES.BRAND_ID}>Hãng pin</Label>
            <Select
              value={formData.brand_id}
              onValueChange={(value) => onInputChange(FIELD_NAMES.BRAND_ID, value)}
              disabled={loadingBrands}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loadingBrands ? 'Đang tải...' : 'Chọn hãng pin'} />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id.toString()}>
                    {brand.name}
                  </SelectItem>
                ))}
                <SelectItem value="OTHER">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Voltage */}
          <div>
            <Label htmlFor={FIELD_NAMES.VOLTAGE_V}>Điện áp (V)</Label>
            <Input
              id={FIELD_NAMES.VOLTAGE_V}
              type="number"
              step="0.01"
              min="0"
              max="1000"
              value={formData.voltageV}
              onChange={(e) => onInputChange(FIELD_NAMES.VOLTAGE_V, e.target.value)}
              placeholder="48.0"
              className="text-base"
            />
          </div>

          {/* Capacity */}
          <div>
            <Label htmlFor={FIELD_NAMES.CAPACITY_AH}>Dung lượng (Ah)</Label>
            <Input
              id={FIELD_NAMES.CAPACITY_AH}
              type="number"
              step="0.01"
              min="0"
              max="9999"
              value={formData.capacityAh}
              onChange={(e) => onInputChange(FIELD_NAMES.CAPACITY_AH, e.target.value)}
              placeholder="20.5"
              className="text-base"
            />
          </div>

          {/* Charge Time */}
          <div>
            <Label htmlFor={FIELD_NAMES.CHARGE_TIME_HOURS}>Thời gian sạc đầy (giờ)</Label>
            <Input
              id={FIELD_NAMES.CHARGE_TIME_HOURS}
              type="number"
              step="0.1"
              min="0"
              max="24"
              value={formData.chargeTimeHours}
              onChange={(e) => onInputChange(FIELD_NAMES.CHARGE_TIME_HOURS, e.target.value)}
              placeholder="4.5"
              className="text-base"
            />
          </div>

          {/* Chemistry */}
          <div>
            <Label htmlFor={FIELD_NAMES.CHEMISTRY}>Loại hoá học cell</Label>
            <Select
              value={formData.chemistry}
              onValueChange={(value) => onInputChange(FIELD_NAMES.CHEMISTRY, value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn loại hoá học" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BATTERY_CHEMISTRY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Origin */}
          <div>
            <Label htmlFor={FIELD_NAMES.ORIGIN}>Xuất xứ</Label>
            <Select
              value={formData.origin}
              onValueChange={(value) => onInputChange(FIELD_NAMES.ORIGIN, value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn xuất xứ" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BATTERY_ORIGIN_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Weight */}
          <div>
            <Label htmlFor={FIELD_NAMES.WEIGHT_KG}>Trọng lượng (kg)</Label>
            <Input
              id={FIELD_NAMES.WEIGHT_KG}
              type="number"
              step="0.01"
              min="0"
              max="9999"
              value={formData.weightKg}
              onChange={(e) => onInputChange(FIELD_NAMES.WEIGHT_KG, e.target.value)}
              placeholder="12.5"
              className="text-base"
            />
          </div>

          {/* Cycle Life */}
          <div>
            <Label htmlFor={FIELD_NAMES.CYCLE_LIFE}>Tuổi thọ chu kỳ (số chu kỳ)</Label>
            <Input
              id={FIELD_NAMES.CYCLE_LIFE}
              type="number"
              min="0"
              max="100000"
              value={formData.cycleLife}
              onChange={(e) => onInputChange(FIELD_NAMES.CYCLE_LIFE, e.target.value)}
              placeholder="1000"
              className="text-base"
            />
          </div>

          {/* Range */}
          <div>
            <Label htmlFor={FIELD_NAMES.RANGE_KM}>Quãng đường đi xa (km)</Label>
            <Input
              id={FIELD_NAMES.RANGE_KM}
              type="number"
              min="0"
              max="10000"
              value={formData.rangeKm}
              onChange={(e) => onInputChange(FIELD_NAMES.RANGE_KM, e.target.value)}
              placeholder="60"
              className="text-base"
            />
          </div>

          {/* Compatible Notes - Full Width */}
          <div className="md:col-span-2">
            <Label htmlFor={FIELD_NAMES.COMPATIBLE_NOTES}>Ghi chú tương thích</Label>
            <Textarea
              id={FIELD_NAMES.COMPATIBLE_NOTES}
              value={formData.compatibleNotes}
              onChange={(e) => onInputChange(FIELD_NAMES.COMPATIBLE_NOTES, e.target.value)}
              placeholder="Ví dụ: Tương thích với xe VinFast Klara, Pega eSH..."
              className="text-base min-h-[80px]"
              maxLength={5000}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
