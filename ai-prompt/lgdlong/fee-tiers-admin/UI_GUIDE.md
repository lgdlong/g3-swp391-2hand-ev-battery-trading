# Fee Tiers Admin UI Guide

## Page Layout Overview

### Header Section

```
┌─────────────────────────────────────────────────────────┐
│ Fee Tiers Management                                    │
│ Quản lý các mức phí đặt cọc theo khoảng giá            │
└─────────────────────────────────────────────────────────┘
```

### Statistics Cards (3 columns grid)

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ 💵 Total Tiers  │  │ 📈 Active Tiers │  │ 💯 Average Rate │
│                 │  │                 │  │                 │
│      5          │  │      5          │  │    5.2%         │
│ Tổng số fee tiers│  │ Fee tiers hoạt động│ │ Tỷ lệ trung bình│
└─────────────────┘  └─────────────────┘  └─────────────────┘
  (Emerald theme)     (Blue theme)        (Purple theme)
```

### Main Table Section

```
┌──────────────────────────────────────────────────────────────────┐
│ Fee Tiers                                      [+ Add Tier]      │
│ Quản lý tỷ lệ đặt cọc dựa trên khoảng giá                      │
├──────────────────────────────────────────────────────────────────┤
│ Min Price    │ Max Price     │ Deposit Rate │ Status  │ Actions │
├──────────────────────────────────────────────────────────────────┤
│ 0 ₫          │ 5.000.000 ₫   │ [10.0%]     │ Active  │ ✏️ 🗑️  │
│ 5.000.000 ₫  │ 20.000.000 ₫  │ [8.0%]      │ Active  │ ✏️ 🗑️  │
│ 20.000.000 ₫ │ 100.000.000 ₫ │ [5.0%]      │ Active  │ ✏️ 🗑️  │
│ 100.000.000 ₫│ No Limit      │ [3.0%]      │ Active  │ ✏️ 🗑️  │
│ 0 ₫          │ No Limit      │ [0.0%]      │ Inactive│ ✏️ 🗑️  │
└──────────────────────────────────────────────────────────────────┘
```

## Add/Edit Dialog

```
┌────────────────────────────────────────┐
│ Add New Fee Tier                    ✕  │
│ Tạo mới một fee tier với tỷ lệ đặt cọc │
├────────────────────────────────────────┤
│                                        │
│ Giá tối thiểu (VND) *                 │
│ [0________________]                    │
│                                        │
│ Giá tối đa (VND)                      │
│ [________________]                     │
│ Để trống = không giới hạn             │
│                                        │
│ Tỷ lệ đặt cọc (%) *                   │
│ [10.0____________]                     │
│ Từ 0% đến 100%                        │
│                                        │
│ Trạng thái hoạt động     [🔘 ON]     │
│                                        │
├────────────────────────────────────────┤
│                    [Cancel]  [Create]  │
└────────────────────────────────────────┘
```

## Delete Confirmation Dialog

```
┌────────────────────────────────────────┐
│ Xác nhận xóa                        ✕  │
│ Bạn có chắc chắn muốn xóa fee tier    │
│ này? Hành động này không thể hoàn tác. │
├────────────────────────────────────────┤
│                    [Cancel]  [Xóa]     │
└────────────────────────────────────────┘
```

## Color Coding

### Status Badges

- **Active**: 🟢 Green background (`bg-emerald-100 text-emerald-800`)
- **Inactive**: ⚪ Gray background (`bg-gray-100 text-gray-800`)

### Deposit Rate Badges

- **All rates**: 🔵 Blue background (`bg-blue-100 text-blue-800`)

### Special Badges

- **No Limit**: ⚫ Outlined badge (`variant="outline"`)

### Action Buttons

- **Edit**: 🔵 Blue icon on hover (`text-blue-600`)
- **Delete**: 🔴 Red icon on hover (`text-red-600`)

## Admin Sidebar Navigation

```
┌──────────────────────┐
│ 🛡️ Admin Panel       │
│ Management System    │
├──────────────────────┤
│ 📊 Dashboard         │
│ 👥 Users             │
│ 📄 Posts             │
│ 📈 Analytics         │
│ 💾 Database          │
│ 🔒 Security          │
│ 🔔 Notifications     │
│ 💰 Fee Tiers     ← NEW│
│ ⚙️  Settings         │
└──────────────────────┘
```

## Responsive Behavior

### Desktop (lg+)

- Statistics cards: 3 columns
- Table: Full width with all columns visible
- Sidebar: Always visible

### Tablet (md)

- Statistics cards: 2-3 columns
- Table: Scrollable horizontally if needed
- Sidebar: Toggleable

### Mobile (sm)

- Statistics cards: 1 column
- Table: Horizontal scroll
- Sidebar: Hidden, accessible via hamburger menu

## User Interactions

### 1. View Fee Tiers

- **Trigger**: Navigate to `/admin/feetiers`
- **Action**: Automatic data fetch and display
- **Feedback**: Loading spinner → Table with data

### 2. Add New Fee Tier

- **Trigger**: Click "+ Add Tier" button
- **Action**: Opens dialog with empty form
- **Feedback**:
  - Form validation on submit
  - Success toast: "Tạo fee tier thành công"
  - Table refreshes with new tier

### 3. Edit Fee Tier

- **Trigger**: Click ✏️ (pencil) icon
- **Action**: Opens dialog with pre-filled form
- **Feedback**:
  - Form validation on submit
  - Success toast: "Cập nhật fee tier thành công"
  - Table refreshes with updated tier

### 4. Delete Fee Tier

- **Trigger**: Click 🗑️ (trash) icon
- **Action**: Opens confirmation dialog
- **Feedback**:
  - Confirmation required
  - Success toast: "Xóa fee tier thành công"
  - Table refreshes without deleted tier

### 5. Form Validation

- **Min Price**: Required, must be >= 0
- **Max Price**: Optional, must be > min price if provided
- **Deposit Rate**: Required, 0-100%
- **Error Feedback**: Toast notification with specific message

## Toast Notifications

### Success Messages

- ✅ "Tạo fee tier thành công"
- ✅ "Cập nhật fee tier thành công"
- ✅ "Xóa fee tier thành công"

### Error Messages

- ❌ "Không thể tải danh sách fee tiers"
- ❌ "Vui lòng điền đầy đủ thông tin bắt buộc"
- ❌ "Giá tối thiểu không hợp lệ"
- ❌ "Giá tối đa phải lớn hơn giá tối thiểu"
- ❌ "Tỷ lệ đặt cọc phải từ 0 đến 100%"
- ❌ "Không thể lưu fee tier"
- ❌ "Không thể xóa fee tier"

## Loading States

### Page Load

```
┌─────────────────────────────────┐
│                                 │
│         ⏳ (spinner)            │
│    Đang tải dữ liệu...         │
│                                 │
└─────────────────────────────────┘
```

### Form Submit

```
[Đang lưu...] (disabled button)
```

## Error States

### Fetch Error

```
┌─────────────────────────────────┐
│             ❌                  │
│ Không thể tải danh sách fee tiers│
│        [Thử lại]                │
└─────────────────────────────────┘
```

### Empty State

```
┌─────────────────────────────────┐
│                                 │
│ Chưa có fee tier nào.          │
│ Nhấn "Add Tier" để tạo mới.    │
│                                 │
└─────────────────────────────────┘
```

## Currency Formatting

### Vietnamese Dong (VND)

- Format: `1.000.000 ₫` (thousand separator with dot)
- Zero: `0 ₫`
- Example: `100.000.000 ₫` = 100 million VND

### Percentage

- Format: `10.0%` (one decimal place)
- Range: `0.0%` to `100.0%`

## Data Flow

```
User Action
    ↓
UI Component (page.tsx)
    ↓
API Function (feeTiersApi.ts)
    ↓
HTTP Request with JWT
    ↓
Backend API (/settings/fee-tiers)
    ↓
Database
    ↓
Response
    ↓
Update UI State
    ↓
Show Feedback (Toast)
```

## Accessibility

- ✅ Keyboard navigation supported
- ✅ Screen reader compatible labels
- ✅ Focus indicators on interactive elements
- ✅ ARIA labels on dialogs
- ✅ Semantic HTML structure
- ✅ Color contrast meets WCAG standards

## Performance Considerations

- Data fetched once on page load
- Optimistic UI updates after mutations
- Automatic table refresh after CRUD operations
- Minimal re-renders with proper state management
- Sorted data (by minPrice) for better UX
