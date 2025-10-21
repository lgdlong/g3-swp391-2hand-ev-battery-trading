'use client';

import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { ImageDiffPayload, PostImage } from '@/types/post';

// Local imports
import { VALIDATION, MESSAGES, CSS_CLASSES } from '../constants/constants';
import { NewImage, DisplayImage } from '../types/types';
import {
  filterValidFiles,
  getActiveImageCount,
  createDisplayImages,
  buildImageDiff,
} from './helpers';
import { imageReducer } from './reducer';

interface ImageUploadProps {
  existingImages?: PostImage[];
  onImagesUpdate?: (diff: ImageDiffPayload) => void;
}

export default function ImageUpload({ existingImages = [], onImagesUpdate }: ImageUploadProps) {
  const [state, dispatch] = useReducer(imageReducer, {
    existing: existingImages,
    added: [],
    deletedIds: new Set<string>(),
    uploading: false,
    dragOver: false,
  });

  // Sync with existing images when they change
  useEffect(() => {
    dispatch({ type: 'SYNC_EXISTING', payload: existingImages });
  }, [existingImages]);

  // Notify parent with diff payload
  useEffect(() => {
    const diff = buildImageDiff(state.existing, state.added, state.deletedIds);
    onImagesUpdate?.(diff);
  }, [state.existing, state.added, state.deletedIds, onImagesUpdate]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      state.added.forEach((img) => {
        if (img.previewUrl) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, [state.added]);

  const displayImages = useMemo(
    () => createDisplayImages(state.existing, state.added, state.deletedIds),
    [state.existing, state.added, state.deletedIds],
  );

  // Event handlers
  const removeDisplayImage = useCallback((item: DisplayImage) => {
    if (item.kind === 'existing') {
      const key = item.id ?? item.publicId!;
      dispatch({ type: 'MARK_EXISTING_DELETED', payload: key });
      toast.success(MESSAGES.IMAGE_MARKED_DELETED);
    } else {
      dispatch({ type: 'MARK_NEW_DELETED', payload: item.tempId! });
      toast.success(MESSAGES.IMAGE_REMOVED);
    }
  }, []);

  const handleFileSelect = useCallback(
    async (files: FileList) => {
      if (!files || files.length === 0) return;

      const validFiles = filterValidFiles(files);
      if (validFiles.length === 0) return;

      const currentCount = getActiveImageCount(state.existing, state.added, state.deletedIds);
      if (currentCount + validFiles.length > VALIDATION.MAX_IMAGES) {
        toast.error(MESSAGES.MAX_IMAGES_EXCEEDED);
        return;
      }

      dispatch({ type: 'SET_UPLOADING', payload: true });
      try {
        const basePos = displayImages.length;
        const newImages: NewImage[] = validFiles.map((file, i) => ({
          tempId: `temp-${Date.now()}-${i}`,
          file,
          previewUrl: URL.createObjectURL(file),
          position: basePos + i,
        }));

        dispatch({ type: 'ADD_IMAGES', payload: newImages });
        toast.success(MESSAGES.IMAGES_ADDED(newImages.length));
      } catch (error) {
        console.error('File upload error:', error);
        toast.error(MESSAGES.UPLOAD_ERROR);
        dispatch({ type: 'SET_UPLOADING', payload: false });
      }
    },
    [state.existing, state.added, state.deletedIds, displayImages.length],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dispatch({ type: 'SET_DRAG_OVER', payload: false });
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_DRAG_OVER', payload: true });
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_DRAG_OVER', payload: false });
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFileSelect(e.target.files);
      }
    },
    [handleFileSelect],
  );

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
          className={`${CSS_CLASSES.uploadArea.base} ${
            state.dragOver ? CSS_CLASSES.uploadArea.dragOver : CSS_CLASSES.uploadArea.normal
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-2">Kéo thả hình ảnh vào đây hoặc</p>
          <div className="flex justify-center">
            <Label htmlFor="image-upload">
              <Button variant="outline" size="sm" disabled={state.uploading} asChild>
                <span className="cursor-pointer">
                  {state.uploading ? MESSAGES.UPLOADING : MESSAGES.SELECT_FILES}
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
            onChange={handleFileInputChange}
            disabled={state.uploading}
          />
          <p className="text-xs text-gray-500 mt-2">
            Tối đa {VALIDATION.MAX_IMAGES} hình, mỗi file &lt; 5MB
          </p>
        </div>

        {/* Image Preview Grid */}
        {displayImages.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">
              Hình ảnh đã tải ({displayImages.length}/{VALIDATION.MAX_IMAGES})
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
                  {index === 0 && <div className={CSS_CLASSES.badge.main}>Ảnh chính</div>}
                  {item.kind === 'new' && <div className={CSS_CLASSES.badge.new}>Mới</div>}
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
