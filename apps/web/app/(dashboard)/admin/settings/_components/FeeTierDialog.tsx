'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { FeeTier } from '@/types/api/fee-tier';
import { FEE_TIER_PRICE_CONSTANTS, FEE_TIER_DEPOSIT_RATE_CONSTANTS } from './constants';

export interface FeeTierFormData {
  minPrice: string;
  maxPrice: string;
  depositRate: string;
  active: boolean;
}

// Helper functions for number formatting
const formatNumberWithDots = (value: string | number): string => {
  const numValue = typeof value === 'string' ? value.replace(/\./g, '') : value.toString();
  return numValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseNumberFromFormatted = (value: string): string => {
  return value.replace(/\./g, '');
};

interface FeeTierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTier: FeeTier | null;
  onSubmit: (data: FeeTierFormData) => Promise<void>;
  submitting: boolean;
}

export function FeeTierDialog({
  open,
  onOpenChange,
  editingTier,
  onSubmit,
  submitting,
}: FeeTierDialogProps) {
  const [formData, setFormData] = useState<FeeTierFormData>({
    minPrice: '',
    maxPrice: '',
    depositRate: '',
    active: true,
  });

  // Display values with formatting (for UI)
  const [displayMinPrice, setDisplayMinPrice] = useState('');
  const [displayMaxPrice, setDisplayMaxPrice] = useState('');

  useEffect(() => {
    if (open) {
      if (editingTier) {
        const minPrice = editingTier.minPrice;
        const maxPrice = editingTier.maxPrice || '';
        const depositRate = (editingTier as any).depositRate || '0';

        setFormData({
          minPrice,
          maxPrice,
          depositRate: (parseFloat(depositRate) * 100).toString(),
          active: editingTier.active,
        });

        setDisplayMinPrice(formatNumberWithDots(minPrice));
        setDisplayMaxPrice(maxPrice ? formatNumberWithDots(maxPrice) : '');
      } else {
        const defaultMinPrice = FEE_TIER_PRICE_CONSTANTS.MIN_PRICE.toString();
        setFormData({
          minPrice: defaultMinPrice,
          maxPrice: '',
          depositRate: '',
          active: true,
        });
        setDisplayMinPrice(formatNumberWithDots(defaultMinPrice));
        setDisplayMaxPrice('');
      }
    }
  }, [open, editingTier]);

  const handleMinPriceChange = (value: string) => {
    // Remove dots and non-numeric characters
    const cleanedValue = parseNumberFromFormatted(value);

    // Update display with formatting
    setDisplayMinPrice(formatNumberWithDots(cleanedValue));

    // Update form data with raw number
    setFormData({ ...formData, minPrice: cleanedValue });
  };

  const handleMaxPriceChange = (value: string) => {
    if (value === '') {
      setDisplayMaxPrice('');
      setFormData({ ...formData, maxPrice: '' });
      return;
    }

    // Remove dots and non-numeric characters
    const cleanedValue = parseNumberFromFormatted(value);

    // Update display with formatting
    setDisplayMaxPrice(formatNumberWithDots(cleanedValue));

    // Update form data with raw number
    setFormData({ ...formData, maxPrice: cleanedValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editingTier ? 'Chỉnh Sửa Hoa Hồng' : 'Thêm Hoa Hồng Mới'}</DialogTitle>
            <DialogDescription>
              {editingTier
                ? 'Cập nhật thông tin hoa hồng'
                : 'Tạo mới một mức hoa hồng với tỷ lệ phí theo khoảng giá'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="minPrice">
                Giá tối thiểu (VND) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="minPrice"
                type="text"
                inputMode="numeric"
                placeholder={formatNumberWithDots(FEE_TIER_PRICE_CONSTANTS.MIN_PRICE.toString())}
                value={displayMinPrice}
                onChange={(e) => handleMinPriceChange(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                Tối thiểu: {formatNumberWithDots(FEE_TIER_PRICE_CONSTANTS.MIN_PRICE.toString())} VND
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maxPrice">Giá tối đa (VND)</Label>
              <Input
                id="maxPrice"
                type="text"
                inputMode="numeric"
                placeholder="Để trống = không giới hạn"
                value={displayMaxPrice}
                onChange={(e) => handleMaxPriceChange(e.target.value)}
              />
              <p className="text-xs text-gray-500">Để trống nếu không có giới hạn trên</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="depositRate">
                Tỷ lệ phí hoa hồng (%) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="depositRate"
                type="number"
                step={FEE_TIER_DEPOSIT_RATE_CONSTANTS.STEP}
                min={FEE_TIER_DEPOSIT_RATE_CONSTANTS.MIN}
                max={FEE_TIER_DEPOSIT_RATE_CONSTANTS.MAX}
                placeholder="10.0"
                value={formData.depositRate}
                onChange={(e) => setFormData({ ...formData, depositRate: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500">
                Từ {FEE_TIER_DEPOSIT_RATE_CONSTANTS.MIN}% đến {FEE_TIER_DEPOSIT_RATE_CONSTANTS.MAX}%
                (có thể nhập 0.01, 0.001, v.v.)
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active">Trạng thái hoạt động</Label>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Đang lưu...' : editingTier ? 'Cập Nhật' : 'Tạo Mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
