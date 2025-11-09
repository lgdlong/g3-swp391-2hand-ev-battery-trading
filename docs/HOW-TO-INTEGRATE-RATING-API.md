# 🔌 Hướng dẫn tích hợp API Rating vào UI

## ✅ Đã chuẩn bị sẵn:

1. **Types**: `apps/web/types/rating.types.ts`
2. **API Client**: `apps/web/lib/api/ratingApi.ts`
3. **React Query Hooks**: `apps/web/hooks/useRatings.ts`

---

## 🚀 Cách tích hợp vào page.tsx

### Bước 1: Import hooks

Mở file: `apps/web/app/(public)/my-purchases/page.tsx`

Thêm import:
```typescript
import { useMyPurchases, useSubmitRating } from '@/hooks/useRatings';
```

### Bước 2: Replace mock data

**XÓA:**
```typescript
// XÓA dòng này:
const [purchases, setPurchases] = useState(mockPurchases);
```

**THAY BẰNG:**
```typescript
// Fetch real data từ API
const { data: purchases = [], isLoading } = useMyPurchases();

// Submit rating mutation
const submitRatingMutation = useSubmitRating();
```

### Bước 3: Update handleRatingSubmit

**XÓA:**
```typescript
// XÓA toàn bộ function handleRatingSubmit cũ (dòng 63-94)
const handleRatingSubmit = async (
  purchaseId: string,
  rating: number,
  comment: string
) => {
  setIsSubmitting(true);
  try {
    // ... mock code
  } catch (error) {
    // ...
  } finally {
    setIsSubmitting(false);
  }
};
```

**THAY BẰNG:**
```typescript
// Submit rating với real API
const handleRatingSubmit = (purchaseId: string, rating: number, comment: string) => {
  submitRatingMutation.mutate({
    postId: purchaseId, // hoặc purchaseId - tùy BE
    rating,
    comment,
  });
};
```

### Bước 4: Add loading state

Thêm loading UI trước return:
```typescript
if (isLoading) {
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );
}
```

### Bước 5: Update isSubmitting prop

Trong PurchaseCard component:
```typescript
<PurchaseCard
  key={purchase.id}
  purchase={purchase}
  onRatingSubmit={handleRatingSubmit}
  isSubmitting={submitRatingMutation.isPending} // ← Thay đổi này
/>
```

### Bước 6: Remove mock data & unused state

XÓA:
```typescript
// XÓA mock data (dòng 18-45)
const mockPurchases = [...];

// XÓA state không dùng
const [isSubmitting, setIsSubmitting] = useState(false);
```

---

## 📝 Code hoàn chỉnh sau khi tích hợp

```typescript
'use client';

import { useState } from 'react';
import { Package, Search, Filter, Loader2 } from 'lucide-react';
import { PurchaseCard } from './_components/PurchaseCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMyPurchases, useSubmitRating } from '@/hooks/useRatings';

export default function MyPurchasesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'rated' | 'not-rated'>('all');

  // ✅ Fetch data từ API
  const { data: purchases = [], isLoading } = useMyPurchases();
  
  // ✅ Submit rating mutation
  const submitRatingMutation = useSubmitRating();

  // Filter purchases based on search and status
  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch = purchase.postTitle
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'rated' && purchase.hasRated) ||
      (filterStatus === 'not-rated' && !purchase.hasRated);
    return matchesSearch && matchesFilter;
  });

  // ✅ Handle rating submission
  const handleRatingSubmit = (purchaseId: string, rating: number, comment: string) => {
    submitRatingMutation.mutate({
      postId: purchaseId, // hoặc purchaseId - tùy BE response
      rating,
      comment,
    });
  };

  // ✅ Loading state
  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* ... rest of UI ... */}
      
      <div className="space-y-4">
        {filteredPurchases.map((purchase) => (
          <PurchaseCard
            key={purchase.id}
            purchase={purchase}
            onRatingSubmit={handleRatingSubmit}
            isSubmitting={submitRatingMutation.isPending}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 🔧 Điều chỉnh theo BE

### Nếu BE trả về format khác:

**Ví dụ 1: BE trả về array trực tiếp**
```typescript
// Trong ratingApi.ts, sửa:
export async function getMyPurchases(): Promise<Purchase[]> {
  const response = await api.get<Purchase[]>('/my-purchases');
  return response.data; // ← Không có .purchases
}
```

**Ví dụ 2: BE dùng field khác tên**
```typescript
// Trong rating.types.ts, thêm mapping:
export interface BackendPurchase {
  transaction_id: string;
  post_id: string;
  // ... other fields
}

// Transform trong API function
```

**Ví dụ 3: BE cần purchaseId thay vì postId**
```typescript
// Trong handleRatingSubmit:
submitRatingMutation.mutate({
  purchaseId: purchaseId, // ← Đổi field
  rating,
  comment,
});
```

---

## 🎯 Checklist trước khi test

- [ ] BE đã có endpoint `/api/my-purchases` hoặc tương tự
- [ ] BE đã có endpoint `POST /api/ratings`
- [ ] Types trong `rating.types.ts` match với BE response
- [ ] Đã import hooks vào `page.tsx`
- [ ] Đã xóa mock data và state cũ
- [ ] Đã test với Postman/curl xem BE response ra sao
- [ ] Environment variable `NEXT_PUBLIC_API_URL` đã đúng

---

## 🐛 Troubleshooting

**Lỗi: "Cannot find module '@/hooks/useRatings'"**
→ Restart dev server: `pnpm dev`

**Lỗi: 401 Unauthorized**
→ Check JWT token trong localStorage, đảm bảo user đã login

**Lỗi: 404 Not Found**
→ Kiểm tra endpoint URL trong `ratingApi.ts` match với BE

**Data không hiện**
→ Check console, xem API response format có đúng không

---

## 📞 Khi BE ready

1. **Update endpoint URLs** trong `ratingApi.ts` nếu cần
2. **Uncomment code** trong `page.tsx` (import hooks, replace mock data)
3. **Test API** với Postman trước
4. **Refresh page** và check Network tab xem API call có thành công không
5. **Submit rating** và check có invalidate query không

Done! 🎉
