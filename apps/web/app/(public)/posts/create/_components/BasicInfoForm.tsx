'use client';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText } from 'lucide-react';
import { useProvinces, useDistricts, useWards } from '@/hooks/useGeo';

interface BasicInfoFormProps {
  formData: {
    title: string;
    description: string;
    priceVnd: string;
    addressText: string;
    addressTextCached: string;
    wardCode: string;
    provinceNameCached: string;
    districtNameCached: string;
    wardNameCached: string;
    isNegotiable: boolean;
  };
  postType: 'ev' | 'battery' | null;
  provinceCode: string;
  districtCode: string;
  onInputChange: (field: string, value: string) => void;
  onProvinceChange: (code: string, name: string) => void;
  onDistrictChange: (code: string, name: string) => void;
  onWardChange: (code: string, name: string, addressCached: string) => void;
  onAddressTextChange: (value: string) => void;
  formatNumberWithCommas: (value: string) => string;
}

export default function BasicInfoForm({
  formData,
  postType,
  provinceCode,
  districtCode,
  onInputChange,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  onAddressTextChange,
  formatNumberWithCommas,
}: BasicInfoFormProps) {
  const provincesQ = useProvinces();
  const districtsQ = useDistricts(provinceCode || undefined);
  const wardsQ = useWards(districtCode || undefined);
  const provinces = provincesQ.data ?? [];
  const districts = districtsQ.data ?? [];
  const wards = wardsQ.data ?? [];

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Thông tin cơ bản
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="title">
              Tiêu đề tin đăng <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => onInputChange('title', e.target.value)}
              placeholder={
                postType === 'ev'
                  ? 'VinFast VF e34 - 2022 - Màu xanh'
                  : 'Pack pin EV 60kWh - còn 90% SOH'
              }
              className="text-base"
              required
            />
          </div>

          <div>
            <Label htmlFor="price">
              Giá bán (VND) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="price"
              type="text"
              inputMode="numeric"
              value={formData.priceVnd}
              onChange={(e) => onInputChange('priceVnd', formatNumberWithCommas(e.target.value))}
              placeholder="385,000,000"
              className="text-base"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="isNegotiable"
              checked={formData.isNegotiable}
              onCheckedChange={(checked) =>
                onInputChange('isNegotiable', checked === true ? 'true' : 'false')
              }
            />
            <Label htmlFor="isNegotiable" className="cursor-pointer mb-0">
              Có thể thương lượng
            </Label>
          </div>

          {/* Address selectors */}
          <div>
            <Label>
              Tỉnh/Thành phố <span className="text-red-500">*</span>
            </Label>
            <select
              value={provinceCode}
              onChange={(e) => {
                const code = e.target.value;
                const provinceName = provinces.find((p) => p.code === code)?.name || '';
                onProvinceChange(code, provinceName);
              }}
              className="w-full px-3 py-2 border border-input rounded-md text-base"
              required
            >
              <option value="">-- Chọn tỉnh --</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>
              Quận/Huyện <span className="text-red-500">*</span>
            </Label>
            <select
              value={districtCode}
              disabled={!provinceCode || districtsQ.isLoading}
              onChange={(e) => {
                const code = e.target.value;
                const districtName = districts.find((d) => d.code === code)?.name || '';
                onDistrictChange(code, districtName);
              }}
              className="w-full px-3 py-2 border border-input rounded-md text-base"
              required
            >
              <option value="">-- Chọn quận/huyện --</option>
              {districts.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>
              Phường/Xã <span className="text-red-500">*</span>
            </Label>
            <select
              value={formData.wardCode}
              disabled={!districtCode || wardsQ.isLoading}
              onChange={(e) => {
                const code = e.target.value;
                const wardName = wards.find((w) => w.code === code)?.name || '';
                const provinceName = formData.provinceNameCached;
                const districtName = formData.districtNameCached;
                const addressCached = [wardName, districtName, provinceName]
                  .filter(Boolean)
                  .join(', ');
                onWardChange(code, wardName, addressCached);
              }}
              className="w-full px-3 py-2 border border-input rounded-md text-base"
              required
            >
              <option value="">-- Chọn phường/xã --</option>
              {wards.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="specificAddress">Địa chỉ cụ thể</Label>
            <Input
              id="specificAddress"
              value={formData.addressText}
              onChange={(e) => onAddressTextChange(e.target.value)}
              placeholder="Số nhà, đường..."
              className="text-base"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description">Mô tả chi tiết</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                onInputChange('description', e.target.value)
              }
              placeholder={
                postType === 'ev'
                  ? 'Xe gia đình sử dụng kỹ, bảo dưỡng định kỳ tại hãng, pin còn tốt.'
                  : 'Pack tháo xe, đã test dung lượng, phù hợp thay thế hoặc dự phòng.'
              }
              className="min-h-24 resize-none text-base"
              rows={4}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
