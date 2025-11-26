'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  getPostById,
  uploadPostImages,
  uploadVerificationDocuments,
  getVerificationDocuments,
} from '@/lib/api/postApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PostVerificationDocumentType } from '@/types/post';
import { Badge } from '@/components/ui/badge';

const DOCUMENT_LABELS: Record<PostVerificationDocumentType, string> = {
  REGISTRATION_CERTIFICATE: 'Cà vẹt / Giấy đăng ký xe',
  INSURANCE: 'Bảo hiểm xe',
  OTHER: 'Giấy tờ khác',
};

export default function UploadImagesPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.postId as string;

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [documentType, setDocumentType] = useState<PostVerificationDocumentType>('REGISTRATION_CERTIFICATE');
  const [selectedDocFiles, setSelectedDocFiles] = useState<File[]>([]);
  const [docPreviewUrls, setDocPreviewUrls] = useState<string[]>([]);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);

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

  const {
    data: documents,
    isLoading: isLoadingDocuments,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: ['post-verification-documents', postId],
    queryFn: () => getVerificationDocuments(postId),
    enabled: !!postId,
  });

  // Redirect if post status is not PENDING_REVIEW
  useEffect(() => {
    if (post && post.status !== 'PENDING_REVIEW') {
      toast.error('Bài đăng không ở trạng thái chờ tải ảnh');
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

  const handleDocumentFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (selectedDocFiles.length + files.length > 5) {
      toast.error('Chỉ được chọn tối đa 5 giấy tờ mỗi lần tải lên');
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} không phải là tệp hình ảnh`);
        return false;
      }
      if (file.size > 4 * 1024 * 1024) {
        toast.error(`${file.name} vượt quá kích thước 4MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));
    setSelectedDocFiles((prev) => [...prev, ...validFiles]);
    setDocPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeDocumentPreview = (index: number) => {
    if (docPreviewUrls[index]) {
      URL.revokeObjectURL(docPreviewUrls[index]);
    }

    setSelectedDocFiles((prev) => prev.filter((_, i) => i !== index));
    setDocPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadDocuments = async () => {
    if (selectedDocFiles.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 giấy tờ');
      return;
    }

    setIsUploadingDocs(true);
    try {
      await uploadVerificationDocuments(postId, selectedDocFiles, documentType);
      toast.success('Tải giấy tờ thành công!');
      docPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
      setSelectedDocFiles([]);
      setDocPreviewUrls([]);
      await refetchDocuments();
    } catch (error: unknown) {
      console.error('Failed to upload documents:', error);
      type ApiError = { response?: { data?: { message?: string } }; message?: string };
      const err = error as ApiError;
      const errorMessage = err?.response?.data?.message || err?.message || 'Tải giấy tờ thất bại';
      toast.error(`Tải giấy tờ thất bại: ${errorMessage}`);
    } finally {
      setIsUploadingDocs(false);
    }
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
          {/* Success Message */}
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

          {/* Image Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                {post?.images && post.images.length > 0 ? 'Ảnh hiện tại' : 'Tải ảnh lên (tùy chọn)'}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                {post?.images && post.images.length > 0
                  ? `Bài đăng của bạn đã có ${post.images.length} ảnh. Bạn có thể thêm ảnh khác hoặc tiếp tục.`
                  : 'Thêm hình ảnh để tăng độ tin cậy của bài đăng. Tối đa 10 ảnh, mỗi ảnh tối đa 5MB.'}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Show existing images if any */}
              {post?.images && post.images.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Ảnh hiện tại ({post.images.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {post.images.map((image: { url?: string; id?: string }, index: number) => (
                      <div key={image.id || index} className="relative aspect-square">
                        <Image
                          src={image.url || ''}
                          alt={`Image ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Để thay đổi ảnh, vui lòng liên hệ với quản trị viên.
                  </p>
                </div>
              )}

              {/* File Input - only show if post doesn't have images */}
              {!post?.images || post.images.length === 0 ? (
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
              ) : null}

              {/* Preview Grid */}
              {previewUrls.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Đã chọn {selectedFiles.length} ảnh</h4>
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
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {post?.images && post.images.length > 0 ? (
                  // Post already has images
                  <Button onClick={handleSkip} className="flex-1 bg-primary hover:bg-primary/90">
                    Hoàn tất
                  </Button>
                ) : (
                  // No images yet
                  <>
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
                          Tải {selectedFiles.length} ảnh lên
                        </>
                      )}
                    </Button>
                    {/* <Button
                      onClick={handleSkip}
                      variant="outline"
                      disabled={isUploading}
                      className="flex-1"
                    >
                      Bỏ qua, thêm sau
                    </Button> */}
                  </>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Bạn có thể thêm hoặc chỉnh sửa ảnh sau trong phần quản lý bài đăng
              </p>
            </CardContent>
          </Card>

          {/* Document Upload Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Giấy tờ xe (bắt buộc)
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Các giấy tờ như cà vẹt, đăng ký xe, bảo hiểm sẽ chỉ hiển thị với quản trị viên.
                Bạn có thể làm mờ thông tin nhạy cảm trước khi tải lên.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingDocuments ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải giấy tờ hiện có...
                </div>
              ) : documents && documents.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium">Giấy tờ đã tải ({documents.length})</h4>
                    {post?.status === 'PENDING_REVIEW' && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <Loader2 className="h-3 w-3 mr-1" />
                        Chờ kiểm duyệt
                      </Badge>
                    )}
                    {post?.status === 'PUBLISHED' && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Đã duyệt
                      </Badge>
                    )}
                    {post?.status === 'REJECTED' && (
                      <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                        <X className="h-3 w-3 mr-1" />
                        Bị từ chối
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="space-y-2">
                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden border">
                          <Image
                            src={doc.url}
                            alt={DOCUMENT_LABELS[doc.type] || doc.type}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Badge variant="outline" className="text-xs w-fit">
                          {DOCUMENT_LABELS[doc.type] || doc.type}
                        </Badge>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(doc.uploadedAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-gray-300 rounded-lg p-4 text-sm text-muted-foreground">
                  Chưa có giấy tờ nào. Vui lòng tải ít nhất 1 giấy tờ xe để bài đăng được duyệt.
                </div>
              )}

              <div className="grid gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Loại giấy tờ</p>
                  <Select
                    value={documentType}
                    onValueChange={(value) => setDocumentType(value as PostVerificationDocumentType)}
                  >
                    <SelectTrigger className="w-full sm:w-72">
                      <SelectValue placeholder="Chọn loại giấy tờ" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DOCUMENT_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    id="document-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleDocumentFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="document-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Shield className="h-8 w-8 text-gray-400" />
                    <span className="font-semibold text-gray-700">Chọn giấy tờ</span>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG, JPEG (tối đa 4MB mỗi ảnh)
                    </span>
                  </label>
                </div>

                {docPreviewUrls.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Đã chọn {selectedDocFiles.length} giấy tờ (
                      {DOCUMENT_LABELS[documentType]})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {docPreviewUrls.map((url, index) => (
                        <div key={url} className="relative group aspect-[4/3]">
                          <Image
                            src={url}
                            alt={`Document preview ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeDocumentPreview(index)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            disabled={isUploadingDocs}
                            aria-label="Xóa giấy tờ"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleUploadDocuments}
                    disabled={isUploadingDocs || selectedDocFiles.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isUploadingDocs ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang tải giấy tờ...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Tải {selectedDocFiles.length} giấy tờ
                      </>
                    )}
                  </Button>
                  {selectedDocFiles.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        docPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
                        setSelectedDocFiles([]);
                        setDocPreviewUrls([]);
                      }}
                      disabled={isUploadingDocs}
                    >
                      Xóa lựa chọn
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {documents && documents.length > 0
                ? 'Bạn có thể cập nhật giấy tờ bất cứ lúc nào trong trang quản lý tin đăng.'
                : 'Bạn cần tải ít nhất 1 giấy tờ xe để bài đăng được duyệt.'}
            </p>
            <Button
              onClick={() => router.push('/my-posts')}
              disabled={!documents || documents.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Hoàn tất
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
