'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { getAllBookmarks, deleteBookmark } from '@/lib/api/bookmarkApi';
import type { Bookmark } from '@/types/bookmark';

import { getPostById } from '@/lib/api/postApi';

// Helpers
function pickTitle(p: any): string {
  return p?.title || `Post`;
}

function pickImageUrl(p: any): string | null {
  const imgs = p?.images;
  if (Array.isArray(imgs) && imgs.length > 0) {
    const first = imgs[0];
    if (first?.url) return first.url;
  }
  return null;
}

function pickPrice(p: any): number | null {
  const price = p?.priceVnd;
  if (price == null) return null;
  const numPrice = Number(price);
  return isNaN(numPrice) ? null : numPrice;
}

function formatTimeAgo(dateString: string): string {
  console.log('Formatting date:', dateString);
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return '1 ngày trước';
    if (diffDays < 30) return `${diffDays} ngày trước`;

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return '1 tháng trước';
    if (diffMonths < 12) return `${diffMonths} tháng trước`;

    return `${Math.floor(diffMonths / 12)} năm trước`;
  } catch {
    return 'Gần đây';
  }
}

function pickLocation(p: any): string {
  const district = p?.districtNameCached;
  const ward = p?.wardNameCached;
  const province = p?.provinceNameCached;

  // Ưu tiên hiển thị quận/huyện
  if (district && district !== 'N/A') return district;
  if (ward && ward !== 'N/A') return ward;
  if (province && province !== 'N/A') return province;

  return 'Không rõ';
}

type Row = Bookmark & {
  postTitle?: string;
  postImageUrl?: string | null;
  priceVnd?: number | null;
  isNegotiable?: boolean;
  location?: string;
  timeAgo?: string;
};

export function BookmarksManager() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [needLogin, setNeedLogin] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const list = await getAllBookmarks();
        const base: Row[] = list.map((b) => ({ ...b }));
        setRows(base);

        await Promise.all(
          base.map(async (b) => {
            try {
              const post = await getPostById(String(b.postId));
              setRows(
                (prev) =>
                  prev?.map((r) =>
                    r.id === b.id
                      ? {
                          ...r,
                          postTitle: pickTitle(post),
                          postImageUrl: pickImageUrl(post),
                          priceVnd: pickPrice(post),
                          isNegotiable: post?.isNegotiable ?? false,
                          location: pickLocation(post),
                          timeAgo: formatTimeAgo(post.createdAt),
                        }
                      : r,
                  ) ?? prev,
              );
            } catch {
              // nếu fail giữ nguyên, hiển thị fallback
            }
          }),
        );
      } catch {
        setNeedLogin(true);
        setRows([]);
      }
    })();
  }, []);

  async function handleUnsave(b: Row) {
    if (!rows) return;
    setBusyId(b.id);
    try {
      await deleteBookmark(b.id);
      setRows(rows.filter((x) => x.id !== b.id));
    } finally {
      setBusyId(null);
    }
  }

  if (needLogin) {
    return (
      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <p>Bạn cần đăng nhập để xem bookmark.</p>
        <Button asChild>
          <Link href="/login">Đăng nhập</Link>
        </Button>
      </div>
    );
  }

  if (rows === null) return <div>Đang tải…</div>;
  if (rows.length === 0) return <div>Bạn chưa lưu bài nào.</div>;

  return (
    <div className="flex flex-col divide-y divide-gray-200">
      {rows.map((b) => (
        <div key={b.id} className="relative flex gap-4 p-3 hover:bg-gray-50 transition-colors">
          {/* Ảnh bên trái */}
          <Link
            href={`/posts/ev/${b.postId}`}
            className="relative flex-shrink-0 w-32 h-24 overflow-hidden bg-gray-100"
          >
            <Image
              src={b.postImageUrl || '/asset/phu-tung-o-to-27.png'}
              alt={b.postTitle || `Post #${b.postId}`}
              fill
              sizes="128px"
              className="object-cover"
              unoptimized
            />
          </Link>

          {/* Nội dung bên phải */}
          <div className="flex-1 flex items-center justify-between">
            <div>
              <Link href={`/posts/ev/${b.postId}`}>
                <h3 className="text-[15px] font-semibold line-clamp-2 hover:text-emerald-700 transition-colors">
                  {b.postTitle || `Post #${b.postId}`}
                </h3>
              </Link>

              {/* Price display */}
              {b.priceVnd !== null && b.priceVnd !== undefined ? (
                <p className="text-red-600 font-bold mt-1">
                  {b.isNegotiable
                    ? 'Liên hệ'
                    : new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        minimumFractionDigits: 0,
                      }).format(b.priceVnd)}
                </p>
              ) : null}

              <p className="text-xs text-gray-500 mt-1">
                {b.timeAgo || 'Gần đây'} • {b.location || 'Không rõ'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
              >
                Chat
              </Button>

              <button
                onClick={() => handleUnsave(b)}
                disabled={busyId === b.id}
                className="p-2 rounded-full hover:bg-gray-100"
                title="Bỏ lưu"
              >
                <Heart className="h-5 w-5 fill-rose-600 stroke-none" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
