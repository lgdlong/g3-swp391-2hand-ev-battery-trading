'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPostById, uploadPostImages } from '@/lib/api/postApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function UploadImagesPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const postId = params.postId as string;

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch post data
  const {
    data: post,
    isLoading: isLoadingPost,
    error: postError,
    refetch: refetchPost,
  } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });

  // Allow access for PENDING_REVIEW, REJECTED, and DRAFT statuses
  useEffect(() => {
    if (post && !['PENDING_REVIEW', 'REJECTED', 'DRAFT'].includes(post.status)) {
      toast.error('Bài đăng không ở trạng thái có thể tải ảnh');
      router.push(`/my-posts`);
    }
  }, [post, router]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Validate file count (max 10 images)
    if (selectedFiles.length + files.length > 10) {
      toast.error('Bạn chỉ có thể tải lên tối đa 10 hình ảnh');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} không phải là tệp hình ảnh`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error(`${file.name} vượt quá kích thước 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Create preview URLs
    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    // Revoke object URL to free memory
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 hình ảnh');
      return;
    }

    setIsUploading(true);

    try {
      await uploadPostImages(postId, selectedFiles);
      toast.success('Tải ảnh lên thành công!');
      await refetchPost();
      setSelectedFiles([]);
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setPreviewUrls([]);
    } catch (error: unknown) {
      console.error('Failed to upload images:', error);
      type ApiError = { response?: { data?: { message?: string } }; message?: string };
      const err = error as ApiError;
      const errorMessage = err?.response?.data?.message || err?.message || 'Tải ảnh lên thất bại';
      toast.error(`Tải ảnh lên thất bại: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkip = () => {
    toast.info('Bạn có thể thêm ảnh sau trong phần quản lý bài đăng');
    router.push(`/my-posts`);
  };

  if (isLoadingPost) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải thông tin bài đăng...</p>
        </div>
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <X className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Không tìm thấy bài đăng</h2>
              <p className="text-muted-foreground mb-4">
                Bài đăng không tồn tại hoặc bạn không có quyền truy cập
              </p>
              <Button onClick={() => router.push('/my-posts')}>Về trang quản lý bài đăng</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Message - Only show if post is PENDING_REVIEW (newly created) */}
          {post?.status === 'PENDING_REVIEW' && (!post?.images || post.images.length === 0) && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">Thanh toán thành công!</h3>
                    <p className="text-sm text-green-700">
                      Bài đăng của bạn đang chờ phê duyệt. Hãy tải ảnh và giấy tờ xe để đội ngũ kiểm
                      duyệt xử lý nhanh hơn.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Post Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Thông tin bài đăng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tiêu đề:</span>
                  <span className="font-medium">{post.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loại:</span>
                  <span className="font-medium">
                    {post.postType === 'EV_CAR'
                      ? 'Xe điện'
                      : post.postType === 'EV_BIKE'
                        ? 'Xe máy điện'
                        : 'Pin'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giá:</span>
                  <span className="font-medium text-primary">
                    {new Intl.NumberFormat('vi-VN').format(parseFloat(post.priceVnd))} ₫
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Chờ phê duyệt
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Upload Section - Always show to allow adding more images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Tải ảnh lên (tùy chọn)
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Thêm hình ảnh để tăng độ tin cậy của bài đăng. Tối đa 10 ảnh, mỗi ảnh tối đa 5MB.
                {post?.images && post.images.length > 0 && (
                  <span className="block mt-1 text-green-600">
                    Đã tải {post.images.length} ảnh. Bạn có thể thêm ảnh nữa.
                  </span>
                )}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Input */}
              <div>
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-10 w-10 text-gray-400 mb-3" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Nhấn để chọn ảnh</span> hoặc kéo thả
                    </p>
                    <p className="text-xs text-gray-400">PNG, JPG, JPEG (Tối đa 5MB mỗi ảnh)</p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                  />
                </label>
              </div>

              {/* Preview Grid - Show selected images before upload */}
              {previewUrls.length > 0 && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Ảnh đã chọn ({selectedFiles.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group aspect-square">
                        <Image
                          src={url}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          disabled={isUploading}
                          aria-label="Xóa ảnh"
                          title="Xóa ảnh"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || selectedFiles.length === 0}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang tải lên...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Tải {selectedFiles.length > 0 ? `${selectedFiles.length} ảnh` : 'ảnh'} lên
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Bạn có thể thêm hoặc chỉnh sửa ảnh sau trong phần quản lý bài đăng
              </p>
            </CardContent>
          </Card>

          {/* Next Step: Upload Documents - Improved UX */}
          <Card className="mt-6 border-2 border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">
                  2
                </div>
                <CardTitle className="text-lg">Tải giấy tờ xe (Bắt buộc)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                Để bài đăng được duyệt, bạn cần tải lên <strong>ít nhất 1 ảnh giấy tờ xe</strong>{' '}
                (cà vẹt, đăng ký xe, hoặc giấy tờ liên quan).
              </p>
              <Button
                onClick={() => router.push(`/posts/create/upload-documents/${postId}`)}
                className="w-full sm:w-auto"
                size="lg"
              >
                Tiếp tục tải giấy tờ
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
