# Image Upload Pattern - Diff-based Approach

## Tổng quan

Component `ImageUpload` đã được refactor để sử dụng pattern "đánh dấu" (marking) thay vì xoá/thêm trực tiếp. Pattern này tách bạch **danh sách hiển thị** ra khỏi **trạng thái thao tác**, cho phép tính toán *diff* chính xác khi submit.

## Cấu trúc State

Component quản lý 3 state chính:

### 1. `existing: PostImage[]`
- Ảnh đã có từ backend (đã được upload trước đó)
- Sync với prop `existingImages` khi component mount/update
- Không bị thay đổi cho đến khi submit thành công

### 2. `added: NewImage[]`
- Ảnh mới người dùng chọn (đang giữ `File` object)
- Có `previewUrl` tạm (từ `URL.createObjectURL`)
- Có cờ `deleted` để đánh dấu nếu người dùng bỏ trước khi submit

### 3. `deletedIds: Set<string>`
- Tập hợp các `id` hoặc `publicId` của ảnh cũ bị đánh dấu xoá
- Không xoá thật trong database cho đến khi submit

## Danh sách hiển thị - `displayImages`

```typescript
const displayImages = useMemo(() => {
  const keptExisting = existing.filter(
    img => !deletedIds.has(img.id) && !deletedIds.has(img.publicId)
  );
  const keptAdded = added.filter(a => !a.deleted);
  
  return [
    ...keptExisting.map(img => ({
      kind: 'existing' as const,
      id: img.id,
      publicId: img.publicId,
      url: img.url,
      position: img.position,
    })),
    ...keptAdded.map(a => ({
      kind: 'new' as const,
      tempId: a.tempId,
      url: a.previewUrl,
      position: a.position,
    })),
  ].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}, [existing, added, deletedIds]);
```

**Ý nghĩa:**
- Là mảng được computed từ 3 state trên
- Chỉ chứa ảnh "còn giữ" (chưa bị đánh dấu xoá)
- Được dùng để render UI grid
- Tự động update khi user thao tác (thêm/xoá/sắp xếp)

## Flow hoạt động

### 1. **Thêm ảnh mới**

```typescript
const handleFileSelect = async (files: FileList) => {
  // Validate files...
  
  const basePos = displayImages.length;
  const newOnes: NewImage[] = validFiles.map((file, i) => ({
    tempId: `temp-${Date.now()}-${i}`,
    file,
    previewUrl: URL.createObjectURL(file),
    position: basePos + i,
  }));
  
  setAdded(prev => [...prev, ...newOnes]);
};
```

**Kết quả:**
- Ảnh mới được thêm vào `added` state
- `displayImages` tự động update → UI render thêm ảnh mới
- File object được giữ nguyên để upload sau

### 2. **Xoá ảnh**

```typescript
const removeDisplayImage = (item: { 
  kind: 'existing' | 'new'; 
  id?: string; 
  publicId?: string; 
  tempId?: string; 
}) => {
  if (item.kind === 'existing') {
    // Ảnh cũ: đánh dấu vào deletedIds
    const key = item.id ?? item.publicId!;
    setDeletedIds(prev => new Set(prev).add(key));
    toast.success('Đã đánh dấu xoá ảnh');
  } else {
    // Ảnh mới: đặt cờ deleted = true
    setAdded(prev => 
      prev.map(a => a.tempId === item.tempId 
        ? { ...a, deleted: true } 
        : a
      )
    );
    toast.success('Đã bỏ ảnh mới');
  }
};
```

**Kết quả:**
- Ảnh **không bị xoá** khỏi state ngay
- Chỉ được **đánh dấu** (marking)
- `displayImages` filter ra → UI không hiển thị nữa
- Ảnh cũ vẫn còn trong database cho đến khi submit

### 3. **Submit - Tạo Diff Payload**

```typescript
const buildSubmitPayload = (): ImageDiffPayload => {
  const toDelete = Array.from(deletedIds);

  const toKeep = existing
    .filter(img => !deletedIds.has(img.id) && !deletedIds.has(img.publicId))
    .map(img => ({
      id: img.id,
      publicId: img.publicId,
      position: img.position ?? 0,
    }));

  const toUpload = added
    .filter(a => !a.deleted)
    .map(a => ({
      file: a.file,
      position: a.position ?? 0,
    }));

  const hasMain = toKeep.some(x => x.position === 0) || 
                  toUpload.some(x => x.position === 0);

  return { toDelete, toKeep, toUpload, hasMain };
};
```

**Output - `ImageDiffPayload`:**

```typescript
interface ImageDiffPayload {
  toDelete: string[];  // ['img-id-1', 'publicId-2']
  toKeep: Array<{      // Ảnh cũ giữ lại, có thể đổi vị trí
    id: string;
    publicId: string;
    position: number;
  }>;
  toUpload: Array<{    // Ảnh mới cần upload
    file: File;
    position: number;
  }>;
  hasMain: boolean;    // Có ảnh ở position = 0 không
}
```

## Tích hợp với Form

### Parent Component (`page.tsx`)

```typescript
export default function UpdatePostPage() {
  const [imageDiff, setImageDiff] = useState<ImageDiffPayload | null>(null);

  return (
    <ImageUpload
      existingImages={post.images || []}
      onImagesUpdate={(diff) => {
        setImageDiff(diff);
        console.log('Image diff:', diff);
      }}
    />
    
    <UpdatePostForm 
      post={post} 
      imageDiff={imageDiff}  // Truyền diff xuống form
    />
  );
}
```

### Submit Form (`UpdatePostForm.tsx`)

```typescript
const handleSubmit = async () => {
  // ... validate form data ...

  // Process image diff
  if (imageDiff) {
    // 1. Xoá ảnh cũ đã đánh dấu
    if (imageDiff.toDelete.length > 0) {
      await deletePostImages({ 
        postId: post.id, 
        imageIds: imageDiff.toDelete 
      });
    }

    // 2. Cập nhật vị trí ảnh giữ lại
    if (imageDiff.toKeep.length > 0) {
      await updateImagePositions({ 
        postId: post.id, 
        images: imageDiff.toKeep 
      });
    }

    // 3. Upload ảnh mới
    if (imageDiff.toUpload.length > 0) {
      const formData = new FormData();
      imageDiff.toUpload.forEach((img, idx) => {
        formData.append('files', img.file);
        formData.append(`positions[${idx}]`, String(img.position));
      });
      await uploadPostImages({ 
        postId: post.id, 
        formData 
      });
    }
  }

  // Submit form data...
};
```

## API Backend cần implement

### 1. DELETE `/posts/:id/images`
```typescript
// Xoá nhiều ảnh theo ID hoặc publicId
deletePostImages({ postId, imageIds: string[] })
```

### 2. PATCH `/posts/:id/images/positions`
```typescript
// Cập nhật vị trí ảnh
updateImagePositions({ 
  postId, 
  images: Array<{ id, publicId, position }> 
})
```

### 3. POST `/posts/:id/images`
```typescript
// Upload ảnh mới với position
uploadPostImages({ 
  postId, 
  formData: FormData  // chứa files + positions
})
```

**Hoặc một endpoint tổng hợp:**

### POST `/posts/:id/images/batch-update`
```typescript
{
  "delete": ["publicId-1", "publicId-2"],
  "keep": [
    { "id": "35", "publicId": "abc", "position": 0 },
    { "id": "36", "publicId": "def", "position": 1 }
  ],
  "uploadMeta": [
    { "position": 2 },
    { "position": 3 }
  ]
  // files đi trong multipart form-data
}
```

## Ưu điểm của Pattern này

✅ **Tách bạch state**: Không mix ảnh cũ & ảnh mới vào cùng 1 mảng  
✅ **Không mất dữ liệu**: Ảnh cũ vẫn giữ nguyên cho đến khi submit thành công  
✅ **Diff rõ ràng**: Biết chính xác ảnh nào xoá/thêm/giữ  
✅ **UX tốt**: Người dùng có thể undo (reload lại component)  
✅ **Performance**: Chỉ upload ảnh mới, không re-upload ảnh cũ  
✅ **Type-safe**: TypeScript đảm bảo kiểu dữ liệu chính xác  

## Lưu ý khi implement

1. **Memory leak**: Nhớ `URL.revokeObjectURL` khi component unmount
   ```typescript
   useEffect(() => {
     return () => {
       added.forEach(img => URL.revokeObjectURL(img.previewUrl));
     };
   }, [added]);
   ```

2. **Thứ tự ảnh**: Ảnh đầu tiên (`position = 0`) là ảnh chính

3. **Validation**: Kiểm tra số lượng ảnh tối đa dựa trên `displayImages.length`

4. **Error handling**: Nếu upload/delete fail, cần rollback state hoặc refetch data

5. **Loading states**: Show loading khi đang upload/delete ảnh

## Testing checklist

- [ ] Thêm ảnh mới → hiển thị preview đúng
- [ ] Xoá ảnh cũ → đánh dấu, chưa xoá database
- [ ] Xoá ảnh mới → bỏ khỏi danh sách upload
- [ ] Submit → API nhận đúng diff payload
- [ ] Reload page → state reset về existingImages
- [ ] Giới hạn số ảnh → validate đúng
- [ ] Thứ tự ảnh → position được tính đúng
- [ ] Memory leak → preview URL được revoke

---

**Tác giả:** Refactored based on best practices for image upload UX  
**Ngày cập nhật:** 2025-01-17
