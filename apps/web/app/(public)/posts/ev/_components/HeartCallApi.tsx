import { useEffect, useState } from 'react';
import HeartToggle from './HeartToggle';
import { createBookmark, deleteBookmark, getAllBookmarks } from '@/lib/api/bookmarkApi';
import type { Bookmark } from '@/types/bookmark';

export function HeartCallApi({ postId, initialBookmark }: { postId: number; initialBookmark?: Bookmark | null }) {
  const [bookmark, setBookmark] = useState<Bookmark | null>(initialBookmark ?? null);
  const [busy, setBusy] = useState(false);

  // ✅ HYDRATE khi vừa vào trang / sau đăng nhập
  useEffect(() => {
    if (bookmark) return; // đã có rồi thì thôi
    (async () => {
      try {
        const list = await getAllBookmarks(); // cần token
        const existing = list.find((b) => Number(b.postId) === Number(postId));
        if (existing) setBookmark(existing);
      } catch {
        // chưa login thì bỏ qua, lần sau có token sẽ hydrate lại (xem Cách B với authReady)
      }
    })();
  }, [postId]); // thêm [authReady] nếu bạn có biến báo token sẵn sàng


  const handleChange = async (liked: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      if (liked) {
        //nếu có thì return 
        if (bookmark) return; 
        try {
          const created = await createBookmark({ postId });
          setBookmark(created);
        } catch (err: any) {
          const status = err?.response?.status ?? err?.status;
          if (status === 409) {
            // đồng bộ lại
            const list = await getAllBookmarks();
            const existing = list.find((b) => Number(b.postId) === Number(postId));
            if (existing) setBookmark(existing);
          } else if (err?.message === 'LOGIN_REQUIRED') {
            // show login
          } else {
            console.warn('[Create] failed:', err);
          }
        }
      } else {
        if (!bookmark) return; // chưa có thì thôi
        console.log('[Delete] id:', bookmark.id, 'postId:', postId);
        await deleteBookmark(bookmark.id);
        console.log('[Delete] success');
        setBookmark(null);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <HeartToggle
      key={bookmark ? `on-${bookmark.id}` : 'off'}
      defaultLiked={!!bookmark}
      onChange={handleChange}
    />
  );
}
