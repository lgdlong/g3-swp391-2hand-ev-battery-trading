'use client';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car } from 'lucide-react';
import { Brand, Model } from '@/types/catalog';
import { Origin } from '@/types/enums';

interface EVDetailsFormProps {
  formData: {
    vehicleType: 'xe_hoi' | 'xe_may';
    brandId: string;
    modelId: string;
    manufactureYear: string;
    bodyStyle: 'SEDAN' | 'SUV' | 'HATCHBACK' | 'COUPE' | 'OTHER';
    bikeStyle: 'SCOOTER' | 'UNDERBONE' | 'MOTORCYCLE' | 'MOPED' | 'OTHER';
    origin: Origin;
    color: 'BLACK' | 'WHITE' | 'RED' | 'BLUE' | 'SILVER';
    seats: string;
    trimName: string;
    licensePlate: string;
    ownersCount: string;
    odoKm: string;
    batteryCapacityKwh: string;
    rangeKm: string;
    chargeAcKw: string;
    chargeDcKw: string;
    motorPowerKw: string;
    batteryHealthPct: string;
  };
  brands: Brand[];
  models: Model[];
  loadingBrands: boolean;
  loadingModels: boolean;
  onInputChange: (field: string, value: string) => void;
}

export default function EVDetailsForm({
  formData,
  brands,
  models,
  loadingBrands,
  loadingModels,
  onInputChange,
}: EVDetailsFormProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Car className="h-5 w-5" />
          Thông tin xe điện
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="vehicleType">
              Loại xe <span className="text-red-500">*</span>
            </Label>
            <select
              id="vehicleType"
              value={formData.vehicleType}
              onChange={(e) => onInputChange('vehicleType', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md text-base"
              required
            >
              <option value="xe_hoi">Xe hơi</option>
              <option value="xe_may">Xe máy</option>
            </select>
          </div>

          <div>
            <Label htmlFor="brandId">
              Hãng xe <span className="text-red-500">*</span>
            </Label>
            <select
              id="brandId"
              value={formData.brandId}
              onChange={(e) => onInputChange('brandId', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md text-base"
              required
              disabled={loadingBrands}
            >
              <option value="">{loadingBrands ? 'Đang tải...' : 'Chọn hãng xe'}</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id.toString()}>
                  {brand.name}
                </option>
              ))}
              <option value="other">Khác</option>
            </select>
          </div>

          <div>
            <Label htmlFor="modelId">
              Model {formData.brandId !== 'other' && <span className="text-red-500">*</span>}
            </Label>
            <select
              id="modelId"
              value={formData.modelId}
              onChange={(e) => onInputChange('modelId', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md text-base"
              required={formData.brandId !== 'other'}
              disabled={loadingModels || !formData.brandId || formData.brandId === 'other'}
            >
              <option value="">
                {loadingModels
                  ? 'Đang tải...'
                  : !formData.brandId
                    ? 'Chọn hãng xe trước'
                    : formData.brandId === 'other'
                      ? 'Chọn "Khác" nếu không có model'
                      : 'Chọn model'}
              </option>
              {models.map((model) => (
                <option key={model.id} value={model.id.toString()}>
                  {model.name}
                </option>
              ))}
              {formData.brandId && formData.brandId !== 'other' && (
                <option value="other">Khác</option>
              )}
              {formData.brandId === 'other' && <option value="other">Khác</option>}
            </select>
          </div>

          <div>
            <Label htmlFor="trimName">Phiên bản</Label>
            <Input
              id="trimName"
              value={formData.trimName}
              onChange={(e) => onInputChange('trimName', e.target.value)}
              placeholder="Standard"
              className="text-base"
            />
          </div>

          <div>
            <Label htmlFor="manufactureYear">
              Năm sản xuất <span className="text-red-500">*</span>
            </Label>
            <select
              id="manufactureYear"
              value={formData.manufactureYear}
              onChange={(e) => onInputChange('manufactureYear', e.target.value)}
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
            <Label htmlFor="odoKm">
              Số km đã đi <span className="text-red-500">*</span>
            </Label>
            <Input
              id="odoKm"
              type="number"
              value={formData.odoKm}
              onChange={(e) => onInputChange('odoKm', e.target.value)}
              placeholder="23000"
              className="text-base"
              required
            />
          </div>

          <div>
            <Label htmlFor="batteryCapacity">
              Dung lượng pin (kWh) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="batteryCapacity"
              type="number"
              value={formData.batteryCapacityKwh}
              onChange={(e) => onInputChange('batteryCapacityKwh', e.target.value)}
              placeholder="42"
              className="text-base"
              required
            />
          </div>

          <div>
            <Label htmlFor="rangeKm">Phạm vi hoạt động (km)</Label>
            <Input
              id="rangeKm"
              type="number"
              value={formData.rangeKm}
              onChange={(e) => onInputChange('rangeKm', e.target.value)}
              placeholder="450"
              className="text-base"
            />
          </div>

          <div>
            <Label htmlFor="chargeAcKw">Sạc AC (kW)</Label>
            <Input
              id="chargeAcKw"
              type="number"
              value={formData.chargeAcKw}
              onChange={(e) => onInputChange('chargeAcKw', e.target.value)}
              placeholder="11"
              className="text-base"
            />
          </div>

          <div>
            <Label htmlFor="chargeDcKw">Sạc DC (kW)</Label>
            <Input
              id="chargeDcKw"
              type="number"
              value={formData.chargeDcKw}
              onChange={(e) => onInputChange('chargeDcKw', e.target.value)}
              placeholder="120"
              className="text-base"
            />
          </div>

          <div>
            <Label htmlFor="motorPowerKw">Công suất động cơ (kW)</Label>
            <Input
              id="motorPowerKw"
              type="number"
              value={formData.motorPowerKw}
              onChange={(e) => onInputChange('motorPowerKw', e.target.value)}
              placeholder="150"
              className="text-base"
            />
          </div>

          <div>
            <Label htmlFor="batteryHealthPct">Tình trạng pin (%)</Label>
            <Input
              id="batteryHealthPct"
              type="number"
              min={0}
              max={100}
              value={formData.batteryHealthPct}
              onChange={(e) => onInputChange('batteryHealthPct', e.target.value)}
              placeholder="90"
              className="text-base"
            />
          </div>

          <div>
            <Label htmlFor="colorName">Màu sắc</Label>
            <select
              id="colorName"
              value={formData.color}
              onChange={(e) => onInputChange('color', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md text-base"
            >
              <option value="">Chọn màu sắc</option>
              <option value="WHITE">Trắng</option>
              <option value="BLACK">Đen</option>
              <option value="GRAY">Xám</option>
              <option value="SILVER">Bạc</option>
              <option value="RED">Đỏ</option>
              <option value="BLUE">Xanh dương</option>
              <option value="GREEN">Xanh lá</option>
              <option value="YELLOW">Vàng</option>
              <option value="ORANGE">Cam</option>
              <option value="PURPLE">Tím</option>
              <option value="BROWN">Nâu</option>
              <option value="PINK">Hồng</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>

          <div>
            <Label htmlFor="licensePlate">Biển số xe</Label>
            <Input
              id="licensePlate"
              value={formData.licensePlate}
              onChange={(e) => onInputChange('licensePlate', e.target.value)}
              placeholder="51H-123.45"
              className="text-base"
            />
          </div>

          <div>
            <Label htmlFor="seats">Số chỗ ngồi</Label>
            <select
              id="seats"
              value={formData.vehicleType === 'xe_may' ? '2' : formData.seats}
              onChange={(e) => onInputChange('seats', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md text-base"
              disabled={formData.vehicleType === 'xe_may'}
            >
              <option value="">Chọn số chỗ ngồi</option>
              <option value="2">2 chỗ</option>
              <option value="5">5 chỗ</option>
              <option value="8">8 chỗ</option>
            </select>
          </div>

          <div>
            <Label htmlFor="bodyStyle">Kiểu dáng</Label>
            <select
              id="bodyStyle"
              value={formData.vehicleType === 'xe_may' ? formData.bikeStyle : formData.bodyStyle}
              onChange={(e) =>
                onInputChange(
                  formData.vehicleType === 'xe_may' ? 'bikeStyle' : 'bodyStyle',
                  e.target.value,
                )
              }
              className="w-full px-3 py-2 border border-input rounded-md text-base"
            >
              {formData.vehicleType === 'xe_may' ? (
                <>
                  <option value="SCOOTER">Scooter</option>
                  <option value="UNDERBONE">Underbone</option>
                  <option value="MOTORCYCLE">Motorcycle</option>
                  <option value="MOPED">Moped</option>
                  <option value="OTHER">Khác</option>
                </>
              ) : (
                <>
                  <option value="SEDAN">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="HATCHBACK">Hatchback</option>
                  <option value="COUPE">Coupe</option>
                  <option value="OTHER">Khác</option>
                </>
              )}
            </select>
          </div>

          <div>
            <Label htmlFor="ownersCount">
              Số đời chủ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ownersCount"
              type="number"
              min={1}
              value={formData.ownersCount}
              onChange={(e) => onInputChange('ownersCount', e.target.value)}
              placeholder="1"
              className="text-base"
              required
            />
          </div>

          <div>
            <Label htmlFor="origin">Xuất xứ</Label>
            <select
              id="origin"
              value={formData.origin}
              onChange={(e) => onInputChange('origin', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md text-base"
            >
              <option value="NOI_DIA">Nội địa</option>
              <option value="NHAP_KHAU">Nhập khẩu</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
