'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPostById,
  uploadVerificationDocuments,
  getVerificationDocuments,
  deleteVerificationDocument,
  publishPost,
  updateMyPost,
} from '@/lib/api/postApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PostVerificationDocumentType } from '@/types/post';
import { Badge } from '@/components/ui/badge';

const DOCUMENT_LABELS: Record<PostVerificationDocumentType, string> = {
  REGISTRATION_CERTIFICATE: 'Cà vẹt / Giấy đăng ký xe',
  INSURANCE: 'Bảo hiểm xe',
  OTHER: 'Giấy tờ khác',
};

export default function UploadDocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const postId = params.postId as string;

  // Document upload state
  interface NewDocument {
    tempId: string;
    file: File;
    previewUrl: string;
    type: PostVerificationDocumentType;
  }
  const [newDocuments, setNewDocuments] = useState<NewDocument[]>([]);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Fetch post data
  const {
    data: post,
    isLoading: isLoadingPost,
    error: postError,
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

  // Allow access for PENDING_REVIEW, REJECTED, and DRAFT statuses
  // Skip upload-documents step for BATTERY posts
  useEffect(() => {
    if (!post) return;
    if (post.postType === 'BATTERY') {
      // Redirect to next step or my-posts if battery post
      router.replace(`/my-posts`);
      toast.info('Không cần tải giấy tờ cho bài đăng pin.');
      return;
    }
    if (!['PENDING_REVIEW', 'REJECTED', 'DRAFT'].includes(post.status)) {
      toast.error('Bài đăng không ở trạng thái có thể tải giấy tờ');
      router.push(`/my-posts`);
    }
  }, [post, router]);

  const handleDocumentFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentCount = (documents?.length || 0) + newDocuments.length;
    if (currentCount + files.length > 10) {
      toast.error('Tối đa 10 giấy tờ cho mỗi bài đăng');
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

    const defaultType: PostVerificationDocumentType = 'REGISTRATION_CERTIFICATE';
    const newDocs: NewDocument[] = validFiles.map((file, index) => ({
      tempId: `temp-doc-${Date.now()}-${index}`,
      file,
      previewUrl: URL.createObjectURL(file),
      type: defaultType,
    }));

    setNewDocuments((prev) => [...prev, ...newDocs]);
    toast.success(`Đã thêm ${validFiles.length} giấy tờ`);

    // Reset input
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeNewDocument = (tempId: string) => {
    setNewDocuments((prev) => {
      const doc = prev.find((d) => d.tempId === tempId);
      if (doc?.previewUrl) {
        URL.revokeObjectURL(doc.previewUrl);
      }
      return prev.filter((d) => d.tempId !== tempId);
    });
    toast.success('Đã xóa giấy tờ khỏi danh sách');
  };

  const updateDocumentType = (tempId: string, type: PostVerificationDocumentType) => {
    setNewDocuments((prev) => prev.map((doc) => (doc.tempId === tempId ? { ...doc, type } : doc)));
  };

  const handleUploadDocuments = async () => {
    if (newDocuments.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 giấy tờ');
      return;
    }

    setIsUploadingDocs(true);
    try {
      const documentsToUpload = newDocuments.map((doc) => ({
        file: doc.file,
        type: doc.type,
      }));

      await uploadVerificationDocuments(postId, documentsToUpload);

      toast.success(`Đã tải lên ${newDocuments.length} giấy tờ thành công!`);

      // Cleanup preview URLs
      newDocuments.forEach((doc) => {
        if (doc.previewUrl) {
          URL.revokeObjectURL(doc.previewUrl);
        }
      });

      setNewDocuments([]);
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

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa giấy tờ này?')) {
      return;
    }

    setDeletingDocId(docId);
    try {
      await deleteVerificationDocument(docId);
      toast.success('Xóa giấy tờ thành công!');
      await refetchDocuments();
    } catch (error: unknown) {
      console.error('Failed to delete document:', error);
      type ApiError = { response?: { data?: { message?: string } }; message?: string };
      const err = error as ApiError;
      const errorMessage = err?.response?.data?.message || err?.message || 'Xóa giấy tờ thất bại';
      toast.error(`Xóa giấy tờ thất bại: ${errorMessage}`);
    } finally {
      setDeletingDocId(null);
    }
  };

  // Lưu nháp - chuyển status về DRAFT
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      // Update post status to DRAFT
      await updateMyPost(postId, { status: 'DRAFT' });

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['post', postId] });
      await queryClient.invalidateQueries({ queryKey: ['myPosts'] });

      toast.success('Đã lưu nháp');
      router.push('/my-posts');
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Không thể lưu nháp. Vui lòng thử lại.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Đăng bài - chuyển sang PENDING_REVIEW
  const handlePublish = async () => {
    // Validate: ít nhất 1 ảnh giấy tờ
    const allDocuments = [...(documents || []), ...newDocuments];

    if (allDocuments.length < 1) {
      toast.error('Vui lòng tải ít nhất 1 ảnh giấy tờ xe');
      return;
    }

    // Nếu có documents mới chưa upload, upload trước
    if (newDocuments.length > 0) {
      setIsPublishing(true);
      try {
        const documentsToUpload = newDocuments.map((doc) => ({
          file: doc.file,
          type: doc.type,
        }));

        await uploadVerificationDocuments(postId, documentsToUpload);

        // Cleanup preview URLs
        newDocuments.forEach((doc) => {
          if (doc.previewUrl) {
            URL.revokeObjectURL(doc.previewUrl);
          }
        });

        setNewDocuments([]);
        await refetchDocuments();
      } catch (error: unknown) {
        console.error('Upload documents failed:', error);
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        const errorMessage = err?.response?.data?.message || err?.message || 'Tải giấy tờ thất bại';
        toast.error(`Lỗi: ${errorMessage}`);
        setIsPublishing(false);
        return;
      }
    }

    setIsPublishing(true);
    try {
      await publishPost(postId);
      toast.success('Bài đăng đã được gửi để chờ duyệt!');

      // Invalidate queries để cập nhật UI
      await queryClient.invalidateQueries({ queryKey: ['post', postId] });

      router.push('/my-posts');
    } catch (error: unknown) {
      console.error('Publish failed:', error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err?.response?.data?.message || err?.message || 'Đăng bài thất bại';
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setIsPublishing(false);
    }
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

          {/* Document Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Giấy tờ xe (bắt buộc)
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Các giấy tờ như cà vẹt, đăng ký xe, bảo hiểm sẽ chỉ hiển thị với quản trị viên.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingDocuments ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải giấy tờ hiện có...
                </div>
              ) : null}

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  id="document-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleDocumentFileSelect}
                  className="hidden"
                  disabled={isUploadingDocs}
                />
                <label
                  htmlFor="document-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Shield className="h-8 w-8 text-gray-400" />
                  <span className="font-semibold text-gray-700">Chọn giấy tờ</span>
                  <span className="text-xs text-muted-foreground">
                    PNG, JPG, JPEG (tối đa 4MB mỗi ảnh, tối đa 10 giấy tờ)
                  </span>
                </label>
              </div>

              {/* All Documents Grid - Existing + New */}
              {(documents && documents.length > 0) || newDocuments.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">
                      Giấy tờ ({documents?.length || 0} đã tải + {newDocuments.length} mới)
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Existing Documents */}
                    {documents?.map((doc) => (
                      <div key={doc.id} className="space-y-2">
                        <div className="relative group aspect-[4/3] rounded-lg overflow-hidden border">
                          <Image
                            src={doc.url}
                            alt={DOCUMENT_LABELS[doc.type] || doc.type}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteDocument(doc.id)}
                            disabled={deletingDocId === doc.id || isUploadingDocs}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Xóa giấy tờ"
                            title="Xóa giấy tờ"
                          >
                            {deletingDocId === doc.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <Badge variant="outline" className="text-xs w-fit">
                          {DOCUMENT_LABELS[doc.type] || doc.type}
                        </Badge>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(doc.uploadedAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    ))}

                    {/* New Documents (Preview) */}
                    {newDocuments.map((doc) => (
                      <div key={doc.tempId} className="space-y-2">
                        <div className="relative group aspect-[4/3] rounded-lg overflow-hidden border-2 border-dashed border-blue-300">
                          <Image
                            src={doc.previewUrl}
                            alt="Document preview"
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewDocument(doc.tempId)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            aria-label="Xóa giấy tờ"
                            title="Xóa giấy tờ"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <Badge className="absolute top-2 left-2 bg-blue-500 text-white text-xs">
                            Mới
                          </Badge>
                        </div>
                        <Select
                          value={doc.type}
                          onValueChange={(value) =>
                            updateDocumentType(doc.tempId, value as PostVerificationDocumentType)
                          }
                        >
                          <SelectTrigger className="w-full text-xs h-8">
                            <SelectValue />
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
                    ))}
                  </div>
                </div>
              ) : (
                !isLoadingDocuments && (
                  <div className="border border-dashed border-gray-300 rounded-lg p-4 text-sm text-muted-foreground text-center">
                    Chưa có giấy tờ nào. Vui lòng tải ít nhất 1 ảnh giấy tờ xe để bài đăng được
                    duyệt.
                  </div>
                )
              )}

              {/* Upload Button */}
              {newDocuments.length > 0 && (
                <div className="flex gap-3">
                  <Button
                    onClick={handleUploadDocuments}
                    disabled={isUploadingDocs || newDocuments.length === 0}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {isUploadingDocs ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang tải lên...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Tải {newDocuments.length} giấy tờ lên
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {documents && documents.length >= 1
                ? 'Bạn có thể cập nhật giấy tờ bất cứ lúc nào trong trang quản lý tin đăng.'
                : 'Bạn cần tải ít nhất 1 ảnh giấy tờ xe để bài đăng được duyệt.'}
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleSaveDraft}
                variant="outline"
                disabled={isPublishing || isSavingDraft}
                className="flex-1 sm:flex-initial"
              >
                {isSavingDraft ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  'Lưu nháp'
                )}
              </Button>
              <Button
                onClick={handlePublish}
                disabled={
                  isPublishing ||
                  isSavingDraft ||
                  (documents?.length || 0) + newDocuments.length < 1
                }
                className="flex-1 sm:flex-initial"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang đăng...
                  </>
                ) : (
                  'Đăng bài'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
