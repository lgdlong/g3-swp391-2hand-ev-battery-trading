# Cảnh báo Rủi ro - Những điểm Giảng viên hay Soi

**Ngày tạo**: 23/11/2025  
**Mục đích**: Cảnh báo các lỗi phổ biến, lỗ hổng nghiệp vụ mà giảng viên thường phát hiện khi đánh giá đồ án

---

## 🔴 RỦI RO CỰC KỲ CAO (CRITICAL)

### 1. ❌ Luồng tiền không minh bạch

**Vấn đề**:
> Giảng viên sẽ hỏi: "Làm sao chứng minh tiền đã trừ từ Buyer, Seller đã nhận, và Sàn đã thu phí hoa hồng?"

**Cách giảng viên test**:
1. Yêu cầu demo: User A mua sản phẩm 10,000,000 ₫
2. Kiểm tra Database:
   - `wallets`: Số dư User A giảm 10,000,000 ₫
   - `wallets`: Số dư Seller tăng 9,500,000 ₫ (sau khi trừ phí 5%)
   - `wallet_transactions`: Có 2 bản ghi (1 âm cho Buyer, 1 dương cho Seller)
   - `platform_commissions`: Có bản ghi ghi nhận 500,000 ₫ phí hoa hồng

**⚠️ LỖI THƯỜNG GẶP**:
- ❌ Chỉ trừ tiền Buyer, không cộng tiền cho Seller
- ❌ Không ghi nhận phí hoa hồng vào bảng riêng
- ❌ Transaction không atomic → Dữ liệu bị mất tính nhất quán

**✅ GIẢI PHÁP**:
```typescript
// Đảm bảo transaction atomic
return this.dataSource.transaction(async (manager) => {
  // 1. Trừ tiền Buyer
  await this.walletsService.deduct(...);
  
  // 2. Cộng tiền Seller (sau khi trừ phí)
  await this.walletsService.topup(...);
  
  // 3. Ghi nhận phí hoa hồng
  await manager.save(PlatformCommission, {...});
});
```

**📋 CHECKLIST TRƯỚC KHI DEMO**:
- [ ] Tạo 1 giao dịch mua bán
- [ ] Screenshot tất cả bảng liên quan:
  - `wallets` (trước/sau)
  - `wallet_transactions` (2 bản ghi)
  - `platform_commissions` (1 bản ghi)
- [ ] Tính toán đúng: `Buyer trả = Seller nhận + Phí hoa hồng`

---

### 2. ❌ Không có tính năng "So sánh" (Compare)

**Vấn đề**:
> Giảng viên sẽ hỏi: "Đây là sàn TMĐT xe/pin, sao không có chức năng so sánh sản phẩm?"

**Tham chiếu**:
- Tài liệu yêu cầu: FR-M13
- Các sàn TMĐT nổi tiếng (Shopee, Tiki, Chợ Tốt Xe) đều có tính năng này

**⚠️ LỖI THƯỜNG GẶP**:
- ❌ Đánh dấu "(Không làm)" mà không giải thích
- ❌ Nghĩ tính năng không quan trọng

**✅ GIẢI PHÁP**:
- ✅ **BẮT BUỘC phải làm tính năng So sánh** (tối đa 3 sản phẩm)
- ✅ Tham khảo `03_refactor_checklist.md` - Task 1

**📋 CHECKLIST TRƯỚC KHI DEMO**:
- [ ] Backend có API `GET /posts/compare?ids=1,2,3`
- [ ] Frontend có trang `/posts/compare`
- [ ] Hiển thị bảng so sánh (Giá, Hãng, Năm, Dung lượng pin)
- [ ] Test với 2-3 sản phẩm

---

### 3. ❌ Thông tin liên hệ hiển thị công khai

**Vấn đề**:
> Giảng viên sẽ hỏi: "Nếu ai cũng xem được SĐT Seller, họ sẽ liên hệ trực tiếp → Sàn không thu được phí. Vậy business model là gì?"

**Logic đúng**:
> Chỉ hiển thị thông tin liên hệ (SĐT, địa chỉ) **SAU KHI Buyer đã thanh toán mua sản phẩm**.

**⚠️ LỖI THƯỜNG GẶP**:
- ❌ Hiển thị SĐT/địa chỉ cho tất cả user (kể cả chưa mua)
- ❌ Chỉ check quyền ở Frontend (dễ bypass)

**✅ GIẢI PHÁP**:
```typescript
// Backend PHẢI check quyền
async getPostById(postId: number, currentUserId?: number) {
  const post = await this.postsRepo.findOne(...);
  
  const canViewContact = await this.canViewContactInfo(
    postId, 
    post.seller.id, 
    currentUserId
  );

  if (!canViewContact) {
    post.seller.phoneNumber = null;  // Ẩn SĐT
    post.seller.address = null;       // Ẩn địa chỉ
  }

  return post;
}
```

**📋 CHECKLIST TRƯỚC KHI DEMO**:
- [ ] User chưa mua → Không xem được SĐT/địa chỉ
- [ ] User đã mua → Xem được SĐT/địa chỉ
- [ ] Chủ bài → Luôn xem được (để chỉnh sửa)
- [ ] Test bằng cách inspect API response (không chỉ UI)

---

### 4. ❌ Không xử lý hoàn tiền khi Admin từ chối bài

**Vấn đề**:
> Giảng viên sẽ hỏi: "Nếu Admin từ chối bài đăng, Seller có được hoàn phí không? Nếu không hoàn → Seller bị lừa."

**Logic đúng**:
> Khi Admin từ chối bài đăng → **Tự động hoàn phí đăng bài** cho Seller

**⚠️ LỖI THƯỜNG GẶP**:
- ❌ Không có logic hoàn tiền
- ❌ Có logic nhưng không tự động (phải Admin bấm nút thủ công)

**✅ GIẢI PHÁP**:

**Option 1**: Xử lý ngay khi Admin từ chối
```typescript
async rejectPost(postId: string, reason: string, adminId: number) {
  const post = await this.postsRepo.findOne({ where: { id: postId } });
  
  // 1. Cập nhật status
  post.status = PostStatus.REJECTED;
  post.rejectionReason = reason;
  await this.postsRepo.save(post);

  // 2. Hoàn phí ngay lập tức
  await this.refundsService.createRefund(post.id, post.seller.id, reason);
  await this.walletsService.topup(
    post.seller.id, 
    post.postPayment.amountPaid, 
    'REFUND', 
    `Hoàn phí bài đăng #${post.id} bị từ chối`
  );
}
```

**Option 2**: Dùng CRON job tự động (từ module `refunds/` trong `dev`)
```typescript
@Cron('0 */6 * * *')  // Chạy mỗi 6 giờ
async handleAutoRefunds() {
  // Tìm các post bị reject nhưng chưa hoàn tiền
  const postsNeedRefund = await this.postsRepo.find({
    where: { status: PostStatus.REJECTED, isRefunded: false },
  });

  for (const post of postsNeedRefund) {
    await this.processRefund(post);
  }
}
```

**📋 CHECKLIST TRƯỚC KHI DEMO**:
- [ ] Test: Admin từ chối bài → Kiểm tra `wallets.balance` của Seller tăng
- [ ] Test: Kiểm tra `wallet_transactions` có giao dịch `REFUND`
- [ ] Chuẩn bị giải thích: "Em dùng CRON job tự động hoàn tiền mỗi 6 giờ" (nếu dùng option 2)

---

## 🟠 RỦI RO CAO (HIGH)

### 5. ⚠️ Đơn vị tiền tệ không nhất quán

**Vấn đề**:
> Giảng viên sẽ hỏi: "Tại sao chỗ này hiển thị VND, chỗ kia hiển thị coin? Coin là gì?"

**⚠️ LỖI THƯỜNG GẶP**:
- ❌ Code backend dùng "coin", UI dùng "₫"
- ❌ Swagger docs ghi "coin" nhưng database lưu VND
- ❌ Không giải thích được tỷ giá quy đổi

**✅ GIẢI PHÁP**:
- ✅ **Thống nhất toàn bộ hệ thống dùng VND**
- ✅ Tìm và thay thế tất cả "coin" → "VND" hoặc "₫"

**📋 CHECKLIST TRƯỚC KHI DEMO**:
```bash
# Tìm tất cả file còn dùng "coin"
git grep -i "coin" apps/

# Nếu tìm thấy → Sửa ngay
```

- [ ] Backend: Không có từ "coin" trong code
- [ ] Frontend: Tất cả hiển thị "₫" hoặc "VND"
- [ ] Swagger docs: Dùng "VND" trong description

---

### 6. ⚠️ Phí đăng bài không hợp lý

**Vấn đề**:
> Giảng viên sẽ hỏi: "Tại sao bài đăng 1 triệu và 100 triệu đều cùng phí? Logic tính phí là gì?"

**Logic đúng** (theo FR-M16a):
> Sử dụng **Fee Tier System** (phí cố định theo khoảng giá)

**Ví dụ**:
| Khoảng giá | Phí đăng bài |
|-----------|--------------|
| 0 - 10M | 20,000 ₫ |
| 10M - 50M | 50,000 ₫ |
| > 50M | 100,000 ₫ |

**⚠️ LỖI THƯỜNG GẶP**:
- ❌ Tính phí theo % (cũ) → Không đúng yêu cầu mới
- ❌ Phí cố định cho tất cả bài đăng

**✅ GIẢI PHÁP**:
```typescript
async calculatePostFee(priceVnd: number) {
  const feeTiers = await this.feeTierService.findAll();
  
  const tier = feeTiers.find(t => 
    priceVnd >= t.minPrice && 
    (t.maxPrice === null || priceVnd <= t.maxPrice)
  );

  return tier.feeAmount;  // Trả về phí cố định
}
```

**📋 CHECKLIST TRƯỚC KHI DEMO**:
- [ ] Có bảng `fee_tiers` trong database
- [ ] Test với 3 khoảng giá khác nhau
- [ ] Chuẩn bị giải thích logic tính phí

---

### 7. ⚠️ Không validate số dư ví trước khi thanh toán

**Vấn đề**:
> Giảng viên sẽ test: "Nếu ví có 10,000 ₫ nhưng mua sản phẩm 1 triệu → Hệ thống xử lý sao?"

**⚠️ LỖI THƯỜNG GẶP**:
- ❌ Cho phép số dư âm
- ❌ Không check số dư trước khi trừ tiền
- ❌ Hiển thị lỗi không rõ ràng

**✅ GIẢI PHÁP**:
```typescript
async deduct(userId: number, amount: string, serviceType: string) {
  const wallet = await this.walletsRepo.findOne({ where: { userId } });
  
  const currentBalance = parseFloat(wallet.balance);
  const deductAmount = parseFloat(amount);

  if (currentBalance < deductAmount) {
    throw new BadRequestException(
      `Số dư không đủ. Hiện có: ${currentBalance} ₫, cần: ${deductAmount} ₫`
    );
  }

  // ... tiếp tục trừ tiền
}
```

**Frontend**:
```typescript
// Hiển thị nút "Nạp tiền" khi không đủ
{balance < price ? (
  <Button onClick={openTopupModal}>Nạp tiền</Button>
) : (
  <Button onClick={handlePurchase}>Mua ngay</Button>
)}
```

**📋 CHECKLIST TRƯỚC KHI DEMO**:
- [ ] Test với số dư không đủ → Hiển thị lỗi rõ ràng
- [ ] Test Frontend: Nút "Mua ngay" disabled khi không đủ tiền
- [ ] Test: Click "Nạp tiền" → Mở TopupModal

---

## 🟡 RỦI RO TRUNG BÌNH (MEDIUM)

### 8. ⚠️ CRON job không chạy

**Vấn đề**:
> Nếu có module Refunds với CRON job, giảng viên sẽ hỏi: "CRON job chạy lúc nào? Em có log để chứng minh không?"

**⚠️ LỖI THƯỜNG GẶP**:
- ❌ CRON job không được enable
- ❌ Không có log khi CRON chạy
- ❌ CRON schedule không hợp lý (vd: chạy mỗi 1 phút → tốn resource)

**✅ GIẢI PHÁP**:
```typescript
import { Cron, CronExpression } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';

export class RefundsCronService {
  private readonly logger = new Logger(RefundsCronService.name);

  @Cron('0 */6 * * *')  // Mỗi 6 giờ
  async handleAutoRefunds() {
    this.logger.log('🔄 Starting auto-refund job...');
    
    const postsNeedRefund = await this.findPostsNeedRefund();
    this.logger.log(`Found ${postsNeedRefund.length} posts need refund`);

    for (const post of postsNeedRefund) {
      await this.processRefund(post);
      this.logger.log(`✅ Refunded post #${post.id}`);
    }

    this.logger.log('✅ Auto-refund job completed');
  }
}
```

**📋 CHECKLIST TRƯỚC KHI DEMO**:
- [ ] CRON job được enable trong `app.module.ts`
- [ ] Có log rõ ràng (timestamp, số bản ghi xử lý)
- [ ] Chuẩn bị screenshot log để demo

---

### 9. ⚠️ Không có validation cho Upload ảnh

**Vấn đề**:
> Giảng viên sẽ test: "Nếu upload file 100MB hoặc file virus → Hệ thống xử lý sao?"

**⚠️ LỖI THƯỜNG GẶP**:
- ❌ Không giới hạn kích thước file
- ❌ Không validate MIME type
- ❌ Cho phép upload quá 10 ảnh

**✅ GIẢI PHÁP**:
```typescript
// Backend validation
@Post('upload')
@UseInterceptors(FilesInterceptor('files', 10, {
  limits: { fileSize: 5 * 1024 * 1024 },  // Max 5MB
  fileFilter: (req, file, callback) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      return callback(new BadRequestException('Chỉ chấp nhận JPG/PNG/WebP'), false);
    }
    callback(null, true);
  },
}))
async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
  // ...
}
```

**📋 CHECKLIST TRƯỚC KHI DEMO**:
- [ ] Test upload file > 5MB → Hiển thị lỗi
- [ ] Test upload file .exe → Hiển thị lỗi
- [ ] Test upload > 10 ảnh → Hiển thị lỗi

---

### 10. ⚠️ Thuật ngữ không nhất quán

**Vấn đề**:
> Giảng viên sẽ hỏi: "'Kiểm định' và 'Kiểm duyệt' khác nhau thế nào?"

**Giải thích**:
- **Kiểm định**: Kiểm tra chất lượng vật lý (VD: test pin còn 80% dung lượng)
- **Kiểm duyệt**: Admin xem xét và phê duyệt bài đăng (review & approve)

**⚠️ LỖI THƯỜNG GẶP**:
- ❌ Dùng "kiểm định" cho việc Admin duyệt bài
- ❌ Dùng "verification" nhầm lẫn

**✅ GIẢI PHÁP**:
- ✅ Dùng **"Kiểm duyệt"** cho Admin review
- ✅ Dùng **"Kiểm định"** cho việc kiểm tra chất lượng thực tế (nếu có)

**📋 CHECKLIST TRƯỚC KHI DEMO**:
- [ ] Tìm và sửa tất cả "kiểm định" → "kiểm duyệt" (nếu nghĩa là Admin review)
- [ ] Chuẩn bị giải thích sự khác biệt

---

## 🟢 RỦI RO THẤP (LOW) - Nhưng vẫn nên chú ý

### 11. ⚠️ Không có Breadcrumb

**Vấn đề**:
> Giảng viên sẽ hỏi: "User đang ở trang nào? Làm sao quay lại trang trước?"

**✅ GIẢI PHÁP**:
- Thêm breadcrumb: `Trang chủ > Danh sách bài đăng > Chi tiết bài đăng`

---

### 12. ⚠️ Không có Pagination

**Vấn đề**:
> Nếu có 1000 bài đăng, giảng viên sẽ hỏi: "Em load hết 1000 bài một lúc à?"

**✅ GIẢI PHÁP**:
- Backend: Dùng `limit` và `offset`
- Frontend: Dùng TanStack Query với `useInfiniteQuery`

---

### 13. ⚠️ Không có Loading State

**Vấn đề**:
> Khi API chậm, giảng viên sẽ hỏi: "Trang này bị đơ à?"

**✅ GIẢI PHÁP**:
```typescript
{isLoading ? (
  <div>Đang tải...</div>
) : (
  <PostList posts={data} />
)}
```

---

## 📋 CHECKLIST TỔNG THỂ TRƯỚC KHI DEMO

### Backend
- [ ] Tất cả transaction phải atomic (dùng `dataSource.transaction()`)
- [ ] Validate input ở Controller (`@IsString()`, `@Min()`, `@Max()`)
- [ ] Validate business logic ở Service (số dư ví, quyền xem thông tin)
- [ ] Có log rõ ràng cho các thao tác quan trọng
- [ ] Swagger docs đầy đủ và chính xác

### Frontend
- [ ] Hiển thị loading state khi fetch data
- [ ] Hiển thị error message rõ ràng
- [ ] Validate form trước khi submit
- [ ] Không cho phép double-submit (disable button khi loading)
- [ ] Test responsive (mobile/desktop)

### Database
- [ ] Có foreign key constraint
- [ ] Có index cho các cột hay query
- [ ] Có audit fields (`created_at`, `updated_at`)
- [ ] Backup database trước khi demo

### Testing
- [ ] Test happy path (luồng chính)
- [ ] Test edge cases (số dư không đủ, post không tồn tại)
- [ ] Test với nhiều role khác nhau (User, Admin)
- [ ] Test trên browser khác nhau (Chrome, Firefox)

---

## 🎯 ĐIỂM SỐI THƯỜNG THẤY CỦA GIẢNG VIÊN

### Câu hỏi thường gặp:

1. **"Em giải thích luồng tiền từ A đến Z"**
   - ➡️ Chuẩn bị diagram và screenshot database

2. **"Tại sao không có tính năng X?"**
   - ➡️ Trỏ vào tài liệu yêu cầu: "(Không làm)" hoặc "Out of scope"

3. **"Nếu hacker làm Y thì sao?"**
   - ➡️ Giải thích validation ở cả Backend và Frontend

4. **"Sàn thu phí thế nào?"**
   - ➡️ Giải thích Fee Tier + Commission Rate

5. **"Code này ai viết?"**
   - ➡️ `git blame` hoặc `git log` để chứng minh

---

## 🚨 NHỮNG VIỆC TUYỆT ĐỐI KHÔNG NÊN LÀM

1. ❌ **KHÔNG bỏ tính năng cốt lõi** chỉ vì sợ bug
   - VD: Bỏ module Wallet vì sợ lỗi transaction → MẤT ĐIỂM NẶNG

2. ❌ **KHÔNG hardcode** giá trị trong code
   - VD: `const FEE = 5%` → Phải lưu trong database

3. ❌ **KHÔNG để lỗi Frontend/Backend không nhất quán**
   - VD: Frontend gọi API `/posts/compare` nhưng Backend không có endpoint này

4. ❌ **KHÔNG commit trực tiếp lên `main` branch**
   - Dùng Pull Request để dễ review

5. ❌ **KHÔNG demo khi chưa test kỹ**
   - Test ít nhất 3 lần trước khi demo

---

## 🎯 KẾT LUẬN

**Top 3 điểm quan trọng nhất**:
1. 🔴 **Luồng tiền phải minh bạch** (Buyer trả = Seller nhận + Phí hoa hồng)
2. 🔴 **Phải có tính năng So sánh** (FR-M13)
3. 🔴 **Ẩn thông tin liên hệ** cho đến khi mua sản phẩm

**Nếu làm đúng 3 điểm này → 80% cơ hội pass đồ án**

---

**📅 Cập nhật lần cuối**: 23/11/2025  
**🔗 Liên kết**: Đọc kèm `03_refactor_checklist.md` để biết cách implement
