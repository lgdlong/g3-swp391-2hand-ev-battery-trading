'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FilterButtons } from '@/components/breadcrumb-filter';
import { usePost, useAccount } from '../../ev/_queries';
import { SellerInfo, PostHeader } from '@/app/(public)/posts/_components';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ brand?: string }>;
}

export default function BatteryDetailPage({ params, searchParams }: Props) {
  const [id, setId] = useState<string>('');
  const [brand, setBrand] = useState<string>('all');
  const [mainImage, setMainImage] = useState<string>('');

  useEffect(() => {
    params.then((p) => setId(p.id));
    searchParams.then((sp) => setBrand(sp.brand || 'all'));
  }, [params, searchParams]);

  const { data: post, isLoading: postLoading, error: postError } = usePost(id);
  const { data: seller, isLoading: sellerLoading } = useAccount(post?.seller.id || 0);

  useEffect(() => {
    if (post?.images?.[0]?.url) {
      setMainImage(post.images[0].url);
    } else {
      setMainImage('/asset/phu-tung-o-to-27.png');
    }
  }, [post]);

  if (postLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="h-80 bg-gray-200 rounded" />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="h-32 bg-gray-200 rounded" />
              <div className="h-64 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pin không tìm thấy</h1>
          <p className="text-gray-600 mb-6">
            Bài đăng pin bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Link
            href="/posts/batteries"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING_REVIEW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      <FilterButtons
        type="battery"
        initialCategory="Pin EV"
        initialSubcategory={brand !== 'all' ? brand : post.title}
        showFilters={false}
      />
      <div className="container mx-auto px-4 py-6">
        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Section */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden shadow-lg">
              <CardContent className="p-0">
                <div className="relative h-80 w-full bg-gray-50">
                  <Image
                    src={mainImage}
                    alt={post.title}
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="object-contain p-8"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gray-900 text-white border-0">PIN EV</Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className={`border ${getStatusColor(post.status)}`}>
                      {post.status === 'PUBLISHED'
                        ? 'Đã đăng'
                        : post.status === 'PENDING_REVIEW'
                          ? 'Chờ duyệt'
                          : 'Đã từ chối'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info Section */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <SellerInfo account={seller} post={post} loading={sellerLoading} />
              </CardContent>
            </Card>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <PostHeader post={post} details={undefined} />

            {/* Basic Specifications */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Thông tin chi tiết</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">Loại bài đăng</div>
                      <div className="font-medium">Pin EV</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">Trạng thái</div>
                      <div className="font-medium">
                        {post.status === 'PUBLISHED'
                          ? 'Đã đăng'
                          : post.status === 'PENDING_REVIEW'
                            ? 'Chờ duyệt'
                            : 'Đã từ chối'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">Giá có thể thương lượng</div>
                      <div className="font-medium">{post.isNegotiable ? 'Có' : 'Không'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">Ngày đăng</div>
                      <div className="font-medium">
                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {post.description && (
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Mô tả chi tiết</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {post.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
