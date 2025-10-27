# Fee Tiers Admin - Component Structure

## Overview

The fee tiers admin page has been refactored into smaller, maintainable components following the same pattern as the posts admin page.

## File Structure

```
apps/web/app/(dashboard)/admin/feetiers/
├── page.tsx                    # Main page component (215 lines)
└── _components/
    ├── index.ts               # Component exports
    ├── FeeTierStatsCards.tsx  # Statistics cards component
    ├── FeeTierTable.tsx       # Data table component
    ├── FeeTierDialog.tsx      # Add/Edit dialog component
    └── FeeTierActions.tsx     # Delete confirmation component
```

## Component Breakdown

### 1. Main Page (`page.tsx`)

**Purpose**: Main container that manages state and orchestrates all components
**Responsibilities**:

- State management (feeTiers, loading, error, dialogs)
- API calls (fetch, create, update, delete)
- Event handlers and business logic
- Loading and error states

**Key Features**:

- 215 lines (reduced from 451 lines)
- Clean separation of concerns
- Type-safe error handling
- Centralized state management

### 2. FeeTierStatsCards (`FeeTierStatsCards.tsx`)

**Purpose**: Display statistics cards
**Props**:

- `feeTiers: FeeTier[]` - Array of fee tiers for calculations

**Features**:

- Total Tiers count
- Active Tiers count
- Average Rate calculation
- Responsive grid layout
- Color-coded cards (Emerald, Blue, Purple)

### 3. FeeTierTable (`FeeTierTable.tsx`)

**Purpose**: Display fee tiers in a table format
**Props**:

- `feeTiers: FeeTier[]` - Data to display
- `onAddTier: () => void` - Add button handler
- `onEditTier: (tier: FeeTier) => void` - Edit button handler
- `onDeleteTier: (tierId: number) => void` - Delete button handler

**Features**:

- Sortable by min price
- Currency formatting (VND)
- Status badges
- Action buttons
- Empty state message

### 4. FeeTierDialog (`FeeTierDialog.tsx`)

**Purpose**: Add/Edit fee tier form dialog
**Props**:

- `open: boolean` - Dialog visibility
- `onOpenChange: (open: boolean) => void` - Dialog state handler
- `editingTier: FeeTier | null` - Tier being edited (null for new)
- `onSubmit: (data: FeeTierFormData) => Promise<void>` - Form submit handler
- `submitting: boolean` - Loading state

**Features**:

- Form validation
- Pre-filled data for editing
- Currency input formatting
- Percentage input validation
- Active/inactive toggle

### 5. FeeTierActions (`FeeTierActions.tsx`)

**Purpose**: Delete confirmation dialog
**Props**:

- `deletingTierId: number | null` - ID of tier to delete
- `onConfirmDelete: () => void` - Confirm delete handler
- `onCancelDelete: () => void` - Cancel delete handler

**Features**:

- Confirmation dialog
- Destructive action styling
- Clear warning message

## Benefits of Refactoring

### 1. Maintainability

- **Single Responsibility**: Each component has one clear purpose
- **Easier Testing**: Components can be tested in isolation
- **Code Reusability**: Components can be reused in other pages
- **Smaller Files**: Easier to navigate and understand

### 2. Performance

- **Selective Re-renders**: Only affected components re-render
- **Code Splitting**: Components can be lazy-loaded if needed
- **Memory Efficiency**: Smaller component trees

### 3. Developer Experience

- **Clear Structure**: Easy to find specific functionality
- **Type Safety**: Each component has well-defined props
- **Debugging**: Easier to isolate issues
- **Collaboration**: Multiple developers can work on different components

## Component Communication

```
page.tsx (Main Container)
├── FeeTierStatsCards (receives: feeTiers)
├── FeeTierTable (receives: feeTiers, handlers)
├── FeeTierDialog (receives: state, handlers)
└── FeeTierActions (receives: state, handlers)
```

## State Flow

1. **Initial Load**: `page.tsx` fetches data → passes to `FeeTierStatsCards` and `FeeTierTable`
2. **Add Tier**: User clicks "Add Tier" → `FeeTierTable` calls `onAddTier` → `page.tsx` opens `FeeTierDialog`
3. **Edit Tier**: User clicks edit → `FeeTierTable` calls `onEditTier` → `page.tsx` opens `FeeTierDialog` with data
4. **Submit Form**: User submits → `FeeTierDialog` calls `onSubmit` → `page.tsx` handles API call
5. **Delete Tier**: User clicks delete → `FeeTierTable` calls `onDeleteTier` → `page.tsx` opens `FeeTierActions`

## Type Safety

All components use TypeScript interfaces:

- `FeeTierStatsCardsProps`
- `FeeTierTableProps`
- `FeeTierDialogProps`
- `FeeTierActionsProps`
- `FeeTierFormData`

## Error Handling

- **API Errors**: Handled in `page.tsx` with proper error messages
- **Form Validation**: Handled in `FeeTierDialog` with user feedback
- **Type Safety**: TypeScript prevents runtime errors

## Future Enhancements

### Easy to Add:

- **Search/Filter**: Add `FeeTierFilters` component
- **Bulk Actions**: Add `FeeTierBulkActions` component
- **Export**: Add `FeeTierExport` component
- **Pagination**: Add `FeeTierPagination` component

### Component Extensions:

- **FeeTierCard**: Alternative view for mobile
- **FeeTierChart**: Visual representation of rates
- **FeeTierHistory**: Audit log component

## Comparison with Posts Admin

| Aspect           | Posts Admin     | Fee Tiers Admin |
| ---------------- | --------------- | --------------- |
| Main Page        | 324 lines       | 215 lines       |
| Components       | 3 main          | 4 main          |
| State Management | React Query     | useState        |
| Error Handling   | Centralized     | Centralized     |
| Type Safety      | Full TypeScript | Full TypeScript |

## Migration Benefits

### Before Refactoring:

- ❌ 451 lines in single file
- ❌ Hard to maintain
- ❌ Difficult to test
- ❌ Poor reusability

### After Refactoring:

- ✅ 215 lines main + 4 focused components
- ✅ Easy to maintain
- ✅ Testable components
- ✅ Reusable components
- ✅ Clear separation of concerns
- ✅ Better performance
- ✅ Improved developer experience

## Usage Example

```tsx
// Main page imports all components
import { FeeTierStatsCards, FeeTierTable, FeeTierDialog, FeeTierActions } from './_components';

// Each component receives only what it needs
<FeeTierStatsCards feeTiers={feeTiers} />
<FeeTierTable
  feeTiers={feeTiers}
  onAddTier={handleOpenAddDialog}
  onEditTier={handleOpenEditDialog}
  onDeleteTier={handleDeleteTier}
/>
```

This structure makes the codebase more maintainable, testable, and scalable while following React best practices and the existing project patterns.
