'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { PostLifecycle, updateSinglePostLifecycle } from '@/lib/api/postLifecycleApi';
import { toast } from 'sonner';

interface PostLifecycleCardProps {
  postLifecycle: PostLifecycle | null;
  onUpdate: () => void;
}

interface PostLifecycleFormData {
  expirationDays: number;
  autoApprove: boolean;
}

export function PostLifecycleCard({ postLifecycle, onUpdate }: PostLifecycleCardProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PostLifecycleFormData>({
    expirationDays: postLifecycle?.expirationDays || 0,
    autoApprove: postLifecycle?.autoApprove || false,
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSinglePostLifecycle(formData);
      toast.success('Cập nhật vòng đời bài đăng thành công');
      setEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating post lifecycle:', error);
      toast.error('Không thể cập nhật vòng đời bài đăng');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (postLifecycle) {
      setFormData({
        expirationDays: postLifecycle.expirationDays,
        autoApprove: postLifecycle.autoApprove,
      });
    }
    setEditing(false);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <div>
          <CardTitle className="text-xl">Vòng Đời Bài Đăng</CardTitle>
          <CardDescription className="mt-1">
            Cấu hình thời gian hết hạn và tự động duyệt bài
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
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  Số Ngày Hết Hạn
                </Label>
                <Input
                  type="number"
                  value={formData.expirationDays}
                  onChange={(e) =>
                    setFormData({ ...formData, expirationDays: parseInt(e.target.value) })
                  }
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  {formData.autoApprove ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-600" />
                  )}
                  Tự Động Duyệt
                </Label>
                <select
                  value={formData.autoApprove ? 'true' : 'false'}
                  onChange={(e) =>
                    setFormData({ ...formData, autoApprove: e.target.value === 'true' })
                  }
                  className="w-full h-11 p-2 border rounded-md bg-white"
                >
                  <option value="true">Bật</option>
                  <option value="false">Tắt</option>
                </select>
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
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <Label className="text-sm text-gray-600 font-medium">Số Ngày Hết Hạn</Label>
              </div>
              <p className="text-3xl font-bold text-purple-900">
                {postLifecycle?.expirationDays || 0} <span className="text-lg">ngày</span>
              </p>
            </div>

            <div
              className={`p-4 rounded-lg border ${
                postLifecycle?.autoApprove
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {postLifecycle?.autoApprove ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-600" />
                )}
                <Label className="text-sm text-gray-600 font-medium">Tự Động Duyệt</Label>
              </div>
              <Badge
                className={`text-sm px-3 py-1 ${
                  postLifecycle?.autoApprove
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {postLifecycle?.autoApprove ? 'Đang Bật' : 'Đang Tắt'}
              </Badge>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 lg:col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <Label className="text-sm text-gray-600 font-medium">Cập Nhật Lần Cuối</Label>
              </div>
              <p className="text-xl font-semibold text-blue-900">
                {new Date(postLifecycle?.updatedAt || '').toLocaleDateString('vi-VN', {
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
