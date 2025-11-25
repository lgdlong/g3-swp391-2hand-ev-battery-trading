'use client';

import { PostDetailModalHeader } from './PostDetailModalHeader';
import { PostDebugPanel } from './PostDebugPanel';
import { PostImagesGallery } from './PostImagesGallery';
import { PostBasicInfo } from './PostBasicInfo';
import { PostSellerInfo } from './PostSellerInfo';
import { PostTimeInfo } from './PostTimeInfo';
import { PostVehicleDetails } from './PostVehicleDetails';
import { PostDetailActions } from './PostDetailActions';
import { Post } from '@/types/post';
import { useQuery } from '@tanstack/react-query';
import { getPostDocuments } from '@/lib/api/postApi';
import type { PostDocument } from '@/types/post';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

export interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  onApprove: (postId: number | string) => void;
  onReject: (postId: number | string, reason: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
}

export function PostDetailModal({
  isOpen,
  onClose,
  post,
  onApprove,
  onReject,
  isApproving = false,
  isRejecting = false,
}: PostDetailModalProps) {
  if (!post) return null;

  const {
    data: documents,
    isLoading: isLoadingDocuments,
  } = useQuery({
    queryKey: ['admin-post-documents', post.id],
    queryFn: () => getPostDocuments(String(post.id)),
    enabled: isOpen,
  });

  const documentCount = documents?.length ?? 0;
  const canApprove = post.status === 'PENDING_REVIEW' && documentCount > 0;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <PostDetailModalHeader onClose={onClose} />

            {/* Debug Panel - Remove this in production */}
            <PostDebugPanel post={post} />

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Hero Section - Main Info */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Hình ảnh */}
                  <PostImagesGallery post={post} />

                  {/* Thông tin cơ bản */}
                  <PostBasicInfo post={post} />
                </div>
              </div>

              {/* Info Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Thông tin người bán */}
                <PostSellerInfo seller={post.seller} />

                {/* Thông tin thời gian */}
                <PostTimeInfo
                  createdAt={post.createdAt}
                  reviewedAt={post.reviewedAt}
                  updatedAt={post.updatedAt}
                />
              </div>

              {/* Chi tiết xe (nếu có) */}
              <PostVehicleDetails carDetails={post.carDetails} bikeDetails={post.bikeDetails} />

              {/* Documents Section */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Giấy tờ xe do người bán cung cấp
                </h3>
                {isLoadingDocuments ? (
                  <p className="text-sm text-muted-foreground">Đang tải giấy tờ...</p>
                ) : documents && documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {documents.map((doc: PostDocument) => (
                      <div
                        key={doc.id}
                        className="border rounded-lg p-3 bg-gray-50 hover:bg-white transition-colors"
                      >
                        <div className="relative aspect-[4/3] rounded-md overflow-hidden mb-3">
                          <Image
                            src={doc.url}
                            alt={doc.documentType}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Badge variant="outline" className="text-xs mb-1">
                          {doc.documentType}
                        </Badge>
                        <p className="text-[11px] text-muted-foreground">
                          Tải lúc {new Date(doc.uploadedAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-red-600 border border-red-100 rounded-lg p-3 bg-red-50">
                    Người bán chưa tải giấy tờ. Vui lòng yêu cầu bổ sung trước khi duyệt bài đăng.
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <PostDetailActions
                postId={post.id}
                postStatus={post.status}
                onApprove={onApprove}
                onReject={onReject}
                onClose={onClose}
                isApproving={isApproving}
                isRejecting={isRejecting}
                canApprove={canApprove}
                approveDisabledReason={
                  post.status === 'PENDING_REVIEW' && !canApprove
                    ? 'Cần ít nhất 1 giấy tờ xe để duyệt bài đăng'
                    : undefined
                }
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
