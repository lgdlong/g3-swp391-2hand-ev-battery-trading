'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getAllFeeTiers,
  createFeeTier,
  updateFeeTier,
  deleteFeeTier,
  type FeeTier,
} from '@/lib/api/feeTiersApi';
import { FeeTierStatsCards, FeeTierTable, FeeTierDialog, FeeTierActions } from './_components';

interface FeeTierFormData {
  minPrice: string;
  maxPrice: string;
  depositRate: string;
  active: boolean;
}

export default function AdminFeeTiersPage() {
  const [feeTiers, setFeeTiers] = useState<FeeTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<FeeTier | null>(null);
  const [deletingTierId, setDeletingTierId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch fee tiers
  useEffect(() => {
    fetchFeeTiers();
  }, []);

  const fetchFeeTiers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllFeeTiers();
      // Sort by minPrice ascending
      const sorted = data.sort((a, b) => parseFloat(a.minPrice) - parseFloat(b.minPrice));
      setFeeTiers(sorted);
    } catch (err) {
      setError('Không thể tải danh sách fee tiers');
      console.error('Error fetching fee tiers:', err);
      toast.error('Không thể tải danh sách fee tiers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddDialog = () => {
    setEditingTier(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (tier: FeeTier) => {
    setEditingTier(tier);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTier(null);
  };

  const handleSubmit = async (formData: FeeTierFormData) => {
    // Validation
    if (!formData.minPrice || !formData.depositRate) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const minPrice = parseFloat(formData.minPrice);
    const maxPrice = formData.maxPrice ? parseFloat(formData.maxPrice) : null;
    const depositRate = parseFloat(formData.depositRate) / 100;

    if (isNaN(minPrice) || minPrice < 0) {
      toast.error('Giá tối thiểu không hợp lệ');
      return;
    }

    if (maxPrice !== null && (isNaN(maxPrice) || maxPrice <= minPrice)) {
      toast.error('Giá tối đa phải lớn hơn giá tối thiểu');
      return;
    }

    if (isNaN(depositRate) || depositRate < 0 || depositRate > 1) {
      toast.error('Tỷ lệ đặt cọc phải từ 0 đến 100%');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        minPrice,
        maxPrice: maxPrice ?? 0,
        depositRate,
        active: formData.active,
      };

      if (editingTier) {
        await updateFeeTier(editingTier.id, payload);
        toast.success('Cập nhật fee tier thành công');
      } else {
        await createFeeTier(payload);
        toast.success('Tạo fee tier thành công');
      }

      await fetchFeeTiers();
      handleCloseDialog();
    } catch (err: unknown) {
      console.error('Error saving fee tier:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể lưu fee tier';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTierId) return;

    try {
      await deleteFeeTier(deletingTierId);
      toast.success('Xóa fee tier thành công');
      await fetchFeeTiers();
      setDeletingTierId(null);
    } catch (err: unknown) {
      console.error('Error deleting fee tier:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa fee tier';
      toast.error(errorMessage);
    }
  };

  const handleDeleteTier = (tierId: number) => {
    setDeletingTierId(tierId);
  };

  const handleCancelDelete = () => {
    setDeletingTierId(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Fee Tiers Management</h1>
          <p className="text-gray-600 mt-2">Quản lý các mức phí đặt cọc</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Fee Tiers Management</h1>
          <p className="text-gray-600 mt-2">Quản lý các mức phí đặt cọc</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-600 mb-2">❌</div>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchFeeTiers}>Thử lại</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Hoa Hồng</h1>
        <p className="text-gray-600 mt-2">Quản lý các mức hoa hồng đặt cọc theo khoảng giá</p>
      </div>

      {/* Statistics Cards */}
      <FeeTierStatsCards feeTiers={feeTiers} />

      {/* Fee Tiers Table */}
      <FeeTierTable
        feeTiers={feeTiers}
        onAddTier={handleOpenAddDialog}
        onEditTier={handleOpenEditDialog}
        onDeleteTier={handleDeleteTier}
      />

      {/* Add/Edit Dialog */}
      <FeeTierDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingTier={editingTier}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      {/* Delete Confirmation Dialog */}
      <FeeTierActions
        deletingTierId={deletingTierId}
        onConfirmDelete={handleDelete}
        onCancelDelete={handleCancelDelete}
      />
    </div>
  );
}
