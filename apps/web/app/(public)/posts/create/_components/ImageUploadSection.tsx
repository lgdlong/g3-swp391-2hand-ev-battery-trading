'use client';
import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface ImageUploadSectionProps {
  selectedFiles: File[];
  previewUrls: string[];
  isUploadingImages: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onUploadImages: () => void;
  onSkipUpload: () => void;
}

export default function ImageUploadSection({
  selectedFiles,
  previewUrls,
  isUploadingImages,
  onFileSelect,
  onRemoveImage,
  onUploadImages,
  onSkipUpload,
}: ImageUploadSectionProps) {
  return (
    <div className="mt-8">
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bước 2: Thêm hình ảnh</h2>
            <p className="text-gray-600">
              Bài đăng đã được tạo thành công! Bây giờ hãy thêm hình ảnh để thu hút người mua.
            </p>
          </div>

          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
            <input
              type="file"
              id="image-upload"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={onFileSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Kéo thả hình ảnh vào đây hoặc
              </p>
              <label htmlFor="image-upload" className="cursor-pointer">
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#048C73] text-[#048C73] hover:bg-[#048C73] hover:text-white"
                  asChild
                >
                  <span>Chọn hình ảnh</span>
                </Button>
              </label>
              <p className="text-sm text-gray-500 mt-2">
                Hỗ trợ: JPG, PNG, WebP (tối đa 10MB mỗi ảnh, tối đa 10 ảnh)
              </p>
            </div>
          </div>

          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Xem trước hình ảnh:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={url}
                      alt={`Preview ${index + 1}`}
                      width={200}
                      height={128}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => onRemoveImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={onSkipUpload}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Bỏ qua (Hoàn thành sau)
            </Button>
            <Button
              onClick={onUploadImages}
              disabled={selectedFiles.length === 0 || isUploadingImages}
              className="bg-[#048C73] hover:bg-[#037A66] text-white"
            >
              {isUploadingImages ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Đang upload...
                </>
              ) : (
                `Upload ${selectedFiles.length} ảnh`
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
