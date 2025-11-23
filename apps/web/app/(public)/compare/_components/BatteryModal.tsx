'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useComparison } from '@/hooks/useComparison';
import { getBatteryPostsWithQuery } from '@/lib/api/postApi';
import Image from 'next/image';
import { toast } from 'sonner';
import type { Post } from '@/types/post';

interface BatteryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BatteryModal({ open, onOpenChange }: BatteryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { addItem, isSelected, isAtMaxLimit } = useComparison();

  const { data: batteries = [] } = useQuery({
    queryKey: ['batteryPosts'],
    queryFn: () =>
      getBatteryPostsWithQuery({
        limit: 50,
        offset: 0,
      }),
    enabled: open,
  });

  const products = batteries.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProduct = (product: Post) => {
    if (isAtMaxLimit) {
      toast.error('Giới hạn so sánh', {
        description: 'Bạn chỉ có thể so sánh tối đa 8 sản phẩm',
      });
      return;
    }
    addItem(product, 'BATTERY');
    toast.success(`Đã thêm "${product.title}" vào so sánh`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Thêm pin để so sánh</DialogTitle>
          {isAtMaxLimit && (
            <p className="text-sm text-amber-600 mt-2">
              Bạn đã đạt giới hạn tối đa 8 sản phẩm. Hãy xóa một sản phẩm trước khi thêm sản phẩm mới.
            </p>
          )}
        </DialogHeader>

        <div className="px-4 py-3 flex-shrink-0 border-b">
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3 px-4 py-3">
            {products.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Không tìm thấy sản phẩm</p>
              </div>
            ) : (
              products.map((product) => {
                const alreadySelected = isSelected(product.id);
                return (
                  <div
                    key={product.id}
                    className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow flex"
                  >
                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 relative overflow-hidden">
                      {product.images && product.images.length > 0 && product.images[0]?.url ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                          <span className="text-xs">No image</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 p-3 flex justify-between items-center">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm line-clamp-2 text-gray-900">
                          {product.title}
                        </h3>
                        <p className="text-emerald-600 font-bold mt-1">
                          {Number(product.priceVnd).toLocaleString('vi-VN')} đ
                        </p>
                      </div>

                      <Button
                        onClick={() => handleAddProduct(product)}
                        disabled={alreadySelected || isAtMaxLimit}
                        variant={alreadySelected ? 'outline' : 'default'}
                        size="sm"
                        className="ml-3 flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-200 disabled:text-gray-600"
                        title={isAtMaxLimit ? 'Giới hạn tối đa 8 sản phẩm' : ''}
                      >
                        {alreadySelected ? '✓ Đã thêm' : isAtMaxLimit ? 'Giới hạn' : 'Thêm'}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
