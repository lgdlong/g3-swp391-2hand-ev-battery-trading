'use client';

import { PostDetailModalProps } from './types';
import { PostDetailModalHeader } from './PostDetailModalHeader';
import { PostDebugPanel } from './PostDebugPanel';
import { PostImagesGallery } from './PostImagesGallery';
import { PostBasicInfo } from './PostBasicInfo';
import { PostSellerInfo } from './PostSellerInfo';
import { PostTimeInfo } from './PostTimeInfo';
import { PostVehicleDetails } from './PostVehicleDetails';
import { PostDetailActions } from './PostDetailActions';

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

  // Debug log để kiểm tra dữ liệu
  console.log('PostDetailModal - Post data:', {
    id: post.id,
    title: post.title,
    description: post.description,
    images: post.images,
    imagesLength: post.images?.length,
    provinceNameCached: post.provinceNameCached,
    districtNameCached: post.districtNameCached,
    wardNameCached: post.wardNameCached,
    seller: post.seller,
    carDetails: post.carDetails,
    bikeDetails: post.bikeDetails,
  });

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

              {/* Action Footer */}
              <PostDetailActions
                postId={post.id}
                postStatus={post.status}
                onApprove={onApprove}
                onReject={onReject}
                onClose={onClose}
                isApproving={isApproving}
                isRejecting={isRejecting}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
