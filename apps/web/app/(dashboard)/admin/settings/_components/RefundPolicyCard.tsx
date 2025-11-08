'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Save, X, Percent, Calendar, AlertCircle, Clock } from 'lucide-react';
import { RefundPolicy, updateSingleRefundPolicy } from '@/lib/api/refundPolicy';
import { toast } from 'sonner';

interface RefundPolicyCardProps {
  refundPolicy: RefundPolicy | null;
  onUpdate: () => void;
}

interface RefundPolicyFormData {
  cancelEarlyRate: number;
  cancelLateRate: number;
  expiredRate: number;
  fraudSuspectedRate: number;
  cancelEarlyDaysThreshold: number;
  cancelLateDaysThreshold: number;
  holdDays: number;
  autoRefundAfterDays: number;
}

export function RefundPolicyCard({ refundPolicy, onUpdate }: RefundPolicyCardProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<RefundPolicyFormData>({
    cancelEarlyRate: refundPolicy ? parseFloat(refundPolicy.cancelEarlyRate) * 100 : 0,
    cancelLateRate: refundPolicy ? parseFloat(refundPolicy.cancelLateRate) * 100 : 0,
    expiredRate: refundPolicy ? parseFloat(refundPolicy.expiredRate) * 100 : 0,
    fraudSuspectedRate: refundPolicy ? parseFloat(refundPolicy.fraudSuspectedRate) * 100 : 0,
    cancelEarlyDaysThreshold: refundPolicy?.cancelEarlyDaysThreshold || 7,
    cancelLateDaysThreshold: refundPolicy?.cancelLateDaysThreshold || 7,
    holdDays: refundPolicy?.holdDays || 0,
    autoRefundAfterDays: refundPolicy?.autoRefundAfterDays || 0,
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      // Convert percentage values back to decimal for API
      const apiData = {
        cancelEarlyRate: formData.cancelEarlyRate / 100,
        cancelLateRate: formData.cancelLateRate / 100,
        expiredRate: formData.expiredRate / 100,
        fraudSuspectedRate: formData.fraudSuspectedRate / 100,
        cancelEarlyDaysThreshold: formData.cancelEarlyDaysThreshold,
        cancelLateDaysThreshold: formData.cancelLateDaysThreshold,
        holdDays: formData.holdDays,
        autoRefundAfterDays: formData.autoRefundAfterDays,
      };
      await updateSingleRefundPolicy(apiData);
      toast.success('Cập nhật chính sách hoàn tiền thành công');
      setEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating refund policy:', error);
      toast.error('Không thể cập nhật chính sách hoàn tiền');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (refundPolicy) {
      setFormData({
        cancelEarlyRate: parseFloat(refundPolicy.cancelEarlyRate) * 100,
        cancelLateRate: parseFloat(refundPolicy.cancelLateRate) * 100,
        expiredRate: parseFloat(refundPolicy.expiredRate) * 100,
        fraudSuspectedRate: parseFloat(refundPolicy.fraudSuspectedRate) * 100,
        cancelEarlyDaysThreshold: refundPolicy.cancelEarlyDaysThreshold,
        cancelLateDaysThreshold: refundPolicy.cancelLateDaysThreshold,
        holdDays: refundPolicy.holdDays,
        autoRefundAfterDays: refundPolicy.autoRefundAfterDays,
      });
    }
    setEditing(false);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <div>
          <CardTitle className="text-xl">Chính Sách Hoàn Tiền</CardTitle>
          <CardDescription className="mt-1">
            Cấu hình tỷ lệ và chính sách hoàn tiền cho các tình huống
          </CardDescription>
        </div>
        {!editing && (
          <Button onClick={() => setEditing(true)} size="sm" className="gap-2">
            <Edit className="h-4 w-4" />
            Chỉnh Sửa
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        {editing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Refund Rates Section */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Percent className="h-4 w-4 text-blue-600" />
                  Tỷ Lệ Hoàn Khi Hủy Sớm (%)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.cancelEarlyRate}
                  onChange={(e) =>
                    setFormData({ ...formData, cancelEarlyRate: parseFloat(e.target.value) })
                  }
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Percent className="h-4 w-4 text-amber-600" />
                  Tỷ Lệ Hoàn Khi Hủy Trễ (%)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.cancelLateRate}
                  onChange={(e) =>
                    setFormData({ ...formData, cancelLateRate: parseFloat(e.target.value) })
                  }
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  Tỷ Lệ Hoàn Khi Tin Hết Hạn (%)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.expiredRate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiredRate: parseFloat(e.target.value) })
                  }
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Tỷ Lệ Hoàn Khi Gian Lận (%)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.fraudSuspectedRate}
                  onChange={(e) =>
                    setFormData({ ...formData, fraudSuspectedRate: parseFloat(e.target.value) })
                  }
                  className="h-11"
                />
              </div>

              {/* Days Threshold Section */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Ngưỡng Hủy Sớm (ngày)
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.cancelEarlyDaysThreshold}
                  onChange={(e) =>
                    setFormData({ ...formData, cancelEarlyDaysThreshold: parseInt(e.target.value) })
                  }
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-amber-600" />
                  Ngưỡng Hủy Trễ (ngày)
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.cancelLateDaysThreshold}
                  onChange={(e) =>
                    setFormData({ ...formData, cancelLateDaysThreshold: parseInt(e.target.value) })
                  }
                  className="h-11"
                />
              </div>

              {/* Other Fields */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-purple-600" />
                  Số Ngày Giữ Tiền (Gian Lận)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.holdDays}
                  onChange={(e) => setFormData({ ...formData, holdDays: parseInt(e.target.value) })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-green-600" />
                  Tự Động Hoàn Sau (ngày)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.autoRefundAfterDays}
                  onChange={(e) =>
                    setFormData({ ...formData, autoRefundAfterDays: parseInt(e.target.value) })
                  }
                  className="h-11"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </Button>
              <Button variant="outline" onClick={handleCancel} className="gap-2">
                <X className="h-4 w-4" />
                Hủy
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Refund Rates */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="h-5 w-5 text-blue-600" />
                <Label className="text-sm text-gray-600 font-medium">Tỷ Lệ Hủy Sớm</Label>
              </div>
              <p className="text-3xl font-bold text-blue-900">
                {(parseFloat(refundPolicy?.cancelEarlyRate || '0') * 100).toFixed(1)}%
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="h-5 w-5 text-amber-600" />
                <Label className="text-sm text-gray-600 font-medium">Tỷ Lệ Hủy Trễ</Label>
              </div>
              <p className="text-3xl font-bold text-amber-900">
                {(parseFloat(refundPolicy?.cancelLateRate || '0') * 100).toFixed(1)}%
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                <Label className="text-sm text-gray-600 font-medium">Tỷ Lệ Hết Hạn</Label>
              </div>
              <p className="text-3xl font-bold text-orange-900">
                {(parseFloat(refundPolicy?.expiredRate || '0') * 100).toFixed(1)}%
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <Label className="text-sm text-gray-600 font-medium">Tỷ Lệ Gian Lận</Label>
              </div>
              <p className="text-3xl font-bold text-red-900">
                {(parseFloat(refundPolicy?.fraudSuspectedRate || '0') * 100).toFixed(1)}%
              </p>
            </div>

            {/* Days Thresholds */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <Label className="text-sm text-gray-600 font-medium">Ngưỡng Hủy Sớm</Label>
              </div>
              <p className="text-3xl font-bold text-blue-900">
                {refundPolicy?.cancelEarlyDaysThreshold || 7} <span className="text-lg">ngày</span>
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-amber-600" />
                <Label className="text-sm text-gray-600 font-medium">Ngưỡng Hủy Trễ</Label>
              </div>
              <p className="text-3xl font-bold text-amber-900">
                {refundPolicy?.cancelLateDaysThreshold || 7} <span className="text-lg">ngày</span>
              </p>
            </div>

            {/* Other Settings */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <Label className="text-sm text-gray-600 font-medium">Giữ Tiền (Gian Lận)</Label>
              </div>
              <p className="text-3xl font-bold text-purple-900">
                {refundPolicy?.holdDays || 0} <span className="text-lg">ngày</span>
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <Label className="text-sm text-gray-600 font-medium">Tự Động Hoàn Tiền</Label>
              </div>
              <p className="text-3xl font-bold text-green-900">
                {refundPolicy?.autoRefundAfterDays || 0} <span className="text-lg">ngày</span>
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <Label className="text-sm text-gray-600 font-medium">Cập Nhật Lần Cuối</Label>
              </div>
              <p className="text-xl font-semibold text-blue-900">
                {new Date(refundPolicy?.updatedAt || '').toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
