'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { FeeTier } from '@/lib/api/feeTiersApi';

interface FeeTierTableProps {
  feeTiers: FeeTier[];
}

type SortField = 'minPrice' | 'maxPrice' | 'depositRate' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

export function FeeTierTable({ feeTiers }: FeeTierTableProps) {
  const [sortField, setSortField] = useState<SortField>('minPrice');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const sortedFeeTiers = [...feeTiers].sort((a, b) => {
    let aValue: number;
    let bValue: number;

    switch (sortField) {
      case 'minPrice':
        aValue = parseFloat(a.minPrice);
        bValue = parseFloat(b.minPrice);
        break;
      case 'maxPrice':
        aValue = a.maxPrice ? parseFloat(a.maxPrice) : Number.MAX_SAFE_INTEGER;
        bValue = b.maxPrice ? parseFloat(b.maxPrice) : Number.MAX_SAFE_INTEGER;
        break;
      case 'depositRate':
        aValue = parseFloat(a.depositRate);
        bValue = parseFloat(b.depositRate);
        break;
      case 'updatedAt':
        aValue = new Date(a.updatedAt).getTime();
        bValue = new Date(b.updatedAt).getTime();
        break;
      default:
        return 0;
    }

    if (sortDirection === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hoa Hồng</CardTitle>
        <CardDescription>Quản lý tỷ lệ đặt cọc dựa trên khoảng giá</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">
                  <button
                    onClick={() => handleSort('minPrice')}
                    className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                  >
                    Giá Tối Thiểu
                    {getSortIcon('minPrice')}
                  </button>
                </th>
                <th className="text-left p-3 font-medium">
                  <button
                    onClick={() => handleSort('maxPrice')}
                    className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                  >
                    Giá Tối Đa
                    {getSortIcon('maxPrice')}
                  </button>
                </th>
                <th className="text-left p-3 font-medium">
                  <button
                    onClick={() => handleSort('depositRate')}
                    className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                  >
                    Tỷ Lệ Đặt Cọc
                    {getSortIcon('depositRate')}
                  </button>
                </th>
                <th className="text-left p-3 font-medium">Trạng Thái</th>
                <th className="text-left p-3 font-medium">
                  <button
                    onClick={() => handleSort('updatedAt')}
                    className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                  >
                    Cập Nhật Lần Cuối
                    {getSortIcon('updatedAt')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedFeeTiers.map((tier) => (
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
                  <td className="p-3 text-sm text-gray-600">{formatDate(tier.updatedAt)}</td>
                </tr>
              ))}
              {feeTiers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Chưa có hoa hồng nào.
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
