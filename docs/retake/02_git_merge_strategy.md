# Chiến lược Hợp nhất Git: `dev` → `smaller-business`

**Ngày tạo**: 23/11/2025  
**Người thực hiện**: Tech Lead - Đồ án tốt nghiệp  
**Mục đích**: Hướng dẫn merge thủ công từng phần từ nhánh `dev` sang `smaller-business`

---

## 🎯 Chiến lược tổng thể

**KHÔNG sử dụng `git merge dev`** vì sẽ:
- ❌ Merge toàn bộ code cũ (kể cả bug đã fix)
- ❌ Ghi đè code sạch trong `smaller-business`
- ❌ Tạo ra conflict khó xử lý

**THAY VÀO ĐÓ, sử dụng `git checkout` từng folder cụ thể**:
- ✅ Chỉ lấy module cần thiết
- ✅ Giữ nguyên code đã fix trong `smaller-business`
- ✅ Kiểm soát được từng file merge

---

## 📋 Danh sách Module cần khôi phục

Dựa trên phân tích từ `01_gap_analysis.md`:

| **Module** | **Quyết định** | **Độ ưu tiên** |
|-----------|---------------|---------------|
| `refunds/` | ⚠️ Cân nhắc | 🔶 Medium |
| ~~`chat/`~~ | ❌ Không khôi phục | - |
| ~~`post-fraud-flags/`~~ | ❌ Không khôi phục | - |
| ~~`post-ratings/`~~ | ❌ Đã có (tên `post-review`) | - |

**Kết luận**: Chỉ cần cân nhắc khôi phục module `refunds/`

---

## 🔍 BƯỚC 1: Kiểm tra logic Refunds trong `smaller-business`

Trước khi quyết định có khôi phục `refunds/` hay không, cần kiểm tra xem `smaller-business` đã xử lý hoàn tiền chưa.

### Lệnh kiểm tra:

```bash
# Tìm tất cả file có chứa từ "refund" trong smaller-business
git grep -i "refund" apps/api/src/

# Kiểm tra logic trong PostsService khi Admin từ chối bài
code apps/api/src/modules/posts/posts.service.ts

# Kiểm tra TransactionsService có xử lý hoàn tiền không
code apps/api/src/modules/transactions/transactions.service.ts
```

### Quyết định dựa trên kết quả:

**TH1: Nếu tìm thấy logic hoàn tiền trong `posts.service.ts` hoặc `transactions.service.ts`**:
```
✅ KHÔNG CẦN khôi phục module refunds
```

**TH2: Nếu KHÔNG tìm thấy logic hoàn tiền**:
```
⚠️ CẦN khôi phục module refunds từ dev
➡️ Chuyển sang BƯỚC 2
```

---

## 🔧 BƯỚC 2: Khôi phục Module Refunds (Nếu cần)

### 2.1. Checkout module từ `dev`

```bash
# Đảm bảo đang ở nhánh smaller-business
git status

# Nếu có uncommitted changes, stash chúng
git stash

# Checkout toàn bộ folder refunds từ dev
git checkout dev -- apps/api/src/modules/refunds/

# Kiểm tra file đã được checkout
ls apps/api/src/modules/refunds/
```

### 2.2. Kiểm tra dependencies

Module `refunds` có thể phụ thuộc vào:
- `WalletsService`
- `TransactionsService`
- `PostsService`

```bash
# Kiểm tra import trong refunds.service.ts
cat apps/api/src/modules/refunds/refunds.service.ts | grep "import"
```

### 2.3. Đăng ký module vào `app.module.ts`

```typescript
// apps/api/src/app.module.ts

import { RefundsModule } from './modules/refunds/refunds.module';

@Module({
  imports: [
    // ... các module khác
    RefundsModule,  // ← Thêm dòng này
  ],
})
export class AppModule {}
```

### 2.4. Kiểm tra CRON job

Module refunds có `refunds-cron.service.ts` (chạy định kỳ).

```bash
# Xem cấu hình CRON
cat apps/api/src/modules/refunds/refunds-cron.service.ts
```

**Kiểm tra**:
- ✅ CRON schedule (`@Cron('0 */6 * * *')` = chạy mỗi 6 giờ)
- ✅ Logic xử lý: Tìm các post bị reject → Hoàn phí tự động

---

## 🗄️ BƯỚC 3: Xử lý Database Schema

### 3.1. Kiểm tra bảng `refunds` đã tồn tại chưa

```bash
# SSH vào database hoặc dùng pgAdmin/DBeaver
psql -U your_username -d your_database_name

# Kiểm tra bảng
\dt refunds

# Nếu bảng KHÔNG tồn tại → Tạo migration
```

### 3.2. Tạo migration cho bảng Refunds (Nếu chưa có)

**File**: `apps/api/src/migrations/1700000000000-CreateRefundsTable.ts`

```typescript
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateRefundsTable1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'refunds',
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
            name: 'refund_amount',
            type: 'decimal',
            precision: 14,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'PENDING'",
          },
          {
            name: 'processed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Foreign Keys
    await queryRunner.createForeignKey(
      'refunds',
      new TableForeignKey({
        columnNames: ['post_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'posts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'refunds',
      new TableForeignKey({
        columnNames: ['seller_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'accounts',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('refunds');
  }
}
```

### 3.3. Chạy migration

```bash
cd apps/api

# Chạy migration
pnpm run migration:run

# Kiểm tra bảng đã tạo
psql -U your_username -d your_database_name -c "\dt refunds"
```

---

## ⚙️ BƯỚC 4: Xử lý Environment Variables

Module từ `dev` có thể yêu cầu các biến môi trường mới.

### 4.1. So sánh `.env` giữa 2 nhánh

```bash
# Xem .env của dev
git show dev:apps/api/.env.example

# So sánh với .env hiện tại
diff <(git show dev:apps/api/.env.example) apps/api/.env.example
```

### 4.2. Thêm biến môi trường mới (Nếu có)

**Ví dụ**:
```bash
# apps/api/.env

# Refunds Configuration (nếu module refunds yêu cầu)
REFUND_CRON_ENABLED=true
REFUND_AUTO_APPROVE=false
```

---

## 🔄 BƯỚC 5: Xử lý File Configuration

### 5.1. Kiểm tra `package.json`

Module từ `dev` có thể cần thư viện mới.

```bash
# So sánh package.json
git diff dev -- apps/api/package.json

# Nếu có dependency mới, cài đặt
pnpm install
```

### 5.2. Kiểm tra `app.module.ts`

Đảm bảo module mới đã được import (đã làm ở BƯỚC 2.3).

---

## 🧪 BƯỚC 6: Test sau khi merge

### 6.1. Build project

```bash
cd apps/api
pnpm run build
```

### 6.2. Start development server

```bash
pnpm run start:dev
```

### 6.3. Kiểm tra Swagger

Truy cập: `http://localhost:3000/api`

**Kiểm tra**:
- ✅ Endpoint `/refunds` xuất hiện trong Swagger (nếu có)
- ✅ CRON job đang chạy (xem log)

### 6.4. Test thủ công

**Scenario**: Admin từ chối bài đăng → Kiểm tra hoàn tiền

1. Tạo bài đăng → Thanh toán phí
2. Admin từ chối bài đăng với lý do
3. Kiểm tra:
   - ✅ Bản ghi trong bảng `refunds` được tạo
   - ✅ CRON job tự động xử lý hoàn tiền
   - ✅ `wallet_transactions` có giao dịch hoàn tiền (amount dương)
   - ✅ `wallets.balance` tăng lên

---

## 🚫 CÁC MODULE KHÔNG NÊN KHÔI PHỤC

### ❌ Module Chat

```bash
# KHÔNG chạy lệnh này
# git checkout dev -- apps/api/src/modules/chat/
```

**Lý do**:
- Không phải yêu cầu bắt buộc
- WebSocket phức tạp, dễ lỗi
- Frontend đã xóa context

### ❌ Module Post Fraud Flags

```bash
# KHÔNG chạy lệnh này
# git checkout dev -- apps/api/src/modules/post-fraud-flags/
```

**Lý do**: FR-M20 ghi rõ "(Không làm)"

---

## 🔧 BƯỚC 7: Xử lý Conflicts (Nếu có)

Nếu `git checkout dev -- ...` gây conflict:

```bash
# Xem file bị conflict
git status

# Mở file conflict
code path/to/conflicted/file.ts

# Giải quyết conflict thủ công:
# <<<<<<< HEAD
# Code từ smaller-business (GIỮ LẠI nếu đã fix bug)
# =======
# Code từ dev (CHỈ LẤY phần cần thiết)
# >>>>>>> dev

# Sau khi giải quyết
git add path/to/conflicted/file.ts
```

---

## 📦 BƯỚC 8: Commit thay đổi

```bash
# Kiểm tra file đã thay đổi
git status

# Add file mới
git add apps/api/src/modules/refunds/
git add apps/api/src/app.module.ts
git add apps/api/src/migrations/

# Commit với message rõ ràng
git commit -m "feat: khôi phục module Refunds từ nhánh dev

- Checkout module refunds/ từ dev
- Thêm RefundsModule vào app.module.ts
- Tạo migration cho bảng refunds
- Test CRON job hoàn tiền tự động

Relates-to: đồ án tốt nghiệp (retake)"

# Push lên remote
git push origin smaller-business
```

---

## 🔍 BƯỚC 9: Code Review Checklist

Trước khi demo cho giảng viên, kiểm tra:

- ✅ Module mới không gây lỗi build
- ✅ Migration chạy thành công trên database
- ✅ CRON job hoạt động (xem log)
- ✅ API endpoint test thành công qua Postman/Swagger
- ✅ Frontend (nếu cần) đã tích hợp
- ✅ Không có warning/error trong console
- ✅ Code style nhất quán (chạy `pnpm run lint`)

---

## 🎯 TÓM TẮT LỆNH QUAN TRỌNG

```bash
# === CHUẨN BỊ ===
git stash                          # Lưu changes hiện tại
git checkout smaller-business      # Đảm bảo đúng nhánh

# === KIỂM TRA LOGIC REFUND (QUAN TRỌNG) ===
git grep -i "refund" apps/api/src/

# === NẾU CẦN KHÔI PHỤC REFUNDS ===
git checkout dev -- apps/api/src/modules/refunds/
ls apps/api/src/modules/refunds/

# === ĐĂNG KÝ MODULE ===
# Sửa apps/api/src/app.module.ts (thủ công)

# === TẠO MIGRATION ===
# Tạo file migration (thủ công)
pnpm run migration:run

# === BUILD & TEST ===
cd apps/api
pnpm install
pnpm run build
pnpm run start:dev

# === COMMIT ===
git add .
git commit -m "feat: khôi phục module Refunds từ dev"
git push origin smaller-business
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **KHÔNG dùng `git merge dev`** → Sẽ ghi đè code đã fix
2. **CHỈ checkout từng module cụ thể** → Kiểm soát tốt hơn
3. **LUÔN test sau khi merge** → Tránh lỗi khi demo
4. **ƯU TIÊN giữ code trong `smaller-business`** → Chỉ merge khi thực sự cần

---

**📅 Thời gian dự kiến**: 2-3 giờ (bao gồm test)
