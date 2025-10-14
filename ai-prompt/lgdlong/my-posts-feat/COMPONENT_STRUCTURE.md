# My Posts Page - Component Structure

```
my-posts/
├── page.tsx                          # Main page component
├── _components/
│   ├── index.ts                       # Barrel export file
│   ├── search-bar.tsx                 # Search & sort controls
│   ├── post-list-item.tsx            # Individual post card
│   ├── post-detail-dialog.tsx         # Post detail modal
│   ├── delete-confirm-dialog.tsx      # Delete confirmation modal
│   ├── empty-state.tsx                # Empty state message
│   ├── post-list-skeleton.tsx         # Loading skeleton
│   └── pagination.tsx                 # Pagination controls
└── REFACTORING_SUMMARY.md            # This documentation
```

## Component Hierarchy

```
MyListingsPage (page.tsx)
├── TooltipProvider
    ├── div.container
        ├── div.header
        │   ├── h1 "Quản lý tin đăng"
        │   └── SearchBar
        │       ├── Search Input
        │       ├── Sort Dropdown
        │       └── Create Button
        │
        ├── Tabs
        │   ├── TabsList
        │   │   ├── TabsTrigger (PENDING_REVIEW) + Badge
        │   │   ├── TabsTrigger (PUBLISHED) + Badge
        │   │   ├── TabsTrigger (REJECTED) + Badge
        │   │   └── TabsTrigger (SOLD) + Badge
        │   │
        │   └── TabsContent (for each status)
        │       ├── PostListSkeleton (if loading)
        │       ├── Error Message (if error)
        │       ├── EmptyState (if no posts)
        │       └── Post List + Pagination (if has posts)
        │           ├── PostListItem (multiple)
        │           │   ├── Image
        │           │   ├── Title + StatusBadge
        │           │   ├── Price, Location, Date
        │           │   └── Action Buttons
        │           │       ├── Edit (DRAFT/REJECTED)
        │           │       ├── Delete (DRAFT/REJECTED)
        │           │       ├── View (PENDING/PUBLISHED/SOLD)
        │           │       └── Mark as Sold (PUBLISHED)
        │           │
        │           └── Pagination
        │               ├── Previous Button
        │               ├── Page Indicator
        │               └── Next Button
        │
        ├── DeleteConfirmDialog
        │   ├── Dialog Title
        │   ├── Dialog Description
        │   └── Action Buttons (Cancel, Delete)
        │
        └── PostDetailDialog
            ├── Dialog Title
            ├── Post Image
            ├── Title + Status Badge
            ├── Price
            ├── Vehicle Details Grid
            ├── Location
            ├── Description
            ├── Dates
            └── Close Button
```

## Data Flow

### Loading Posts
1. User lands on page or changes filters
2. `useQuery` fetches data from `/posts/my`
3. While loading: `PostListSkeleton` shown
4. On success: Posts rendered with `PostListItem`
5. On error: Error message displayed
6. If empty: `EmptyState` shown

### Deleting a Post
1. User clicks Delete button on `PostListItem`
2. `handleDelete` sets `postToDelete` and opens dialog
3. User confirms in `DeleteConfirmDialog`
4. `deleteMutation` calls API
5. On success:
   - Toast notification
   - Query cache invalidated
   - List automatically refreshes
6. Dialog closes

### Marking as Sold
1. User clicks "Đã bán" button on `PostListItem`
2. `handleMarkAsSold` triggers mutation
3. API updates post status to 'SOLD'
4. On success:
   - Toast notification
   - Cache invalidated
   - Post moves to SOLD tab

### Viewing Details
1. User clicks View button on `PostListItem`
2. `handleViewDetail` sets `postToView` and opens dialog
3. `PostDetailDialog` displays full post information
4. User clicks Close or outside to dismiss

## Props Interface Reference

### SearchBar
```typescript
{
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy?: 'newest' | 'oldest' | 'price-asc' | 'price-desc';
  onSortChange: (sort: ...) => void;
  onCreateNew?: () => void;
}
```

### PostListItem
```typescript
{
  post: Post;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onView?: (post: Post) => void;
  onMarkAsSold?: (postId: string) => void;
}
```

### PostDetailDialog
```typescript
{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post | null;
}
```

### DeleteConfirmDialog
```typescript
{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}
```

### EmptyState
```typescript
{
  status: string;
}
```

### Pagination
```typescript
{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
```

## State Management

### Local State (useState)
- `activeTab`: Current status filter
- `searchQuery`: Search text
- `sortBy`: Sort option
- `currentPage`: Current page number
- `deleteDialogOpen`: Delete dialog visibility
- `postToDelete`: ID of post to delete
- `viewDialogOpen`: View dialog visibility
- `postToView`: Post to view in dialog

### Server State (useQuery)
- `postsData`: Paginated posts response
- `isLoading`: Loading state
- `error`: Error state

### Mutations (useMutation)
- `deleteMutation`: Delete post
- `markAsSoldMutation`: Update post status

## Styling Approach

- **Tailwind CSS** for all styling
- **shadcn/ui** components for consistency
- **Mobile-first** responsive design
- **Dark mode** support via Tailwind classes
- **Consistent spacing** using Tailwind spacing scale
