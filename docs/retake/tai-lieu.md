### **I. TÓM TẮT CỐT LÕI YÊU CẦU CỦA GIẢNG VIÊN**

Đây là danh sách những thứ thầy cô **bắt buộc** muốn thấy trong đồ án thi lại của bạn:

1. **Mở rộng Scope (Phạm vi):** Không được cắt bỏ các chức năng cốt lõi (thanh toán, giao dịch) chỉ vì sợ lỗ hổng nghiệp vụ nhỏ2222. Đồ án hiện tại quá sơ sài, giống bài đăng tin Facebook hơn là sàn giao dịch3.

2. **Quy trình Giao dịch (Bắt buộc có):** Phải có nút "Mua ngay", đặt cọc/thanh toán online, giữ tiền và tính phí hoa hồng sàn4444.

3. **Quản lý thông tin chi tiết:** Tách biệt thông tin Pin và Xe, nhưng khi bán thì phải hiển thị đầy đủ thông số cả hai5.

4. **Cơ chế hiển thị thông tin liên lạc:** Chỉ hiển thị số điện thoại/liên hệ sau khi người mua đã nhấn nút Mua hoặc Đặt cọc6.

5. **Tính năng so sánh:** Phải có chức năng so sánh các xe với nhau77.

---

### **II. TÀI LIỆU RA QUYẾT ĐỊNH: GIỮ, SỬA, THÊM HAY BỎ?**

Dưới đây là bảng phân tích chi tiết. Cột **"Quyết định của bạn"** đang để trống hoặc đưa ra các lựa chọn (Option) để bạn chốt dựa trên code cũ bạn đang có.

#### **1\. Nhóm chức năng: NGHIỆP VỤ CỐT LÕI (Sàn giao dịch)**

*Tình trạng hiện tại: Bạn đang cắt bỏ phần này (thanh toán, giao dịch) khiến đồ án bị đánh giá thấp.*

| Hạng mục | Yêu cầu của Thầy/Cô | Phân tích & Lựa chọn cho bạn |
| :---- | :---- | :---- |
| **Thanh toán Online** |  **Bắt buộc làm.** Phải có luồng: Mua/Đặt cọc \-\> Chuyển tiền \-\> Giữ tiền \-\> Hoàn tất8.  | **Phải làm.** Bạn cần khôi phục lại code thanh toán (nếu đã có ở bản backup) hoặc code mới. Không thể bỏ qua. |
| **Nút "Mua Ngay"** |  **Bắt buộc thêm.** Bên cạnh đấu giá, phải cho phép mua ngay.  | **Phải làm.** Đây là tính năng cơ bản để định hình là "Sàn thương mại". |
| **Phí hoa hồng** |  **Bắt buộc thêm.** Hệ thống phải tính được sàn ăn bao nhiêu %, người bán nhận bao nhiêu.  | **Phải làm.** Cần thêm logic tính toán tiền sau khi giao dịch thành công. |
| **Hợp đồng mua bán** | Thầy hỏi có không \-\> Bạn nói không. Thầy yêu cầu phải có quy trình này.  | **Cần thêm.** Có thể chỉ là hiển thị form hợp đồng trên web xác nhận giữa 2 bên. |
| **Đơn vị tiền tệ (Coin vs Tiền)** | Cô phàn nàn về việc nhóm không thống nhất (lúc nói Coin, lúc nói Tiền).  | **Sửa ngay.** Quy về 1 mối (ưu tiên dùng **Tiền** thật/VND cho thực tế) để tránh bị bắt bẻ nghiệp vụ. |

#### **2\. Nhóm chức năng: TÍNH NĂNG PHỤ TRỢ & UI/UX**

*Tình trạng hiện tại: Một số cái bạn đã làm, một số cái thầy kêu bỏ để kịp tiến độ.*

| Hạng mục | Yêu cầu của Thầy/Cô | Phân tích & Lựa chọn cho bạn |
| :---- | :---- | :---- |
| **~~Xử lý khiếu nại (BỎ)~~** |  **Thầy gợi ý: NÊN BỎ.** Lý do: Không kịp làm, không đủ thời gian.  | **Lựa chọn của bạn:** 1\. **Bỏ:** Theo lời thầy để giảm tải công việc. 2\. **Giữ:** Chỉ giữ nếu bạn **đã code xong hoàn thiện 100%** ở bản backup. Nếu chưa xong \-\> Bỏ ngay. |
| **Chức năng Chat** | **Thầy gợi ý: NÊN BỎ.** Lý do: Sợ làm không kịp. Thầy chấp nhận sàn không có chat 14. **Thực tế:** Bạn nói bạn đã có code chat đầy đủ.  | **Lựa chọn của bạn:** 1\. **Bỏ:** An toàn, bớt bug, đỡ phải giải trình luồng chat. 2\. **Giữ (Khôi phục bản backup):** Vì bạn đã có sẵn. Tuy nhiên, phải đảm bảo Chat không tạo ra "lỗ hổng" giao dịch ngoài luồng mà nhóm từng lo sợ. *Lời khuyên: Nếu code chạy ngon thì giữ để tăng điểm tính năng, nếu code còn lỗi thì mạnh dạn bỏ theo lời thầy.* |
| **~~Xuất file PDF Hợp đồng (BỎ)~~** |  **Thầy gợi ý: Ưu tiên sau cùng.** Có thì tốt, không thì hiển thị thông tin là được16.  | **Lựa chọn của bạn:** 1\. **Bỏ:** Nếu chưa code tính năng xuất file. 2\. **Giữ:** Nếu thư viện xuất PDF đã chạy ổn định. Đừng tốn thời gian dev mới cái này. |
| **Ẩn/Hiện thông tin liên hệ** |  **Yêu cầu sửa:** Chỉ hiện SĐT/Liên hệ khi đã nhấn nút Mua/Cọc.  | **Sửa Logic:** Cần chỉnh lại code hiển thị (Frontend) để che thông tin đi cho đến khi có action từ người mua. |
| **So sánh (Compare)** |  **Yêu cầu thêm:** So sánh xe và pin.  | **Phải làm:** Đây là tính năng tăng tính kỹ thuật cho đồ án. |
| **Đánh giá (Review/Rating)** |  **Yêu cầu thêm:** Đánh giá lịch sử người bán/người mua để tăng uy tín.  | **Phải làm:** Cần bảng database lưu rating/comment sau khi hoàn tất đơn hàng. |

#### **3\. Nhóm chức năng: QUẢN LÝ DỮ LIỆU (Input/Output)**

*Các hiểu lầm về nghiệp vụ cần chỉnh sửa lại.*

| Hạng mục | Yêu cầu của Thầy/Cô | Phân tích & Lựa chọn cho bạn |
| :---- | :---- | :---- |
| **Thông tin Pin & Xe** |  **Yêu cầu:** Quản lý riêng biệt (2 bảng/đối tượng khác nhau) nhưng khi bán phải gộp chung thông số.  | **Kiểm tra lại Database:** Đảm bảo cấu trúc DB tách rời Pin và Xe, nhưng API get detail bài đăng phải join 2 bảng này lại. |
| **Upload giấy tờ đăng kiểm** | **Làm rõ nghiệp vụ:** Hệ thống chỉ cho **Upload file** để **Kiểm duyệt** (Admin duyệt bài). Không dùng từ "Kiểm định" (vì hệ thống không tự kiểm tra chất lượng xe được).  | **Sửa lại thuật ngữ & Flow:** \- Đổi tên chức năng: Kiểm định \-\> Kiểm duyệt hồ sơ. \- Flow: User up ảnh giấy tờ \-\> Admin tick xanh duyệt \-\> Bài đăng hiện lên. |
| **~~AI gợi ý/Search (BỎ)~~** | Thầy có nhắc đến việc dùng AI thay cho Search truyền thống hoặc gợi ý22222222. Bạn cũng xác nhận có dùng AI code23.  | **Tùy chọn:** Nếu bạn đã có chức năng AI (như trong bản backup hoặc code cũ), hãy show ra. Nếu chưa có, tập trung làm Search filter cơ bản cho tốt trước. |

