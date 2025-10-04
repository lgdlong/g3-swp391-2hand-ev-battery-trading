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

// Helpers rút gọn cho title + image
function pickTitle(p: any): string {
  return p?.title || `Post`;
}

function pickImageUrl(p: any): string | null {
  console.log('First image', p);
  const imgs = p?.images;
  if (Array.isArray(imgs) && imgs.length > 0) {
    const first = imgs[0];
    
    if (first?.url) return first.url; 
  }
  return null;
}

type Row = Bookmark & { postTitle?: string; postImageUrl?: string | null };

export function BookmarksManager() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [needLogin, setNeedLogin] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // 1) lấy danh sách bookmark
        const list = await getAllBookmarks();
        const base: Row[] = list.map((b) => ({ ...b }));
        setRows(base);

        // 2) hydrate tiêu đề + ảnh theo postId (song song, đơn giản)
        await Promise.all(
          base.map(async (b) => {
            try {
              const post = await getPostById(String(b.postId));
              console.log('Post for bookmark', b.id, post);
              setRows((prev) =>
                prev?.map((r) =>
                  r.id === b.id
                    ? {
                        ...r,
                        postTitle: pickTitle(post),
                        postImageUrl: pickImageUrl(post),
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
        // chưa đăng nhập / thiếu token
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
      setRows(rows.filter((x) => x.id !== b.id)); // optimistic
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

  if (rows === null) {
    return <div className="text-sm text-muted-foreground">Đang tải…</div>;
  }

  if (rows.length === 0) {
    return <div className="text-sm text-muted-foreground">Bạn chưa lưu bài nào.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {rows.map((b) => (
        <Card key={b.id} className="relative overflow-hidden group">
          {/* Ảnh */}
          <div className="relative h-40 w-full bg-slate-50">
            <Image
              src={b.postImageUrl || '/asset/phu-tung-o-to-27.png'}
              alt={b.postTitle || `Post #${b.postId}`}
              fill
              unoptimized // vì ảnh bên ngoài
              sizes="(max-width:768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Trái tim để BỎ LƯU */}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleUnsave(b)}
              disabled={busyId === b.id}
              className="absolute right-2 top-2 rounded-full bg-white/90 hover:bg-white shadow"
              aria-label="Bỏ lưu"
              title="Bỏ lưu"
            >
              <Heart className="h-5 w-5 fill-rose-600 stroke-none" />
            </Button>
          </div>

          {/* Tiêu đề */}
          <Link href={`/posts/ev/${b.postId}`} className="block px-3 py-3">
            <h3 className="text-sm font-semibold line-clamp-2 hover:text-[#048C73] transition-colors">
              {b.postTitle || `Post #${b.postId}`}
            </h3>
          </Link>
        </Card>
      ))}
    </div>
  );
}
