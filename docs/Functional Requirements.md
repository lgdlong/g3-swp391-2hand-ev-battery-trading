# **Functional Requirements Document (FRD) – Overview**

**Project:** Second-hand EV & Battery Trading Platform  
**Roles:** Guest, Member, Admin

---

## **0\. Guest (khách chưa đăng nhập)**

* **FR-G1**: Xem danh sách tin đăng (public posts). (Done)

* **FR-G2**: Tìm kiếm & lọc tin đăng theo: hãng, năm, dung lượng pin, tình trạng, giá. (Done)

* **FR-G3**: Xem chi tiết tin đăng: ảnh, mô tả, thông số, thông tin người bán cơ bản. (Done)

---

## **1\. Member (Người dùng đã đăng ký)**

### **A. Đăng ký & Quản lý tài khoản**

* **FR-M1**: Đăng ký tài khoản bằng email/số điện thoại (Done)

* **FR-M2**: Đăng nhập/Đăng xuất bằng email. (Done)  
  * Đăng nhập (Done)  
  * Đăng xuất (Done)  
* **FR-M3**: Đăng nhập bằng Google. (Done)

* **FR-M4**: Xem và chỉnh sửa profile (tên, số điện thoại, địa chỉ, avatar). (Done)

### **F. FR – API GEO (Done)**

![][image1]

### **B. Đăng tin bán xe/pin**

* **FR-M7**: Form tạo tin đăng (ảnh, mô tả, thông số cơ bản). (Done)  
  * **FR-M71**: From tạo tin đăng cho ev. (Done)  
  * **FR-M72**: Form tạo tin đăng cho battery. (Done)

* **FR-M8**: Quản lý tin đăng (sửa, xóa, xem trạng thái pending/approved/rejected). (Done)

* **FR-M9**: AI/Rule-based gợi ý giá bán (stretch goal). (Không làm)

### **C. Tìm kiếm & Mua**

* **FR-M10**: Tìm kiếm nâng cao: brand, year, battery capacity, tình trạng, price range. (Done)

* **FR-M11**: Lọc và sort tin đăng: mới nhất, giá ↑↓, dung lượng pin. (Done)

* **FR-M12**: Bookmark tin đăng yêu thích. (Done)

* **FR-M13**: So sánh nhiều tin đăng (≤ 3 tin). (Không làm)

* **FR-M14**: Đánh giá và review người bán sau khi giao dịch. **(Done)**
  * **Mô tả mới:** User có thể rating (1-5 sao) và viết review cho post sau khi giao dịch thành công.
  * **Process/Flow:** User truy cập post detail → Click "Đánh giá" → Chọn số sao + viết comment → Submit rating.
  * **Note:** Rating được lưu trong bảng `ratings` với các trường: `postId`, `userId`, `ratingValue`, `comment`.

* **FR-M15**: Đặt giá trong phiên đấu giá (auction). (Không làm)

### D. Giao dịch & Thanh toán

* ### **FR-M16a –Thanh toán Phí đăng tin bằng Ví: (Done)**

  * ### **Mô tả mới:** Khi Seller đăng bài → hệ thống yêu cầu nộp phí đăng tin theo Fee Tier (Fixed Fee System - không phải phần trăm). Thanh toán phí sẽ được thực hiện qua **ví điện tử của người dùng**.

  * ### **Business Model Update (2025):** Hệ thống chuyển từ "deposit rate" (phí theo %) sang **"posting fee" (phí cố định)** dựa trên giá bài đăng. Ví dụ:
    - Giá 0-10M: Phí 20,000 ₫
    - Giá 10M-50M: Phí 50,000 ₫
    - Giá >50M: Phí 100,000 ₫

  * ### **Process/Flow mới:** 

    1. ### Seller tạo Draft Post qua Form tạo tin đăng (`FR-M7`). Status = `DRAFT`.

    2. ### Seller được redirect đến trang Payment: `/posts/create/payment/{postId}`.

    3. ### Hệ thống hiển thị:
       - Giá bài đăng
       - Phí đăng bài (dựa trên Fee Tier)
       - Số dư ví hiện tại

    4. ### Seller nhấn "Thanh toán".

    5. ### Backend kiểm tra số dư `wallets.balance` của Seller.

    6. ### **Nếu số dư không đủ:** Hiển thị lỗi "Số dư không đủ. Vui lòng nạp thêm tiền vào ví" và hiển thị button "Nạp tiền" để mở TopupModal (`FR-W2`).

    7. ### **Nếu số dư đủ:**

       * ### Hệ thống trừ tiền từ `wallets.balance` của Seller (atomic transaction).

       * ### Tạo một bản ghi `wallet_transactions` với `service_type = 'POST_PAYMENT'` (Số tiền âm).

       * ### Tạo bản ghi `post_payments` để liên kết post với wallet transaction.

       * ### Post vẫn giữ status `DRAFT` (chưa publish).

    8. ### Seller upload ảnh (5-10 ảnh) tại `/posts/create/upload-images/{postId}`.

    9. ### Seller click "Hoàn tất" → Backend validate payment + images → Status chuyển thành `PENDING_REVIEW`.

    10. ### Admin duyệt bài → Status chuyển thành `PUBLISHED`.

  * ### **Important Notes:**
    - **Phí không hoàn lại** (non-refundable) trong business model mới.
    - Payment được xử lý **atomic** để đảm bảo consistency.
    - Seller có thể nạp thêm tiền nếu thiếu bằng TopupModal ngay trong payment page.

### **E. Hỗ trợ sau bán**

* **FR-M20**: Báo cáo giao dịch hoặc user (fraud report).(Không làm)

---

## **2\. Admin (Quản trị viên)**

* **FR-A1**: Quản lý người dùng (yêu cầu role admin): (Done)

  * **FR-A1.1**: Admin xem tất cả accounts (Done)

  * **FR-A1.2**: Admin có thể ban account. (Done)

  * **FR-A1.3**: Admin có thể đổi role MEMBER → ADMIN. (Done)

* **FR-A2**: Quản lý tin đăng (approve/reject, remove spam). (Done)  
  * Admin quyệt approve bài đăng (Done)  
  * Admin từ chối bài đăng kèm lý do (Done)

* **FR-A3**: Gắn nhãn **“Đã kiểm định”** (verified badge) cho tin đăng. (Done)

* **FR-A5:** Setting biến môi trường & Phí (Done)

* **FR-A6**: Dashboard thống kê: số lượng user, listing active, số giao dịch. **(Done)**  
  * **Mô tả mới:** Dashboard thống kê: tổng số user, listing active, số giao dịch, **tổng số dư ví người dùng, tổng tiền nạp, tổng phí thu được**.  
  * **Yêu cầu:** Bổ sung các chỉ số liên quan đến hoạt động ví.  
  * **Implemented Features:**
    * ✅ **Financial Overview**: Total wallet balance, total topup amount, total fees collected (post payments + verification fees), net revenue
    * ✅ **Transaction Stats**: Total transactions, transactions today, post payments count, topup count, verification count
    * ✅ **User Stats**: Total users, active users, banned users, new users today
    * ✅ **Post Stats**: Total posts, published posts, pending posts, posts by type (EV_CAR/EV_BIKE/BATTERY), posts by status
    * ✅ **Time Series Charts**: User growth và post growth (7 days)
    * ✅ **Recent Data Tables**: Recent 10 users, recent 10 posts
    * ✅ **Real-time Updates**: Auto-refresh every 30-60 seconds with React Query
  * **API Endpoints:**
    * `GET /admin/statistics/dashboard` - Complete dashboard stats
    * `GET /admin/statistics/financial` - Financial overview
    * `GET /admin/statistics/transactions` - Transaction statistics
    * `GET /accounts/count?status=active` - Count active users
    * `GET /posts/count?status=PUBLISHED` - Count published posts

* **FR-A7**: Báo cáo nâng cao: doanh thu theo tháng, loại sản phẩm hot (stretch goal). **(Partially Done)**  
  * ✅ **Revenue Tracking**: Net revenue calculation (fees - refunds)
  * ✅ **Post Type Distribution**: Statistics by EV_CAR, EV_BIKE, BATTERY
  * ❌ **Monthly Revenue Reports**: Not yet implemented (future enhancement)
  * ❌ **Hot Products Analysis**: Not yet implemented (future enhancement)

---

**A. Quản lý Ví (Wallet Management)**

* **FR-W1: Tạo và kích hoạt Ví điện tử (Done)**  
  * **Mô tả:** Mỗi Member sẽ có một ví điện tử cá nhân được tạo tự động khi đăng ký hoặc kích hoạt thủ công.  
  * **Actor:** Member  
  * **Input:** Không có (tự động) hoặc yêu cầu kích hoạt.  
  * **Output:** Ví điện tử được tạo và sẵn sàng sử dụng.  
  * **Priority:** High  
* **FR-W2: Nạp tiền vào Ví (Top-up Wallet) (Done)**  
  * **Mô tả:** Người dùng có thể nạp tiền vào ví của mình thông qua các phương thức thanh toán được hỗ trợ (ví dụ: chuyển khoản ngân hàng, thẻ tín dụng/ghi nợ, cổng thanh toán bên thứ ba).  
  * **Actor:** Member  
  * **Input:** Số tiền nạp, phương thức thanh toán.  
  * **Output:** Số dư ví được cập nhật, lịch sử giao dịch nạp tiền.  
  * **Priority:** High  
* **FR-W3: Rút tiền từ Ví (Withdraw from Wallet) (Không làm)**  
  * **Mô tả:** Người dùng có thể rút tiền từ ví về tài khoản ngân hàng đã liên kết.  
  * **Actor:** Member  
  * **Input:** Số tiền rút, tài khoản ngân hàng nhận.  
  * **Output:** Số dư ví được cập nhật, yêu cầu rút tiền được xử lý, lịch sử giao dịch rút tiền.  
  * **Priority:** High  
* **FR-W4: Xem số dư và lịch sử giao dịch Ví (Done)**  
  * **Mô tả:** Người dùng có thể xem số dư hiện tại của ví và toàn bộ lịch sử các giao dịch nạp, rút, cọc, hoàn tiền.  
  * **Actor:** Member  
  * **Input:** Không có (truy cập trang ví).  
  * **Output:** Hiển thị số dư và danh sách giao dịch ví.  
  * **Priority:** High  
* **FR-W5: Liên kết tài khoản ngân hàng (Không làm)**  
  * **Mô tả:** Người dùng có thể liên kết (thêm/xóa/sửa) các tài khoản ngân hàng để nạp/rút tiền thuận tiện.  
  * **Actor:** Member  
  * **Input:** Thông tin tài khoản ngân hàng (tên ngân hàng, số tài khoản, tên chủ tài khoản).  
  * **Output:** Tài khoản ngân hàng được liên kết thành công.  
  * **Priority:** Medium

---
