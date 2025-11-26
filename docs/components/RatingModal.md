# RatingModal Component

Shared component để đánh giá/review bài post sau khi mua.

## 📍 Location

`apps/web/components/RatingModal.tsx`

---

## 🎨 Features

- ⭐ **5-star rating selector** với hover effects
- 📝 **Large textarea** cho comments (max 1000 chars)
- 🔢 **Character counter**
- 📋 **Rating guidelines** (1-5 sao với ý nghĩa)
- ⏳ **Loading state** support
- ✅ **Validation**: Phải chọn rating trước khi submit
- 🔄 **Auto reset** state khi đóng modal

---

## 📦 Props

```typescript
interface RatingModalProps {
  isOpen: boolean;        // Control modal visibility
  onClose: () => void;    // Callback khi đóng modal
  onSubmit: (rating: number, comment: string) => void; // Callback khi submit
  postTitle?: string;     // Tên bài post (hiển thị trong description)
  isSubmitting?: boolean; // Loading state khi đang submit
}
```

---

## 🚀 Usage

### Basic Example

```tsx
import { useState } from 'react';
import { RatingModal } from '@/components/RatingModal';
import { useSubmitRating } from '@/hooks/useRatings';
import { toast } from 'sonner';

export default function MyComponent() {
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const submitRatingMutation = useSubmitRating();

  const handleRatingSubmit = (rating: number, comment: string) => {
    submitRatingMutation.mutate(
      { postId: 'post-123', rating, comment },
      {
        onSuccess: () => {
          setIsRatingModalOpen(false);
          toast.success('Đánh giá thành công!');
        },
      }
    );
  };

  return (
    <>
      <button onClick={() => setIsRatingModalOpen(true)}>
        Đánh giá
      </button>

      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
        postTitle="Pin xe máy điện VinFast Klara"
        isSubmitting={submitRatingMutation.isPending}
      />
    </>
  );
}
```

---

## 📍 Use Cases

### 1. Post Detail Page

Hiển thị nút "Đánh giá" trên trang chi tiết bài post (nếu user đã mua):

```tsx
// app/(public)/posts/ev/[id]/page.tsx
import { RatingModal } from '@/components/RatingModal';

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const { data: post } = usePost(params.id);
  const submitRating = useSubmitRating();

  // Check if user has purchased this post
  const userHasPurchased = true; // TODO: Check từ API

  return (
    <div>
      {/* Post content */}
      
      {userHasPurchased && (
        <button onClick={() => setIsRatingModalOpen(true)}>
          ⭐ Đánh giá sản phẩm
        </button>
      )}

      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={(rating, comment) => {
          submitRating.mutate({ postId: params.id, rating, comment });
        }}
        postTitle={post?.title}
        isSubmitting={submitRating.isPending}
      />
    </div>
  );
}
```

---

### 2. My Posts Management Page

User xem lại các bài đã mua và đánh giá:

```tsx
// app/(public)/my-posts/page.tsx
import { RatingModal } from '@/components/RatingModal';

export default function MyPostsPage() {
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const { data: posts } = useMyPosts();
  const submitRating = useSubmitRating();

  return (
    <div>
      {posts?.map((post) => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          {!post.hasRated && (
            <button onClick={() => setSelectedPost(post.id)}>
              Đánh giá
            </button>
          )}
        </div>
      ))}

      <RatingModal
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        onSubmit={(rating, comment) => {
          submitRating.mutate({ postId: selectedPost!, rating, comment });
        }}
        postTitle={posts?.find(p => p.id === selectedPost)?.title}
        isSubmitting={submitRating.isPending}
      />
    </div>
  );
}
```

---

### 3. Order Complete Page

Sau khi thanh toán thành công:

```tsx
// app/(public)/orders/[id]/complete/page.tsx
import { RatingModal } from '@/components/RatingModal';

export default function OrderCompletePage() {
  const [showRating, setShowRating] = useState(false);

  return (
    <div>
      <h1>✅ Giao dịch thành công!</h1>
      <button onClick={() => setShowRating(true)}>
        Đánh giá ngay
      </button>

      <RatingModal
        isOpen={showRating}
        onClose={() => setShowRating(false)}
        onSubmit={(rating, comment) => {
          // Submit rating
        }}
      />
    </div>
  );
}
```

---

## 🎨 Styling

Component sử dụng:
- **shadcn/ui** components (Dialog, Button, Textarea, Label)
- **Tailwind CSS** utilities
- **lucide-react** icons (Star)
- **Responsive design** built-in

---

## 🔌 Integration with API

### Connect với hooks

```tsx
import { RatingModal } from '@/components/RatingModal';
import { useSubmitRating } from '@/hooks/useRatings';

function MyComponent() {
  const submitRatingMutation = useSubmitRating();

  const handleSubmit = (rating: number, comment: string) => {
    submitRatingMutation.mutate({
      postId: 'post-123',
      rating,
      comment,
    });
  };

  return (
    <RatingModal
      isOpen={true}
      onClose={() => {}}
      onSubmit={handleSubmit}
      isSubmitting={submitRatingMutation.isPending}
    />
  );
}
```

---

## 🎯 Behavior

1. **Open modal** → Khởi tạo rating = 0, comment = ''
2. **User chọn sao** → Update rating state
3. **User nhập comment** → Update comment state (max 1000 chars)
4. **Click "Gửi đánh giá"**:
   - Validate: rating > 0
   - Call onSubmit(rating, comment)
   - Không tự đóng modal (để parent component handle success)
5. **Click "Hủy" hoặc close** → Reset state về 0

---

## ⚠️ Notes

- Component **không tự handle API calls** - parent phải truyền onSubmit handler
- **Không tự đóng modal** sau submit - parent phải đóng trong onSuccess callback
- **Reset state** tự động khi đóng modal
- **Textarea** có giới hạn 1000 ký tự
- **Rating validation** - phải chọn ít nhất 1 sao mới submit được

---

## 📚 Related Files

- **API Client**: `apps/web/lib/api/ratingApi.ts`
- **React Query Hooks**: `apps/web/hooks/useRatings.ts`
- **Types**: `apps/web/types/rating.types.ts`
- **Integration Guide**: `docs/HOW-TO-INTEGRATE-RATING-API.md`

---

## 🎉 Example với full flow

```tsx
'use client';

import { useState } from 'react';
import { RatingModal } from '@/components/RatingModal';
import { useSubmitRating } from '@/hooks/useRatings';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

export default function PostWithRating({ postId, postTitle }: { postId: string; postTitle: string }) {
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const submitRatingMutation = useSubmitRating();

  const handleRatingSubmit = (rating: number, comment: string) => {
    submitRatingMutation.mutate(
      {
        postId,
        rating,
        comment,
      },
      {
        onSuccess: () => {
          // Đóng modal sau khi thành công
          setIsRatingModalOpen(false);
        },
        // onError được handle trong hook (toast error)
      }
    );
  };

  return (
    <div>
      <Button onClick={() => setIsRatingModalOpen(true)} className="gap-2">
        <Star className="h-4 w-4" />
        Đánh giá sản phẩm
      </Button>

      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
        postTitle={postTitle}
        isSubmitting={submitRatingMutation.isPending}
      />
    </div>
  );
}
```

---

**Component location:** `apps/web/components/RatingModal.tsx`  
**Import:** `import { RatingModal } from '@/components/RatingModal';`
