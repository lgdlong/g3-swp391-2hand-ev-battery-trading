'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { ImageDiffPayload, PostImage } from '@/types/post';

// Constants
const MAX_IMAGES = 10;

// Internal type for new images (only used in this component)
interface NewImage {
  tempId: string;
  file: File;
  previewUrl: string;
  position: number;
  deleted?: boolean;
}

interface ImageUploadProps {
  existingImages?: PostImage[];
  onImagesUpdate?: (diff: ImageDiffPayload) => void;
}

export default function ImageUpload({ existingImages = [], onImagesUpdate }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // State tách bạch: existing (ảnh đã có) + added (ảnh mới) + deletedIds (đánh dấu xoá)
  const [existing, setExisting] = useState<PostImage[]>(existingImages);
  const [added, setAdded] = useState<NewImage[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // Sync with existing images when they change (when post data loads)
  useEffect(() => {
    setExisting(existingImages);
    setAdded([]); // reset thêm mới khi dữ liệu post đổi
    setDeletedIds(new Set()); // reset xoá
  }, [existingImages]);

  const displayImages = useMemo(() => {
    const keptExisting = existing.filter(
      (img) => !deletedIds.has(img.id) && !deletedIds.has(img.publicId),
    );
    const keptAdded = added.filter((a) => !a.deleted);
    // Hợp nhất và đảm bảo thứ tự theo 'position'
    return [
      ...keptExisting.map((img) => ({
        kind: 'existing' as const,
        id: img.id,
        publicId: img.publicId,
        url: img.url,
        position: img.position,
      })),
      ...keptAdded.map((a) => ({
        kind: 'new' as const,
        tempId: a.tempId,
        url: a.previewUrl,
        position: a.position,
      })),
    ].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }, [existing, added, deletedIds]);

  const removeDisplayImage = (item: {
    kind: 'existing' | 'new';
    id?: string;
    publicId?: string;
    tempId?: string;
  }) => {
    if (item.kind === 'existing') {
      // đánh dấu xoá bằng id hoặc publicId
      const key = item.id ?? item.publicId!;
      setDeletedIds((prev) => new Set(prev).add(key));
      toast.success('Đã đánh dấu xoá ảnh');
    } else {
      // new -> không đưa lên server nữa
      setAdded((prev) => prev.map((a) => (a.tempId === item.tempId ? { ...a, deleted: true } : a)));
      toast.success('Đã bỏ ảnh mới');
    }
  };

  const handleFileSelect = async (files: FileList) => {
    if (!files || files.length === 0) return;

    // Validate file types and sizes
    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} không phải là file hình ảnh`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} quá lớn (tối đa 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Check giới hạn tổng: existing (trừ deleted) + added (trừ deleted)
    const currentCount =
      existing.filter((img) => !deletedIds.has(img.id) && !deletedIds.has(img.publicId)).length +
      added.filter((a) => !a.deleted).length;

    // Check total image limit
    if (currentCount + validFiles.length > MAX_IMAGES) {
      toast.error(`Chỉ được tải lên tối đa ${MAX_IMAGES} hình ảnh`);
      return;
    }

    setUploading(true);
    try {
      const basePos = displayImages.length; // nối tiếp vị trí hiện có
      const newOnes: NewImage[] = validFiles.map((file, i) => ({
        tempId: `temp-${Date.now()}-${i}`,
        file,
        previewUrl: URL.createObjectURL(file),
        position: basePos + i,
      }));
      setAdded((prev) => [...prev, ...newOnes]);
      toast.success(`Đã thêm ${newOnes.length} hình`);
    } catch (e) {
      console.error(e);
      toast.error('Có lỗi khi thêm hình');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  // Build diff payload for submit
  const buildSubmitPayload = (): ImageDiffPayload => {
    const toDelete = Array.from(deletedIds);

    const toKeep = existing
      .filter((img) => !deletedIds.has(img.id) && !deletedIds.has(img.publicId))
      .map((img) => ({
        id: img.id,
        publicId: img.publicId,
        position: img.position ?? 0,
      }));

    const toUpload = added
      .filter((a) => !a.deleted)
      .map((a) => ({
        file: a.file,
        position: a.position ?? 0,
      }));

    // Ảnh chính: theo quy ước là ảnh có position = 0
    const mainFromKeep = toKeep.find((x) => x.position === 0);
    const hasMain = !!mainFromKeep || toUpload.some((x) => x.position === 0);

    return { toDelete, toKeep, toUpload, hasMain };
  };

  // Notify parent whenever display images change
  useEffect(() => {
    const payload = buildSubmitPayload();
    onImagesUpdate?.(payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing, added, deletedIds]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      added.forEach((img) => {
        if (img.previewUrl) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, [added]);

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ImageIcon className="h-5 w-5" />
          <span>Hình ảnh tin đăng</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-2">Kéo thả hình ảnh vào đây hoặc</p>
          <div className="flex justify-center">
            <Label htmlFor="image-upload">
              <Button variant="outline" size="sm" disabled={uploading} asChild>
                <span className="cursor-pointer">
                  {uploading ? 'Đang tải lên...' : 'Chọn file'}
                </span>
              </Button>
            </Label>
          </div>
          <Input
            id="image-upload"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            disabled={uploading}
          />
          <p className="text-xs text-gray-500 mt-2">Tối đa {MAX_IMAGES} hình, mỗi file &lt; 5MB</p>
        </div>

        {/* Image Preview Grid */}
        {displayImages.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">
              Hình ảnh đã tải ({displayImages.length}/{MAX_IMAGES})
            </h4>

            <div className="grid grid-cols-3 gap-2">
              {displayImages.map((item, index) => (
                <div
                  key={item.kind === 'existing' ? item.id : item.tempId}
                  className="relative group"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={item.url}
                      alt={`Hình ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 33vw, 16vw"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeDisplayImage(item)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  {index === 0 && (
                    <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-1 rounded">
                      Ảnh chính
                    </div>
                  )}
                  {/* Badge to show image type (for debugging/clarity) */}
                  {item.kind === 'new' && (
                    <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                      Mới
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>Hình ảnh đầu tiên sẽ là ảnh chính</p>
          <p>Hỗ trợ: JPG, PNG, WebP</p>
        </div>
      </CardContent>
    </Card>
  );
}
