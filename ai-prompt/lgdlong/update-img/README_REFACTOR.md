# Refactor ImageUpload Component - Summary

## Những thay đổi chính

### 1. Component `ImageUpload.tsx`

**Trước đây:**
- Mix ảnh cũ (`PostImage`) và ảnh mới vào cùng 1 state `images[]`
- Xoá ảnh = xoá ngay khỏi state
- Không có cách nào biết ảnh nào cần upload, ảnh nào cần xoá khi submit

**Bây giờ:**
- **Tách 3 state độc lập:**
  - `existing: PostImage[]` - Ảnh đã có từ backend
  - `added: NewImage[]` - Ảnh mới người dùng chọn (có File object)
  - `deletedIds: Set<string>` - ID của ảnh cũ bị đánh dấu xoá

- **Computed `displayImages`:**
  - Danh sách hiển thị = existing (trừ deleted) + added (trừ deleted)
  - Sort theo `position`
  - Dùng để render UI grid

- **Return `ImageDiffPayload` thay vì `PostImage[]`:**
  ```typescript
  interface ImageDiffPayload {
    toDelete: string[];           // IDs to delete
    toKeep: Array<{               // Existing images to keep
      id: string;
      publicId: string;
      position: number;
    }>;
    toUpload: Array<{             // New files to upload
      file: File;
      position: number;
    }>;
    hasMain: boolean;             // Has main image (position 0)
  }
  ```

### 2. Component `page.tsx`

**Thay đổi:**
- Thêm state `imageDiff` để lưu payload
- Pass `imageDiff` xuống `UpdatePostForm`
- Xoá prop `postId` không cần thiết

```typescript
const [imageDiff, setImageDiff] = useState<ImageDiffPayload | null>(null);

<ImageUpload
  existingImages={post.images || []}
  onImagesUpdate={(diff) => setImageDiff(diff)}
/>

<UpdatePostForm post={post} imageDiff={imageDiff} />
```

### 3. Component `UpdatePostForm.tsx`

**Thay đổi:**
- Nhận prop `imageDiff?: ImageDiffPayload | null`
- Thêm TODO comment hướng dẫn xử lý image diff trong `handleSubmit`
- Sẵn sàng để implement logic upload/delete ảnh

```typescript
// TODO trong handleSubmit:
// 1. Delete: await deletePostImages({ postId, imageIds: imageDiff.toDelete })
// 2. Reorder: await updateImagePositions({ postId, images: imageDiff.toKeep })
// 3. Upload: await uploadPostImages({ postId, formData })
```

## Files đã thay đổi

```
apps/web/app/(public)/my-posts/[id]/edit/
├── _components/
│   ├── ImageUpload.tsx           ✅ Refactored
│   ├── UpdatePostForm.tsx         ✅ Updated
│   ├── IMAGE_UPLOAD_PATTERN.md   📄 New - Documentation
│   └── README_REFACTOR.md        📄 New - This file
└── page.tsx                      ✅ Updated
```

## Type Definitions

**Đã có sẵn trong `types/post.ts`:**
```typescript
export interface NewImage {
  tempId: string;
  file: File;
  previewUrl: string;
  position: number;
  deleted?: boolean;
}
```

**Mới thêm trong `ImageUpload.tsx`:**
```typescript
export interface ImageDiffPayload {
  toDelete: string[];
  toKeep: Array<{ id: string; publicId: string; position: number }>;
  toUpload: Array<{ file: File; position: number }>;
  hasMain: boolean;
}
```

## Flow hoạt động mới

```
1. User load page
   └─> existingImages sync vào `existing` state

2. User chọn ảnh mới
   └─> Thêm vào `added` với File object + preview URL
   └─> displayImages update → UI render

3. User xoá ảnh cũ
   └─> Thêm ID vào `deletedIds` (đánh dấu)
   └─> displayImages update → UI ẩn ảnh
   └─> Database chưa bị xoá

4. User xoá ảnh mới
   └─> Set `deleted: true` trong `added`
   └─> displayImages update → UI ẩn ảnh
   └─> File không được upload

5. Component tự động build diff payload
   └─> onImagesUpdate(diff) gọi mỗi khi state thay đổi
   └─> Parent component nhận ImageDiffPayload

6. User submit form
   └─> UpdatePostForm nhận imageDiff
   └─> Gọi API với 3 operations: delete, reorder, upload
   └─> Backend xử lý theo thứ tự
```

## Next Steps - Backend API Implementation

Cần implement 3 endpoints (hoặc 1 endpoint tổng hợp):

### Option 1: Separate endpoints

```typescript
// 1. Delete images
DELETE /api/posts/:postId/images
Body: { imageIds: string[] }

// 2. Update positions
PATCH /api/posts/:postId/images/positions
Body: { images: Array<{ id, publicId, position }> }

// 3. Upload new images
POST /api/posts/:postId/images
Body: FormData with files + positions
```

### Option 2: Batch endpoint (Recommended)

```typescript
POST /api/posts/:postId/images/batch-update
Body: {
  delete: string[],
  keep: Array<{ id, publicId, position }>,
  uploadMeta: Array<{ position }>
}
+ FormData with files
```

## Benefits của refactor này

✅ **Rõ ràng hơn**: Biết chính xác ảnh nào sẽ bị xoá/thêm/giữ  
✅ **An toàn hơn**: Không mất dữ liệu cho đến khi submit thành công  
✅ **Performance**: Chỉ upload ảnh mới, không re-upload ảnh cũ  
✅ **UX tốt**: User có thể undo bằng cách reload page  
✅ **Type-safe**: TypeScript đảm bảo kiểu dữ liệu chính xác  
✅ **Maintainable**: Code dễ đọc, dễ test, dễ mở rộng  

## Testing Checklist

- [ ] Thêm ảnh mới → hiển thị preview
- [ ] Xoá ảnh cũ → đánh dấu, UI ẩn
- [ ] Xoá ảnh mới → không upload
- [ ] Submit form → imageDiff có đủ dữ liệu
- [ ] Reload page → reset về existingImages
- [ ] Limit ảnh → validate đúng
- [ ] Position → ảnh đầu tiên là ảnh chính

## Documentation

Xem chi tiết tại: [IMAGE_UPLOAD_PATTERN.md](./IMAGE_UPLOAD_PATTERN.md)

---

**Refactored by:** GitHub Copilot  
**Date:** 2025-01-17  
**Branch:** feat/my-posts-update
