'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreHorizontal, AlertTriangle, FileText, Search, RefreshCw, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefundCase } from '@/types/refund';

interface CasesTableCardProps {
  cases: RefundCase[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onRefetch: () => void;
  onSelectCase: (caseItem: RefundCase) => void;
}

// Badge color mapping
const STATUS_BADGE_CONFIG = {
  PENDING: {
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  },
  REFUNDED: {
    variant: 'secondary' as const,
    className: 'bg-green-100 text-green-800 hover:bg-green-200',
  },
  REJECTED: {
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 hover:bg-red-200',
  },
  FAILED: {
    variant: 'outline' as const,
    className: '',
  },
} as const;

const SCENARIO_BADGE_CONFIG = {
  FRAUD_SUSPECTED: 'destructive' as const,
  CANCEL_EARLY: 'secondary' as const,
  CANCEL_LATE: 'secondary' as const,
  EXPIRED: 'secondary' as const,
} as const;

export function CasesTableCard({
  cases,
  isLoading,
  error,
  onRefetch,
  onSelectCase,
}: CasesTableCardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scenarioFilter, setScenarioFilter] = useState<string>('all');

  // Filter and search logic
  const filteredCases = useMemo(() => {
    if (!cases) {
      return [];
    }

    return cases.filter((caseItem) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        caseItem.id.includes(searchLower) ||
        caseItem.postId.includes(searchLower) ||
        caseItem.account?.email?.toLowerCase().includes(searchLower) ||
        caseItem.account?.fullName?.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = statusFilter === 'all' || caseItem.status === statusFilter;

      // Scenario filter
      const matchesScenario = scenarioFilter === 'all' || caseItem.scenario === scenarioFilter;

      return matchesSearch && matchesStatus && matchesScenario;
    });
  }, [cases, searchTerm, statusFilter, scenarioFilter]);

  if (error) {
    return (
      <Card>
        <CardContent className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <h3 className="mb-2 text-lg font-semibold">Lỗi tải hoàn tiền</h3>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Tải hoàn tiền thất bại'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách hoàn tiền</CardTitle>
        <CardDescription>
          Xem và quản lý tất cả hoàn tiền. Sử dụng bộ lọc để tìm hoàn tiền cụ thể.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm theo ID, email, ID post..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                <SelectItem value="REFUNDED">Đã hoàn</SelectItem>
                <SelectItem value="REJECTED">Từ chối</SelectItem>
                <SelectItem value="FAILED">Thất bại</SelectItem>
              </SelectContent>
            </Select>
            <Select value={scenarioFilter} onValueChange={setScenarioFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tình huống" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="CANCEL_EARLY">Hủy sớm</SelectItem>
                <SelectItem value="CANCEL_LATE">Hủy muộn</SelectItem>
                <SelectItem value="EXPIRED">Hết hạn</SelectItem>
                <SelectItem value="FRAUD_SUSPECTED">Nghi ngờ gian lận</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => onRefetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {filteredCases.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <FileText className="mb-4 h-16 w-16 text-muted-foreground opacity-20" />
            <h3 className="mb-2 text-lg font-semibold">Không tìm thấy hoàn tiền</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || scenarioFilter !== 'all'
                ? 'Không có hoàn tiền phù hợp với bộ lọc. Thử điều chỉnh tìm kiếm.'
                : 'Không có hoàn tiền nào.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left font-medium">ID hoàn tiền</th>
                  <th className="p-3 text-left font-medium">Người dùng</th>
                  <th className="p-3 text-left font-medium">Bài đăng</th>
                  <th className="p-3 text-right font-medium">Số tiền</th>
                  <th className="p-3 text-left font-medium">Tình huống</th>
                  <th className="p-3 text-center font-medium">%</th>
                  <th className="p-3 text-left font-medium">Trạng thái</th>
                  <th className="p-3 text-left font-medium">Lý do</th>
                  <th className="p-3 text-left font-medium">Ngày tạo</th>
                  <th className="p-3 text-center font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((caseItem) => (
                  <tr key={caseItem.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="font-mono text-xs">#{caseItem.id}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{caseItem.account?.email || 'N/A'}</span>
                        {caseItem.account?.fullName && (
                          <span className="text-xs text-muted-foreground">
                            {caseItem.account.fullName}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="max-w-[150px]">
                        <div className="font-mono text-xs text-muted-foreground">
                          #{caseItem.postId}
                        </div>
                        {caseItem.post?.title && (
                          <div className="truncate text-xs">{caseItem.post.title}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right font-medium">
                      {Number.parseFloat(caseItem.amountOriginal).toLocaleString('vi-VN')} VND
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          SCENARIO_BADGE_CONFIG[
                            caseItem.scenario as keyof typeof SCENARIO_BADGE_CONFIG
                          ] || 'secondary'
                        }
                      >
                        {caseItem.scenario.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">{caseItem.policyRatePercent}%</td>
                    <td className="p-3">
                      <Badge
                        variant={
                          STATUS_BADGE_CONFIG[caseItem.status as keyof typeof STATUS_BADGE_CONFIG]
                            ?.variant || 'outline'
                        }
                        className={
                          STATUS_BADGE_CONFIG[caseItem.status as keyof typeof STATUS_BADGE_CONFIG]
                            ?.className || ''
                        }
                      >
                        {caseItem.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="max-w-[200px] truncate text-xs text-muted-foreground">
                        {caseItem.reason || 'Auto refund'}
                      </div>
                    </td>
                    <td className="p-3 text-xs">
                      {new Date(caseItem.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-3 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => onSelectCase(caseItem)}
                            disabled={caseItem.status !== 'PENDING'}
                          >
                            Giải quyết hoàn tiền
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
