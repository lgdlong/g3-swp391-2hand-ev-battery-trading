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
import { FeeTier } from '@/lib/api/feeTiersApi';

export interface FeeTierFormData {
  minPrice: string;
  maxPrice: string;
  depositRate: string;
  active: boolean;
}

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

  useEffect(() => {
    if (open) {
      if (editingTier) {
        setFormData({
          minPrice: editingTier.minPrice,
          maxPrice: editingTier.maxPrice || '',
          depositRate: (parseFloat(editingTier.depositRate) * 100).toString(),
          active: editingTier.active,
        });
      } else {
        setFormData({
          minPrice: '',
          maxPrice: '',
          depositRate: '',
          active: true,
        });
      }
    }
  }, [open, editingTier]);

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
                : 'Tạo mới một mức hoa hồng với tỷ lệ đặt cọc theo khoảng giá'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="minPrice">
                Giá tối thiểu (VND) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={formData.minPrice}
                onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maxPrice">Giá tối đa (VND)</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="Để trống = không giới hạn"
                value={formData.maxPrice}
                onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
              />
              <p className="text-xs text-gray-500">Để trống nếu không có giới hạn trên</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="depositRate">
                Tỷ lệ đặt cọc (%) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="depositRate"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="10.0"
                value={formData.depositRate}
                onChange={(e) => setFormData({ ...formData, depositRate: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500">Từ 0% đến 100%</p>
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
