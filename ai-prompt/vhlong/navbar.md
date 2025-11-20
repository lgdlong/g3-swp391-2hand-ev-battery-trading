# Navbar Component Refactoring - Q&A

## Question: Move Searchbar and Navbar Out of UI Folder

**Prompt:**
i just move searchbar and navbar out of ui , in the component, check these files that have wrong import

**Answer:**

### Solution:
Sau khi di chuyển `searchbar` và `navbar` ra khỏi folder `ui`, cần cập nhật tất cả các import statements trong codebase.

### 1. Correct Import Paths

**Navbar:**
```typescript
// ✅ Correct import
import { Navbar } from '@/components/navbar/navbar';

// ❌ Old import (sai)
import { Navbar } from '@/components/ui/navbar';
```

**Searchbar:**
```typescript
// ✅ Correct import
import { SearchBar } from '@/components/searchbar/searchbar';

// ❌ Old import (sai)
import { SearchBar } from '@/components/ui/searchbar';
```

### 2. Files That Need to Be Updated

#### Layout Files:
```typescript
// apps/web/app/(public)/layout.tsx
import { Navbar } from '@/components/navbar/navbar';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
```

#### Post Pages:
```typescript
// apps/web/app/(public)/posts/layout.tsx hoặc page.tsx
import { SearchBar } from '@/components/searchbar/searchbar';

export default function PostsPage() {
  return (
    <div>
      <SearchBar />
      {/* Other content */}
    </div>
  );
}
```

### 3. Component Structure

**New Structure:**
```
components/
├── navbar/
│   ├── navbar.tsx
│   ├── Logo.tsx
│   ├── navigation.tsx
│   ├── UserActions.tsx
│   ├── UserSidebar.tsx
│   └── index.ts
└── searchbar/
    ├── searchbar.tsx
    ├── LocationSelector.tsx
    ├── PriceFilter.tsx
    ├── FilterDropdown.tsx
    └── index.ts
```

### 4. Export from Index Files

**Navbar Index:**
```typescript
// apps/web/components/navbar/index.ts
export { Navbar } from './navbar';
export { Logo } from './Logo';
export { Navigation } from './navigation';
export { UserActions } from './UserActions';
export { UserSidebar } from './UserSidebar';
```

**Searchbar Index:**
```typescript
// apps/web/components/searchbar/index.ts
export { SearchBar } from './searchbar';
export { LocationSelector } from './LocationSelector';
export { PriceFilter } from './PriceFilter';
export { FilterDropdown } from './FilterDropdown';
```

### 5. Common Import Errors to Fix

**Error 1: Wrong path**
```typescript
// ❌ Wrong
import { Navbar } from '@/components/ui/navbar';

// ✅ Correct
import { Navbar } from '@/components/navbar/navbar';
// hoặc
import { Navbar } from '@/components/navbar';
```

**Error 2: Missing export**
```typescript
// Đảm bảo component được export đúng
export function Navbar() { ... }
// hoặc
export { Navbar };
```

**Error 3: Circular dependency**
```typescript
// Tránh import vòng tròn
// navbar.tsx không nên import từ searchbar.tsx và ngược lại
```

### 6. Verification Steps

1. ✅ Kiểm tra tất cả files import `Navbar` hoặc `SearchBar`
2. ✅ Cập nhật import paths từ `@/components/ui/...` sang `@/components/navbar/...` hoặc `@/components/searchbar/...`
3. ✅ Đảm bảo index.ts files export đúng components
4. ✅ Chạy build để kiểm tra lỗi import
5. ✅ Test navigation và search functionality

### 7. Files to Check

Các file cần kiểm tra và cập nhật:
- `apps/web/app/(public)/layout.tsx`
- `apps/web/app/(public)/posts/layout.tsx`
- `apps/web/app/(public)/posts/ev/page.tsx`
- `apps/web/app/(public)/posts/batteries/page.tsx`
- `apps/web/app/(public)/menu/layout.tsx`
- Bất kỳ file nào import từ `@/components/ui/navbar` hoặc `@/components/ui/searchbar`

### 8. Quick Fix Script

Nếu có nhiều files cần fix, có thể dùng find & replace:
- Find: `@/components/ui/navbar`
- Replace: `@/components/navbar`
- Find: `@/components/ui/searchbar`
- Replace: `@/components/searchbar`
