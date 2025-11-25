# Danh sách việc cần làm - Chuẩn bị Đồ án Tốt nghiệp (Thi lại)

**Ngày tạo**: 23/11/2025  
**Deadline**: TBD  
**Người thực hiện**: Team Development  
**Mục đích**: Checklist chi tiết các tác vụ cần hoàn thành

---

## 🎯 Phân loại công việc

| **Loại** | **Số lượng** | **Trạng thái** |
|----------|--------------|---------------|
| 🔴 High Priority | 7 tasks | ⏳ Chưa bắt đầu |
| 🔶 Medium Priority | 3 tasks | ⏳ Chưa bắt đầu |
| 🟡 Low Priority | 2 tasks | ⏳ Chưa bắt đầu |

---

## 🔴 PRIORITY 1: TÍnh năng bắt buộc (HIGH)

### ✅ Task 1: Tính năng So sánh sản phẩm (FR-M13)

**Trạng thái**: ⏳ Chưa bắt đầu  
**Ước tính thời gian**: 6-8 giờ  
**Độ ưu tiên**: 🔴 High

#### Backend (3-4 giờ)

**API Endpoint**:
```typescript
GET /posts/compare?ids=1,2,3
```

**File cần tạo/sửa**:
```
apps/api/src/modules/posts/
├── dto/
│   └── compare-posts.dto.ts        # DTO cho request
└── posts.controller.ts              # Thêm endpoint
    posts.service.ts                 # Logic so sánh
```

**Implementation**:

```typescript
// 1. DTO (dto/compare-posts.dto.ts)
export class ComparePostsQueryDto {
  @ApiProperty({ 
    description: 'Danh sách ID bài đăng (tối đa 3)',
    example: '1,2,3'
  })
  @IsString()
  @Matches(/^\d+(,\d+){0,2}$/, { message: 'Tối đa 3 ID' })
  ids: string;
}

// 2. Controller (posts.controller.ts)
@Get('compare')
@ApiOperation({ summary: 'So sánh tối đa 3 bài đăng' })
@ApiResponse({ status: 200, type: [BasePostResponseDto] })
async comparePosts(@Query() query: ComparePostsQueryDto) {
  const postIds = query.ids.split(',').map(Number);
  return this.postsService.compareMultiplePosts(postIds);
}

// 3. Service (posts.service.ts)
async compareMultiplePosts(postIds: number[]) {
  if (postIds.length < 2 || postIds.length > 3) {
    throw new BadRequestException('Phải so sánh 2-3 bài đăng');
  }

  const posts = await this.postsRepo.find({
    where: { id: In(postIds), status: PostStatus.PUBLISHED },
    relations: ['seller', 'carDetails', 'bikeDetails', 'batteryDetails'],
  });

  if (posts.length !== postIds.length) {
    throw new NotFoundException('Một số bài đăng không tồn tại');
  }

  return posts.map(post => this.mapToResponseDto(post));
}
```

**Checklist Backend**:
- [ ] Tạo DTO `ComparePostsQueryDto`
- [ ] Thêm endpoint `GET /posts/compare` trong controller
- [ ] Implement logic trong service
- [ ] Test API qua Swagger
- [ ] Validate: Tối thiểu 2, tối đa 3 posts
- [ ] Validate: Chỉ so sánh post đã PUBLISHED

---

#### Frontend (3-4 giờ)

**File cần tạo/sửa**:
```
apps/web/
├── app/(public)/posts/compare/
│   ├── page.tsx                    # Trang so sánh
│   └── _components/
│       └── CompareTable.tsx        # Bảng so sánh
├── components/
│   └── CompareButton.tsx           # Nút "So sánh" (reusable)
└── lib/api/
    └── postApi.ts                  # API function
```

**Implementation**:

```typescript
// 1. API Function (lib/api/postApi.ts)
export async function comparePosts(postIds: number[]) {
  const ids = postIds.join(',');
  const response = await fetch(`${API_URL}/posts/compare?ids=${ids}`);
  if (!response.ok) throw new Error('Không thể so sánh bài đăng');
  return response.json();
}

// 2. Compare Page (app/(public)/posts/compare/page.tsx)
'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { comparePosts } from '@/lib/api/postApi';
import CompareTable from './_components/CompareTable';

export default function ComparePage() {
  const searchParams = useSearchParams();
  const ids = searchParams.get('ids')?.split(',').map(Number) || [];

  const { data: posts, isLoading } = useQuery({
    queryKey: ['compare-posts', ids],
    queryFn: () => comparePosts(ids),
    enabled: ids.length >= 2 && ids.length <= 3,
  });

  if (ids.length < 2) {
    return <div>Vui lòng chọn ít nhất 2 bài đăng để so sánh</div>;
  }

  if (isLoading) return <div>Đang tải...</div>;

  return <CompareTable posts={posts} />;
}

// 3. Compare Table Component (CompareTable.tsx)
interface CompareTableProps {
  posts: Post[];
}

export default function CompareTable({ posts }: CompareTableProps) {
  const rows = [
    { label: 'Giá bán', getValue: (p: Post) => formatCurrency(p.priceVnd) },
    { label: 'Hãng xe', getValue: (p: Post) => p.carDetails?.brand || 'N/A' },
    { label: 'Năm sản xuất', getValue: (p: Post) => p.carDetails?.year || 'N/A' },
    { label: 'Dung lượng pin', getValue: (p: Post) => 
        p.batteryDetails?.capacityKwh 
          ? `${p.batteryDetails.capacityKwh} kWh` 
          : 'N/A' 
    },
    { label: 'Tình trạng', getValue: (p: Post) => p.condition },
    { label: 'Người bán', getValue: (p: Post) => p.seller.fullName },
  ];

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="border p-2">Tiêu chí</th>
          {posts.map((post) => (
            <th key={post.id} className="border p-2">{post.title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx}>
            <td className="border p-2 font-semibold">{row.label}</td>
            {posts.map((post) => (
              <td key={post.id} className="border p-2">
                {row.getValue(post)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**Checklist Frontend**:
- [ ] Tạo trang `/posts/compare`
- [ ] Tạo component `CompareTable.tsx`
- [ ] Thêm nút "So sánh" ở danh sách bài đăng
- [ ] Implement logic chọn tối đa 3 posts
- [ ] Test responsive (mobile/desktop)
- [ ] Test error cases (post không tồn tại)

---

### ✅ Task 2: Ẩn thông tin liên hệ người bán

**Trạng thái**: ⏳ Chưa bắt đầu  
**Ước tính thời gian**: 4-6 giờ  
**Độ ưu tiên**: 🔴 High

#### Backend (2-3 giờ)

**Logic nghiệp vụ**:
> Chỉ hiển thị `seller.phoneNumber` và `seller.address` nếu:
> 1. User là chủ bài (`req.user.id === post.sellerId`), HOẶC
> 2. User đã mua sản phẩm (có giao dịch `PURCHASE` trong `wallet_transactions`)

**File cần sửa**:
```
apps/api/src/modules/posts/
└── posts.service.ts                 # Thêm logic check permission
    dto/
    └── post-response.dto.ts         # Có thể cần sửa
```

**Implementation**:

```typescript
// posts.service.ts
async getPostById(postId: number, currentUserId?: number) {
  const post = await this.postsRepo.findOne({
    where: { id: postId, status: PostStatus.PUBLISHED },
    relations: ['seller', 'carDetails', 'bikeDetails', 'batteryDetails'],
  });

  if (!post) {
    throw new NotFoundException('Bài đăng không tồn tại');
  }

  // Check permission xem thông tin liên hệ
  const canViewContact = await this.canViewContactInfo(
    postId, 
    post.seller.id, 
    currentUserId
  );

  // Ẩn thông tin nếu không có quyền
  if (!canViewContact) {
    post.seller.phoneNumber = null;
    post.seller.address = null;
  }

  return this.mapToResponseDto(post);
}

private async canViewContactInfo(
  postId: number, 
  sellerId: number, 
  currentUserId?: number
): Promise<boolean> {
  // Chưa đăng nhập → Không được xem
  if (!currentUserId) return false;

  // Là chủ bài → Được xem
  if (currentUserId === sellerId) return true;

  // Kiểm tra đã mua sản phẩm chưa
  const purchaseTransaction = await this.walletTransactionsRepo.findOne({
    where: {
      walletUserId: currentUserId,
      relatedEntityType: 'posts',
      relatedEntityId: postId,
      serviceType: { name: 'PURCHASE' },  // Cần có service type này
    },
  });

  return !!purchaseTransaction;
}
```

**Checklist Backend**:
- [ ] Thêm method `canViewContactInfo()` trong service
- [ ] Sửa `getPostById()` để ẩn thông tin
- [ ] Đảm bảo có service type `PURCHASE` trong bảng `service_types`
- [ ] Test API với user chưa mua
- [ ] Test API với user đã mua
- [ ] Test API với chủ bài

---

#### Frontend (2-3 giờ)

**File cần sửa**:
```
apps/web/app/(public)/posts/ev/[id]/
└── page.tsx                         # Hiển thị thông tin liên hệ
    _components/
    └── SellerContact.tsx            # Component thông tin liên hệ
```

**Implementation**:

```typescript
// SellerContact.tsx
interface SellerContactProps {
  seller: {
    phoneNumber: string | null;
    address: string | null;
    fullName: string;
  };
}

export default function SellerContact({ seller }: SellerContactProps) {
  return (
    <div className="border rounded p-4">
      <h3 className="font-bold mb-2">Thông tin người bán</h3>
      <p><strong>Tên:</strong> {seller.fullName}</p>
      
      {seller.phoneNumber ? (
        <p><strong>📞 SĐT:</strong> {seller.phoneNumber}</p>
      ) : (
        <p className="text-gray-500">
          📞 SĐT: *** **** *** 
          <span className="text-xs">(Mua sản phẩm để xem)</span>
        </p>
      )}

      {seller.address ? (
        <p><strong>📍 Địa chỉ:</strong> {seller.address}</p>
      ) : (
        <p className="text-gray-500">
          📍 Địa chỉ: ***** 
          <span className="text-xs">(Mua sản phẩm để xem)</span>
        </p>
      )}
    </div>
  );
}
```

**Checklist Frontend**:
- [ ] Tạo component `SellerContact.tsx`
- [ ] Hiển thị placeholder khi thông tin bị ẩn
- [ ] Thêm tooltip giải thích
- [ ] Test với user chưa đăng nhập
- [ ] Test với user đã mua

---

### ✅ Task 3: Phí hoa hồng cho sàn (Platform Fee)

**Trạng thái**: ⏳ Chưa bắt đầu  
**Ước tính thời gian**: 8-10 giờ  
**Độ ưu tiên**: 🔴 High

#### Backend - Database (2 giờ)

**File cần tạo**:
```
apps/api/src/migrations/
└── 1700000000001-CreatePlatformCommissionsTable.ts
```

**Implementation**:

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePlatformCommissionsTable1700000000001 
  implements MigrationInterface {
  
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'platform_commissions',
        columns: [
          {
            name: 'id',
            type: 'bigserial',
            isPrimary: true,
          },
          {
            name: 'post_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'seller_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'buyer_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'transaction_amount',
            type: 'decimal',
            precision: 14,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'commission_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: false,
            comment: 'VD: 5.00 = 5%',
          },
          {
            name: 'commission_amount',
            type: 'decimal',
            precision: 14,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'collected_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('platform_commissions');
  }
}
```

**Checklist Database**:
- [ ] Tạo migration cho bảng `platform_commissions`
- [ ] Chạy migration: `pnpm run migration:run`
- [ ] Verify bảng trong database
- [ ] Thêm index cho `post_id`, `seller_id`, `buyer_id`

---

#### Backend - Entity & Service (4-5 giờ)

**File cần tạo**:
```
apps/api/src/modules/transactions/
├── entities/
│   └── platform-commission.entity.ts
└── transactions.service.ts          # Sửa logic
```

**Implementation**:

```typescript
// 1. Entity
@Entity('platform_commissions')
export class PlatformCommission {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ type: 'bigint', name: 'post_id' })
  postId: string;

  @Column({ type: 'int', name: 'seller_id' })
  sellerId: number;

  @Column({ type: 'int', name: 'buyer_id' })
  buyerId: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  transactionAmount: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  commissionRate: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  commissionAmount: string;

  @CreateDateColumn({ name: 'collected_at' })
  collectedAt: Date;
}

// 2. Service Logic
async processProductPurchase(
  buyerId: number, 
  postId: string, 
  amount: string
) {
  const post = await this.postsRepo.findOne({ 
    where: { id: postId },
    relations: ['seller']
  });

  // Tính phí hoa hồng (5%)
  const commissionRate = 5.00;
  const commissionAmount = (parseFloat(amount) * commissionRate) / 100;
  const sellerReceives = parseFloat(amount) - commissionAmount;

  return this.dataSource.transaction(async (manager) => {
    // 1. Trừ tiền Buyer
    await this.walletsService.deduct(
      buyerId, 
      amount, 
      'PURCHASE', 
      `Mua sản phẩm #${postId}`
    );

    // 2. Cộng tiền Seller (sau khi trừ phí)
    await this.walletsService.topup(
      post.seller.id, 
      sellerReceives.toString(), 
      'SALE_REVENUE', 
      `Bán sản phẩm #${postId}`
    );

    // 3. Ghi nhận phí hoa hồng
    const commission = manager.create(PlatformCommission, {
      postId,
      sellerId: post.seller.id,
      buyerId,
      transactionAmount: amount,
      commissionRate: commissionRate.toString(),
      commissionAmount: commissionAmount.toString(),
    });

    await manager.save(commission);

    return { success: true, commission };
  });
}
```

**Checklist Backend Service**:
- [ ] Tạo entity `PlatformCommission`
- [ ] Implement `processProductPurchase()` với atomic transaction
- [ ] Thêm service type `PURCHASE` và `SALE_REVENUE`
- [ ] Test atomic transaction (rollback khi lỗi)
- [ ] Log chi tiết giao dịch

---

#### Backend - Admin Dashboard (2-3 giờ)

**File cần sửa**:
```
apps/api/src/modules/admin-statistics/
└── admin-statistics.service.ts      # Thêm metric tổng phí hoa hồng
```

**Implementation**:

```typescript
async getDashboardStats() {
  // ... existing code

  // Tính tổng phí hoa hồng
  const totalCommissions = await this.platformCommissionsRepo
    .createQueryBuilder('commission')
    .select('SUM(commission.commission_amount)', 'total')
    .getRawOne();

  return {
    ...existingStats,
    totalCommissionsCollected: totalCommissions.total || '0.00',
  };
}
```

**Checklist Admin**:
- [ ] Thêm metric `totalCommissionsCollected` trong API
- [ ] Hiển thị trong Admin Dashboard (Frontend)
- [ ] Test với dữ liệu mẫu

---

### ✅ Task 4: Thống nhất đơn vị tiền tệ (VND)

**Trạng thái**: ⏳ Chưa bắt đầu  
**Ước tính thời gian**: 3-4 giờ  
**Độ ưu tiên**: 🔴 High

**Tìm và thay thế toàn bộ "coin" thành "VND"**

#### Backend (1.5-2 giờ)

```bash
# Tìm tất cả file có "coin"
git grep -i "coin" apps/api/src/
```

**Checklist Backend**:
- [ ] Tìm tất cả file có từ "coin"
- [ ] Thay thế trong Swagger docs (`@ApiProperty`)
- [ ] Thay thế trong DTO description
- [ ] Thay thế trong log messages
- [ ] Chạy `pnpm run lint` để kiểm tra

#### Frontend (1.5-2 giờ)

```bash
# Tìm tất cả file có "coin"
git grep -i "coin" apps/web/
```

**Checklist Frontend**:
- [ ] Thay thế "coin" thành "₫" trong UI
- [ ] Thay thế trong validation messages
- [ ] Thay thế trong toast messages
- [ ] Test tất cả trang có hiển thị tiền
- [ ] Đảm bảo format đúng: `formatCurrency(value)` → "1.000.000 ₫"

---

### ✅ Task 5: Kiểm tra logic Refunds

**Trạng thái**: ⏳ Chưa bắt đầu  
**Ước tính thời gian**: 2-3 giờ  
**Độ ưu tiên**: 🔴 High

**Mục đích**: Xác định có cần khôi phục module `refunds/` từ `dev` hay không

**Checklist**:
- [ ] Chạy: `git grep -i "refund" apps/api/src/`
- [ ] Kiểm tra `posts.service.ts` có logic hoàn tiền không
- [ ] Kiểm tra `transactions.service.ts` có xử lý refund không
- [ ] Nếu KHÔNG tìm thấy → Chuyển sang Task 6 (Khôi phục Refunds)
- [ ] Nếu CÓ → Test thủ công: Admin từ chối bài → Kiểm tra ví có được hoàn tiền không

---

### ✅ Task 6: Thêm nút "Mua ngay" (Frontend)

**Trạng thái**: ⏳ Chưa bắt đầu  
**Ước tính thời gian**: 4-5 giờ  
**Độ ưu tiên**: 🔴 High

**Mục đích**: User click "Mua ngay" → Thanh toán → Trừ tiền ví → Hiển thị thông tin liên hệ

#### Implementation

**File cần tạo/sửa**:
```
apps/web/app/(public)/posts/ev/[id]/
├── _components/
│   ├── BuyNowButton.tsx             # Nút "Mua ngay"
│   └── BuyNowModal.tsx              # Modal xác nhận thanh toán
└── page.tsx                         # Tích hợp
```

**Code mẫu**:

```typescript
// BuyNowButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseProduct } from '@/lib/api/transactionsApi';
import BuyNowModal from './BuyNowModal';
import { toast } from 'sonner';

interface BuyNowButtonProps {
  postId: string;
  price: number;
  disabled?: boolean;
}

export default function BuyNowButton({ postId, price, disabled }: BuyNowButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => purchaseProduct(postId),
    onSuccess: () => {
      toast.success('Mua sản phẩm thành công!');
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      setShowModal(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Mua sản phẩm thất bại');
    },
  });

  return (
    <>
      <Button 
        onClick={() => setShowModal(true)} 
        disabled={disabled || mutation.isPending}
        size="lg"
        className="w-full"
      >
        {mutation.isPending ? 'Đang xử lý...' : 'Mua ngay'}
      </Button>

      <BuyNowModal
        open={showModal}
        onClose={() => setShowModal(false)}
        postId={postId}
        price={price}
        onConfirm={() => mutation.mutate()}
        isLoading={mutation.isPending}
      />
    </>
  );
}
```

**Checklist Frontend**:
- [ ] Tạo component `BuyNowButton.tsx`
- [ ] Tạo component `BuyNowModal.tsx` (hiển thị giá, số dư ví)
- [ ] Tạo API function `purchaseProduct()` trong `transactionsApi.ts`
- [ ] Test với user có đủ tiền
- [ ] Test với user không đủ tiền (hiển thị nút "Nạp tiền")
- [ ] Test sau khi mua xong → Thông tin liên hệ hiện ra

---

### ✅ Task 7: Test toàn bộ luồng tiền

**Trạng thái**: ⏳ Chưa bắt đầu  
**Ước tính thời gian**: 3-4 giờ  
**Độ ưu tiên**: 🔴 High

**Scenario test**:

1. **Luồng đăng bài**:
   - [ ] Seller tạo bài → Thanh toán phí đăng → Số dư ví giảm
   - [ ] Kiểm tra `wallet_transactions` có ghi nhận `POST_PAYMENT`
   - [ ] Admin duyệt → Post status = `PUBLISHED`

2. **Luồng mua sản phẩm**:
   - [ ] Buyer click "Mua ngay" → Thanh toán → Số dư ví Buyer giảm
   - [ ] Số dư ví Seller tăng (sau khi trừ phí hoa hồng)
   - [ ] Kiểm tra `platform_commissions` có ghi nhận phí
   - [ ] Buyer xem được thông tin liên hệ Seller

3. **Luồng hoàn tiền** (nếu có):
   - [ ] Admin từ chối bài → Seller được hoàn phí
   - [ ] Kiểm tra `wallet_transactions` có giao dịch hoàn tiền

---

## 🔶 PRIORITY 2: Tính năng cần cân nhắc (MEDIUM)

### ✅ Task 8: Khôi phục Module Refunds (Nếu cần)

**Trạng thái**: ⏳ Chờ kết quả Task 5  
**Ước tính thời gian**: 4-6 giờ  
**Độ ưu tiên**: 🔶 Medium

**Điều kiện**: CHỈ làm nếu Task 5 xác nhận KHÔNG có logic hoàn tiền

**Checklist**:
- [ ] Checkout module từ `dev`: `git checkout dev -- apps/api/src/modules/refunds/`
- [ ] Đăng ký module trong `app.module.ts`
- [ ] Tạo migration cho bảng `refunds`
- [ ] Test CRON job hoàn tiền tự động
- [ ] Test thủ công: Admin từ chối bài → Hoàn tiền

**Tham khảo**: `02_git_merge_strategy.md`

---

### ✅ Task 9: Thêm metric Admin Dashboard

**Trạng thái**: ⏳ Chưa bắt đầu  
**Ước tính thời gian**: 2-3 giờ  
**Độ ưu tiên**: 🔶 Medium

**Yêu cầu**: FR-A6 - Dashboard thống kê

**Metrics cần thêm**:
- [ ] Tổng số dư ví người dùng (SUM của `wallets.balance`)
- [ ] Tổng tiền nạp (SUM của transactions có `service_type = TOP_UP`)
- [ ] Tổng phí thu được (SUM của `platform_commissions.commission_amount`)
- [ ] Biểu đồ doanh thu theo ngày (7 ngày gần nhất)

**File cần sửa**:
```
apps/api/src/modules/admin-statistics/
└── admin-statistics.service.ts

apps/web/app/(dashboard)/admin/
└── _components/DashboardCharts.tsx
```

---

### ✅ Task 10: Tối ưu Performance

**Trạng thái**: ⏳ Chưa bắt đầu  
**Ước tính thời gian**: 2-3 giờ  
**Độ ưu tiên**: 🔶 Medium

**Checklist**:
- [ ] Thêm index cho các cột hay query: `post_id`, `seller_id`, `buyer_id`
- [ ] Enable Redis cache cho danh sách bài đăng (nếu có)
- [ ] Optimize image upload (resize trước khi upload Cloudinary)
- [ ] Lazy load images trong danh sách bài đăng

---

## 🟡 PRIORITY 3: Polish & Documentation (LOW)

### ✅ Task 11: Đổi thuật ngữ "Kiểm định" → "Kiểm duyệt"

**Trạng thái**: ⏳ Chưa bắt đầu  
**Ước tính thời gian**: 2-3 giờ  
**Độ ưu tiên**: 🟡 Low

**Checklist Backend**:
```bash
# Tìm tất cả file có "verification" hoặc "verified"
git grep -i "verification\|verified" apps/api/src/
```

- [ ] Đổi entity name (nếu cần): `Verification` → `Review`
- [ ] Đổi status: `VERIFIED` → `APPROVED`
- [ ] Đổi API endpoint (nếu cần): `/verify` → `/review`
- [ ] Update Swagger docs

**Checklist Frontend**:
- [ ] Đổi UI text: "Đã kiểm định" → "Đã kiểm duyệt"
- [ ] Đổi trong form validation messages
- [ ] Đổi trong toast messages

---

### ✅ Task 12: Viết API Documentation

**Trạng thái**: ⏳ Chưa bắt đầu  
**Ước tính thời gian**: 3-4 giờ  
**Độ ưu tiên**: 🟡 Low

**Checklist**:
- [ ] Viết README cho API endpoints mới
- [ ] Thêm Swagger examples cho DTOs
- [ ] Viết Postman collection (nếu cần)
- [ ] Document flow diagrams (dùng Mermaid)

---

## 📊 Tiến độ tổng thể

### Công việc hoàn thành
- ✅ Phân tích chênh lệch (File 01)
- ✅ Chiến lược Git merge (File 02)
- ✅ Checklist chi tiết (File 03 - Đang đọc)

### Công việc đang làm
- ⏳ Không có

### Công việc chưa bắt đầu
- ⏳ 12 tasks

---

## 📅 Timeline đề xuất

### Tuần 1 (5 ngày)
- Ngày 1-2: Task 1 (So sánh sản phẩm)
- Ngày 3: Task 2 (Ẩn thông tin liên hệ)
- Ngày 4-5: Task 3 (Phí hoa hồng)

### Tuần 2 (3 ngày)
- Ngày 1: Task 4 (Thống nhất VND) + Task 5 (Kiểm tra Refunds)
- Ngày 2: Task 6 (Nút "Mua ngay") + Task 7 (Test luồng tiền)
- Ngày 3: Task 8 (Refunds nếu cần) + Task 11 (Đổi thuật ngữ)

### Tuần 3 (2 ngày - Buffer)
- Ngày 1: Task 9 (Admin Dashboard) + Task 10 (Performance)
- Ngày 2: Task 12 (Documentation) + Final testing

**Tổng thời gian dự kiến**: 10-12 ngày làm việc

---

## ⚠️ Lưu ý quan trọng

1. **Luôn test sau mỗi task** → Tránh lỗi chồng chất
2. **Commit thường xuyên** → Dễ rollback khi lỗi
3. **Ưu tiên task 🔴 High trước** → Đảm bảo tính năng cốt lõi
4. **Đọc `04_bug_warning.md`** → Tránh các lỗi giảng viên hay soi

---

**📋 Cập nhật lần cuối**: 23/11/2025
