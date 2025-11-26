'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useComparison } from '@/hooks/useComparison';
import { getCarPostsWithQuery, getBikePostsWithQuery } from '@/lib/api/postApi';
import Image from 'next/image';
import { toast } from 'sonner';
import type { Post } from '@/types/post';

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterType?: 'all' | 'CAR' | 'BIKE' | 'BATTERY';
}

export function AddProductModal({ open, onOpenChange, filterType = 'all' }: AddProductModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'cars' | 'bikes'>(
    filterType === 'BIKE' ? 'bikes' : 'cars'
  );
  const { addItem, isSelected } = useComparison();

  // Fetch cars (without search - do client-side filtering)
  const { data: cars = [] } = useQuery({
    queryKey: ['carPosts'],
    queryFn: () =>
      getCarPostsWithQuery({
        limit: 50,
        offset: 0,
      }),
    enabled: open && selectedType === 'cars',
  });

  // Fetch bikes (without search - do client-side filtering)
  const { data: bikes = [] } = useQuery({
    queryKey: ['bikePosts'],
    queryFn: () =>
      getBikePostsWithQuery({
        limit: 50,
        offset: 0,
      }),
    enabled: open && selectedType === 'bikes',
  });

  // Client-side filter
  const allProducts = selectedType === 'cars' ? cars : bikes;
  const products = allProducts.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProduct = (product: Post) => {
    const type = product.postType === 'EV_CAR' ? 'CAR' : product.postType === 'EV_BIKE' ? 'BIKE' : 'BATTERY';
    addItem(product, type);
    toast.success(`Đã thêm "${product.title}" vào so sánh`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Thêm sản phẩm để so sánh</DialogTitle>
        </DialogHeader>

        {/* Type Tabs */}
        <div className="flex gap-2 border-b flex-shrink-0">
          <button
            onClick={() => {
              setSelectedType('cars');
              setSearchQuery('');
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              selectedType === 'cars'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Xe Điện
          </button>
          <button
            onClick={() => {
              setSelectedType('bikes');
              setSearchQuery('');
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              selectedType === 'bikes'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Xe Máy
          </button>
        </div>

        {/* Search Input */}
        <div className="px-4 py-3 flex-shrink-0 border-b">
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Product List */}
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
                    {/* Product Image */}
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

                    {/* Product Info */}
                    <div className="flex-1 p-3 flex justify-between items-center">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm line-clamp-2 text-gray-900">
                          {product.title}
                        </h3>
                        <p className="text-emerald-600 font-bold mt-1">
                          {Number(product.priceVnd).toLocaleString('vi-VN')} đ
                        </p>
                      </div>

                      {/* Add Button */}
                      <Button
                        onClick={() => handleAddProduct(product)}
                        disabled={alreadySelected}
                        variant={alreadySelected ? 'outline' : 'default'}
                        size="sm"
                        className="ml-3 flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-200 disabled:text-gray-600"
                      >
                        {alreadySelected ? '✓ Đã thêm' : 'Thêm'}
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
