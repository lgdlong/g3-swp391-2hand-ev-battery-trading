# Refunds Cron Job Documentation

## Tổng quan

Cron job tự động quét và hoàn tiền cho các posts hết hạn mỗi ngày lúc 00:00 (12h đêm).

## Cấu hình

### Schedule
- **Thời gian chạy**: Mỗi ngày lúc 00:00 (12h đêm)
- **Timezone**: Asia/Ho_Chi_Minh (GMT+7)
- **Service**: `RefundsCronService`

### Refund Policy
Theo các scenario đã định nghĩa:

| Scenario | Refund Rate | Trigger | Notes |
|----------|-------------|---------|-------|
| **EXPIRED** | 80% | Auto (Cron) | Post hết hạn, không có gian lận |
| **CANCEL_EARLY** | 100% | Manual | User hủy sớm |
| **HIGH_INTERACTION** | 50% | Auto/Admin | Hủy sau tương tác cao |
| **FRAUD_SUSPECTED** | Hold 3-5 days | Admin only | Nghi ngờ gian lận |

## Logic xử lý

### 1. Tìm posts cần refund

Điều kiện để post được auto refund:
- ✅ Post `created_at` > 30 ngày (coi như hết hạn)
- ✅ Post `status` = `PUBLISHED` (đang hiển thị)
- ✅ Có `PaymentOrder` với `status` = `COMPLETED`
- ✅ Chưa có `Refund` record cho payment order đó
- ✅ `payableType` = `'POST'`

### 2. Xử lý refund

Mỗi post đủ điều kiện sẽ:
1. Tìm `PaymentOrder` tương ứng
2. Gọi `RefundsService.handleRefund()` với scenario `EXPIRED` (80%)
3. Chuyển tiền từ system vào ví seller
4. Tạo `Refund` record với status `REFUNDED`
5. Log kết quả

### 3. Logging

Cron job ghi log chi tiết:
- 🔄 Bắt đầu quét
- 📋 Số lượng posts tìm thấy
- ✅ Refund thành công
- ❌ Refund thất bại (với error stack)
- 🎯 Tổng kết (success/failed count)

## API Endpoints

### Manual Trigger (Testing)

```http
POST /refunds/cron/trigger-expired-refund
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "processed": 5,
  "success": 4,
  "failed": 1
}
```

⚠️ **Chỉ dùng để test**. Production sẽ tự động chạy theo schedule.

## Testing

### 1. Test manual trigger

```bash
# Login as admin để lấy token
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Trigger manual refund check
curl -X POST http://localhost:8000/refunds/cron/trigger-expired-refund \
  -H "Authorization: Bearer {token}"
```

### 2. Kiểm tra logs

```bash
# Xem logs của cron job
grep "CRON" api.log

# Hoặc trong NestJS console
# Tìm logs có prefix [RefundsCronService]
```

### 3. Verify database

```sql
-- Kiểm tra refunds đã tạo
SELECT * FROM refunds 
WHERE scenario = 'EXPIRED' 
ORDER BY created_at DESC;

-- Kiểm tra wallet transactions
SELECT wt.* 
FROM wallet_transactions wt
JOIN refunds r ON r.wallet_transaction_id = wt.id
WHERE r.scenario = 'EXPIRED';
```

## Monitoring

### Metrics cần theo dõi

1. **Success rate**: Tỷ lệ refund thành công/tổng số
2. **Processing time**: Thời gian xử lý mỗi batch
3. **Failed refunds**: Số lượng và lý do thất bại
4. **Total amount refunded**: Tổng số tiền hoàn trả

### Alerts

Nên setup alerts cho:
- ❌ Cron job failed to start
- ❌ Success rate < 90%
- ❌ Processing time > 5 minutes
- ⚠️ Số lượng posts cần refund > threshold

## Troubleshooting

### Cron job không chạy

1. Kiểm tra `ScheduleModule` đã được import trong `AppModule`
2. Kiểm tra `RefundsCronService` đã được register trong `RefundsModule`
3. Xem logs startup xem có error không

### Refund thất bại

Các lỗi thường gặp:
1. **Payment order not found**: Post không có payment
2. **Wallet topUp failed**: Lỗi wallet service
3. **Refund policy not found**: Chưa config policy trong DB

### Cron job chạy nhưng không refund

1. Kiểm tra điều kiện query có đúng không
2. Verify có posts đủ điều kiện trong DB không
3. Kiểm tra timezone config

## Configuration

### Thay đổi schedule

File: `refunds-cron.service.ts`

```typescript
// Thay đổi từ midnight sang 2h sáng
@Cron('0 2 * * *', {
  name: 'auto-refund-expired-posts',
  timeZone: 'Asia/Ho_Chi_Minh',
})
```

### Thay đổi expired logic

File: `refunds-cron.service.ts`

```typescript
// Thay đổi từ 30 ngày sang 60 ngày
const sixtyDaysAgo = new Date();
sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
```

### Thay đổi refund rate

File: `refund-policy` table trong database

```sql
UPDATE refund_policy 
SET expired_rate = 90  -- Thay từ 80% sang 90%
WHERE id = 1;
```

## Security

- ✅ Cron job chạy với system user (sub: 0)
- ✅ Manual trigger chỉ admin mới gọi được
- ✅ Tất cả refunds được log đầy đủ
- ✅ Không thể refund 2 lần cho cùng payment

## Future Improvements

1. [ ] Thêm field `expiresAt` vào Post entity
2. [ ] Implement retry mechanism cho failed refunds
3. [ ] Send notification đến user khi refund thành công
4. [ ] Dashboard để monitor cron job metrics
5. [ ] Export refund reports
6. [ ] Add dead letter queue cho failed refunds

## Related Files

- `apps/api/src/modules/refunds/refunds-cron.service.ts` - Cron job logic
- `apps/api/src/modules/refunds/refunds.service.ts` - Refund business logic
- `apps/api/src/modules/refunds/refunds.controller.ts` - Manual trigger endpoint
- `apps/api/src/modules/refunds/refunds.module.ts` - Module registration
- `apps/api/src/app.module.ts` - ScheduleModule registration

## Support

Nếu có vấn đề với cron job, liên hệ:
- Backend team lead
- DevOps team (nếu liên quan infrastructure)
- Check logs và database để debug
