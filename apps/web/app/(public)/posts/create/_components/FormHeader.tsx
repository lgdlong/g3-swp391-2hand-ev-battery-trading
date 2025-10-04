'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Car, Battery } from 'lucide-react';

type PostType = 'ev' | 'battery';

interface FormHeaderProps {
  postType: PostType | null;
  onChangePostType: () => void;
}

export default function FormHeader({ postType, onChangePostType }: FormHeaderProps) {
  if (!postType) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
            Đăng tin bán {postType === 'ev' ? 'Xe điện' : 'Pin EV'}
          </h1>
          <p className="text-muted-foreground">
            Tạo tin đăng để bán {postType === 'ev' ? 'xe điện' : 'pin EV'} của bạn
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onChangePostType}
          className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-[#048C73]/5 hover:border-[#048C73] hover:text-[#048C73]"
        >
          {postType === 'ev' ? <Car className="h-4 w-4" /> : <Battery className="h-4 w-4" />}
          Đổi loại tin đăng
        </Button>
      </div>
    </div>
  );
}

