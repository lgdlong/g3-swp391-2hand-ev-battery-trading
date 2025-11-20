import { useEffect, useState } from 'react';
import HeartToggle from './HeartToggle';
import { createBookmark, deleteBookmark, getAllBookmarks } from '@/lib/api/bookmarkApi';
import type { Bookmark } from '@/types/bookmark';
import { useRouter } from 'next/navigation';

export function HeartCallApi({
  postId,
  initialBookmark,
}: {
  postId: number;
  initialBookmark?: Bookmark | null;
}) {
  const [bookmark, setBookmark] = useState<Bookmark | null>(initialBookmark ?? null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  // ✅ HYDRATE khi vừa vào trang / sau đăng nhập (giống tạo sẵn HTMl rồi chờ mình đăng nhập là nó sẽ load thêm dữ liệu mới chứ không phải load lại trang)
  useEffect(() => {
    if (bookmark) return; // đã có rồi thì thôi
    (async () => {
      try {
        const list = await getAllBookmarks(); // cần token
        const existing = list.find((b) => Number(b.postId) === Number(postId));
        if (existing) setBookmark(existing);
      } catch {}
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
          // Nếu server báo đã tồn tại (409) -> đồng bộ lại từ server
          const status = err?.response?.status ?? err?.status;

          if (status === 409) {
            // đồng bộ lại
            const list = await getAllBookmarks();
            const existing = list.find((b) => Number(b.postId) === Number(postId));
            if (existing) setBookmark(existing);
          } else if (err?.message === 'Authentication using token required!') {
            router.push('/login');
            setTimeout(() => window.location.assign('/login'), 300); //ép buộc chuyển trang vì push phế
          } else {
            console.error(err);
            console.warn('[Create] failed:', err);
          }
        }
      } else {
        if (!bookmark) return; // chưa có thì thôi
        await deleteBookmark(bookmark.id);
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
