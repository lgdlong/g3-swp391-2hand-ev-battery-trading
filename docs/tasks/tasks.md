# Checklist Tác Vụ Dự Án (FRD)
# Project: Second-hand EV & Battery Trading Platform

## 0. Guest (Khách chưa đăng nhập)
- [x] FR-G1: Xem danh sách tin đăng (public posts).
- [x] FR-G2: Tìm kiếm & lọc tin đăng theo: hãng, năm, dung lượng pin, tình trạng, giá.
- [x] FR-G3: Xem chi tiết tin đăng: ảnh, mô tả, thông số, thông tin người bán cơ bản.
- [x] FR-G4: Nhấn “Lưu/Bookmark” → chuyển hướng tới đăng nhập/đăng ký.

## 1. Member (Người dùng đã đăng ký)

### A. Đăng ký & Quản lý tài khoản
- [x] FR-M1: Đăng ký tài khoản bằng email/số điện thoại.
- [x] FR-M2: Đăng nhập/Đăng xuất bằng email.
- [x] FR-M3: Đăng nhập bằng Google.
- [x] FR-M4: Xem và chỉnh sửa profile (tên, số điện thoại, địa chỉ, avatar).
- [x] F. FR – API GEO.

### B. Đăng tin bán xe/pin
- [x] FR-M7: Form tạo tin đăng (ảnh, mô tả, thông số cơ bản).
- [x] FR-M71: Form tạo tin đăng cho ev.
- [x] FR-M72: Form tạo tin đăng cho battery.
- [x] FR-M8: Quản lý tin đăng (sửa, xóa, xem trạng thái pending/approved/rejected).
- [ ] FR-M9: AI/Rule-based gợi ý giá bán (stretch goal).

### C. Tìm kiếm & Mua
- [x] FR-M10: Tìm kiếm nâng cao: brand, year, battery capacity, tình trạng, price range.
- [x] FR-M11: Lọc và sort tin đăng: mới nhất, giá ↑↓, dung lượng pin.
- [x] FR-M12: Bookmark tin đăng yêu thích.
- [ ] FR-M13: So sánh nhiều tin đăng (≤ 3 tin).
- [ ] FR-M15: Đặt giá trong phiên đấu giá (auction).

### D. Giao dịch & Thanh toán
- [ ] FR-M16a: Deposit Payment (Seller Listing). (Status: Cần fix lại vài bug)
- [ ] FR-M16b: Fee Capture (đơn giản hóa).
- [ ] FR-M16c: Refund Policy (giữ nguyên logic cũ).
- [ ] FR-M17: PDF Contract (giữ & update).
- [ ] FR-M18: Xem và tải lịch sử hợp đồng.

### E. Hỗ trợ sau bán
- [ ] FR-M19: Đánh giá người bán (rating 1–5 sao + bình luận).
- [ ] FR-M20: Báo cáo giao dịch hoặc user (fraud report).
- [ ] FR-M22: Xác nhận giao dịch đôi bên (NEW).
- [ ] FR-M23: Fraud Signals (vẫn giữ).
- [ ] FR-M24: Seller Reputation.

## 2. Admin (Quản trị viên)
- [x] FR-A1: Quản lý người dùng (yêu cầu role admin).
- [x] FR-A1.1: Admin xem tất cả accounts.
- [x] FR-A1.2: Admin có thể ban account.
- [x] FR-A1.3: Admin có thể đổi role MEMBER → ADMIN.
- [x] FR-A2: Quản lý tin đăng (approve/reject, remove spam).
- [x] FR-A2.1: Admin duyệt approve bài đăng.
- [x] FR-A2.2: Admin từ chối bài đăng kèm lý do.
- [x] FR-A3: Gắn nhãn “Đã kiểm định” (verified badge) cho tin đăng.
- [ ] FR-A4: Admin Case Management.
- [x] FR-A5: Thiết lập phí & hoàn cọc admin settings.
- [ ] FR-A6: Dashboard thống kê. (Status: Cần update)
- [ ] FR-A7: Báo cáo nâng cao: doanh thu theo tháng, loại sản phẩm hot (stretch goal).

## 3. Quản lý Ví (Wallet Management)
- [x] FR-W1: Tạo và kích hoạt Ví điện tử.
- [x] FR-W2: Nạp tiền vào Ví (Top-up Wallet).
- [ ] FR-W3: Rút tiền từ Ví (Withdraw from Wallet).
- [x] FR-W4: Xem số dư và lịch sử giao dịch Ví.
- [ ] FR-W5: Liên kết tài khoản ngân hàng.

## 4. Chat (Trò chuyện)
- [x] FR-CHAT-M1: Khởi tạo cuộc trò chuyện từ tin đăng.
- [x] FR-CHAT-M2: Xem danh sách cuộc trò chuyện liên quan đến tin đăng.
- [x] FR-CHAT-M3: Gửi và nhận tin nhắn văn bản.
- [x] FR-CHAT-M4: Hiển thị lịch sử trò chuyện.
