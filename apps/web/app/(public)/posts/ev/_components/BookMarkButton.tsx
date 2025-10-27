import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import React from 'react';

interface BookMarkButtonProps {
  liked: boolean;
  onClick: () => void;
}

export function BookMarkButton({ liked, onClick }: BookMarkButtonProps) {
  return (
    <Button
      type="button"
      aria-pressed={liked}
      onClick={onClick}
      variant="outline"
      className="flex items-center gap-2 rounded-full border shadow-none py-5 w-24 text-base font-semibold bg-white text-gray-800 hover:bg-gray-50"
    >
      {/* Dùng props size để chắc chắn icon to lên; fill khi đã lưu */}
      <Heart
        strokeWidth={2}
        className={`size-[26px] ${liked ? 'fill-rose-600 stroke-none' : ''}`}
      />
      Lưu
    </Button>
  );
}
