'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FilterButtons } from '@/components/breadcrumb-filter';
import { usePost, useAccount } from '../_queries';
import { formatVnd, originText, getLocation, statusChip } from '@/lib/utils/format';
import { SellerInfo, Specifications } from './_components';
import { BookMarkButton } from '../_components/BookMarkButton';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ model?: string }>;
}

export default function EvDetailPage({ params, searchParams }: Props) {
  const [id, setId] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [liked, setLiked] = useState(false);

  // Extract ID and model from params
  useEffect(() => {
    params.then((p) => setId(p.id));
    searchParams.then((sp) => setModel(sp.model || 'all'));
  }, [params, searchParams]);

  // Fetch post and seller data using our new hooks
  const { data: post, isLoading: postLoading, error: postError } = usePost(id);
  const { data: seller, isLoading: sellerLoading } = useAccount(post?.seller.id || 0);

  // Loading state
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
              <div className="h-48 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (postError || !post) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <h2 className="text-2xl font-bold mb-2">Lỗi tải dữ liệu</h2>
            <p className="text-gray-600">Không thể tải thông tin bài đăng. ID: {id}</p>
            <p className="text-sm text-gray-500 mt-2">Error: {postError?.message}</p>
          </div>
          <Link
            href="/posts/ev"
            className="inline-flex items-center text-[#048C73] hover:text-[#037A66] hover:underline"
          >
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  // Determine post type and details
  const isCarPost = post.postType === 'EV_CAR';
  const details = post.carDetails || post.bikeDetails;
  const imageUrl = post.images[0]?.url || '/asset/phu-tung-o-to-27.png';

  return (
    <>
      <FilterButtons type="ev" initialCategory="Xe điện" initialSubcategory={model || 'all'} />
      <div className="container mx-auto py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Section */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden border-none shadow-none">
              <CardContent className="p-0">
                <div className="relative h-80 w-full bg-gray-50">
                  <Image
                    src={imageUrl}
                    alt={post.title}
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="object-contain p-8"
                  />
                  {/* Post type badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white border-0">
                      {isCarPost ? 'Ô tô điện' : 'Xe máy điện'}
                    </Badge>
                  </div>
                  {/* Status badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className={`border ${statusChip.getColor(post.status)}`}>
                      {statusChip.getText(post.status)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info Box */}
            <Card className="border-none shadow-none">
              <CardContent className="p-6">
                {sellerLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                ) : (
                  <SellerInfo account={seller} post={post} loading={sellerLoading} />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card className="border-none shadow-none">
              <CardContent className="py-2 px-6">
                <div className="flex flex-col items-start justify-between mb-4 gap-4">
                  {/* Title + Bookmark */}
                  <div className="flex items-center justify-between w-full">
                    <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
                    <BookMarkButton liked={liked} onClick={() => setLiked((v) => !v)} />
                  </div>

                  {/* Price */}
                  <div className="text-2xl font-bold text-red-600 mb-2">
                    {post.isNegotiable ? <p>Liên hệ người bán</p> : formatVnd(post.priceVnd)}
                  </div>
                </div>

                {/* The origin */}
                <div className="mb-6">
                  {details?.origin && <Badge>{originText(details.origin)}</Badge>}
                </div>

                {/* Address */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{getLocation(post)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Specifications post={post} />

            {/* Description */}
            {post.description && (
              <Card className="border-none shadow-none">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Mô tả chi tiết</h2>
                  <p className="text-gray-700 leading-relaxed">{post.description}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
