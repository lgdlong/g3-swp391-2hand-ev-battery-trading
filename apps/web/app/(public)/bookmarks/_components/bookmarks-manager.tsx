'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { getAllBookmarks, deleteBookmark } from '@/lib/api/bookmarkApi';
import type { Bookmark } from '@/types/bookmark';
import { getPostById } from '@/lib/api/postApi';
import { DEFAULT_IMAGE } from '@/constants/images';
import {
  pickTitle,
  pickImageUrl,
  pickPrice,
  formatTimeAgo,
  pickLocation,
} from '@/lib/post-helpers';

type BookmarkItem = Bookmark & {
  postTitle?: string;
  postImageUrl?: string | null;
  priceVnd?: number | null;
  isNegotiable?: boolean;
  location?: string;
  timeAgo?: string;
};

export function BookmarksManager() {
  // rows: danh sách bookmark hiển thị trên UI (null = đang tải lần đầu)
  const [rows, setRows] = useState<BookmarkItem[] | null>(null);
  // busyId: đánh dấu item nào đang xử lý (ví dụ khi bấm "Bỏ lưu")
  const [busyId, setBusyId] = useState<number | null>(null);
  // needLogin: nếu gọi API lỗi do chưa đăng nhập → hiển thị nhắc đăng nhập
  const [needLogin, setNeedLogin] = useState(false);

  /**
   * enrichBookmarkWithPostData:
   * - Nhận vào 1 bookmark (Row)
   * - Gọi API lấy chi tiết post tương ứng
   * - Cập nhật lại "rows" bằng cách map và trộn thêm dữ liệu post cho đúng item
   *
   * Dùng useCallback để tránh tạo lại hàm trên mỗi lần render (giúp dependency của useEffect/loadBookmarks ổn định).
   */
  const enrichBookmarkWithPostData = useCallback(async (bookmark: BookmarkItem) => {
    try {
      // 1) Fetch chi tiết bài đăng theo postId của bookmark
      const post = await getPostById(String(bookmark.postId));

      // 2) Cập nhật state "rows" dựa trên giá trị trước đó (functional setState)
      //    - Tìm đúng item bằng row.id === bookmark.id
      //    - Gộp thêm các field lấy từ post (title, image, price, location, timeAgo)
      setRows(
        (prevRows) =>
          prevRows?.map((row) =>
            row.id === bookmark.id
              ? {
                  ...row,
                  postTitle: pickTitle(post),
                  postImageUrl: pickImageUrl(post),
                  priceVnd: pickPrice(post),
                  isNegotiable: post?.isNegotiable ?? false,
                  location: pickLocation(post),
                  timeAgo: formatTimeAgo(post.createdAt),
                }
              : row,
          ) ?? prevRows,
      );
    } catch (error) {
      // Nếu lỗi khi enrich 1 post, ta chỉ log và giữ nguyên item với dữ liệu fallback
      console.error(`Failed to fetch post ${bookmark.postId}:`, error);
    }
  }, []);

  /**
   * loadBookmarks:
   * - Gọi API lấy toàn bộ bookmarks của user
   * - Set "rows" ngay lập tức với dữ liệu thô để UI hiển thị skeleton/fallback sớm
   * - Sau đó enrich song song từng bookmark bằng Promise.all
   * - Nếu lỗi (thường do chưa đăng nhập) → needLogin = true và rows = []
   *
   * Dùng useCallback để ổn định reference (là dependency của useEffect).
   */
  const loadBookmarks = useCallback(async () => {
    try {
      // 1) Lấy list bookmark
      const bookmarkList = await getAllBookmarks();

      // 2) Chuẩn hóa về Row (ban đầu chưa có dữ liệu post)
      const initialRows: BookmarkItem[] = bookmarkList.map((bookmark) => ({ ...bookmark }));

      // 3) Set ngay "rows" để UI render danh sách (đang ở trạng thái chưa enrich)
      setRows(initialRows);

      // 4) Enrich từng item với dữ liệu post chạy song song
      await Promise.all(initialRows.map(enrichBookmarkWithPostData));
      // Lưu ý: mỗi lần enrich xong 1 item, setRows sẽ cập nhật dần-dần.
      // Promise.all chỉ đảm bảo tất cả enrich đã chạy xong, nhưng UI đã được cập nhật incremental trước đó.
    } catch (error) {
      // 5) Nếu load thất bại (ví dụ 401), hiển thị yêu cầu đăng nhập
      console.error('Failed to load bookmarks:', error);
      setNeedLogin(true);
      setRows([]);
    }
  }, [enrichBookmarkWithPostData]);

  /**
   * useEffect khởi tạo:
   * - Chạy 1 lần sau lần render đầu tiên (vì dependency chỉ có loadBookmarks – một hàm ổn định nhờ useCallback)
   * - Mục tiêu: tải danh sách bookmark và enrich dữ liệu post
   *
   * Vòng đời:
   *   1) Render lần đầu → rows = null ⇒ UI hiển thị "Đang tải…"
   *   2) Effect chạy → gọi loadBookmarks()
   *   3) loadBookmarks setRows(initialRows) ⇒ Trigger re-render:
   *        - UI hiển thị danh sách với dữ liệu thô (chưa có title/ảnh/giá)
   *   4) Promise.all enrich từng item:
   *        - Mỗi lần enrich xong 1 item → setRows(...) cập nhật dần
   *        - UI re-render tương ứng, hiển thị dần đủ title/ảnh/giá/thời gian/địa điểm
   *   5) Nếu lỗi 401 → setNeedLogin(true) và rows = [] ⇒ UI hiển thị nhắc đăng nhập
   */
  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  /**
   * handleUnsave:
   * - Khi bấm "Bỏ lưu" trên 1 item:
   *   1) Đánh dấu busyId = id item (để disable nút, tránh double click)
   *   2) Gọi API deleteBookmark
   *   3) Xóa item khỏi state "rows"
   *   4) Dù thành công hay lỗi cũng clear busyId trong finally
   */
  async function handleUnsave(b: BookmarkItem) {
    if (!rows) return;
    setBusyId(b.id);
    try {
      await deleteBookmark(b.id);
      setRows(rows.filter((x) => x.id !== b.id));
    } finally {
      setBusyId(null);
    }
  }

  // Nhánh UI: nếu cần đăng nhập
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

  // Nhánh UI: lần render đầu tiên khi rows còn null → đang tải
  if (rows === null) return <div>Đang tải…</div>;
  // Nhánh UI: đã tải xong nhưng rỗng
  if (rows.length === 0) return <div>Bạn chưa lưu bài nào.</div>;

  // UI danh sách bookmark
  return (
    <div className="flex flex-col divide-y divide-gray-200">
      {rows.map((b) => (
        <div key={b.id} className="relative flex gap-4 p-3 hover:bg-gray-50 transition-colors">
          {/* Ảnh bên trái: dùng ảnh enrich (nếu có), fallback là ảnh mặc định */}
          <Link
            href={`/posts/ev/${b.postId}`}
            className="relative flex-shrink-0 w-32 h-24 overflow-hidden bg-gray-100"
          >
            <Image
              src={b.postImageUrl || DEFAULT_IMAGE}
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
                  {/* Khi chưa enrich xong → hiện fallback "Post #id" */}
                  {b.postTitle || `Post #${b.postId}`}
                </h3>
              </Link>

              {/* Hiển thị giá:
                  - Nếu isNegotiable = true → 'Liên hệ'
                  - Ngược lại format VND
                  - Nếu chưa enrich xong price (null/undefined) → ẩn */}
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

              {/* Thông tin phụ:
                  - timeAgo/location có thể chưa có khi chưa enrich → dùng fallback */}
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
