'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

type Props = {
  defaultLiked?: boolean;
  onChange?: (liked: boolean) => void;
};

export default function HeartToggle({ defaultLiked = false, onChange }: Props) {
  const [liked, setLiked] = useState(defaultLiked);

  const toggle = () => {
    const v = !liked;
    setLiked(v);
    onChange?.(v);
  };

  return (
    <Button
      type="button"
      aria-pressed={liked}
      aria-label={liked ? 'Bỏ đánh dấu' : 'Đánh dấu yêu thích'}
      onClick={toggle}
      variant="ghost"
      size="icon"
      className="rounded-full p-2 transition-transform active:scale-95"
    >
      {liked ? (
        // Trạng thái fill: dùng fill-current & tắt stroke
        <Heart className="h-6 w-6 fill-rose-600 stroke-none" />
      ) : (
        // Trạng thái outline mặc định
        <Heart className="h-6 w-6" />
      )}
    </Button>
  );
}
