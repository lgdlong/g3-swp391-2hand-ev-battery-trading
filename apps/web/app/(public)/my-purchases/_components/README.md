# Rating Components

Components for the rating/review feature after purchase.

## Components

### `RatingModal.tsx`
Modal popup for rating a purchased item.

**Features:**
- 5-star rating selector with hover effects
- Large textarea for comments (max 1000 chars)
- Character counter
- Rating guidelines
- Loading state support

**Props:**
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  postTitle?: string;
  isSubmitting?: boolean;
}
```

### `PurchaseCard.tsx`
Card component displaying a purchased item with rating action.

**Features:**
- Thumbnail image
- Post info (title, price, seller, date)
- Rating status badges
- "Rate" or "Edit Rating" button
- Link to post detail

**Props:**
```typescript
{
  purchase: {
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
  };
  onRatingSubmit: (purchaseId: string, rating: number, comment: string) => void;
  isSubmitting?: boolean;
}
```

## Usage

```tsx
import { RatingModal, PurchaseCard } from './_components';

// In your component
<PurchaseCard
  purchase={purchase}
  onRatingSubmit={handleRatingSubmit}
  isSubmitting={isSubmitting}
/>
```

## Dependencies

- `@/components/ui/*` - shadcn/ui components
- `lucide-react` - Icons
- `sonner` - Toast notifications
