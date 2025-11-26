'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  getAllFeeTiers,
  createFeeTier,
  updateFeeTier,
  deleteFeeTier,
  type FeeTier,
} from '@/lib/api/feeTiersApi';
import { getSinglePostLifecycle, type PostLifecycle } from '@/lib/api/postLifecycleApi';
import {
  FeeTierStatsCards,
  FeeTierTable,
  FeeTierDialog,
  FeeTierActions,
  PostLifecycleCard,
} from './_components';
import type { FeeTierFormData } from './_components/FeeTierDialog';

export default function AdminSettingsPage() {
  const [feeTiers, setFeeTiers] = useState<FeeTier[]>([]);
  // refund policy removed from admin settings UI
  const [postLifecycle, setPostLifecycle] = useState<PostLifecycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<FeeTier | null>(null);
  const [deletingTierId, setDeletingTierId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    // Fetch fee tiers and post lifecycle configuration separately so a failing call
    // in one does not block the others and we can provide specific error messages.
    let feeTiersData: FeeTier[] = [];
    let lifecycleData: PostLifecycle | null = null;

    try {
      feeTiersData = await getAllFeeTiers();
    } catch (err) {
      console.error('Error fetching fee tiers:', err);
      toast.error('Không thể tải thông tin hoa hồng');
    }

    try {
      lifecycleData = await getSinglePostLifecycle();
    } catch (err) {
      console.error('Error fetching post lifecycle:', err);
      toast.error('Không thể tải vòng đời bài đăng');
    }

    // Sort fee tiers by minPrice ascending
    const sortedFeeTiers = feeTiersData.sort(
      (a, b) => parseFloat(a.minPrice) - parseFloat(b.minPrice),
    );

    setFeeTiers(sortedFeeTiers);
    setPostLifecycle(lifecycleData);
    setLoading(false);
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
      toast.error('Tỷ lệ phí hoa hồng phải từ 0 đến 100%');
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
        toast.success('Cập nhật hoa hồng thành công');
      } else {
        await createFeeTier(payload);
        toast.success('Tạo hoa hồng thành công');
      }

      await fetchAllData();
      handleCloseDialog();
    } catch (err: unknown) {
      console.error('Error saving fee tier:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể lưu hoa hồng';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTierId) return;

    try {
      await deleteFeeTier(deletingTierId);
      toast.success('Xóa hoa hồng thành công');
      await fetchAllData();
      setDeletingTierId(null);
    } catch (err: unknown) {
      console.error('Error deleting fee tier:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa hoa hồng';
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
          <h1 className="text-3xl font-bold text-gray-900">Cài Đặt Hệ Thống</h1>
          <p className="text-gray-600 mt-2">Quản lý cài đặt hệ thống và chính sách</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Đang tải cài đặt...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cài Đặt Hệ Thống</h1>
        <p className="text-gray-600 mt-2">
          Quản lý hoa hồng, chính sách hoàn tiền và vòng đời bài đăng
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="fee-tiers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger className="data-[state=active]:bg-white" value="fee-tiers">
            Hoa Hồng
          </TabsTrigger>
          {/* Refund policy tab removed */}
          <TabsTrigger className="data-[state=active]:bg-white" value="listing-lifecycle">
            Vòng Đời Bài Đăng
          </TabsTrigger>
        </TabsList>

        {/* Fee Tiers Tab */}
        <TabsContent value="fee-tiers" className="space-y-4">
          <FeeTierStatsCards feeTiers={feeTiers} />
          <FeeTierTable
            feeTiers={feeTiers}
            onAddTier={handleOpenAddDialog}
            onEditTier={handleOpenEditDialog}
            onDeleteTier={handleDeleteTier}
          />
        </TabsContent>

        {/* Refund Policy has been removed */}

        {/* Listing Lifecycle Tab */}
        <TabsContent value="listing-lifecycle" className="space-y-4">
          <PostLifecycleCard postLifecycle={postLifecycle} onUpdate={fetchAllData} />
        </TabsContent>
      </Tabs>

      {/* Fee Tier Add/Edit Dialog */}
      <FeeTierDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingTier={editingTier}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      {/* Fee Tier Delete Confirmation */}
      <FeeTierActions
        deletingTierId={deletingTierId}
        onConfirmDelete={handleDelete}
        onCancelDelete={handleCancelDelete}
      />
    </div>
  );
}
