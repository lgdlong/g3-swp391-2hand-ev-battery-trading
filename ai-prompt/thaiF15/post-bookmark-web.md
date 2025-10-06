# Nhật ký phát triển và debug tính năng Bookmark (Song song giữa tôi và ChatGPT)

---

## Giới thiệu

Đây là bản tổng hợp chi tiết về toàn bộ quá trình tôi (người phát triển FE) và ChatGPT cùng làm việc để xây dựng, debug, và hoàn thiện **tính năng Bookmark** cho dự án **EV & Battery Trading Platform**. Mục tiêu của phần này là để người đọc (giám khảo, mentor, hoặc reviewer) có thể hiểu rõ quá trình cộng tác thật — không phải bản code thuê, mà là sản phẩm được phát triển qua nhiều bước, với các câu hỏi, thử nghiệm và chỉnh sửa thực tế.

---

## 1. Bối cảnh và mục tiêu

Tôi đã có backend bằng **NestJS + TypeORM + PostgreSQL**, với module `PostBookmarksModule` có các endpoint REST đầy đủ:

```
POST    /bookmarks       // Lưu bài viết
GET     /bookmarks       // Danh sách bookmark của user
GET     /bookmarks/:id   // Chi tiết bookmark
DELETE  /bookmarks/:id   // Xóa bookmark
```

Tôi muốn tạo giao diện **Bookmark** trên **Next.js (App Router)** với UI đồng bộ theo hệ thống (sử dụng shadcn/ui, lucide-react icon). Tính năng cần có:

* Trái tim hiển thị trạng thái “đã lưu / chưa lưu”.
* Khi click, tự động call API bookmark / unbookmark.
* Trang quản lý bookmark riêng, có ảnh, tên bài, nút xóa.

---

## 2. Cấu trúc FE và chuẩn code

Tôi gửi cho ChatGPT file `accountApi.ts` để tham khảo pattern viết API. ChatGPT hiểu và hướng dẫn tạo file `bookmarkApi.ts` như sau:

```ts
export async function createBookmark(payload: { postId: number }): Promise<Bookmark>
export async function getAllBookmarks(): Promise<Bookmark[]>
export async function getBookmarkById(id: number): Promise<Bookmark>
export async function deleteBookmark(id: number): Promise<void>
```

Mỗi hàm đều dùng `axios` instance (`api`) và token từ `getAuthHeaders()` để đảm bảo user login.

Tôi xác nhận cấu trúc này hợp lý, ngắn gọn, tuân theo convention của `accountApi.ts`.

---

## 3. Giao diện ban đầu: `BookMarkButton`

Ban đầu tôi có component này:

```tsx
export function BookMarkButton({ liked, onClick }: Props) {
  return (
    <Button onClick={onClick} variant="outline" ...>
      <Heart className={`size-[26px] ${liked ? 'fill-rose-600' : ''}`} />
      Lưu
    </Button>
  );
}
```

Tôi hỏi ChatGPT: “có nên gắn API trực tiếp vào đây không?” ChatGPT trả lời rằng nên tách logic call API ra file khác để tránh coupling UI và logic. Thế là tôi tạo thêm `HeartToggle` (chỉ toggle UI) và `HeartCallApi` (call thật API Bookmark).

---

## 4. Kết nối API – component `HeartCallApi`

Phiên bản đầu tôi viết:

```ts
if (liked && bookmark) {
  await deleteBookmark(bookmark.id);
  setBookmark(null);
} else {
  const created = await createBookmark({ postId });
  setBookmark(created);
}
```

Khi test, tôi gặp lỗi:

```
Error: Post is already bookmarked by this user (409 Conflict)
```

ChatGPT giải thích đây là do BE có unique constraint (accountId + postId). Nếu user bấm quá nhanh hoặc reload, BE sẽ trả 409.

✅ Fix: kiểm tra `bookmark === null` trước khi gọi create, hoặc khi nhận 409, gọi `getAllBookmarks()` để đồng bộ lại state.

---

## 5. Vấn đề Auth và Token

Tôi gặp lỗi:

```
Error: Authentication using token required!
```

ChatGPT chỉ ra là do chưa truyền headers. Tôi sửa thành:

```ts
const { data } = await api.post('/bookmarks', payload, {
  headers: getAuthHeaders(),
});
```

Sau đó lỗi hết.

---

## 6. Trạng thái khi refresh hoặc đăng nhập

Tôi hỏi: “sao trái tim không bật lên dù có trong DB?” ChatGPT đề xuất hai cách:

* **A:** FE tự gọi `getAllBookmarks()` khi load → đồng bộ state bookmark hiện tại.
* **B:** BE trả field `isBookmarked` khi lấy post detail.
  Tôi chọn **Cách A**, vì tiện và không cần sửa BE.

Sau đó thêm logic `initialBookmark` vào `HeartCallApi` để đồng bộ lại khi refresh.

---

## 7. Làm trang quản lý Bookmark (BookmarksManager)

Tôi muốn có trang `/menu/bookmarks` liệt kê toàn bộ bài viết đã lưu.

Tôi hỏi ChatGPT cách hiển thị sao cho đơn giản, và kết quả là dùng `Card` + `Image` + `Heart` button.
Cấu trúc:

```tsx
const list = await getAllBookmarks();
for each bookmark → getPostById(postId);
render Card với ảnh + tiêu đề + trái tim.
```

ChatGPT giúp viết helper `pickImageUrl` và `pickTitle` để xử lý trường hợp null hoặc sai định dạng dữ liệu.

---

## 8. Lỗi ảnh không load

Tôi gặp log:

```
GET /public/asset/phu-tung-o-to-27.png 404
```

ChatGPT giải thích rất chính xác: **Next.js không có prefix `/public` trong URL.**
File trong `/public` được truy cập trực tiếp qua root.

✅ Fix: đổi `src="/public/..."` → `src="/asset/phu-tung-o-to-27.png"` và đặt file trong `public/asset/`.

Cũng thêm:

```tsx
<Image
  unoptimized
  src={b.postImageUrl || '/asset/phu-tung-o-to-27.png'}
  alt={b.postTitle || 'Post'}
  fill
  sizes="(max-width:768px) 100vw, 33vw"
/>
```

---

## 9. Lỗi TypeScript với field `images`

ChatGPT phân tích rằng trong `postApi.ts`, `images` được định nghĩa là `FlexibleField[]` (string | number | object | null), nhưng BE thực tế trả object có key `url`. Do đó, khi tôi viết `first.url`, TS cảnh báo.

### Giải pháp ChatGPT đề xuất:

**Option 1: Dùng type guard.**

```ts
if (typeof first === 'object' && first && 'url' in first) {
  return (first as any).url;
}
```

**Option 2: Sửa lại type trong Post entity.**

```ts
export interface PostImage {
  id: string;
  url: string;
}
export interface Post { images: PostImage[] }
```

Tôi chọn Option 2 để thống nhất schema và tránh cast về any.

---

## 10. Bằng chứng JSON từ BE

Khi tôi gửi JSON mẫu từ BE, ChatGPT xác nhận đúng structure:

```json
{
  "id": "2",
  "postType": "EV_CAR",
  "title": "VinFast VF e34 2023",
  "images": [
    {
      "id": "6",
      "url": "https://res.cloudinary.com/...jpg",
      "width": 474,
      "height": 474
    }
  ]
}
```

→ Chứng minh rõ `images` là object array có `.url`.

---

## 11. Bản hoàn chỉnh của BookmarksManager

ChatGPT giúp hoàn thiện phiên bản cuối cùng:

* Có check `needLogin` → hiển thị nút đăng nhập.
* Khi xoá bookmark → optimistic update UI.
* Khi chưa có ảnh → fallback sang placeholder.
* Hover animation và transition đẹp mắt.

Cuối cùng tôi test: bookmark, unbookmark, reload, login/logout — tất cả chạy ổn định.

---

## 12. Cảm nhận và minh chứng cộng tác thật

Điểm đặc biệt trong quá trình này là **mọi dòng code đều được viết qua đối thoại**:

* Tôi hỏi – ChatGPT giải thích ngắn gọn, không code thuê mà giúp tôi hiểu logic.
* Nhiều lần tôi gửi ảnh log, ChatGPT đọc và chỉ ra đúng lỗi (`/public/` path sai, type mismatch FlexibleField).
* Từng đoạn nhỏ (BookMarkButton, HeartToggle, HeartCallApi, BookmarksManager) đều được phát triển qua thảo luận thật.

Người đọc chỉ cần xem chuỗi hội thoại là biết đây không phải copy/paste sản phẩm thuê viết, mà là **hành trình học và hoàn thiện** thực sự.

---

## 13. Kết luận

| Thành phần                   | Trạng thái | Ghi chú                   |
| ---------------------------- | ---------- | ------------------------- |
| API backend `/bookmarks`     | ✅          | Hoạt động ổn định         |
| API client (bookmarkApi.ts)  | ✅          | Dùng axios, auth token    |
| HeartToggle                  | ✅          | Component client UI       |
| HeartCallApi                 | ✅          | Logic bookmark/unbookmark |
| BookmarksManager             | ✅          | Hiển thị danh sách đã lưu |
| Placeholder & ảnh Cloudinary | ✅          | Load đúng, không 404      |
| TypeScript types             | ✅          | Đã chỉnh đúng với BE      |

🟢 **Tính năng Bookmark hiện hoàn chỉnh**, có thiết kế, logic, và bảo trì rõ ràng.

---

> *Minh chứng về quy trình cộng tác người – AI: Tôi (người phát triển) đã liên tục hỏi, chỉnh, sửa và xác nhận từng chi tiết cùng ChatGPT. Từng log, đoạn code, và file được giải thích, chứng minh, và thử nghiệm thực tế. Bản này không chỉ là code chạy, mà còn là tài liệu phản ánh năng lực học hỏi, phân tích, và làm việc có quy trình.*
