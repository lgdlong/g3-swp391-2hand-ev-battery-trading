# Refunds Module - Complete Documentation & Conversation Summary

## 📌 Quick Links

### GitHub Copilot Chat Conversation
**Full Conversation Thread**: [View in GitHub Copilot Chat History]
- **Date**: November 6-7, 2025
- **Participants**: User (Backend Developer) + GitHub Copilot AI
- **Topic**: Refunds Module Implementation & Debugging
- **Total Messages**: 30+ interactions

> **Note**: To access this conversation:
> 1. Open GitHub Copilot Chat in VS Code
> 2. View Chat History
> 3. Search for: "refunds" or "review lại refunds"
> 4. Date range: Nov 6-7, 2025

### Repository
- **GitHub**: https://github.com/lgdlong/g3-swp391-2hand-ev-battery-trading  
- **Branch**: `feat/backend/api-refund-policy`  
- **Module**: `apps/api/src/modules/refunds/`

---

## 🎯 Overview

The Refunds module handles automatic and manual refund processing for post deposits in the EV Battery Trading Platform.

**Key Features**:
- ✅ Automatic refund via daily cron job
- ✅ Manual refund with admin approval workflow
- ✅ Dry run preview mode
- ✅ Fraud detection support (0% refund)
- ✅ Complete audit trail with wallet transactions

---

## 📊 Technical Architecture

### Database Schema
**Table**: `refunds`
```sql
refunds
├── id (bigint PK) - Auto-increment refund ID
├── post_id (bigint FK → posts) - Related post
├── account_id (int FK → accounts) - User receiving refund
├── scenario (enum) - Refund scenario type
├── policy_rate_percent (smallint) - Rate snapshot (0-100)
├── amount_original (numeric) - Original deposit amount
├── amount_refund (numeric) - Actual refund amount
├── status (enum) - Current status
├── reason (varchar, nullable) - Refund reason/notes
├── held_until (timestamptz, nullable) - Hold period
├── wallet_transaction_id (int FK → wallet_transactions, nullable)
├── refunded_at (timestamptz, nullable) - Completion timestamp
├── created_at (timestamptz) - Creation timestamp
└── updated_at (timestamptz) - Last update timestamp
```

### Enums

**RefundScenario**:
```typescript
enum RefundScenario {
  CANCEL_EARLY = 'CANCEL_EARLY',      // < 7 days → 100%
  CANCEL_LATE = 'CANCEL_LATE',        // 7-30 days → 70%
  EXPIRED = 'EXPIRED',                // > 30 days → 50%
  FRAUD_SUSPECTED = 'FRAUD_SUSPECTED' // Fraud → 0%
}
```

**RefundStatus**:
```typescript
enum RefundStatus {
  PENDING = 'PENDING',     // Awaiting admin approval
  REFUNDED = 'REFUNDED',   // Successfully refunded
  REJECTED = 'REJECTED',   // Rejected by admin
  FAILED = 'FAILED'        // Technical failure
}
```

### API Endpoints Summary
| Method | Endpoint | Auth | Response Type | Description |
|--------|----------|------|---------------|-------------|
| GET | `/refunds` | Admin | `RefundResponseDto[]` | Get all refunds |
| GET | `/refunds/pending` | Admin | `RefundResponseDto[]` | Get pending refunds |
| POST | `/refunds/manual` | Admin | `ManualRefundResponseDto` | Create manual refund (PENDING) |
| POST | `/refunds/:id/decide` | Admin | `AdminDecideRefundResponseDto` | Approve or reject |
| POST | `/refunds/cron/trigger-expired-refund` | Admin | `CronTriggerResponseDto` | [TEST] Trigger cron |

---

## Conversation Flow & Key Decisions

### 1. Initial Review Request
**User**: "review lại refunds cho tôi theo luồng như thế nào làm sao chạy"

**Analysis**:
- Identified 5 admin APIs + 1 cron job for refunds
- Found logic conflict: Refund entity used `PaymentOrder` but cron needed `post_payments`
- Business rules needed clarification

**Decision**: User specified new refund rates:
- CANCEL_EARLY (< 7 days): 100%
- CANCEL_LATE (7-30 days): 70%
- EXPIRED (> 30 days): 50%
- FRAUD_SUSPECTED: 0%

### 2. Entity Optimization
**User**: "không tôi muốn refunds_policy và refunds link nhau để giảm bớt 1 số field thôi"

**Changes Made**:
- Cleaned Refund entity from 18 → 13 fields
- Removed redundant fields: `postPaymentId`, `performedByAdminId`, `PaymentOrder` relation, `triggerType`, `heldUntil`
- Linked with `refund_policy` table to reduce duplication
- Updated `RefundScenario` enum with 4 values

**Files Modified**:
```
apps/api/src/modules/refunds/
├── entities/refund.entity.ts          # 13 fields only
├── entities/refund-policy.entity.ts   # Added cancelLateRate
└── enums/refund-scenario.enum.ts      # 4 scenarios
```

### 3. Synchronization Issue
**User**: "cả 2 admin và cron phải đồng bộ nhau chứ"

**Problem**: Admin APIs and cron job had different logic paths

**Solution**:
- Both now use `post_payments` table for deposit tracking
- Created unified `WalletsService.refund()` method
- Set `service_type_id = 3` (DEPOSIT_REFUND) for all refund transactions

**Key Code**:
```typescript
// WalletsService.refund()
const serviceType = await this.findOrCreateByCode(
  'DEPOSIT_REFUND',
  'Hoàn tiền đặt cọc',
  'Refund deposit payment'
);
transaction.serviceTypeId = serviceType.id; // ID = 3
transaction.relatedEntityType = 'refunds';
transaction.relatedEntityId = refundId;
```

### 4. Database Enum Bug
**User**: "sao nó lỗi INSERT vậy?"

**Error**: `invalid input syntax for type smallint: "0.2"`

**Root Cause**: 
1. PostgreSQL enum had old value `HIGH_INTERACTION` instead of `CANCEL_LATE`
2. TypeORM synchronize doesn't auto-update enum values

**Fix**:
```sql
DROP TYPE refunds_scenario_enum CASCADE;
-- Then restart server to recreate enum
```

**Lesson Learned**: PostgreSQL enums are independent types, must be manually updated

### 5. Service Type Configuration
**User**: "có cách nào chỉnh service_type_id vô số 3 k ?"

**Problem**: Code used generic 'REFUND' instead of specific 'DEPOSIT_REFUND'

**Fix**: Changed `WalletsService.refund()` to use correct service type:
```typescript
// Before
findOrCreateByCode('REFUND', ...)

// After  
findOrCreateByCode('DEPOSIT_REFUND', ...) // Maps to ID=3 in DB
```

### 6. Architecture Validation
**User**: "transaction api ấy nên để FE gọi hay là sử dụng module khác gọi nhau qua service ?"

**Context**: `TransactionsController.recordPostDeposit()` endpoint

**Decision**:
- **This endpoint**: For FE to call (external payment flow)
- **WalletsService.refund()**: Internal service-to-service call

**Reasoning**:
| Aspect | FE Call | Service-to-Service |
|--------|---------|-------------------|
| Trigger | User action + payment gateway | Business logic |
| Purpose | Record payment result | Execute refund |
| Exposure | Public API | Internal method |
| Orchestration | Frontend | Backend |

### 7. Fraud Detection Question
**User**: "gian lận giao dịch -> hoàn 0% cron đâu phát hiên được đúng k"

**Answer**: ✅ Correct! Cron CANNOT detect fraud automatically

**Logic**:
```
Cron handles:
├─ CANCEL_EARLY (time-based)
├─ CANCEL_LATE (time-based)  
└─ EXPIRED (time-based)

Admin handles:
└─ FRAUD_SUSPECTED (manual review)
```

**Workflow**:
1. Admin detects fraud (reports, patterns, monitoring)
2. Admin calls `POST /refunds/manual` with `scenario: "FRAUD_SUSPECTED"`
3. System creates refund with `policyRatePercent = 0%`
4. Admin approves → User receives 0đ

### 8. Manual Refund API Usage
**User**: "cái thủ công đó xài sao vậy gọi api sao v"

**Explained**:
```json
POST /refunds/manual
{
  "postId": "123",
  "scenario": "FRAUD_SUSPECTED",
  "reason": "User tạo post giả để lấy refund",
  "dryRun": false
}
```

**Features**:
- `dryRun: true` → Preview only, no DB write
- `dryRun: false` → Create actual refund record
- Supports custom scenarios and rates
- Admin can override policy

### 9. Dry Run Bug
**User**: "set dryRun false sao vẫn trả true"

**Problem**: Response hardcoded `dryRun: true`

**Fix**:
```typescript
// Before
return { dryRun: true, ... }

// After
return { dryRun: dto.dryRun, ... }
```

### 10. Database Save Issue
**User**: "sao false true gì cũng k thấy nó gửi về db vậy"

**Investigation**: 
- Added debug logs `[REFUND]` throughout the flow
- Found logic was correct but need to verify execution

**Problem Found**: `policy_rate_percent` type mismatch
```
DB expects: smallint (integer)
Code sent: 0.2 (decimal from policy)
```

**Fix**:
```typescript
const rate = Math.round(Number(rateFromPolicy)); // Ensure integer
```

### 11. Merge Conflict Fix
**User**: "tui merge có bị gì k nhỉ ?"

**Error**: `SyntaxError: Identifier 'TransactionsService' has already been declared`

**Cause**: Duplicate class declarations after merge

**Fix**:
1. Merged duplicate imports
2. Removed duplicate `TransactionsService` class
3. Combined all methods into single class
4. Unified `postPaymentRepo` → `postPaymentRepository`

**Files Fixed**:
```
apps/api/src/modules/transactions/
├── transactions.service.ts   # Merged 2 classes → 1
└── transactions.controller.ts # Added missing imports
```

### 12. Manual Refund Flow Change
**User**: "Option 2 đi" (Manual refund creates PENDING, requires approval)

**Before**:
```
POST /refunds/manual → Create PENDING → Refund immediately → REFUNDED
```

**After**:
```
POST /refunds/manual → Create PENDING → Wait
                                      ↓
POST /refunds/:id/decide → approve → REFUNDED
                        → reject → REJECTED
```

**Key Change**:
```typescript
// Removed immediate wallet refund
// Now only creates PENDING record
return {
  success: true,
  refundId: savedRefund.id,
  status: RefundStatus.PENDING,
  message: 'Refund request created. Use POST /refunds/:id/decide to approve or reject.'
};
```

### 13. Swagger Documentation Request
**User**: "tạo dùm swagger cho refunds đi rôi tạo luôn cả file ai-prompt ở thai-F15"

**Created Files**:
1. **Response DTOs** (`refund-response.dto.ts`):
   - `RefundResponseDto`
   - `ManualRefundResponseDto`
   - `DryRunResponseDto`
   - `AdminDecideRefundResponseDto`
   - `CronTriggerResponseDto`

2. **Updated Controller** with `@ApiResponse` decorators

3. **AI Prompt Docs** (`refunds-module.md` & this file)

---

## Final Architecture

### Database Schema
```sql
refunds
├── id (bigint PK)
├── post_id (bigint FK → posts)
├── account_id (int FK → accounts)
├── scenario (enum: CANCEL_EARLY | CANCEL_LATE | EXPIRED | FRAUD_SUSPECTED)
├── policy_rate_percent (smallint: 0-100)
├── amount_original (numeric)
├── amount_refund (numeric)
├── status (enum: PENDING | REFUNDED | REJECTED | FAILED)
├── reason (varchar, nullable)
├── held_until (timestamptz, nullable)
├── wallet_transaction_id (int FK → wallet_transactions, nullable)
├── refunded_at (timestamptz, nullable)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

### API Endpoints
| Method | Endpoint | Auth | Response Type | Description |
|--------|----------|------|---------------|-------------|
| GET | `/refunds` | Admin | `RefundResponseDto[]` | Get all refunds |
| GET | `/refunds/pending` | Admin | `RefundResponseDto[]` | Get pending refunds |
| POST | `/refunds/manual` | Admin | `ManualRefundResponseDto` or `DryRunResponseDto` | Create manual refund (PENDING) |
| POST | `/refunds/:id/decide` | Admin | `AdminDecideRefundResponseDto` | Approve or reject |
| POST | `/refunds/cron/trigger-expired-refund` | Admin | `CronTriggerResponseDto` | [TEST] Trigger cron |

### Service Flow

#### Cron Job (Automatic)
```
Daily 00:00
  ↓
Query posts with reviewed_at
  ↓
Calculate days elapsed
  ↓
Determine scenario (CANCEL_EARLY, CANCEL_LATE, EXPIRED)
  ↓
Get deposit from post_payments
  ↓
Calculate refund = deposit * (rate / 100)
  ↓
Create Refund record (PENDING)
  ↓
Call walletsService.refund()
  ↓
Update status → REFUNDED
```

#### Manual Refund
```
Admin: POST /refunds/manual
  ↓
System: Create Refund (PENDING)
  ↓
Admin: GET /refunds/pending (review)
  ↓
Admin: POST /refunds/:id/decide
  ├─ approve → walletsService.refund() → REFUNDED
  └─ reject → No wallet change → REJECTED
```

---

## Key Technical Decisions

### 1. Service-to-Service Communication
✅ **Correct Pattern**: `RefundsService → WalletsService.refund()`

**Benefits**:
- Transactional consistency
- Centralized business logic
- Single source of truth for wallet operations
- Easier error handling and rollback

### 2. PENDING Status Strategy
All manual refunds now create PENDING records requiring approval.

**Rationale**:
- Admin oversight for manual cases
- Prevent accidental refunds
- Audit trail for decisions
- Fraud case handling (0% refund)

### 3. Dry Run Feature
Preview calculations without DB writes.

**Use Cases**:
- Verify refund amounts before execution
- Test custom rates
- Check scenario detection logic
- Training new admins

### 4. Database Type Safety
Use `Math.round()` to ensure integer rates for `smallint` columns.

**Prevention**:
```typescript
const rate = Math.round(Number(policyRate)); // 0.2 → 0, 70.5 → 71
```

---

## Testing Checklist

### Manual Testing Steps
1. ✅ **Dry Run**: Test calculation preview
   ```bash
   POST /refunds/manual
   { "postId": "75", "dryRun": true, "reason": "Test" }
   ```

2. ✅ **Create PENDING**: Verify no immediate refund
   ```bash
   POST /refunds/manual
   { "postId": "75", "reason": "Manual request", "dryRun": false }
   ```

3. ✅ **Review Pending**: Check refund appears in list
   ```bash
   GET /refunds/pending
   ```

4. ✅ **Approve**: Verify wallet credit + status change
   ```bash
   POST /refunds/10/decide
   { "decision": "approve", "adminNotes": "Verified" }
   ```

5. ✅ **Check Wallet**: Verify transaction created
   ```sql
   SELECT * FROM wallet_transactions WHERE service_type_id = 3 AND related_entity_id = 10;
   ```

6. ✅ **Trigger Cron**: Test automatic refunds
   ```bash
   POST /refunds/cron/trigger-expired-refund
   ```

### Expected Results
- Dry run returns calculation, no DB write
- Manual refund creates PENDING (not REFUNDED)
- Approve creates wallet_transaction with service_type_id=3
- Reject sets status=REJECTED, no wallet change
- Cron processes eligible posts based on reviewed_at

---

## Common Issues & Solutions

### Issue 1: PostgreSQL Enum Error
**Error**: `INSERT failed: invalid input value for enum`

**Solution**: Drop and recreate enum type
```sql
DROP TYPE refunds_scenario_enum CASCADE;
-- Restart server
```

### Issue 2: Duplicate Class Declaration
**Error**: `Identifier 'TransactionsService' has already been declared`

**Solution**: Merge duplicate classes, consolidate imports

### Issue 3: Type Mismatch (smallint vs decimal)
**Error**: `invalid input syntax for type smallint: "0.2"`

**Solution**: `Math.round()` before saving to DB

### Issue 4: Manual Refund Executes Immediately
**Problem**: Expected PENDING but got REFUNDED

**Solution**: Remove immediate `walletsService.refund()` call, return PENDING

### Issue 5: service_type_id Incorrect
**Problem**: Transactions have wrong service type

**Solution**: Use `findOrCreateByCode('DEPOSIT_REFUND', ...)` → ID=3

---

## Future Improvements

### Short Term
1. Add email notifications when refund is processed
2. Implement batch approval for multiple PENDING refunds
3. Add refund history per user for analytics
4. Create admin dashboard for refund monitoring

### Long Term
1. User-initiated refund requests (user → admin approval)
2. ML-based fraud detection (auto-flag suspicious patterns)
3. Partial refunds (custom amounts, not just percentages)
4. Refund scheduling (delay refund to specific date)
5. Multi-tier approval workflow (reviewer → approver)

---

## Related Documentation

- **Main Module Doc**: `./refunds-module.md`
- **API Reference**: Swagger UI at `/api/docs`
- **Database Schema**: `apps/db/migrations/`
- **Entity Definitions**: `apps/api/src/modules/refunds/entities/`
- **Service Logic**: `apps/api/src/modules/refunds/*.service.ts`

---

## Links & Resources

### Repository
- **GitHub**: https://github.com/lgdlong/g3-swp391-2hand-ev-battery-trading
- **Branch**: `feat/backend/api-refund-policy`

### Key Files
```
apps/api/src/modules/refunds/
├── refunds.controller.ts          # API endpoints
├── refunds.service.ts             # Business logic
├── refunds-cron.service.ts        # Cron job
├── entities/
│   ├── refund.entity.ts           # Main entity (13 fields)
│   └── refund-policy.entity.ts    # Policy rates
├── dto/
│   ├── manual-refund.dto.ts       # Request DTO
│   ├── admin-decide-refund.dto.ts # Approve/reject DTO
│   └── refund-response.dto.ts     # Response DTOs
└── enums/
    ├── refund-scenario.enum.ts    # 4 scenarios
    └── refund-status.enum.ts      # 4 statuses
```

### Integration Points
- `apps/api/src/modules/wallets/wallets.service.ts` - `refund()` method
- `apps/api/src/modules/transactions/transactions.service.ts` - Post payments
- `apps/api/src/modules/settings/entities/refund-policy.entity.ts` - Policy rates

---

## Conversation Participants
**User**: Project Developer (Backend)  
**AI Assistant**: GitHub Copilot / Technical Advisor

**Total Interactions**: 13 major conversation threads  
**Duration**: Multiple sessions  
**Outcome**: Fully functional refunds module with admin controls

---

**Last Updated**: 2025-11-07  
**Conversation Summary By**: GitHub Copilot  
**For**: thaiF15 (Backend Developer)
