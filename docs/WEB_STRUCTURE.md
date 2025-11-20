# 📁 Cấu Trúc Thư Mục `apps/web`

## 🎯 Tổng Quan

Dự án frontend sử dụng **Next.js 15** với **App Router**, TypeScript, và React 19. Cấu trúc được tổ chức theo pattern feature-based và component-based.

---

## 📂 Cấu Trúc Tổng Thể

```
apps/web/
├── app/                    # Next.js App Router (pages & routes)
├── components/             # React components tái sử dụng
├── lib/                    # Utilities, API clients, contexts
├── types/                  # TypeScript type definitions
├── hooks/                  # Custom React hooks
├── utils/                  # Helper functions
├── validations/            # Zod schemas
├── config/                 # Configuration files
├── constants/              # Constants & static data
├── public/                 # Static assets
└── [config files]          # next.config.js, tailwind.config.ts, etc.
```

---

## 📁 Chi Tiết Các Thư Mục

### 1. `/app` - Next.js App Router

Thư mục chính chứa routing và pages của ứng dụng. Sử dụng **App Router** của Next.js 15.

#### 1.1. Root Files

- **`layout.tsx`** - Root layout cho toàn bộ ứng dụng
  - Cấu hình font (Roboto)
  - Providers wrapper (React Query, Auth)
  - Toaster notifications

- **`page.tsx`** - Trang chủ (`/`)
  - Landing page hoặc dashboard chính

- **`providers.tsx`** - Client-side providers
  - React Query Provider
  - Auth Provider
  - React Query DevTools

- **`globals.css`** - Global CSS styles
  - Tailwind CSS imports
  - Custom CSS variables

- **`favicon.ico`** - Favicon

#### 1.2. `(auth)` - Authentication Routes

Route group cho các trang authentication (không ảnh hưởng URL).

```
(auth)/
├── login/
│   └── page.tsx              # Trang đăng nhập
├── sign-up/
│   └── page.tsx              # Trang đăng ký
└── google-callback/
    ├── page.tsx              # Callback handler
    └── GoogleCallbackBody.tsx # Component xử lý callback
```

#### 1.3. `(dashboard)` - Admin Dashboard Routes

Route group cho admin dashboard.

```
(dashboard)/
└── admin/
    ├── layout.tsx            # Admin layout với sidebar
    ├── page.tsx              # Dashboard chính
    ├── _components/          # Components riêng cho admin
    │   ├── DashboardCharts.tsx      # Charts hiển thị thống kê
    │   │                           # - Line charts, bar charts
    │   │                           # - Revenue, posts trends
    │   ├── FinancialStatsCards.tsx # Cards thống kê tài chính
    │   │                           # - Total revenue
    │   │                           # - Transactions count
    │   ├── RecentTables.tsx        # Tables hiển thị dữ liệu gần đây
    │   │                           # - Recent posts, transactions
    │   ├── StatsCards.tsx          # Cards thống kê tổng quan
    │   │                           # - Total posts, users
    │   │                           # - Active posts, pending
    │   └── index.ts
    ├── accounts/
    │   ├── page.tsx          # Quản lý tài khoản
    │   │                     # - Danh sách tài khoản
    │   │                     # - Filter, search
    │   │                     # - Ban/unban, change role
    │   └── _components/
    │       └── AccountDetailsDialog.tsx  # Dialog chi tiết tài khoản
    │                                     # - Thông tin user
    │                                     # - Actions (ban, promote)
    ├── analytics/
    │   └── page.tsx          # Analytics & statistics
    │                        # - Charts, graphs
    │                        # - Revenue, posts stats
    ├── posts/
    │   ├── page.tsx          # Quản lý bài đăng
    │   │                     # - Danh sách tất cả bài đăng
    │   │                     # - Filter theo status
    │   │                     # - Approve/reject posts
    │   └── _components/
    │       ├── FilterButtons.tsx        # Buttons filter status
    │       ├── PageSizeSelector.tsx     # Select số items/page
    │       ├── PostCard.tsx              # Card hiển thị bài đăng
    │       ├── PostDetailModal/         # Modal chi tiết bài đăng
    │       │   ├── PostBasicInfo.tsx    # Thông tin cơ bản
    │       │   ├── PostBatteryDetails.tsx # Chi tiết pin
    │       │   ├── PostVehicleDetails.tsx # Chi tiết xe
    │       │   ├── PostImagesGallery.tsx  # Gallery ảnh
    │       │   ├── PostSellerInfo.tsx     # Thông tin người bán
    │       │   ├── PostStatusBadge.tsx    # Badge trạng thái
    │       │   ├── PostTimeInfo.tsx       # Thông tin thời gian
    │       │   └── PostDetailActions.tsx  # Actions (approve/reject)
    │       ├── RejectDialog.tsx           # Dialog từ chối bài đăng
    │       │                              # - Nhập lý do từ chối
    │       └── StatusSummaryCards.tsx     # Cards tổng hợp theo status
    │                                      # - Pending, Approved, Rejected
    └── settings/
        ├── page.tsx          # Cài đặt hệ thống
        │                     # - Fee tiers management
        │                     # - Post lifecycle settings
        └── _components/
            ├── FeeTierActions.tsx        # Actions cho fee tier (CRUD)
            ├── FeeTierDialog.tsx         # Dialog create/edit fee tier
            ├── FeeTierStatsCards.tsx     # Stats cards cho fee tiers
            ├── FeeTierTable.tsx           # Table hiển thị fee tiers
            └── PostLifecycleCard.tsx      # Card cài đặt vòng đời bài đăng
                                            # - Thời gian expire
                                            # - Auto archive settings
```

#### 1.4. `(public)` - Public Routes

Route group cho các trang công khai (user-facing).

```
(public)/
├── layout.tsx                # Public layout
├── page.tsx                  # (nếu có)
│
├── posts/                    # Quản lý bài đăng
│   ├── layout.tsx
│   ├── page.tsx             # Danh sách bài đăng
│   ├── _components/         # Components chung cho posts
│   │   ├── Badge.tsx        # Badge component hiển thị labels (origin, status)
│   │   ├── PostHeader.tsx   # Header bài đăng
│   │   │                    # - Tiêu đề, giá, origin badge
│   │   │                    # - Địa chỉ, bookmark button
│   │   ├── SellerInfo.tsx   # Thông tin người bán
│   │   │                    # - Avatar, tên, email, phone
│   │   │                    # - Trạng thái tài khoản
│   │   │                    # - Nút liên hệ (nếu không phải chủ bài đăng)
│   │   └── index.ts
│   │
│   ├── create/              # Tạo bài đăng mới
│   │   ├── page.tsx         # Page tạo bài đăng (multi-step form)
│   │   ├── _components/
│   │   │   ├── BasicInfoForm.tsx      # Form thông tin cơ bản
│   │   │   │                          # - Tiêu đề, mô tả, giá
│   │   │   │                          # - Địa chỉ (province/district/ward)
│   │   │   │                          # - Có thể thương lượng
│   │   │   ├── BatteryDetailsForm.tsx # Form chi tiết pin
│   │   │   │                          # - Thương hiệu, model, capacity
│   │   │   │                          # - Health, cycles, voltage
│   │   │   ├── EVDetailsForm.tsx      # Form chi tiết xe điện
│   │   │   │                          # - Thương hiệu, model, year
│   │   │   │                          # - Range, odo, battery capacity
│   │   │   ├── FormActions.tsx        # Buttons điều hướng form
│   │   │   │                          # - Previous, Next, Submit
│   │   │   ├── FormHeader.tsx         # Header form tạo bài đăng
│   │   │   │                          # - Title, description
│   │   │   │                          # - Button đổi loại tin (EV/Battery)
│   │   │   ├── ImageUploadSection.tsx # Section upload ảnh
│   │   │   │                          # - Drag & drop upload
│   │   │   │                          # - Preview, delete images
│   │   │   │                          # - Upload lên Cloudinary
│   │   │   └── PostTypeModal.tsx      # Modal chọn loại bài đăng
│   │   │                              # - Chọn EV hoặc Battery
│   │   │                              # - Hiển thị khi chưa chọn type
│   │   ├── _hooks/
│   │   │   └── useCreatePost.ts
│   │   ├── payment/
│   │   │   └── [postId]/
│   │   │       ├── page.tsx
│   │   │       ├── _components/
│   │   │       ├── helpers/
│   │   │       └── hooks/
│   │   └── upload-images/
│   │       └── [postId]/
│   │           └── page.tsx
│   │
│   ├── batteries/          # Danh sách pin
│   │   ├── page.tsx        # Page danh sách pin với filters
│   │   ├── [id]/
│   │   │   ├── page.tsx     # Chi tiết pin
│   │   │   └── _components/
│   │   │       ├── Specifications.tsx  # Component hiển thị thông số kỹ thuật
│   │   │       └── SpecItem.tsx         # Item trong danh sách thông số
│   │   ├── _components/
│   │   │   ├── BatteryPostCard.tsx      # Card hiển thị bài đăng pin
│   │   │   │                            # - Ảnh, tiêu đề, giá
│   │   │   │                            # - Thông tin cơ bản (capacity, health)
│   │   │   │                            # - Bookmark button
│   │   │   ├── EmptyState.tsx           # Empty state khi không có kết quả
│   │   │   ├── HeartCallApi.tsx         # Component gọi API bookmark
│   │   │   ├── HeartToggle.tsx          # Toggle button bookmark (heart icon)
│   │   │   ├── LoadingGrid.tsx          # Skeleton loading cho grid
│   │   │   ├── PageHeader.tsx           # Header của page (title, breadcrumb)
│   │   │   └── PostGrid.tsx             # Grid layout hiển thị danh sách bài đăng
│   │   └── utils/
│   │       └── filterUtils.ts
│   │
│   └── ev/                  # Danh sách xe điện
│       ├── layout.tsx       # Layout riêng cho EV pages
│       ├── page.tsx         # Page danh sách xe điện với filters
│       ├── [id]/
│       │   ├── page.tsx     # Chi tiết xe điện
│       │   └── _components/
│       │       ├── Specifications.tsx  # Thông số kỹ thuật xe
│       │       └── SpecItem.tsx
│       ├── _components/
│       │   ├── BookMarkButton.tsx     # Button bookmark bài đăng
│       │   ├── HeartCallApi.tsx        # API call cho bookmark
│       │   ├── HeartToggle.tsx         # Toggle bookmark với heart icon
│       │   ├── EmptyState.tsx         # Empty state component
│       │   ├── LoadingGrid.tsx         # Loading skeleton
│       │   ├── PageHeader.tsx          # Page header
│       │   ├── PageTitle.tsx           # Title component
│       │   ├── PostCard.tsx            # Card hiển thị bài đăng EV
│       │   │                           # - Ảnh, tiêu đề, giá
│       │   │                           # - Thông tin (brand, range, odo)
│       │   │                           # - Bookmark button
│       │   └── PostGrid.tsx            # Grid layout cho posts
│       ├── _queries.ts      # React Query hooks cho EV data
│       └── utils/           # Utilities cho EV filters
│
├── my-posts/                # Bài đăng của user
│   ├── page.tsx             # Page danh sách bài đăng của user
│   │                        # - List, filter, search
│   │                        # - Pagination
│   ├── [id]/
│   │   └── edit/            # Chỉnh sửa bài đăng
│   │       ├── page.tsx     # Page edit với form tương tự create
│   │       ├── _components/
│   │       │   ├── AddressSelector.tsx  # Component chọn địa chỉ
│   │       │   ├── BasicInfoForm.tsx   # Form thông tin cơ bản
│   │       │   ├── ImageUpload.tsx     # Upload/edit images
│   │       │   └── UpdatePostForm.tsx  # Main form component
│   │       ├── constants/   # Constants cho edit form
│   │       ├── hooks/      # Custom hooks cho edit
│   │       │   ├── useAddressState.ts
│   │       │   ├── useBatteryFormState.ts
│   │       │   └── useEVFormState.ts
│   │       ├── types/      # Types cho edit
│   │       └── utils/      # Utilities cho edit
│   └── _components/
│       ├── archive-confirm-dialog.tsx  # Dialog xác nhận lưu trữ bài đăng
│       ├── delete-confirm-dialog.tsx   # Dialog xác nhận xóa bài đăng
│       ├── empty-state.tsx              # Empty state khi không có bài đăng
│       ├── payment-dialog.tsx           # Dialog thanh toán phí đăng bài
│       ├── post-detail-dialog.tsx       # Dialog xem chi tiết bài đăng
│       ├── post-list-item.tsx           # Item trong danh sách bài đăng
│       ├── post-list-skeleton.tsx       # Skeleton loading
│       ├── pagination.tsx                # Pagination component
│       ├── search-bar.tsx                # Search bar cho my-posts
│       ├── reject-reason-dialog.tsx     # Dialog hiển thị lý do từ chối
│       ├── RequestVerificationButton.tsx # Button yêu cầu xác thực bài đăng
│       └── verification-reject-reason-dialog.tsx # Dialog lý do từ chối verify
│
├── bookmarks/               # Bài đăng đã bookmark
│   ├── page.tsx             # Page danh sách bài đăng đã bookmark
│   └── _components/
│       └── bookmarks-manager.tsx  # Component quản lý bookmarks
│                                 # - Hiển thị danh sách
│                                 # - Remove bookmark
│                                 # - Filter, search
│
├── profile/                 # Hồ sơ người dùng
│   ├── layout.tsx           # Layout cho profile pages
│   ├── page.tsx             # Page hồ sơ cá nhân
│   │                        # - Thông tin tài khoản
│   │                        # - Avatar, email, phone
│   │                        # - Edit profile
│   └── _components/
│       └── AvatarChangeDialog.tsx  # Dialog thay đổi avatar
│                                   # - Upload ảnh mới
│                                   # - Crop, preview
│                                   # - Upload lên Cloudinary
│
├── wallet/                  # Ví điện tử
│   ├── page.tsx             # Page ví điện tử
│   │                        # - Hiển thị số dư
│   │                        # - Nút nạp tiền (TopupModal)
│   │                        # - Lịch sử giao dịch
│   └── transactions/
│       └── [id]/
│           └── page.tsx     # Chi tiết giao dịch
│                            # - Thông tin giao dịch
│                            # - Trạng thái, số tiền
│                            # - Thời gian, mô tả
│
├── checkout/                 # Thanh toán
│   └── result/
│       └── page.tsx         # Kết quả thanh toán
│                            # - Hiển thị kết quả từ PayOS
│                            # - Success/Failed status
│                            # - Redirect về wallet hoặc trang chủ
│
└── menu/                    # Menu
    ├── layout.tsx
    └── page.tsx
```

**Lưu ý về Route Groups:**

- `(auth)`, `(dashboard)`, `(public)` là route groups - không ảnh hưởng URL
- Dùng để nhóm các routes có layout hoặc logic chung
- `_components/` - Components riêng cho route đó (không phải route)

---

### 2. `/components` - Reusable Components

Các React components tái sử dụng trong toàn bộ ứng dụng.

```
components/
├── ui/                      # shadcn/ui components (Base UI components)
│   ├── alert-dialog.tsx     # Alert dialog với confirm/cancel actions
│   ├── avatar.tsx           # Avatar component hiển thị ảnh đại diện
│   ├── badge.tsx            # Badge component cho labels, status
│   ├── button.tsx           # Button component với nhiều variants
│   ├── card.tsx             # Card container component
│   ├── confirmation-dialog.tsx  # Dialog xác nhận hành động
│   ├── context-menu.tsx     # Context menu (right-click menu)
│   ├── dialog.tsx           # Modal dialog component
│   ├── dropdown-menu.tsx    # Dropdown menu component
│   ├── form.tsx             # Form wrapper tích hợp React Hook Form
│   ├── icons.tsx            # Icon components
│   ├── input.tsx            # Input field component
│   ├── label.tsx            # Label component cho form fields
│   ├── scroll-area.tsx      # Scrollable area component
│   ├── select.tsx           # Select dropdown component
│   ├── separator.tsx        # Separator line component
│   ├── skeleton.tsx         # Loading skeleton component
│   ├── sonner.tsx           # Toast notification provider
│   ├── switch.tsx           # Toggle switch component
│   ├── tabs.tsx             # Tabs component
│   ├── textarea.tsx         # Textarea component
│   └── tooltip.tsx          # Tooltip component
│
├── navbar/                  # Navigation bar components
│   ├── navbar.tsx           # Main navbar component (header chính)
│   │                        # - Sticky header với logo, navigation, user actions
│   │                        # - Responsive với mobile menu
│   ├── Logo.tsx             # Logo component của website
│   ├── navigation.tsx       # Navigation links (menu items)
│   ├── SidebarMenu.tsx      # Sidebar menu cho mobile
│   ├── UserActions.tsx      # User action buttons (login, profile, etc.)
│   ├── UserModeToggle.tsx   # Toggle giữa user/admin mode
│   └── UserSidebar.tsx      # User sidebar với profile menu
│
├── searchbar/               # Search & filter bar components
│   ├── searchbar.tsx        # Main search bar component
│   │                        # - Tìm kiếm bài đăng theo keyword
│   │                        # - Filter theo location
│   │                        # - Navigate đến results page
│   ├── BrandFilter.tsx      # Filter theo thương hiệu
│   ├── LocationSelector.tsx # Dropdown chọn tỉnh/thành phố
│   └── PriceFilter.tsx      # Filter theo khoảng giá
│
├── breadcrumb-filter/       # Breadcrumb với filters
│   ├── BreadcrumbFilter.tsx # Main breadcrumb filter component
│   │                        # - Hiển thị breadcrumb path
│   │                        # - Tích hợp filters
│   ├── BatteryFilters.tsx   # Filters riêng cho pin (capacity, health, cycles)
│   ├── EvFilters.tsx       # Filters riêng cho xe điện (range, odo, brand)
│   ├── FilterButton.tsx    # Button hiển thị filter đã chọn
│   ├── FilterButtons.tsx   # Container cho các filter buttons
│   ├── BrandFilterDropdown.tsx    # Dropdown chọn thương hiệu
│   ├── PriceFilterDropdown.tsx    # Dropdown chọn khoảng giá
│   ├── CapacityFilterDropdown.tsx  # Dropdown chọn dung lượng pin
│   ├── HealthFilterDropdown.tsx   # Dropdown chọn tình trạng pin
│   ├── CyclesFilterDropdown.tsx   # Dropdown chọn số chu kỳ sạc
│   ├── RangeFilterDropdown.tsx    # Dropdown chọn tầm hoạt động (EV)
│   ├── OdoKmFilterDropdown.tsx    # Dropdown chọn số km đã đi (EV)
│   ├── components/         # Sub-components hỗ trợ
│   │   ├── ButtonRenderer.tsx
│   │   ├── DropdownButtons.tsx
│   │   └── DropdownManager.tsx
│   ├── constants/          # Filter constants và options
│   ├── hooks/              # Custom hooks cho filters
│   └── types.ts            # TypeScript types cho filters
│
├── admin/
│   └── AdminSidebar.tsx    # Sidebar navigation cho admin dashboard
│                           # - Menu items cho admin features
│
├── DepositModal.tsx        # Modal thanh toán phí đăng bài
│                           # - Hiển thị số dư ví hiện tại
│                           # - Tính toán phí đăng bài theo fee tier
│                           # - Trừ tiền từ ví để đặt cọc
│                           # - Tích hợp TopupModal nếu thiếu tiền
│
├── TopupModal.tsx          # Modal nạp tiền vào ví
│                           # - Nhập số tiền muốn nạp (VND)
│                           # - Preset amounts (25k, 50k, 100k, etc.)
│                           # - Tạo payment link qua PayOS
│                           # - Redirect đến PayOS checkout
│
├── FormRootError.tsx       # Component hiển thị lỗi form level
│                           # - Hiển thị errors từ React Hook Form
│                           # - Dùng cho validation errors chung
│
├── GeoForm.tsx             # Form chọn địa chỉ (tỉnh/huyện/xã)
│                           # - Dropdown cascade (province → district → ward)
│                           # - Tích hợp với API địa chỉ Việt Nam
│
├── VerificationBadge.tsx   # Badge hiển thị trạng thái xác thực
│                           # - Badge "Đã kiểm định" cho bài đăng đã verify
│                           # - Icon checkmark
│
└── asset/                  # Static assets
    └── phu-tung-o-to-27.png
```

**Pattern:**

- `ui/` - Base UI components từ shadcn/ui (headless, accessible, customizable)
- Mỗi feature có thư mục riêng với `index.ts` để export
- Components được tổ chức theo chức năng
- Components có thể có sub-components trong thư mục `components/`

---

### 3. `/lib` - Core Libraries & Utilities

Chứa logic cốt lõi, API clients, contexts, và utilities.

```
lib/
├── api/                     # API clients (Axios wrappers)
│   ├── accountApi.ts       # API cho tài khoản
│   │                       # - Get profile, update profile
│   │                       # - Change avatar, password
│   ├── adminDashboardApi.ts # API cho admin dashboard
│   │                        # - Statistics, analytics
│   ├── adminStatisticsApi.ts # API thống kê admin
│   │                         # - Revenue, posts stats
│   ├── authApi.ts          # API authentication
│   │                       # - Login, signup, logout
│   │                       # - Google OAuth callback
│   │                       # - Refresh token
│   ├── bookmarkApi.ts      # API bookmark
│   │                       # - Add/remove bookmark
│   │                       # - Get bookmarks list
│   ├── catalogApi.ts       # API catalog (brands, models)
│   │                       # - Get car/bike brands
│   │                       # - Get models by brand
│   ├── feeTiersApi.ts      # API fee tiers
│   │                       # - CRUD fee tiers
│   │                       # - Get active tiers
│   ├── postApi.ts          # API bài đăng
│   │                       # - Create, update, delete post
│   │                       # - Get posts list, detail
│   │                       # - Search, filter posts
│   │                       # - Upload images
│   ├── postLifecycleApi.ts # API vòng đời bài đăng
│   │                       # - Get/update lifecycle settings
│   ├── postPaymentApi.ts   # API thanh toán bài đăng
│   │                       # - Create payment order
│   │                       # - Get payment status
│   ├── postReviewLogApi.ts # API review log
│   │                       # - Get review history
│   │                       # - Approve/reject posts
│   ├── verificationApi.ts  # API xác thực bài đăng
│   │                       # - Request verification
│   │                       # - Get verification status
│   └── walletApi.ts        # API ví điện tử
│                           # - Get wallet balance
│                           # - Topup, deduct
│                           # - Get transactions
│
├── adapters/                # Data adapters (Transform API data → UI data)
│   ├── account.ts          # Transform account data
│   │                       # - API account → UI account format
│   └── post.ts             # Transform post data
│                           # - API post → UI post format
│                           # - Format dates, prices
│
├── auth-context.tsx         # Auth context & provider
│                           # - Global auth state
│                           # - User info, login status
│                           # - Login, logout functions
│
├── auth-manager.ts          # Auth logic
│                           # - Token management
│                           # - Session handling
│
├── auth.ts                  # Auth utilities
│                           # - Token helpers
│                           # - Auth checks
│
├── axios.ts                 # Axios instance config
│                           # - Base URL, headers
│                           # - Interceptors (request/response)
│                           # - Error handling
│
├── chat-context.tsx         # Chat context (Socket.io)
│                           # - WebSocket connection
│                           # - Chat state management
│                           # - Send/receive messages
│
├── handle-api-error.ts      # Error handling utilities
│                           # - Parse API errors
│                           # - Show error messages
│
├── post-helpers.ts          # Post utilities
│                           # - Format post data
│                           # - Calculate fees
│                           # - Post status helpers
│
├── query-client.ts          # React Query client config
│                           # - Query client setup
│                           # - Default options
│                           # - Error handling
│
├── tinhthanhpho.ts          # Location data (Vietnam provinces)
│                           # - Provinces list
│                           # - Districts, wards data
│
├── utils.ts                 # General utilities
│                           # - cn() (classNames)
│                           # - Common helpers
│
├── utils/                   # Utility functions
│   └── format.ts            # Formatting functions
│                           # - formatVnd() - Format currency
│                           # - relativeTime() - Relative dates
│                           # - getLocation() - Format address
│
└── validation/              # Validation utilities
    └── file-validation.ts   # File validation
                            # - Image type, size checks
                            # - File upload validation
```

**Pattern:**

- Mỗi API module có file riêng trong `api/`
- Adapters để transform data giữa API và UI
- Contexts cho global state (Auth, Chat)
- Utilities được tách riêng theo chức năng

---

### 4. `/types` - TypeScript Types

Type definitions cho toàn bộ ứng dụng.

```
types/
├── account.ts               # Account types
├── admin-statistics.ts      # Admin stats types
├── bookmark.ts              # Bookmark types
├── catalog.ts               # Catalog types
├── form-data.ts             # Form data types
├── login.ts                 # Login types
├── post.ts                  # Post types
├── post-payment.ts          # Payment types
├── post-review-log.ts       # Review log types
├── refund.ts                # Refund types
│
└── api/                     # API response types
    ├── fee-tier.ts
    ├── post-lifecycle.ts
    └── post.ts
│
└── enums/                   # Enum definitions
    ├── account-enum.ts
    ├── battery-enum.ts
    ├── post-enum.ts
    └── index.ts
```

**Pattern:**

- Types được tổ chức theo domain/feature
- Enums tách riêng trong `enums/`
- API types tách riêng trong `api/`

---

### 5. `/hooks` - Custom React Hooks

Custom hooks tái sử dụng.

```
hooks/
├── useGeo.ts                # Geolocation hook
├── useModeration.ts         # Moderation hook
├── usePostPayment.ts        # Post payment hook
└── useUploadAvatar.ts       # Avatar upload hook
```

**Pattern:**

- Mỗi hook có file riêng
- Naming: `use[Feature].ts`
- Hooks có thể import từ `@/hooks`

---

### 6. `/utils` - Helper Functions

Pure utility functions không phụ thuộc domain.

```
utils/
└── regex.ts                 # Regex patterns
```

**Pattern:**

- Chỉ chứa pure functions
- Không có side effects
- Có thể test dễ dàng

---

### 7. `/validations` - Validation Schemas

Zod schemas cho form validation.

```
validations/
├── login-schema.ts          # Login form validation
└── signup-schema.ts         # Signup form validation
```

**Pattern:**

- Sử dụng Zod cho validation
- Mỗi form có schema riêng
- Có thể share với backend nếu cần

---

### 8. `/config` - Configuration

Configuration files và constants.

```
config/
└── constants.ts             # App constants
```

---

### 9. `/constants` - Static Data

Static data và constants.

```
constants/
└── images.ts                # Image constants
```

---

### 10. `/public` - Static Assets

Static files được serve trực tiếp.

```
public/
├── asset/
│   └── phu-tung-o-to-27.png
├── file-text.svg
├── globe.svg
├── next.svg
├── turborepo-dark.svg
├── turborepo-light.svg
├── vercel.svg
└── window.svg
```

**Pattern:**

- Truy cập qua URL: `/logo.svg`
- Không cần import trong code

---

## 🔧 Configuration Files

### Root Level Config Files

- **`next.config.js`** - Next.js configuration
  - Image domains (Cloudinary, Google)
  - Security headers (CSP, X-Frame-Options)
  - CORS settings

- **`tailwind.config.ts`** - Tailwind CSS configuration
  - Theme customization
  - Custom colors, fonts
  - Plugin configuration

- **`tsconfig.json`** - TypeScript configuration
  - Path aliases (`@/` → `./`)
  - Compiler options
  - Type checking rules

- **`postcss.config.mjs`** - PostCSS configuration
  - Tailwind CSS plugin

- **`components.json`** - shadcn/ui configuration
  - Component paths
  - Style configuration

- **`eslint.config.js`** - ESLint configuration
  - Linting rules
  - TypeScript support

- **`package.json`** - Dependencies & scripts
  - Dependencies
  - Dev dependencies
  - Scripts (dev, build, lint)

---

## 📋 Naming Conventions

### Files & Folders

- **Components**: PascalCase (`Button.tsx`, `UserProfile.tsx`)
- **Hooks**: camelCase với prefix `use` (`useAuth.ts`, `usePostPayment.ts`)
- **Utils**: camelCase (`format.ts`, `regex.ts`)
- **Types**: camelCase (`account.ts`, `post.ts`)
- **API files**: camelCase với suffix `Api` (`postApi.ts`, `authApi.ts`)
- **Pages**: `page.tsx` (Next.js convention)
- **Layouts**: `layout.tsx` (Next.js convention)

### Route Groups

- Route groups: `(groupName)` - không ảnh hưởng URL
- Private components: `_components/` - không phải route
- Private hooks: `_hooks/` - không phải route

### Exports

- Mỗi thư mục có `index.ts` để export components
- Barrel exports để import dễ dàng hơn

---

## 🎨 Component Organization Patterns

### 1. Feature-based Components

Components được tổ chức theo feature trong `app/[feature]/_components/`:

```
app/posts/create/_components/
├── BasicInfoForm.tsx
├── BatteryDetailsForm.tsx
└── index.ts
```

### 2. Shared Components

Components dùng chung trong `components/`:

```
components/
├── ui/              # Base UI components
├── navbar/          # Navigation
└── searchbar/       # Search
```

### 3. Component Structure

Mỗi component thường có:

- Component file (`.tsx`)
- Types (nếu phức tạp)
- Utils/helpers (nếu cần)
- `index.ts` để export

---

## 🔄 Data Flow Patterns

### 1. API Calls

```
Component → Hook → API Client → Backend
```

Example:

```typescript
// Component
const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: () => postApi.getPosts(),
});

// API Client (lib/api/postApi.ts)
export const postApi = {
  getPosts: () => axios.get('/posts'),
};
```

### 2. State Management

- **Server State**: React Query (TanStack Query)
- **Client State**: React Context (Auth, Chat)
- **Form State**: React Hook Form
- **URL State**: Next.js router & search params

### 3. Authentication Flow

```
Login → authApi.login() → Set tokens → AuthContext → Protected routes
```

---

## 📦 Import Patterns

### Path Aliases

Sử dụng `@/` alias (configured in `tsconfig.json`):

```typescript
import { Button } from '@/components/ui/button';
import { postApi } from '@/lib/api/postApi';
import { useAuth } from '@/lib/auth-context';
import type { Post } from '@/types/post';
```

### Barrel Exports

Sử dụng `index.ts` để export:

```typescript
// components/navbar/index.ts
export { Navbar } from './navbar';
export { Logo } from './Logo';

// Usage
import { Navbar, Logo } from '@/components/navbar';
```

---

## 🚀 Development Workflow

### Adding a New Feature

1. **Create route** trong `app/[feature]/`
2. **Create components** trong `app/[feature]/_components/`
3. **Create API client** trong `lib/api/[feature]Api.ts`
4. **Create types** trong `types/[feature].ts`
5. **Create hooks** nếu cần trong `hooks/` hoặc `app/[feature]/_hooks/`

### Adding a New Component

1. **Shared component** → `components/[feature]/`
2. **Feature-specific** → `app/[feature]/_components/`
3. **UI component** → `components/ui/` (nếu là base component)

---

## 📝 Notes

- **Next.js 15 App Router**: Sử dụng App Router, không phải Pages Router
- **Server Components**: Mặc định là Server Components, dùng `'use client'` khi cần Client Components
- **TypeScript**: Strict mode enabled, type safety được ưu tiên
- **React Query**: Sử dụng cho tất cả server state
- **Form Handling**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS với shadcn/ui components

---

## 🔗 Related Documentation

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [React Query Docs](https://tanstack.com/query/latest)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [TECH_STACK.md](./TECH_STACK.md) - Công nghệ sử dụng

---

**Last Updated**: 2025  
**Project**: 2Hand EV Battery Trading Platform - Frontend  
**Framework**: Next.js 15 (App Router)
