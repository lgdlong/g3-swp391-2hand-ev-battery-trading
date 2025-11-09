'use client';

import { useState } from 'react';
import { Package, Star, Search, Filter } from 'lucide-react';
import { PurchaseCard } from './_components/PurchaseCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// Mock data - Replace with actual API call
const mockPurchases = [
  {
    id: '1',
    postId: 'post-123',
    postTitle: 'Pin xe máy điện VinFast Klara - 95% dung lượng',
    postPrice: '15000000',
    postImages: [
      {
        url: 'https://placehold.co/400x300/png?text=EV+Battery',
        public_id: 'sample-1',
      },
    ],
    sellerName: 'Nguyễn Văn A',
    purchasedAt: '2024-11-01T10:30:00Z',
    hasRated: false,
  },
  {
    id: '2',
    postId: 'post-456',
    postTitle: 'VinFast VF5 Plus - 2023 - Pin 98%',
    postPrice: '450000000',
    postImages: [
      {
        url: 'https://placehold.co/400x300/png?text=EV+Battery',
        public_id: 'sample-2',
      },
    ],
    sellerName: 'Trần Thị B',
    purchasedAt: '2024-10-15T14:20:00Z',
    hasRated: true,
    userRating: 5,
    userComment: 'Xe rất tốt, pin còn khỏe, giao dịch nhanh chóng!',
  },
];

export default function MyPurchasesPage() {
  const [purchases, setPurchases] = useState(mockPurchases);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'rated' | 'not-rated'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter purchases based on search and status
  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch = purchase.postTitle
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'rated' && purchase.hasRated) ||
      (filterStatus === 'not-rated' && !purchase.hasRated);
    return matchesSearch && matchesFilter;
  });

  // Handle rating submission - Connect to your API
  const handleRatingSubmit = async (
    purchaseId: string,
    rating: number,
    comment: string
  ) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      // await submitRating(purchaseId, rating, comment);
      
      console.log('Submit rating:', { purchaseId, rating, comment });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update local state
      setPurchases((prev) =>
        prev.map((p) =>
          p.id === purchaseId
            ? { ...p, hasRated: true, userRating: rating, userComment: comment }
            : p
        )
      );

      toast.success('Đánh giá của bạn đã được gửi thành công!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Package className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Bài đăng đã mua</h1>
        </div>
        <p className="text-muted-foreground">
          Quản lý các giao dịch và đánh giá sản phẩm đã mua
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm bài đăng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter by rating status */}
        <Select
          value={filterStatus}
          onValueChange={(value: 'all' | 'rated' | 'not-rated') => setFilterStatus(value)}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="not-rated">Chưa đánh giá</SelectItem>
            <SelectItem value="rated">Đã đánh giá</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-primary">{purchases.length}</div>
          <div className="text-sm text-muted-foreground">Tổng số giao dịch</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {purchases.filter((p) => p.hasRated).length}
          </div>
          <div className="text-sm text-muted-foreground">Đã đánh giá</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-orange-600">
            {purchases.filter((p) => !p.hasRated).length}
          </div>
          <div className="text-sm text-muted-foreground">Chưa đánh giá</div>
        </div>
      </div>

      {/* Purchase List */}
      {filteredPurchases.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {searchQuery || filterStatus !== 'all'
              ? 'Không tìm thấy kết quả'
              : 'Chưa có giao dịch nào'}
          </h3>
          <p className="text-muted-foreground">
            {searchQuery || filterStatus !== 'all'
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Các bài đăng bạn mua sẽ hiển thị ở đây'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPurchases.map((purchase) => (
            <PurchaseCard
              key={purchase.id}
              purchase={purchase}
              onRatingSubmit={handleRatingSubmit}
              isSubmitting={isSubmitting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
