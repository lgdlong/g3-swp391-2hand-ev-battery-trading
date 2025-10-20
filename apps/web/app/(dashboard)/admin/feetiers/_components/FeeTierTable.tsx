'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { FeeTier } from '@/lib/api/feeTiersApi';

interface FeeTierTableProps {
  feeTiers: FeeTier[];
  onAddTier: () => void;
  onEditTier: (tier: FeeTier) => void;
  onDeleteTier: (tierId: number) => void;
}

export function FeeTierTable({ feeTiers, onAddTier, onEditTier, onDeleteTier }: FeeTierTableProps) {
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Hoa Hồng</CardTitle>
          <CardDescription>Quản lý tỷ lệ đặt cọc dựa trên khoảng giá</CardDescription>
        </div>
        <Button onClick={onAddTier} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm Hoa Hồng
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Giá Tối Thiểu</th>
                <th className="text-left p-3 font-medium">Giá Tối Đa</th>
                <th className="text-left p-3 font-medium">Tỷ Lệ Đặt Cọc</th>
                <th className="text-left p-3 font-medium">Trạng Thái</th>
                <th className="text-right p-3 font-medium">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {feeTiers.map((tier) => (
                <tr key={tier.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{formatCurrency(tier.minPrice)}</td>
                  <td className="p-3">
                    {tier.maxPrice ? (
                      formatCurrency(tier.maxPrice)
                    ) : (
                      <Badge variant="outline">Không Giới Hạn</Badge>
                    )}
                  </td>
                  <td className="p-3">
                    <Badge className="bg-blue-100 text-blue-800">
                      {(parseFloat(tier.depositRate) * 100).toFixed(1)}%
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge
                      className={
                        tier.active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {tier.active ? 'Hoạt Động' : 'Không Hoạt Động'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditTier(tier)}
                        className="hover:bg-blue-50"
                      >
                        <Edit2 className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteTier(tier.id)}
                        className="hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {feeTiers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Chưa có hoa hồng nào. Nhấn "Thêm Hoa Hồng" để tạo mới.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
