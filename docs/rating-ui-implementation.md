# Rating UI Implementation Guide

## 📍 Vị trí UI

UI Rating đã được tạo tại: **`apps/web/app/(public)/my-purchases/`**

### Cấu trúc Files

```
apps/web/app/(public)/my-purchases/
├── page.tsx                        # Main page - Danh sách bài đã mua
└── _components/
    ├── index.ts                    # Export components
    ├── RatingModal.tsx             # Modal đánh giá (0-5 sao + textarea)
    └── PurchaseCard.tsx            # Card hiển thị mỗi bài đã mua
```

---

## 🎨 UI Components

### 1. **RatingModal** - Modal đánh giá

**Features:**
- ⭐ 5 sao để chọn rating (0-5)
- 📝 Textarea lớn (min-height: 150px, max 1000 ký tự)
- 🎯 Hover effect trên sao
- ✅ Validation: Phải chọn rating trước khi submit
- 🔄 Loading state khi đang submit

**Props:**
```typescript
interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  postTitle?: string;
  isSubmitting?: boolean;
}
```

**Usage:**
```tsx
<RatingModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSubmit={(rating, comment) => handleSubmit(rating, comment)}
  postTitle="Pin xe máy điện VinFast"
  isSubmitting={isSubmitting}
/>
```

---

### 2. **PurchaseCard** - Card bài đã mua

**Features:**
- 🖼️ Thumbnail image
- 📋 Thông tin: Title, Price, Seller, Purchase Date
- 🏷️ Badge trạng thái: "Đã đánh giá" / "Chưa đánh giá"
- 🔘 Nút "Đánh giá" (primary) hoặc "Sửa đánh giá" (outline) nếu đã đánh giá
- 🔗 Link đến chi tiết bài post

**Props:**
```typescript
interface PurchaseCardProps {
  purchase: {
    id: string;              // Purchase ID
    postId: string;          // Post ID
    postTitle: string;
    postPrice: string;
    postImages?: Array<{ url: string; public_id: string }>;
    sellerName: string;
    purchasedAt: string;     // ISO date string
    hasRated?: boolean;      // Đã đánh giá chưa
    userRating?: number;     // Rating đã cho (1-5)
    userComment?: string;    // Comment đã có
  };
  onRatingSubmit: (purchaseId: string, rating: number, comment: string) => void;
  isSubmitting?: boolean;
}
```

---

### 3. **MyPurchasesPage** - Trang chính

**Features:**
- 📊 Stats cards: Tổng giao dịch, Đã đánh giá, Chưa đánh giá
- 🔍 Search bar: Tìm kiếm theo tên bài post
- 🎛️ Filter: All / Đã đánh giá / Chưa đánh giá
- 📜 List các PurchaseCard
- 🎭 Empty state khi không có data

**Current URL:** `/my-purchases`

---

## 🔌 Tích hợp với Backend

### API Endpoints cần thiết

#### 1. **GET /api/my-purchases** - Lấy danh sách đã mua

**Response:**
```typescript
{
  purchases: Array<{
    id: string;
    postId: string;
    postTitle: string;
    postPrice: string;
    postImages: Array<{ url: string; public_id: string }>;
    sellerId: number;
    sellerName: string;
    purchasedAt: string; // ISO date
    hasRated: boolean;
    rating?: {
      score: number;      // 1-5
      comment: string;
      createdAt: string;
    };
  }>;
}
```

#### 2. **POST /api/ratings** - Gửi rating mới

**Request:**
```typescript
{
  purchaseId: string;   // hoặc postId
  rating: number;       // 1-5
  comment: string;      // max 1000 chars
}
```

**Response:**
```typescript
{
  id: string;
  purchaseId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
```

#### 3. **PUT /api/ratings/:id** - Cập nhật rating (nếu đã có)

**Request:**
```typescript
{
  rating: number;       // 1-5
  comment: string;
}
```

---

## 🔧 Cách tích hợp API

### Bước 1: Tạo API client functions

Tạo file: `apps/web/lib/api/ratingApi.ts`

```typescript
import { api } from './client';

export interface Purchase {
  id: string;
  postId: string;
  postTitle: string;
  postPrice: string;
  postImages?: Array<{ url: string; public_id: string }>;
  sellerName: string;
  purchasedAt: string;
  hasRated?: boolean;
  userRating?: number;
  userComment?: string;
}

export interface RatingSubmitDto {
  purchaseId: string;
  rating: number;
  comment: string;
}

/**
 * Get list of user's purchases
 */
export async function getMyPurchases(): Promise<Purchase[]> {
  const response = await api.get<{ purchases: Purchase[] }>('/my-purchases');
  return response.data.purchases;
}

/**
 * Submit rating for a purchase
 */
export async function submitRating(data: RatingSubmitDto): Promise<void> {
  await api.post('/ratings', data);
}

/**
 * Update existing rating
 */
export async function updateRating(
  ratingId: string,
  data: { rating: number; comment: string }
): Promise<void> {
  await api.put(`/ratings/${ratingId}`, data);
}
```

---

### Bước 2: Tạo React Query hooks

Tạo file: `apps/web/hooks/useRatings.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyPurchases, submitRating, updateRating, type RatingSubmitDto } from '@/lib/api/ratingApi';
import { toast } from 'sonner';

/**
 * Fetch user's purchases
 */
export function useMyPurchases() {
  return useQuery({
    queryKey: ['my-purchases'],
    queryFn: getMyPurchases,
  });
}

/**
 * Submit new rating
 */
export function useSubmitRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitRating,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-purchases'] });
      toast.success('Đánh giá của bạn đã được gửi thành công!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá';
      toast.error(message);
    },
  });
}

/**
 * Update existing rating
 */
export function useUpdateRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ratingId, data }: { ratingId: string; data: { rating: number; comment: string } }) =>
      updateRating(ratingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-purchases'] });
      toast.success('Đánh giá của bạn đã được cập nhật!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật đánh giá';
      toast.error(message);
    },
  });
}
```

---

### Bước 3: Update page.tsx với real API

Cập nhật file: `apps/web/app/(public)/my-purchases/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Package, Search, Filter, Loader2 } from 'lucide-react';
import { PurchaseCard } from './_components/PurchaseCard';
import { useMyPurchases, useSubmitRating } from '@/hooks/useRatings';
// ... other imports

export default function MyPurchasesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'rated' | 'not-rated'>('all');

  // Fetch purchases from API
  const { data: purchases = [], isLoading } = useMyPurchases();

  // Submit rating mutation
  const submitRatingMutation = useSubmitRating();

  // Filter purchases
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

  // Handle rating submission
  const handleRatingSubmit = (purchaseId: string, rating: number, comment: string) => {
    submitRatingMutation.mutate({ purchaseId, rating, comment });
  };

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
      {/* ... rest of the UI ... */}
      
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

## 📱 Responsive Design

UI đã được thiết kế responsive:
- ✅ Mobile: Stack layout, full-width buttons
- ✅ Tablet: 2-column grid cho info
- ✅ Desktop: Horizontal card layout với action buttons bên phải

---

## 🎯 User Flow

1. User vào trang **"Bài đăng đã mua"** (`/my-purchases`)
2. Xem danh sách các bài post đã mua
3. Click nút **"Đánh giá"** trên bài chưa được đánh giá
4. Modal hiện ra với 5 sao và textarea
5. Chọn số sao (1-5) và nhập comment (optional)
6. Click **"Gửi đánh giá"**
7. API gọi về BE → Toast success
8. Card cập nhật trạng thái → Badge "Đã đánh giá"
9. Nút đổi thành **"Sửa đánh giá"** (outline variant)

---

## 🚀 Next Steps

### Backend cần implement:

1. **Entities/Models:**
   - `Rating` entity (id, purchaseId/postId, buyerId, sellerId, rating, comment, createdAt)
   - Relation với `Post` và `Account`

2. **Endpoints:**
   - `GET /my-purchases` - Lấy danh sách đã mua (có thể base trên `Contract` entity)
   - `POST /ratings` - Tạo rating mới
   - `PUT /ratings/:id` - Update rating
   - `GET /posts/:id/ratings` - Lấy ratings của 1 post (để hiện trên post detail)

3. **Business Logic:**
   - Validate: Chỉ buyer của bài post mới được rate
   - Check duplicate: Mỗi buyer chỉ rate 1 lần cho 1 post
   - Calculate average rating cho post/seller

### Frontend TODOs:

- [ ] Tạo `ratingApi.ts` client functions
- [ ] Tạo `useRatings.ts` hooks
- [ ] Update `page.tsx` với real API calls
- [ ] Add link vào Navigation/User menu
- [ ] Add rating display trên Post Detail page (`/posts/ev/[id]`)
- [ ] Add seller rating stats trên Seller Profile

---

## 📝 Notes

- **Mock data** hiện tại đang dùng trong `page.tsx` - Replace bằng API call thật
- **Icon** dùng từ `lucide-react`
- **UI Components** dùng shadcn/ui
- **Styling** dùng Tailwind CSS
- **Form state** được quản lý bằng React useState
- **Toast notifications** dùng `sonner`

---

## 🎨 Screenshots Reference

### RatingModal:
- 5 sao hover effect màu vàng
- Textarea lớn với character counter
- Guideline: 1-5 sao với ý nghĩa
- 2 buttons: Hủy (outline) + Gửi đánh giá (primary)

### PurchaseCard:
- Thumbnail bên trái (hoặc trên mobile)
- Thông tin post ở giữa
- Action buttons bên phải (hoặc dưới mobile)
- Badge trạng thái: Đã/Chưa đánh giá

### MyPurchasesPage:
- Header với icon Package
- 3 stats cards
- Search + Filter bar
- List PurchaseCards với spacing
- Empty state khi không có data

---

## 🔗 Related Files

- `apps/web/lib/utils.ts` - Added `formatCurrency()` và `formatDate()`
- `apps/web/components/ui/dialog.tsx` - Dialog component (shadcn)
- `apps/web/components/ui/button.tsx` - Button component (shadcn)
- `apps/web/components/ui/textarea.tsx` - Textarea component (shadcn)

---

**URL để test:** `http://localhost:3000/my-purchases`

**Backend BE đã có** → Chỉ cần wire up API endpoints! 🎉
