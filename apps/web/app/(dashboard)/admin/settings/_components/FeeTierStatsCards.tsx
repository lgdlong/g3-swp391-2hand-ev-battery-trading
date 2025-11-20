'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp } from 'lucide-react';
import { FeeTier } from '@/lib/api/feeTiersApi';

interface FeeTierStatsCardsProps {
  feeTiers: FeeTier[];
}

export function FeeTierStatsCards({ feeTiers }: FeeTierStatsCardsProps) {
  // Calculate statistics
  const activeCount = feeTiers.filter((t) => t.active).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-800">Tổng Phí</CardTitle>
          <DollarSign className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-900">{feeTiers.length}</div>
          <p className="text-xs text-emerald-600">Tổng số mức phí đăng bài</p>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">Phí Hoạt Động</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{activeCount}</div>
          <p className="text-xs text-blue-600">Phí đang áp dụng</p>
        </CardContent>
      </Card>
    </div>
  );
}
