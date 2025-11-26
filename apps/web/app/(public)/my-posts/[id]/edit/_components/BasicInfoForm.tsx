'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AddressSelector from './AddressSelector';

interface BasicData {
  title: string;
  description: string;
  priceVnd: string;
  isNegotiable: boolean;
  wardCode: string;
  provinceNameCached: string;
  districtNameCached: string;
  wardNameCached: string;
  addressTextCached: string;
}

interface BasicInfoFormProps {
  basicData: BasicData;
  onInputChange: (field: string, value: string | boolean) => void;
  isAddressDialogOpen: boolean;
  onAddressDialogChange: (open: boolean) => void;
  onAddressConfirm: (address: {
    provinceCode: string;
    districtCode: string;
    wardCode: string;
    provinceNameCached: string;
    districtNameCached: string;
    wardNameCached: string;
    addressTextCached: string;
  }) => void;
  onAddressCancel: () => void;
  tempProvinceCode: string;
  tempDistrictCode: string;
  tempWardCode: string;
  onTempProvinceChange: (code: string, name: string) => void;
  onTempDistrictChange: (code: string, name: string) => void;
  onTempWardChange: (code: string, name: string) => void;
}

export default function BasicInfoForm({
  basicData,
  onInputChange,
  isAddressDialogOpen,
  onAddressDialogChange,
  onAddressConfirm,
  onAddressCancel,
  tempProvinceCode,
  tempDistrictCode,
  tempWardCode,
  onTempProvinceChange,
  onTempDistrictChange,
  onTempWardChange,
}: BasicInfoFormProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">
              Tiêu đề <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={basicData.title}
              onChange={(e) => onInputChange('title', e.target.value)}
              placeholder="Nhập tiêu đề tin đăng"
              maxLength={120}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={basicData.description}
              onChange={(e) => onInputChange('description', e.target.value)}
              placeholder="Mô tả chi tiết về sản phẩm"
              className="min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priceVnd">
                Giá (VNĐ){' '}
                <span className="text-muted-foreground text-xs">(không thể thay đổi)</span>
              </Label>
              <Input
                id="priceVnd"
                type="number"
                value={basicData.priceVnd}
                readOnly
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Giá không thể thay đổi sau khi đăng tin
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="isNegotiable"
                checked={basicData.isNegotiable}
                onChange={(e) => onInputChange('isNegotiable', e.target.checked)}
                className="rounded border-gray-300"
                aria-label="Có thể thương lượng"
              />
              <Label htmlFor="isNegotiable">Có thể thương lượng</Label>
            </div>
          </div>

          <div className="space-y-4">
            <AddressSelector
              currentAddress={{
                wardNameCached: basicData.wardNameCached,
                districtNameCached: basicData.districtNameCached,
                provinceNameCached: basicData.provinceNameCached,
              }}
              isOpen={isAddressDialogOpen}
              onOpenChange={onAddressDialogChange}
              onConfirm={onAddressConfirm}
              onCancel={onAddressCancel}
              tempProvinceCode={tempProvinceCode}
              tempDistrictCode={tempDistrictCode}
              tempWardCode={tempWardCode}
              onTempProvinceChange={onTempProvinceChange}
              onTempDistrictChange={onTempDistrictChange}
              onTempWardChange={onTempWardChange}
            />
          </div>

          <div>
            <Label htmlFor="addressTextCached">Địa chỉ cụ thể</Label>
            <Input
              id="addressTextCached"
              value={basicData.addressTextCached}
              onChange={(e) => onInputChange('addressTextCached', e.target.value)}
              placeholder="Nhập số nhà, tên đường, khu vực..."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
