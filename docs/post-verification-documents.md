# Hệ thống Verification Documents (Giấy tờ xe để kiểm duyệt)

## Tổng quan

Đã triển khai hệ thống mới để quản lý giấy tờ xe phục vụ kiểm duyệt, tách biệt với ảnh hiển thị công khai.

## Thay đổi Database

### Bảng mới: `post_verification_documents`

```sql
CREATE TABLE post_verification_documents (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL, -- enum: 'REGISTRATION_CERTIFICATE', 'INSURANCE', 'OTHER'
  url TEXT NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  deleted_at TIMESTAMP NULL, -- soft delete
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_post_verification_documents_post_id_type ON post_verification_documents(post_id, type);
CREATE INDEX idx_post_verification_documents_uploaded_by ON post_verification_documents(uploaded_by);
```

### Phân biệt với bảng khác:

- **`post_images`**: Ảnh sản phẩm hiển thị công khai trên trang chủ
- **`post_verification_documents`**: Giấy tờ xe CHỈ admin và chủ bài đăng xem được, phục vụ kiểm duyệt

**Lưu ý**: Bảng `post_documents` cũ đã bị XÓA vì trùng mục đích với `post_verification_documents`.

## Files đã tạo/cập nhật

### Backend (API)

#### Files mới:
1. **`apps/api/src/shared/enums/post-verification-document-type.enum.ts`**
   - Enum cho loại giấy tờ: REGISTRATION_CERTIFICATE, INSURANCE, OTHER
   - ✅ **Dùng tiếng Anh** theo chuẩn quốc tế

2. **`apps/api/src/modules/posts/entities/post-verification-document.entity.ts`**
   - Entity TypeORM cho bảng mới
   - Có soft delete (deleted_at)
   - Relations với Post và Account

3. **`apps/api/src/modules/posts/dto/create-verification-document.dto.ts`**
   - DTO để tạo verification document

4. **`apps/api/src/modules/posts/dto/verification-document-response.dto.ts`**
   - DTO response cho verification document

#### Files đã cập nhật:
1. **`apps/api/src/modules/posts/entities/post.entity.ts`**
   - Thêm relation `verificationDocuments`

2. **`apps/api/src/modules/posts/posts.module.ts`**
   - Thêm `PostVerificationDocument` vào TypeORM

3. **`apps/api/src/modules/posts/posts.service.ts`**
   - Thêm methods:
     - `addVerificationDocuments()` - Upload giấy tờ
     - `listVerificationDocuments()` - Xem giấy tờ (CHỈ admin/owner)
     - `deleteVerificationDocument()` - Xóa giấy tờ (soft delete)
     - `toVerificationDocumentResponse()` - Convert entity sang DTO
   - **Cập nhật `approvePost()`**: Giờ check `verificationDocsRepo` thay vì `documentsRepo`

4. **`apps/api/src/modules/posts/posts.controller.ts`**
   - Thêm 3 endpoints mới:
     - `POST /posts/:postId/verification-documents` - Upload giấy tờ
     - `GET /posts/:postId/verification-documents` - Xem giấy tờ
     - `DELETE /verification-documents/:docId` - Xóa giấy tờ

## API Endpoints

### 1. Upload Verification Documents
```
POST /posts/:postId/verification-documents
Headers: Authorization: Bearer <token>
Body: [
  {
    "type": "REGISTRATION_CERTIFICATE",
    "url": "https://cloudinary.com/.../cavet.jpg"
  },
  {
    "type": "INSURANCE",
    "url": "https://cloudinary.com/.../insurance.jpg"
  }
]
```

**Quyền**: CHỈ chủ bài đăng (USER role)

### 2. Xem Verification Documents
```
GET /posts/:postId/verification-documents
Headers: Authorization: Bearer <token>
```

**Quyền**: CHỈ admin HOẶC chủ bài đăng

### 3. Xóa Verification Document
```
DELETE /verification-documents/:docId
Headers: Authorization: Bearer <token>
```

**Quyền**: CHỈ admin HOẶC chủ bài đăng  
**Note**: Soft delete, không xóa vĩnh viễn

## Flow mới

### 1. Tạo bài viết
```
User tạo post (DRAFT) 
  → Upload ảnh sản phẩm (post_images)
  → Upload giấy tờ xe (post_verification_documents) ← MỚI
  → Submit để duyệt (status = PENDING_REVIEW)
```

### 2. Admin kiểm duyệt
```
Admin vào xem bài PENDING_REVIEW
  → Xem ảnh sản phẩm (công khai)
  → Xem giấy tờ xe (verification_documents) ← MỚI, CHỈ admin xem được
  → Kiểm tra tính hợp lệ
  → Approve/Reject
```

**Validation khi approve**:
- Bắt buộc phải có ít nhất 1 verification document
- Nếu không có → throw error "Bài đăng chưa có giấy tờ xe phục vụ kiểm duyệt"

### 3. Hiển thị trang chủ
```
Trang chủ chỉ hiển thị:
  - post_images (ảnh sản phẩm)
  
KHÔNG hiển thị:
  - post_verification_documents (giấy tờ xe)
```

## Bảo mật & Quyền hạn

### Upload giấy tờ
- ✅ CHỈ chủ bài đăng
- ❌ Admin KHÔNG được upload thay user

### Xem giấy tờ
- ✅ Admin (kiểm duyệt)
- ✅ Chủ bài đăng
- ❌ User khác KHÔNG được xem

### Xóa giấy tờ
- ✅ Admin
- ✅ Chủ bài đăng
- Soft delete (có thể restore)

### Hiển thị công khai
- ❌ Giấy tờ KHÔNG BAO GIỜ hiển thị công khai
- ❌ API public KHÔNG trả về verification documents

## Enum Values (Tiếng Anh - Chuẩn DB)

| Enum Value | Tiếng Việt | Mô tả |
|------------|-----------|-------|
| `REGISTRATION_CERTIFICATE` | Cà vẹt / Giấy đăng ký xe | Giấy tờ đăng ký và sở hữu xe |
| `INSURANCE` | Bảo hiểm xe | Giấy bảo hiểm xe |
| `OTHER` | Giấy tờ khác | Giấy tờ khác |

## Lưu ý khi Frontend implement

1. **Trang tạo bài viết**:
   - Thêm section riêng để upload giấy tờ xe
   - Có thể upload 3 loại: `REGISTRATION_CERTIFICATE`, `INSURANCE`, `OTHER`
   - Cần upload lên Cloudinary trước, lấy URL rồi gọi API
   - **Hiển thị label tiếng Việt** trên UI, nhưng **gửi value tiếng Anh** cho API

2. **Trang admin review**:
   - Thêm tab/section để xem verification documents
   - Hiển thị các giấy tờ đã upload
   - Có thể zoom/preview ảnh

3. **Trang chủ/danh sách bài viết**:
   - KHÔNG cần thay đổi gì
   - Vẫn chỉ hiển thị post_images như cũ

## Migration từ hệ thống cũ

**Bảng `post_documents` đã bị XÓA HOÀN TOÀN**

Nếu có data cũ trong database, cần migrate trước khi deploy:

```sql
-- 1. Migrate data từ post_documents sang post_verification_documents (NẾU CẦN)
INSERT INTO post_verification_documents (post_id, type, url, uploaded_at, uploaded_by)
SELECT 
  post_id,
  CASE 
    WHEN documentType IN ('REGISTRATION', 'VEHICLE_PAPER', 'OWNERSHIP') THEN 'REGISTRATION_CERTIFICATE'
    WHEN documentType = 'INSURANCE' THEN 'INSURANCE'
    ELSE 'OTHER'
  END,
  url,
  created_at,
  (SELECT seller_id FROM posts WHERE id = post_documents.post_id)
FROM post_documents
WHERE documentType IN ('REGISTRATION', 'VEHICLE_PAPER', 'OWNERSHIP', 'INSURANCE');

-- 2. Xóa bảng post_documents cũ
DROP TABLE IF EXISTS post_documents CASCADE;
```

**Lưu ý**: Backup database trước khi chạy migration!

## Testing

### Test cases cần cover:

1. ✅ User upload verification documents cho bài viết của mình
2. ❌ User upload verification documents cho bài viết người khác → 403
3. ✅ Admin xem verification documents của bất kỳ bài viết nào
4. ✅ Owner xem verification documents của bài viết mình
5. ❌ User khác xem verification documents → 403
6. ❌ Admin approve bài viết không có verification documents → 400
7. ✅ Admin approve bài viết có verification documents → 200
8. ✅ Soft delete verification document
9. ❌ Public API không trả về verification documents

## Câu hỏi thường gặp (FAQ)

**Q: Tại sao cần bảng riêng cho verification documents?**  
A: Để tách biệt giấy tờ kiểm duyệt (riêng tư) với ảnh hiển thị (công khai), dễ quản lý quyền truy cập.

**Q: Có thể xóa hẳn verification document không?**  
A: Hiện tại dùng soft delete. Nếu cần hard delete, có thể thêm endpoint riêng cho admin.

**Q: Badge kiểm định ở đâu?**  
A: Không có badge kiểm định. Sau khi admin approve, post chuyển sang PUBLISHED, không cần badge riêng.

**Q: Documents cũ (post_documents) còn dùng không?**  
A: ĐÃ XÓA! Bảng `post_documents` đã bị xóa hoàn toàn vì trùng mục đích với `post_verification_documents`. Chỉ còn `post_verification_documents` để lưu giấy tờ xe.

