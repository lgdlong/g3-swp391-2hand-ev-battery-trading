'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MapPin, Edit } from 'lucide-react';
import { useProvinces, useDistricts, useWards } from '@/hooks/useGeo';

interface AddressSelectorProps {
  currentAddress: {
    wardNameCached: string;
    districtNameCached: string;
    provinceNameCached: string;
  };
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (address: {
    provinceCode: string;
    districtCode: string;
    wardCode: string;
    provinceNameCached: string;
    districtNameCached: string;
    wardNameCached: string;
    addressTextCached: string;
  }) => void;
  onCancel: () => void;
  tempProvinceCode: string;
  tempDistrictCode: string;
  tempWardCode: string;
  onTempProvinceChange: (code: string, name: string) => void;
  onTempDistrictChange: (code: string, name: string) => void;
  onTempWardChange: (code: string, name: string) => void;
}

export default function AddressSelector({
  currentAddress,
  isOpen,
  onOpenChange,
  onConfirm,
  onCancel,
  tempProvinceCode,
  tempDistrictCode,
  tempWardCode,
  onTempProvinceChange,
  onTempDistrictChange,
  onTempWardChange,
}: AddressSelectorProps) {
  // Address data fetching
  const provincesQ = useProvinces();
  const tempDistrictsQ = useDistricts(tempProvinceCode || undefined);
  const tempWardsQ = useWards(tempDistrictCode || undefined);

  const provinces = useMemo(() => provincesQ.data ?? [], [provincesQ.data]);
  const tempDistricts = useMemo(() => tempDistrictsQ.data ?? [], [tempDistrictsQ.data]);
  const tempWards = useMemo(() => tempWardsQ.data ?? [], [tempWardsQ.data]);

  const displayAddress =
    [
      currentAddress.wardNameCached,
      currentAddress.districtNameCached,
      currentAddress.provinceNameCached,
    ]
      .filter(Boolean)
      .join(', ') || 'Chưa chọn địa chỉ';

  return (
    <div>
      <Label>Địa chỉ hiện tại</Label>
      <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{displayAddress}</span>
        </div>
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Thay đổi
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Chọn địa chỉ mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>
                  Tỉnh/Thành phố <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={tempProvinceCode}
                  onValueChange={(value) => {
                    const provinceName = provinces.find((p) => p.code === value)?.name || '';
                    onTempProvinceChange(value, provinceName);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Chọn tỉnh --" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {provinces.map((p) => (
                      <SelectItem key={p.code} value={p.code}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  Quận/Huyện <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={tempDistrictCode}
                  disabled={!tempProvinceCode || tempDistrictsQ.isLoading}
                  onValueChange={(value) => {
                    const districtName = tempDistricts.find((d) => d.code === value)?.name || '';
                    onTempDistrictChange(value, districtName);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Chọn quận/huyện --" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {tempDistricts.map((d) => (
                      <SelectItem key={d.code} value={d.code}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  Phường/Xã <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={tempWardCode}
                  disabled={!tempDistrictCode || tempWardsQ.isLoading}
                  onValueChange={(value) => {
                    const wardName = tempWards.find((w) => w.code === value)?.name || '';
                    onTempWardChange(value, wardName);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Chọn phường/xã --" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {tempWards.map((w) => (
                      <SelectItem key={w.code} value={w.code}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Hủy
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (tempWardCode) {
                      onConfirm({
                        provinceCode: tempProvinceCode,
                        districtCode: tempDistrictCode,
                        wardCode: tempWardCode,
                        provinceNameCached:
                          provinces.find((p) => p.code === tempProvinceCode)?.name || '',
                        districtNameCached:
                          tempDistricts.find((d) => d.code === tempDistrictCode)?.name || '',
                        wardNameCached: tempWards.find((w) => w.code === tempWardCode)?.name || '',
                        addressTextCached: [
                          tempWards.find((w) => w.code === tempWardCode)?.name,
                          tempDistricts.find((d) => d.code === tempDistrictCode)?.name,
                          provinces.find((p) => p.code === tempProvinceCode)?.name,
                        ]
                          .filter(Boolean)
                          .join(', '),
                      });
                    }
                  }}
                  disabled={!tempWardCode}
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
