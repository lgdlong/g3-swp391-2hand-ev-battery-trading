# Phân tích chênh lệch giữa `smaller-business` và Yêu cầu Giảng viên

**Ngày phân tích**: 23/11/2025  
**Người thực hiện**: Tech Lead - Đồ án tốt nghiệp (Thi lại)  
**Mục đích**: Xác định chênh lệch giữa code hiện tại và yêu cầu bắt buộc từ giảng viên

---

## 📊 Tổng quan so sánh nhánh

| **Nhánh** | **Trạng thái** | **Ưu điểm** | **Nhược điểm** |
|-----------|---------------|-------------|----------------|
| `smaller-business` | ✅ Đang sử dụng | Code sạch, bug đã fix, cấu trúc tốt | Thiếu nhiều module cốt lõi |
| `dev` | 🔄 Backup | Đầy đủ tính năng nghiệp vụ | Có bug, cấu trúc cũ |

---

## ❌ CÁC MODULE BỊ XÓA (CẦN KHÔI PHỤC)

### 1. **Module Chat (chat/)** - RỦI RO CAO ⚠️

**Trạng thái**: 
- ✅ Có trong `dev` 
- ❌ ĐÃ BỊ XÓA trong `smaller-business`

**Cấu trúc trong `dev`**:
```
apps/api/src/modules/chat/
├── chat.controller.ts
├── chat.gateway.ts        # WebSocket gateway
├── chat.module.ts
├── chat.service.ts
├── dto/
├── entities/
└── mappers/
```

**Phân tích rủi ro**:
- ⚠️ **WebSocket phức tạp**: Module này dùng WebSocket Gateway (real-time messaging)
- ⚠️ **Không có trong yêu cầu bắt buộc**: Giảng viên KHÔNG yêu cầu chức năng chat
- ⚠️ **Dễ phát sinh lỗi**: Chat real-time rất dễ có bug về connection/reconnection
- ⚠️ **Frontend đã xóa context**: File `apps/web/lib/chat-context.tsx` đã bị xóa trong `smaller-business`

**🎯 QUYẾT ĐỊNH CHIẾN LƯỢC**: 
```
❌ KHÔNG KHÔI PHỤC MODULE CHAT
```

**Lý do**:
1. Không phải yêu cầu bắt buộc (FR-M18, FR-M19 không có trong tài liệu)
2. Giảm complexity và rủi ro lỗi nghiêm trọng
3. Tiết kiệm thời gian để tập trung vào tính năng cốt lõi
4. Frontend đã xóa context → Khôi phục tốn thời gian

---

### 2. **Module Post Fraud Flags (post-fraud-flags/)** - KHÔNG QUAN TRỌNG

**Trạng thái**: 
- ✅ Có trong `dev` 
- ❌ ĐÃ BỊ XÓA trong `smaller-business`

**Cấu trúc trong `dev`**:
```
apps/api/src/modules/post-fraud-flags/
├── dto/
├── entities/
├── index.ts
├── post-fraud-flags.controller.ts
├── post-fraud-flags.module.ts
└── post-fraud-flags.service.ts
```

**Phân tích**:
- ⚠️ Module này liên quan đến **FR-M20**: Báo cáo giao dịch hoặc user (fraud report)
- ❌ **Tài liệu yêu cầu ghi rõ**: "(Không làm)"

**🎯 QUYẾT ĐỊNH CHIẾN LƯỢC**: 
```
❌ KHÔNG KHÔI PHỤC MODULE FRAUD FLAGS
```

**Lý do**: Không phải yêu cầu bắt buộc theo FR-M20

---

### 3. **Module Post Ratings (post-ratings/)** - CẦN KIỂM TRA ✅

**Trạng thái**: 
- ✅ Có trong `dev` (tên: `post-ratings/`)
- ⚠️ Có trong `smaller-business` nhưng TÊN KHÁC (tên: `post-review/`)

**Cấu trúc trong `dev`**:
```
apps/api/src/modules/post-ratings/
├── dto/
├── entities/
├── mappers/
├── post-ratings.controller.ts
├── post-ratings.module.ts
└── post-ratings.service.ts
```

**Cấu trúc trong `smaller-business`**:
```
apps/api/src/modules/post-review/
├── (có các file tương tự)
```

**Phân tích**:
- ✅ **Yêu cầu bắt buộc**: FR-M14 (Đánh giá và review người bán)
- ⚠️ Module này đã được ĐỔI TÊN: `post-ratings` → `post-review`
- ✅ Chức năng đã có trong `smaller-business`

**🎯 QUYẾT ĐỊNH CHIẾN LƯỢC**: 
```
✅ KHÔNG CẦN KHÔI PHỤC (ĐÃ CÓ VỚI TÊN KHÁC)
```

**Hành động cần làm**:
- Kiểm tra xem `post-review` có đầy đủ chức năng như `post-ratings` không
- Nếu thiếu, merge code từ `dev`

---

### 4. **Module Refunds (refunds/)** - QUAN TRỌNG ⚠️

**Trạng thái**: 
- ✅ Có trong `dev` 
- ❌ ĐÃ BỊ XÓA trong `smaller-business`

**Cấu trúc trong `dev`**:
```
apps/api/src/modules/refunds/
├── dto/
├── entities/
├── helper/
├── refunds-cron.service.ts      # CRON job tự động
├── refunds.controller.ts
├── refunds.module.ts
└── refunds.service.ts
```

**Phân tích nghiệp vụ**:
- ✅ **Liên quan đến luồng tiền**: Hoàn tiền khi bài đăng bị từ chối
- ✅ **Có CRON job**: Tự động xử lý hoàn tiền định kỳ
- ⚠️ **Không có trong yêu cầu bắt buộc**: FR-W3 (Rút tiền) ghi rõ "(Không làm)"
- ✅ **Nhưng logic nghiệp vụ cần**: Nếu Admin từ chối bài đăng, phải hoàn phí

**🎯 QUYẾT ĐỊNH CHIẾN LƯỢC**: 
```
⚠️ CÂN NHẮC KHÔI PHỤC (TÙY LOGIC NGHIỆP VỤ)
```

**Hành động cần làm**:
1. Kiểm tra xem `smaller-business` có xử lý hoàn phí khi Admin từ chối bài không?
2. Nếu KHÔNG → BẮT BUỘC khôi phục module `refunds`
3. Nếu CÓ (xử lý trực tiếp trong `posts.service.ts`) → Có thể bỏ qua

---

## ⚠️ CÁC TÍNH NĂNG THIẾU TRONG `smaller-business`

### 1. **FR-M13: So sánh nhiều tin đăng (≤ 3 tin)** - BẮT BUỘC

**Trạng thái**: 
- ❌ Không có trong `smaller-business`
- ❌ Không có trong `dev`
- ❌ Tài liệu ghi "(Không làm)" NHƯNG đây là lỗi đánh giá

**⚠️ CẢNH BÁO NGHIÊM TRỌNG**:
> Giảng viên THƯỜNG HỎI về tính năng "So sánh sản phẩm" trong các sàn TMĐT.  
> Đây là tính năng phổ biến của sàn xe/pin điện tử.

**🎯 QUYẾT ĐỊNH CHIẾN LƯỢC**: 
```
✅ PHẢI LÀM TÍNH NĂNG SO SÁNH
```

**Hành động cần làm**:
1. **Frontend**:
   - Thêm nút "So sánh" ở danh sách bài đăng
   - Tạo trang `/posts/compare?ids=1,2,3`
   - Hiển thị bảng so sánh (Price, Battery Capacity, Brand, Year, Condition)

2. **Backend**:
   - API: `GET /posts/compare?ids=1,2,3`
   - Validate: Tối đa 3 post
   - Response: Trả về thông tin chi tiết 3 post để Frontend render bảng

---

### 2. **Ẩn thông tin liên hệ (Chỉ hiện khi đã Mua/Cọc)** - BẮT BUỘC

**Trạng thái hiện tại**:
- ❌ Thông tin liên hệ (SĐT, địa chỉ) đang hiển thị công khai cho tất cả user

**Yêu cầu nghiệp vụ**:
> Chỉ hiển thị thông tin liên hệ người bán KHI:
> 1. User đã thanh toán mua sản phẩm, HOẶC
> 2. User đã cọc (nếu có tính năng đấu giá - hiện không có)

**🎯 QUYẾT ĐỊNH CHIẾN LƯỢC**: 
```
✅ PHẢI SỬA LOGIC HIỂN THỊ THÔNG TIN LIÊN HỆ
```

**Hành động cần làm**:
1. **Backend**:
   - Sửa API `GET /posts/:id`: Chỉ trả về `seller.phoneNumber` và `seller.address` nếu:
     - `req.user.id === post.sellerId` (chủ bài), HOẶC
     - Có bản ghi trong `wallet_transactions` với `related_entity_id = postId` và `service_type = 'PURCHASE'`
   
2. **Frontend**:
   - Nếu thông tin liên hệ bị ẩn, hiển thị:
     ```
     📞 Số điện thoại: *** **** *** (Mua sản phẩm để xem)
     📍 Địa chỉ: ***** (Mua sản phẩm để xem)
     ```

---

### 3. **Tách bảng Pin và Xe nhưng hiển thị chung** - ĐÃ LÀM ✅

**Trạng thái**:
- ✅ Database đã tách: `car_details`, `bike_details`, `battery_details`
- ✅ Hiển thị chung qua bảng `posts` với field `post_type` (EV_CAR, EV_BIKE, BATTERY)

**Không cần làm gì thêm**.

---

## 💰 CÁC VẤN ĐỀ VỀ LUỒNG TIỀN

### 1. **Đơn vị tiền tệ: VND hay Coin?**

**Trạng thái hiện tại**:
- ⚠️ Database: `wallets.balance` và `wallet_transactions.amount` dùng `DECIMAL(14,2)`
- ⚠️ Backend code: Có chỗ dùng VND, có chỗ dùng "coin"
- ⚠️ Frontend: Hiển thị "coin" ở một số nơi

**Yêu cầu bắt buộc**:
> FR-M16a: "Thanh toán Phí đăng tin bằng Ví"  
> FR-A6: "tổng số dư ví người dùng, tổng tiền nạp"  
> ➡️ **Sử dụng VND**

**🎯 QUYẾT ĐỊNH CHIẾN LƯỢC**: 
```
✅ THỐNG NHẤT TOÀN BỘ HỆ THỐNG DÙNG VND
```

**Hành động cần làm**:
1. **Backend**: Tìm và thay thế tất cả "coin" thành "VND" trong:
   - Swagger docs
   - Response DTOs
   - Log messages

2. **Frontend**: Thay thế tất cả "coin" thành "₫" hoặc "VND"

---

### 2. **Phí hoa hồng cho sàn (Platform Fee)**

**Trạng thái hiện tại**:
- ✅ Có bảng `fee_tiers` (quản lý phí đăng bài)
- ❌ **KHÔNG có logic thu phí khi giao dịch thành công**

**Yêu cầu nghiệp vụ**:
> Khi Buyer mua sản phẩm → Sàn phải thu phí hoa hồng từ Seller

**🎯 QUYẾT ĐỊNH CHIẾN LƯỢC**: 
```
⚠️ CẦN BỔ SUNG LOGIC PHÍ HOA HỒNG
```

**Hành động cần làm**:
1. **Database**: Thêm bảng `platform_commissions`:
   ```sql
   CREATE TABLE platform_commissions (
     id BIGSERIAL PRIMARY KEY,
     post_id BIGINT NOT NULL,
     seller_id INT NOT NULL,
     buyer_id INT NOT NULL,
     transaction_amount DECIMAL(14,2),
     commission_rate DECIMAL(5,2),    -- VD: 5.00 = 5%
     commission_amount DECIMAL(14,2),
     collected_at TIMESTAMP,
     FOREIGN KEY (post_id) REFERENCES posts(id)
   );
   ```

2. **Backend**: Thêm logic trong `TransactionsService`:
   ```typescript
   async processProductPurchase(buyerId, postId, amount) {
     // 1. Trừ tiền Buyer
     // 2. Cộng tiền Seller (sau khi trừ phí hoa hồng)
     // 3. Ghi nhận phí hoa hồng vào platform_commissions
   }
   ```

3. **Admin Dashboard**: Hiển thị "Tổng phí hoa hồng thu được" (FR-A6)

---

## 📝 THAY ĐỔI THUẬT NGỮ

### ❌ "Kiểm định" → ✅ "Kiểm duyệt"

**Trạng thái hiện tại**:
- ⚠️ Code có thể đang dùng từ "verification" hoặc "kiểm định"

**Yêu cầu bắt buộc**:
> FR-A3: Gắn nhãn "Đã kiểm định" (verified badge)  
> ➡️ Nhưng trong nghiệp vụ Việt Nam, "kiểm duyệt" chính xác hơn

**🎯 QUYẾT ĐỊNH CHIẾN LƯỢC**: 
```
✅ ĐỔI TẤT CẢ "KIỂM ĐỊNH" THÀNH "KIỂM DUYỆT"
```

**Hành động cần làm**:
1. Tìm tất cả file có từ "verification", "verified", "kiểm định"
2. Thay thế:
   - `verified` → `approved` (nếu nghĩa là "đã duyệt bài")
   - `verification` → `review` (nghĩa là "quá trình kiểm duyệt")
   - UI: "Đã kiểm định" → "Đã kiểm duyệt"

---

## 📋 TỔNG KẾT QUYẾT ĐỊNH

| **Module/Tính năng** | **Trạng thái** | **Quyết định** | **Độ ưu tiên** |
|---------------------|---------------|---------------|---------------|
| Module Chat | ❌ Đã xóa | ❌ Không khôi phục | - |
| Module Fraud Flags | ❌ Đã xóa | ❌ Không khôi phục | - |
| Module Post Ratings | ⚠️ Đổi tên | ✅ Giữ nguyên | - |
| Module Refunds | ❌ Đã xóa | ⚠️ Cân nhắc | 🔶 Medium |
| Tính năng So sánh | ❌ Chưa có | ✅ Phải làm | 🔴 High |
| Ẩn thông tin liên hệ | ❌ Chưa có | ✅ Phải làm | 🔴 High |
| Thống nhất VND | ⚠️ Inconsistent | ✅ Phải sửa | 🔴 High |
| Phí hoa hồng | ❌ Chưa có | ✅ Phải làm | 🔴 High |
| Đổi thuật ngữ | ⚠️ Chưa đổi | ✅ Phải làm | 🟡 Low |

---

## 🎯 KẾT LUẬN

**Chiến lược tổng thể**:
1. ✅ **GIỮ NGUYÊN NỀN TẢNG** `smaller-business` (code sạch, bug đã fix)
2. ❌ **KHÔNG KHÔI PHỤC** các module phức tạp không cần thiết (Chat, Fraud Flags)
3. ✅ **BỔ SUNG** các tính năng bắt buộc còn thiếu (So sánh, Ẩn thông tin, Phí hoa hồng)
4. ⚠️ **CÂN NHẮC** module Refunds nếu logic nghiệp vụ yêu cầu

**Ưu tiên thực hiện**:
1. 🔴 **Ưu tiên 1**: Tính năng So sánh, Ẩn thông tin liên hệ, Phí hoa hồng
2. 🔶 **Ưu tiên 2**: Kiểm tra module Refunds
3. 🟡 **Ưu tiên 3**: Đổi thuật ngữ, thống nhất VND

---

**📅 Timeline đề xuất**: 3-5 ngày (tùy độ phức tạp module Refunds)
