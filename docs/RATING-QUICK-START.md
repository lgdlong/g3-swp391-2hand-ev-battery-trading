# 🚀 Rating UI - Quick Start

## Vị trí UI đã tạo

```
apps/web/app/(public)/my-purchases/
├── page.tsx                    ✅ Trang chính
└── _components/
    ├── RatingModal.tsx         ✅ Modal đánh giá (5 sao + textarea)
    └── PurchaseCard.tsx        ✅ Card hiển thị từng bài đã mua
```

**URL:** `http://localhost:3000/my-purchases`

---

## 🎯 Tính năng đã implement

✅ **Modal đánh giá:**
- 5 sao với hover effect
- Textarea lớn (max 1000 ký tự)
- Validation: Phải chọn sao mới submit được
- Loading state

✅ **Trang danh sách:**
- Search theo tên bài post
- Filter: Tất cả / Đã đánh giá / Chưa đánh giá
- Stats cards: Tổng số, Đã rate, Chưa rate
- Responsive design

✅ **Purchase Card:**
- Thumbnail, title, price, seller, date
- Badge trạng thái
- Nút "Đánh giá" / "Sửa đánh giá"
- Link đến chi tiết bài post

---

## 🔌 Cần tích hợp API

### 1. Tạo API client (5 phút)

**File:** `apps/web/lib/api/ratingApi.ts`

```typescript
import { api } from './client';

export async function getMyPurchases() {
  const res = await api.get('/my-purchases');
  return res.data;
}

export async function submitRating(data: {
  purchaseId: string;
  rating: number;
  comment: string;
}) {
  await api.post('/ratings', data);
}
```

### 2. Tạo React Query hook (5 phút)

**File:** `apps/web/hooks/useRatings.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyPurchases, submitRating } from '@/lib/api/ratingApi';
import { toast } from 'sonner';

export function useMyPurchases() {
  return useQuery({
    queryKey: ['my-purchases'],
    queryFn: getMyPurchases,
  });
}

export function useSubmitRating() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: submitRating,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-purchases'] });
      toast.success('Đánh giá thành công!');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra!');
    },
  });
}
```

### 3. Update page.tsx (2 phút)

**File:** `apps/web/app/(public)/my-purchases/page.tsx`

Thay đổi từ:
```typescript
const [purchases, setPurchases] = useState(mockPurchases);
```

Thành:
```typescript
const { data: purchases = [], isLoading } = useMyPurchases();
const submitRatingMutation = useSubmitRating();

const handleRatingSubmit = (purchaseId: string, rating: number, comment: string) => {
  submitRatingMutation.mutate({ purchaseId, rating, comment });
};
```

---

## 📋 Backend Checklist

Backend cần implement:

- [ ] **GET** `/api/my-purchases` - List bài đã mua
- [ ] **POST** `/api/ratings` - Tạo rating mới
- [ ] **PUT** `/api/ratings/:id` - Update rating (optional)
- [ ] **GET** `/api/posts/:id/ratings` - Ratings của 1 bài post (optional)

**Response format:** Xem file `types/rating.types.ts`

---

## 🎨 Demo

Hiện tại dùng **mock data** để xem trước UI:
1. Run dev server: `pnpm dev`
2. Vào: `http://localhost:3000/my-purchases`
3. Xem UI, test modal, search, filter

---

## 📚 Full Documentation

Xem chi tiết: `docs/rating-ui-implementation.md`
