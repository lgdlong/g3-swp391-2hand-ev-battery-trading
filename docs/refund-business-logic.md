# Refund Business Logic - Complete Coverage

## 📋 Business Requirements Coverage

Tài liệu này xác nhận hệ thống refund đã implement **đầy đủ 7 kịch bản** theo yêu cầu business.

---

## ✅ Kịch Bản Đã Implement

### 1️⃣ Giao dịch Thành công (SOLD)
**Điều kiện:**
- `post.status = SOLD`
- Người bán xác nhận đã bán (hoặc admin chuyển status)

**Tỷ lệ Hoàn:** `0%`  
**Phí Thu:** `100%`  
**Hành động:**
- Giữ 100% fee (không tạo refund record)
- Bài SOLD được **loại trừ** khỏi `findRefundCandidatePosts()`

**Implementation:**
```typescript
// refunds.service.ts
.andWhere('post.status != :soldStatus', { soldStatus: 'SOLD' })
```

**Scenario Enum:** `RefundScenario.TRANSACTION_SUCCESS`  
**Tham chiếu:** FR-M16b

---

### 2️⃣ Gian lận (Đã xác nhận)
**Điều kiện:**
- `post_fraud_flags.status = CONFIRMED`

**Tỷ lệ Hoàn:** `0%`  
**Phí Thu:** `100%`  
**Hành động:**
- Tạo record **REJECTED** ngay lập tức (không qua admin)
- Reason: "Fraud CONFIRMED by admin"

**Implementation:**
```typescript
// refunds-cron.service.ts
if (fraudFlag.status === FraudFlagStatus.CONFIRMED) {
  await createRefundRecord({
    scenario: RefundScenario.FRAUD_CONFIRMED,
    status: RefundStatus.REJECTED,
    refundPercent: 0,
  });
}
```

**Scenario Enum:** `RefundScenario.FRAUD_CONFIRMED`  
**Tham chiếu:** FR-A4, FR-M16c

---

### 3️⃣ Gian lận (Bị nghi ngờ)
**Điều kiện:**
- `post_fraud_flags.status = SUSPECTED`

**Tỷ lệ Hoàn:** `0%` (hoặc `fraudSuspectedRate` từ config)  
**Phé Thu:** Tạm giữ  
**Hành động:**
- Tạo Yêu cầu **PENDING** cho Admin duyệt thủ công
- Không tự động hoàn tiền

**Implementation:**
```typescript
// refunds-cron.service.ts
if (fraudFlag.status === FraudFlagStatus.SUSPECTED) {
  await createRefundRecord({
    scenario: RefundScenario.FRAUD_SUSPECTED,
    status: RefundStatus.PENDING,
    refundPercent: fraudSuspectedRate,
  });
}
```

**Scenario Enum:** `RefundScenario.FRAUD_SUSPECTED`  
**Tham chiếu:** FR-M23, FR-A4

---

### 4️⃣ Chống Bán Chui (Hủy sau khi Chat)
**Điều kiện:**
- `post.status = ARCHIVED` (user hủy bài)
- `conversations.hasMessages = true` (đã có tương tác chat)

**Tỷ lệ Hoàn:** `70%` (hoặc `cancelLateRate` từ config)  
**Phí Thu:** `30%`  
**Hành động:**
- Tạo Yêu cầu **PENDING** cho Admin duyệt
- Hoặc tự động hoàn 70% (tùy config)

**Implementation:**
```typescript
// helper/index.ts
if (post.status === ARCHIVED && hasChatActivity) {
  return {
    scenario: RefundScenario.CANCEL_LATE,
    rate: policy.cancelLateRate // 70%
  };
}
```

**Scenario Enum:** `RefundScenario.CANCEL_LATE`  
**Tham chiếu:** FR-M16c, FR-M23

---

### 5️⃣ Bài Hết hạn (Không bán được)
**Điều kiện:**
- `post.status = PUBLISHED` (chưa hủy, chưa bán)
- `daysSinceReviewed >= expirationDays` (ví dụ: 30 ngày)

**Tỷ lệ Hoàn:** `50%` (hoặc `expiredRate` từ config)  
**Phí Thu:** `50%`  
**Hành động:**
- Tự động Hoàn 50%
- Tạo record **REFUNDED** nếu không có flag/chat

**Implementation:**
```typescript
// helper/index.ts
if (post.status === PUBLISHED && daysSinceReviewed >= expirationDays) {
  return {
    scenario: RefundScenario.EXPIRED,
    rate: policy.expiredRate // 50%
  };
}
```

**Scenario Enum:** `RefundScenario.EXPIRED`  
**Tham chiếu:** FR-M16c, FR-A5b

---

### 6️⃣ Hủy sớm "Trong sạch" (Hủy do nhầm lẫn)
**Điều kiện:**
- `post.status = ARCHIVED` (user hủy bài)
- `conversations.hasMessages = false` (không có chat)
- `daysSinceReviewed < cancelEarlyDaysThreshold` (ví dụ: < 7 ngày)

**Tỷ lệ Hoàn:** `100%` (hoặc `cancelEarlyRate` từ config)  
**Phí Thu:** `0%`  
**Hành động:**
- Tự động Hoàn 100%
- Không mất phí

**Implementation:**
```typescript
// helper/index.ts
if (post.status === ARCHIVED && !hasChatActivity && daysSinceReviewed < threshold) {
  return {
    scenario: RefundScenario.CANCEL_EARLY,
    rate: policy.cancelEarlyRate // 100%
  };
}
```

**Scenario Enum:** `RefundScenario.CANCEL_EARLY`  
**Tham chiếu:** FR-M16c, FR-A5b

---

### 7️⃣ Hủy trễ "Trong sạch" (Hủy khi không có ai chat)
**Điều kiện:**
- `post.status = ARCHIVED` (user hủy bài)
- `conversations.hasMessages = false` (không có chat)
- `daysSinceReviewed >= cancelEarlyDaysThreshold` (ví dụ: ≥ 7 ngày)

**Tỷ lệ Hoàn:** `70%` (hoặc `cancelLateRate` từ config)  
**Phí Thu:** `30%`  
**Hành động:**
- Tự động Hoàn 70%

**Implementation:**
```typescript
// helper/index.ts
if (post.status === ARCHIVED && !hasChatActivity && daysSinceReviewed >= threshold) {
  return {
    scenario: RefundScenario.CANCEL_LATE,
    rate: policy.cancelLateRate // 70%
  };
}
```

**Scenario Enum:** `RefundScenario.CANCEL_LATE`  
**Tham chiếu:** refunds/helper

---

## 🎯 Ưu Tiên Xử Lý

Hệ thống kiểm tra theo thứ tự ưu tiên (Priority):

```
1. Gian lận (CONFIRMED/SUSPECTED) → 0%
   ↓
2. Chat Activity (Chống bán chui) → 70%
   ↓
3. Time-based (Hủy sớm/trễ, Hết hạn) → 100%/70%/50%
```

**Logic chi tiết:**

```typescript
// refunds-cron.service.ts - processRefundForCandidatePost()

// 1️⃣ Kiểm tra SOLD (loại trừ sớm)
if (post.status === SOLD) {
  // Không refund (đã bị loại ở findRefundCandidatePosts)
}

// 2️⃣ Kiểm tra Gian lận (ưu tiên cao nhất)
if (fraudFlag.status === CONFIRMED) {
  return REJECTED; // 0% refund
}
if (fraudFlag.status === SUSPECTED) {
  return PENDING; // 0% + admin review
}

// 3️⃣ Kiểm tra Chat Activity (chống bán chui)
if (hasChatActivity) {
  return CANCEL_LATE; // 70% (override time-based)
}

// 4️⃣ Kiểm tra Time-based
if (status === ARCHIVED && daysSinceReviewed < 7) {
  return CANCEL_EARLY; // 100%
}
if (status === ARCHIVED && daysSinceReviewed >= 7) {
  return CANCEL_LATE; // 70%
}
if (status === PUBLISHED && daysSinceReviewed >= 30) {
  return EXPIRED; // 50%
}
```

---

## 📊 Mapping Table

| Kịch bản | Điều kiện | Refund % | Status | Scenario Enum |
|----------|-----------|----------|--------|---------------|
| #1 SOLD | `status=SOLD` | 0% | *(không tạo record)* | `TRANSACTION_SUCCESS` |
| #2 Gian lận (CONFIRMED) | `fraud=CONFIRMED` | 0% | `REJECTED` | `FRAUD_CONFIRMED` |
| #3 Gian lận (SUSPECTED) | `fraud=SUSPECTED` | 0% | `PENDING` | `FRAUD_SUSPECTED` |
| #4 Bán chui | `ARCHIVED + chat` | 70% | `PENDING`/`REFUNDED` | `CANCEL_LATE` |
| #5 Hết hạn | `PUBLISHED + expired` | 50% | `REFUNDED` | `EXPIRED` |
| #6 Hủy sớm | `ARCHIVED + !chat + <7d` | 100% | `REFUNDED` | `CANCEL_EARLY` |
| #7 Hủy trễ | `ARCHIVED + !chat + ≥7d` | 70% | `REFUNDED` | `CANCEL_LATE` |

---

## 🔧 Configuration

Tất cả tỷ lệ refund được lưu trong bảng `refund_policies` (singleton record, ID=1):

```typescript
interface RefundPolicyConfig {
  cancelEarlyRate: number;           // Default: 1.0 (100%)
  cancelLateRate: number;            // Default: 0.7 (70%)
  expiredRate: number;               // Default: 0.5 (50%)
  fraudSuspectedRate: number;        // Default: 0.0 (0%)
  cancelEarlyDaysThreshold: number;  // Default: 7 days
  cancelLateDaysThreshold: number;   // Default: 7 days
}
```

Admin có thể thay đổi các giá trị này qua Settings UI.

---

## ✅ Validation Complete

**Kết luận:** Hệ thống refund đã implement **ĐÚNG VÀ ĐẦY ĐỦ** 7 kịch bản business requirements.

**Changes Made (Nov 12, 2025):**
1. ✅ Sửa Kịch bản #2 (CONFIRMED fraud): Tạo `REJECTED` thay vì `PENDING`
2. ✅ Thêm Kịch bản #1 (SOLD): Loại trừ khỏi refund candidates
3. ✅ Thêm enum scenarios mới: `FRAUD_CONFIRMED`, `TRANSACTION_SUCCESS`
4. ✅ Cập nhật documentation đầy đủ

**Files Modified:**
- `apps/api/src/modules/refunds/refunds-cron.service.ts`
- `apps/api/src/modules/refunds/refunds.service.ts`
- `apps/api/src/shared/enums/refund-scenario.enum.ts`

**Commit Message:**
```
refactor(refunds): align with 7 business scenarios + fix CONFIRMED fraud logic

- Fix Kịch bản #2: CONFIRMED fraud tạo REJECTED thay vì PENDING
- Add Kịch bản #1: Loại trừ SOLD khỏi refund candidates
- Add enum: FRAUD_CONFIRMED, TRANSACTION_SUCCESS
- Update docs: refund-business-logic.md
```
