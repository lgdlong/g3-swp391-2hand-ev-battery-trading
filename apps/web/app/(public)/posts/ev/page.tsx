'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { sampleEvPosts, formatVnd } from './sample-ev';

type SortKey = 'newest' | 'price-asc' | 'price-desc';

function EvPostsContent() {
  const [sort, setSort] = useState<SortKey>('newest');
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [brand, setBrand] = useState('');
  const [min, setMin] = useState<number | null>(null);
  const [max, setMax] = useState<number | null>(null);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setLocation(searchParams.get('loc') || '');
    setBrand(searchParams.get('brand') || '');
    const minParam = searchParams.get('min');
    const maxParam = searchParams.get('max');
    setMin(minParam ? Number(minParam) : null);
    setMax(maxParam ? Number(maxParam) : null);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let data = [...sampleEvPosts];
    const q = query.trim().toLowerCase();
    if (q)
      data = data.filter(
        (p) => p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q),
      );
    if (location)
      data = data.filter((p) => p.location.toLowerCase().includes(location.toLowerCase()));
    if (brand) data = data.filter((p) => p.title.toLowerCase().includes(brand.toLowerCase()));
    if (min !== null) data = data.filter((p) => p.priceVnd >= min);
    if (max !== null) data = data.filter((p) => p.priceVnd <= max);
    switch (sort) {
      case 'price-asc':
        data.sort((a, b) => a.priceVnd - b.priceVnd);
        break;
      case 'price-desc':
        data.sort((a, b) => b.priceVnd - a.priceVnd);
        break;
      default:
        data.sort((a, b) => b.manufactureYear - a.manufactureYear);
    }
    return data;
  }, [query, location, brand, min, max, sort]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'reserved':
        return 'bg-gray-200 text-gray-700 border-gray-300';
      case 'sold':
        return 'bg-gray-300 text-gray-600 border-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const Badge = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className || ''}`}
    >
      {children}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">Xe điện (EV)</h1>
            <p className="text-muted-foreground">Khám phá các mẫu xe điện chất lượng</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Sắp xếp:</span>
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá thấp → cao</option>
              <option value="price-desc">Giá cao → thấp</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Tìm thấy {filtered.length} kết quả</span>
          <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
          <span>Cập nhật liên tục</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy kết quả</h3>
          <p className="text-gray-500">Thử thay đổi bộ lọc tìm kiếm của bạn</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((item) => (
            <Link key={item.id} href={`/posts/ev/${item.id}`} className="group">
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1 bg-white">
                <CardContent className="p-0">
                  <div className="relative h-48 w-full bg-gradient-to-br from-slate-50 to-slate-100">
                    <Image
                      src={item.thumbnail || '/file-text.svg'}
                      alt={item.title}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute left-4 top-4">
                      <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white border-0 shadow-lg">
                        EV
                      </Badge>
                    </div>
                    <div className="absolute right-4 top-4">
                      <Badge className={`border shadow-sm ${getStatusColor(item.status)}`}>
                        {item.status === 'available'
                          ? 'Còn hàng'
                          : item.status === 'reserved'
                            ? 'Giữ chỗ'
                            : 'Đã bán'}
                      </Badge>
                    </div>
                    {item.condition === 'new' && (
                      <div className="absolute right-4 bottom-4">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">Mới</Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-green-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.brandName} • {item.manufactureYear} • {item.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        {item.batteryCapacityKWh} kWh
                      </div>
                      <div className="flex items-center gap-1">
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {item.odoKm.toLocaleString()} km
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-green-600">
                        {formatVnd(item.priceVnd)}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg
                          className="h-5 w-5 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EvPostsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <EvPostsContent />
    </Suspense>
  );
}
