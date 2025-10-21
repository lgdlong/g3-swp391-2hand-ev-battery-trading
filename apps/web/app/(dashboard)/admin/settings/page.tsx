'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { getAllFeeTiers, type FeeTier } from '@/lib/api/feeTiersApi';
import { getSingleRefundPolicy, type RefundPolicy } from '@/lib/api/refundPolicy';
import { getSinglePostLifecycle, type PostLifecycle } from '@/lib/api/postLifecycleApi';
import {
  FeeTierStatsCards,
  FeeTierTable,
  RefundPolicyCard,
  PostLifecycleCard,
} from './_components';

export default function AdminSettingsPage() {
  const [feeTiers, setFeeTiers] = useState<FeeTier[]>([]);
  const [refundPolicy, setRefundPolicy] = useState<RefundPolicy | null>(null);
  const [postLifecycle, setPostLifecycle] = useState<PostLifecycle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [feeTiersData, refundData, lifecycleData] = await Promise.all([
        getAllFeeTiers(),
        getSingleRefundPolicy(),
        getSinglePostLifecycle(),
      ]);

      // Sort fee tiers by minPrice ascending
      const sortedFeeTiers = feeTiersData.sort(
        (a, b) => parseFloat(a.minPrice) - parseFloat(b.minPrice),
      );

      setFeeTiers(sortedFeeTiers);
      setRefundPolicy(refundData);
      setPostLifecycle(lifecycleData);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Không thể tải cài đặt');
    } finally {
      setLoading(false);
    }
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fee-tiers">Hoa Hồng</TabsTrigger>
          <TabsTrigger value="refund-policy">Chính Sách Hoàn Tiền</TabsTrigger>
          <TabsTrigger value="listing-lifecycle">Vòng Đời Bài Đăng</TabsTrigger>
        </TabsList>

        {/* Fee Tiers Tab */}
        <TabsContent value="fee-tiers" className="space-y-4">
          <FeeTierStatsCards feeTiers={feeTiers} />
          <FeeTierTable feeTiers={feeTiers} />
        </TabsContent>

        {/* Refund Policy Tab */}
        <TabsContent value="refund-policy" className="space-y-4">
          <RefundPolicyCard refundPolicy={refundPolicy} onUpdate={fetchAllData} />
        </TabsContent>

        {/* Listing Lifecycle Tab */}
        <TabsContent value="listing-lifecycle" className="space-y-4">
          <PostLifecycleCard postLifecycle={postLifecycle} onUpdate={fetchAllData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
