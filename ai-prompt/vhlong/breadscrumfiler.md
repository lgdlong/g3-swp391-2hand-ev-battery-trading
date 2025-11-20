# Breadcrumb Filter Feature - Q&A

## Question 1: Breadcrumb Filter Implementation

**Prompt:**
Now, when you go to the electric vehicle section on the navbar, the search bar will no longer include the filter. Instead, below the search bar, there will be a search filter based on user actions. For example, if the user selects the VF3 electric vehicle, the search filter line will read: electric vehicle -> VF3. When the user clicks on the 'electric vehicle' line in the filter again, it will return to the electric vehicle section without VF3. Just implement this in the component part only, do not touch the backend or database files.

**Answer:**

### 1. BreadcrumbFilter Component
```typescript
// apps/web/components/breadcrumb-filter/BreadcrumbFilter.tsx
'use client';

import React from 'react';
import { Home, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from './types';

interface BreadcrumbFilterProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbFilter({ items, className }: BreadcrumbFilterProps) {
  if (items.length === 0) return null;

  return (
    <nav className={cn('flex items-center space-x-1 text-sm', className)}>
      <button
        onClick={() => window.location.href = '/'}
        className="hover:text-gray-700 transition-colors duration-200"
      >
        <Home className="h-4 w-4 text-gray-500" />
      </button>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className={cn(
                "font-medium px-2 py-1 rounded-md transition-colors duration-200 hover:bg-gray-50",
                index === items.length - 1
                  ? "text-gray-600 bg-gray-100" // Item cuối cùng (đã chọn) - màu xám với background
                  : "text-gray-900 hover:text-gray-700" // Item bình thường có thể click
              )}
            >
              {item.label}
            </button>
          ) : (
            <span className={cn(
              "font-medium px-2 py-1 rounded-md transition-colors duration-200",
              index === items.length - 1
                ? "text-gray-600 bg-gray-100" // Item cuối cùng (đã chọn) - màu xám với background
                : "text-gray-900" // Item bình thường
            )}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
```

### 2. useBreadcrumb Hook
```typescript
// apps/web/components/breadcrumb-filter/useBreadcrumb.ts
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BreadcrumbState } from './types';

export function useBreadcrumb(type: 'battery' | 'ev' = 'ev') {
  const router = useRouter();

  const [breadcrumbState, setBreadcrumbState] = useState<BreadcrumbState>({
    items: [],
    currentCategory: null,
    currentSubcategory: null,
  });

  const setCategory = useCallback(
    (category: string) => {
      setBreadcrumbState((prev) => ({
        ...prev,
        currentCategory: category,
        currentSubcategory: null,
        items: [
          {
            label: category,
            onClick: () => {
              if (type === 'ev' && category === 'Xe điện') {
                router.push('/posts/ev');
              } else if (type === 'battery' && category === 'Pin EV') {
                router.push('/posts/batteries');
              }
            },
          },
        ],
      }));
    },
    [type, router],
  );

  const setSubcategory = useCallback(
    (subcategory: string) => {
      setBreadcrumbState((prev) => ({
        ...prev,
        currentSubcategory: subcategory,
        items: [
          {
            label: prev.currentCategory || 'Trang chủ',
            onClick: () => {
              if (type === 'ev' && prev.currentCategory === 'Xe điện') {
                router.push('/posts/ev');
              } else if (type === 'battery' && prev.currentCategory === 'Pin EV') {
                router.push('/posts/batteries');
              }
            },
          },
          {
            label: subcategory,
          },
        ],
      }));
    },
    [type, router],
  );

  return {
    breadcrumbState,
    setCategory,
    setSubcategory,
  };
}
```

### 3. Types
```typescript
// apps/web/components/breadcrumb-filter/types.ts
export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbState {
  items: BreadcrumbItem[];
  currentCategory: string | null;
  currentSubcategory: string | null;
}
```

**Key Features:**
- ✅ Breadcrumb hiển thị đường dẫn điều hướng (ví dụ: Xe điện -> VF3)
- ✅ Click vào item đầu tiên sẽ quay lại trang danh sách
- ✅ Item cuối cùng (đã chọn) có màu xám với background để phân biệt
- ✅ Hỗ trợ cả EV và Battery sections
- ✅ Tích hợp với Next.js router để điều hướng

---

## Question 2: Move Criteria Selection Section

**Prompt:**
Move the criteria selection section closer to the search bar, not near the post, and remove the 'back to list' section from the post.

**Answer:**

### Solution:
1. Di chuyển `FilterButtons` component lên trên, ngay sau search bar
2. Xóa phần "back to list" khỏi post detail page
3. Sử dụng breadcrumb để điều hướng thay vì nút "back to list"

**Implementation:**
```typescript
// Trong trang posts/ev/page.tsx hoặc posts/batteries/page.tsx
<div className="container mx-auto px-4 py-6">
  {/* Search Bar */}
  <SearchBar />
  
  {/* FilterButtons với breadcrumb - di chuyển lên trên */}
  <FilterButtons
    type="ev"
    breadcrumbItems={breadcrumbState.items}
    onFilterChange={handleFilterChange}
  />
  
  {/* Post List */}
  <PostGrid posts={filteredPosts} />
</div>
```

**Changes:**
- ✅ FilterButtons được đặt ngay sau SearchBar
- ✅ Breadcrumb hiển thị trong FilterButtons component
- ✅ Xóa nút "back to list" khỏi post detail page
- ✅ Sử dụng breadcrumb để điều hướng

---

## Question 3: Fix Module Not Found Error

**Prompt:**
Module not found: Can't resolve './BreadcrumbFilter'

./apps/web/components/searchbar/searchbar.tsx (111:1)

Module not found: Can't resolve './BreadcrumbFilter'
  109 | export { PriceFilter } from './PriceFilter';
  110 | export { FilterDropdown } from './FilterDropdown';
> 111 | export { BreadcrumbFilter } from './BreadcrumbFilter';
      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

**Answer:**

### Solution:
`BreadcrumbFilter` không nằm trong folder `searchbar`, nó nằm trong folder `breadcrumb-filter`. Cần xóa export này khỏi `searchbar.tsx` hoặc import từ đúng path.

**Fix:**
```typescript
// apps/web/components/searchbar/searchbar.tsx
// Xóa dòng này:
// export { BreadcrumbFilter } from './BreadcrumbFilter';

// Nếu cần import BreadcrumbFilter, import từ đúng path:
// import { BreadcrumbFilter } from '@/components/breadcrumb-filter/BreadcrumbFilter';
```

**Correct Import Path:**
```typescript
// Import từ đúng location
import { BreadcrumbFilter } from '@/components/breadcrumb-filter/BreadcrumbFilter';
import { useBreadcrumb } from '@/components/breadcrumb-filter/useBreadcrumb';
```

**File Structure:**
```
components/
├── searchbar/
│   ├── searchbar.tsx          # Không export BreadcrumbFilter
│   ├── PriceFilter.tsx
│   └── FilterDropdown.tsx
└── breadcrumb-filter/
    ├── BreadcrumbFilter.tsx   # Component chính
    ├── useBreadcrumb.ts       # Hook
    └── types.ts               # Types
```
