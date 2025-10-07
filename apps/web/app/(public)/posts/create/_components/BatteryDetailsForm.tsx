'use client';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Battery } from 'lucide-react';

interface BatteryDetailsFormProps {
  formData: {
    brand: string;
    year: string;
    cyclesUsed: string;
    healthPercent: string;
    batteryCapacityKwh: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export default function BatteryDetailsForm({ formData, onInputChange }: BatteryDetailsFormProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Battery className="h-5 w-5" />
          Thông tin pin EV
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="batteryBrand">
              Hãng pin <span className="text-red-500">*</span>
            </Label>
            <Input
              id="batteryBrand"
              value={formData.brand}
              onChange={(e) => onInputChange('brand', e.target.value)}
              placeholder="CATL"
              className="text-base"
              required
            />
          </div>

          <div>
            <Label htmlFor="batteryYear">
              Năm sản xuất <span className="text-red-500">*</span>
            </Label>
            <select
              id="batteryYear"
              value={formData.year}
              onChange={(e) => onInputChange('year', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md text-base"
              required
            >
              <option value="">Chọn năm sản xuất</option>
              {Array.from({ length: 36 }, (_, i) => 2025 - i).map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="batteryCapacityBattery">
              Dung lượng pin (kWh) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="batteryCapacityBattery"
              type="number"
              value={formData.batteryCapacityKwh}
              onChange={(e) => onInputChange('batteryCapacityKwh', e.target.value)}
              placeholder="60"
              className="text-base"
              required
            />
          </div>

          <div>
            <Label htmlFor="cyclesUsed">Số chu kỳ sạc</Label>
            <Input
              id="cyclesUsed"
              type="number"
              value={formData.cyclesUsed}
              onChange={(e) => onInputChange('cyclesUsed', e.target.value)}
              placeholder="320"
              className="text-base"
            />
          </div>

          <div>
            <Label htmlFor="healthPercent">Health (%)</Label>
            <Input
              id="healthPercent"
              type="number"
              value={formData.healthPercent}
              onChange={(e) => onInputChange('healthPercent', e.target.value)}
              placeholder="90"
              min="0"
              max="100"
              className="text-base"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

