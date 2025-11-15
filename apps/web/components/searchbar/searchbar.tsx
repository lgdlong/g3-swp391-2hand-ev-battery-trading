'use client';

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LocationSelector } from './LocationSelector';
import { searchPosts } from '@/lib/api/postApi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function SearchBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Vui lòng nhập từ khóa tìm kiếm');
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchPosts(searchQuery, {
        provinceNameCached: selectedLocation || undefined,
        limit: 20,
        order: 'DESC',
      });

      console.log('Search results:', results);

      // Store search results and navigate to results page
      // You can either:
      // 1. Navigate to a dedicated search results page with query params
      const params = new URLSearchParams();
      params.append('q', searchQuery);
      if (selectedLocation) params.append('location', selectedLocation);

      router.push(`/posts/ev?${params.toString()}`);

      // 2. Or show results in a modal/dropdown (implement later)
      toast.success(`Tìm thấy ${results.length} kết quả`);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedLocation('');
    // Navigate back to default list
    router.push('/posts/ev');
    toast.success('Đã xóa bộ lọc tìm kiếm');
  };

  return (
    <div className={`w-full relative overflow-visible z-10`}>
      {/* Clean Background */}
      <div className="absolute inset-0 bg-[#7EF2DD]/20"></div>

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center bg-white border border-emerald-600 rounded-2xl h-16 relative z-10 px-4 gap-3">
            {/* Search Input */}
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-600" />
              <Input
                type="text"
                placeholder="Tìm kiếm pin EV, thương hiệu, model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-transparent border-0 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-0 text-base h-full rounded-xl shadow-none"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Clear Search Button - show only when there's a search query or location */}
            {(searchQuery || selectedLocation) && (
              <Button
                onClick={handleClearSearch}
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 hover:bg-gray-100 rounded-full flex-shrink-0"
                title="Xóa tìm kiếm"
              >
                <X strokeWidth={4} size={36} className="text-zinc-950" />
              </Button>
            )}

            {/* Location Dropdown */}
            <LocationSelector
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
            />

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm hover:shadow-md transition-colors duration-200 px-8 py-3 rounded-full text-sm font-semibold h-10 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Đang tìm...' : 'Tìm kiếm'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export individual components for potential reuse
export { LocationSelector } from './LocationSelector';
export { BrandFilter } from './BrandFilter';
export { PriceFilter } from './PriceFilter';
