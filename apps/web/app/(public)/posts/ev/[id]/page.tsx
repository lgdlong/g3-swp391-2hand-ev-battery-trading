'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FilterButtons } from '@/components/breadcrumb-filter';
import { usePost, useAccount } from '../_queries';
import { Specifications } from './_components';
import { PostHeader, SellerInfo } from '@/app/(public)/posts/_components';
import { VerificationBadge } from '@/components/VerificationBadge';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ model?: string }>;
}

export default function EvDetailPage({ params, searchParams }: Props) {
  const [id, setId] = useState<string>('');
  const [model, setModel] = useState<string>('all');
  const [mainImage, setMainImage] = useState<string>('');

  useEffect(() => {
    params.then((p) => setId(p.id));
    searchParams.then((sp) => setModel(sp.model || 'all'));
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
              <div className="h-48 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  const isCarPost = post.postType === 'EV_CAR';
  const details = post.carDetails || post.bikeDetails;

  return (
    <>
      <FilterButtons
        type="ev"
        initialCategory="Xe điện"
        initialSubcategory={model || 'all'}
        showFilters={false}
      />
      <div className="container mx-auto py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card key={`post-image-${post.id}`} className="overflow-hidden border-none shadow-none">
              <CardContent className="p-0">
                <div className="relative h-80 w-full bg-gray-50">
                  <Image
                    src={mainImage}
                    alt={post.title}
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="object-contain p-8"
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <Badge
                      className={`${isCarPost ? 'bg-[#048C73]' : 'bg-[#2563EB]'} text-white border-0`}
                    >
                      {isCarPost ? 'Ô tô điện' : 'Xe máy điện'}
                    </Badge>
                    {post.verificationRequest?.status === 'APPROVED' && <VerificationBadge />}
                  </div>
                </div>
                {post.images?.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto p-4 bg-white border-t border-gray-100">
                    {post.images
                      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                      .map((img, idx) => (
                        <Button
                          key={img.id || `thumb-${idx}`}
                          onClick={() => setMainImage(img.url)}
                          className={`relative h-16 w-24 border rounded overflow-hidden flex-shrink-0 ${
                            mainImage === img.url
                              ? 'ring-2 ring-[#048C73]'
                              : 'hover:ring-1 hover:ring-gray-300'
                          }`}
                        >
                          <Image
                            src={img.url}
                            alt={`Thumbnail ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </Button>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card key={`seller-info-${post.id}`} className="border-none shadow-none">
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

          <div className="lg:col-span-2 space-y-6">
            <PostHeader post={post} details={details} />

            {post.description && (
              <Card key={`post-description-${post.id}`} className="border-none shadow-none">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Mô tả chi tiết</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {post.description}
                  </p>
                </CardContent>
              </Card>
            )}

            <Specifications post={post} />
          </div>
        </div>
      </div>
    </>
  );
}
