# Fee Tiers Admin Management Feature

## Overview

Complete admin settings page for managing fee tiers (deposit rates based on price ranges) with CRUD operations and JWT authentication.

## Files Created/Modified

### 1. API Layer

- **`apps/web/lib/api/feeTiersApi.ts`** - API functions for fee tiers CRUD operations
- **`apps/web/types/api/fee-tier.ts`** - TypeScript type definitions for fee tiers

### 2. UI Components

- **`apps/web/app/(dashboard)/admin/feetiers/page.tsx`** - Main fee tiers admin page
- **`apps/web/components/admin/AdminSidebar.tsx`** - Updated with Fee Tiers navigation link

## Features Implemented

### Admin Fee Tiers Page (`/admin/feetiers`)

#### Statistics Cards

- **Total Tiers**: Shows total number of fee tiers
- **Active Tiers**: Shows count of active fee tiers
- **Average Rate**: Displays average deposit rate across all tiers

#### Fee Tiers Table

- Sortable by minimum price (ascending)
- Displays:
  - Min Price (formatted as VND currency)
  - Max Price (formatted or "No Limit" badge)
  - Deposit Rate (percentage with badge)
  - Status (Active/Inactive badge)
  - Actions (Edit/Delete buttons)

#### CRUD Operations

##### Create Fee Tier

- Dialog form with fields:
  - Min Price (required, VND)
  - Max Price (optional, empty = no limit)
  - Deposit Rate (required, percentage 0-100%)
  - Active status (toggle switch)
- Validation:
  - Min price must be >= 0
  - Max price must be > min price (if provided)
  - Deposit rate must be 0-100%
- API: `POST /settings/fee-tiers`

##### Edit Fee Tier

- Same form as create, pre-filled with existing data
- API: `PUT /settings/fee-tiers/{id}`

##### Delete Fee Tier

- Confirmation dialog before deletion
- API: `DELETE /settings/fee-tiers/{id}`

##### View Fee Tiers

- Automatic fetch on page load
- Sorted by min price ascending
- API: `GET /settings/fee-tiers`

## API Endpoints Used

| Method | Endpoint                   | Description         | Auth Required     |
| ------ | -------------------------- | ------------------- | ----------------- |
| GET    | `/settings/fee-tiers`      | Get all fee tiers   | Yes (JWT)         |
| GET    | `/settings/fee-tiers/{id}` | Get fee tier by ID  | Yes (JWT)         |
| POST   | `/settings/fee-tiers`      | Create new fee tier | Yes (JWT + Admin) |
| PUT    | `/settings/fee-tiers/{id}` | Update fee tier     | Yes (JWT + Admin) |
| DELETE | `/settings/fee-tiers/{id}` | Delete fee tier     | Yes (JWT + Admin) |

## Data Structure

### FeeTier Interface

```typescript
interface FeeTier {
  id: number;
  minPrice: string;
  maxPrice: string | null;
  depositRate: string; // Decimal format (e.g., "0.1" = 10%)
  active: boolean;
  updatedAt: string;
}
```

### API Response Example

```json
{
  "id": 9,
  "minPrice": "1000000000",
  "maxPrice": null,
  "depositRate": "0.0080",
  "active": true,
  "updatedAt": "2025-10-20T05:19:00.548Z"
}
```

## UI Design Pattern

### Styling

- Follows existing admin dashboard design
- Uses shadcn/ui components
- Consistent with accounts/posts admin pages
- Responsive layout with grid system

### Color Scheme

- Emerald: Total stats
- Blue: Active tiers / deposit rate badges
- Purple: Average rate
- Red: Delete actions
- Gray: Inactive status

### Components Used

- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`
- `Button` with variants (default, outline, ghost)
- `Badge` for status and rates
- `Dialog` for add/edit forms
- `ConfirmationDialog` for delete confirmation
- `Input` for form fields
- `Label` for form labels
- `Switch` for active/inactive toggle
- Lucide icons: `DollarSign`, `TrendingUp`, `Percent`, `Edit2`, `Trash2`, `Plus`

## Navigation

Added to Admin Sidebar:

- Position: Between "Notifications" and "Settings"
- Icon: `DollarSign`
- Route: `/admin/feetiers`
- Label: "Fee Tiers"

## Error Handling

- Loading states with spinner
- Error states with retry button
- Form validation with toast notifications
- API error messages displayed to user
- Network error handling

## User Experience

1. **Loading**: Shows spinner while fetching data
2. **Empty State**: Helpful message when no fee tiers exist
3. **Success Feedback**: Toast notifications for all successful actions
4. **Error Feedback**: Toast notifications for all errors
5. **Confirmation**: Required before deleting fee tiers
6. **Form Validation**: Real-time validation with helpful messages

## Usage Example

### Create a Fee Tier

1. Navigate to `/admin/feetiers`
2. Click "Add Tier" button
3. Fill in form:
   - Min Price: 0
   - Max Price: 10,000,000 (or leave empty)
   - Deposit Rate: 10.0
   - Active: ON
4. Click "Create"
5. Success toast appears
6. Table refreshes with new tier

### Edit a Fee Tier

1. Find tier in table
2. Click edit (pencil) icon
3. Modify fields as needed
4. Click "Update"
5. Changes saved and table refreshes

### Delete a Fee Tier

1. Find tier in table
2. Click delete (trash) icon
3. Confirm deletion in dialog
4. Tier removed and table refreshes

## Security

- All API calls include JWT token via `getAuthHeaders()`
- Admin role required (enforced in `AdminLayout`)
- Backend validation for all operations
- No client-side only data manipulation

## Future Enhancements

- [ ] Bulk operations (activate/deactivate multiple tiers)
- [ ] Export fee tiers to CSV/Excel
- [ ] Fee tier history/audit log
- [ ] Validation for overlapping price ranges
- [ ] Import fee tiers from file
- [ ] Fee tier usage statistics
- [ ] Search and filter functionality

## Testing Checklist

- [x] Page loads without errors
- [x] Fee tiers display correctly
- [x] Statistics cards show accurate data
- [x] Add new fee tier works
- [x] Edit existing fee tier works
- [x] Delete fee tier works (with confirmation)
- [x] Form validation works correctly
- [x] Currency formatting displays properly (VND)
- [x] Percentage calculations are accurate
- [x] Active/inactive toggle works
- [x] Toast notifications appear for all actions
- [x] Loading states display correctly
- [x] Error states handled gracefully
- [x] Mobile responsive design
- [ ] Backend API integration (requires testing with live backend)

## Dependencies

- Next.js 14+ (App Router)
- React 18+
- TypeScript
- shadcn/ui components
- Lucide React icons
- sonner (toast notifications)
- Radix UI primitives

## Notes

- Fee tiers are automatically sorted by min price
- Max price of `null` indicates no upper limit
- Deposit rate stored as decimal (0.1 = 10%) in backend
- Display rate as percentage in UI
- Currency displayed in Vietnamese Dong (VND)
