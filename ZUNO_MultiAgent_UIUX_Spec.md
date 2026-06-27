# ĐẶC TẢ THIẾT KẾ UI/UX: HỆ THỐNG AI MULTI-AGENT ZUNO
## Hướng dẫn vẽ Wireframe & Phân bổ thông tin trên Figma

Tài liệu này cung cấp chi tiết cấu trúc, nội dung hiển thị và kịch bản tương tác để đội ngũ thiết kế UI/UX vẽ các màn hình Figma cho hệ thống **ZUNO Multi-Agent**. Nhằm giải quyết triệt để bài toán **quá tải thông tin** cho người dùng trẻ, giao diện được thiết kế theo nguyên tắc: **"Invisible AI until needed"** (AI ẩn mình cho đến khi cần can thiệp) và tích hợp trợ lý AI Secretary làm một trang tính năng độc lập, kích hoạt dễ dàng qua thanh Bottom Navigation 5 nút.

---

### 1. Triết lý Thiết kế Tránh Quá Tải Thông Tin (Cognitive Load Reduction)

Để giữ cho giao diện ngân hàng số luôn sạch sẽ, hiện đại và cao cấp, thông tin từ 3 Agent AI được phân phối theo mô hình phân tầng:
1. **Lớp Thường trực (Persistent Layer):** Tích hợp nút Trợ lý AI Secretary nằm ở vị trí trung tâm của thanh Bottom Navigation 5 nút giúp truy cập trang Chat AI bất kỳ lúc nào, cùng chỉ số Streaks/Flame thường trực trên Header Dashboard.
2. **Lớp Ngữ cảnh (Contextual Layer):** Các thông điệp khuyên bảo nhẹ (Nudges) chỉ xuất hiện dưới dạng một dòng chữ chạy hoặc Banner tự động thu gọn (AI Smart Hub Banner) khi có sự kiện phát sinh (lố quỹ nhẹ, subscription sắp gia hạn).
3. **Lớp Can thiệp (Interruption Layer):** Chỉ khi điểm rủi ro vượt ngưỡng (tiêu lố nặng hoặc nghi ngờ lừa đảo), hệ thống mới kích hoạt Bottom Sheet hoặc Full-screen Modal để thu hút sự tập trung tuyệt đối của người dùng.

---

### 2. Thiết Kế Thanh Điều Hướng 5 Nút (Bottom Navigation Bar)

Thanh điều hướng dưới cùng của ứng dụng được nâng cấp từ **4 nút thành 5 nút**. Nút Trợ lý AI được đặt ở **vị trí trung tâm (vị trí thứ 3)** để tạo điểm nhấn thị giác và nhấn mạnh tính năng Trí tuệ hành vi của ZUNO.

```text
+-------------------------------------------------------------------------+
|                                                                         |
|    [🏠 Home]    [📊 Thống kê]    [[🤖 AI Secretary]]    [💸 Ngân sách]    [👤 Cá nhân] |
+-------------------------------------------------------------------------+
```

*   **Chi tiết vẽ Figma:**
    *   **Bố cục:** Chia đều khoảng cách cho 5 nút.
    *   **Nút Robot AI [🤖] (AI Secretary):**
        *   Được thiết kế dạng **nút hành động nổi bật (FAB - Floating Action Button style)**, nhô cao hơn khoảng 10px-15px so với các nút còn lại.
        *   Nền nút dùng màu xanh Navy đậm (`#112945`) hoặc có viền màu Gradient ZUNO phát sáng nhẹ. Icon robot bên trong màu trắng.
        *   Khi người dùng chạm vào nút này, ứng dụng sẽ chuyển hướng (Navigate) trực tiếp sang trang **/chat-ai**.

---

### 3. Trang Chat AI Độc Lập (Full-Page Chat Route: `/chat-ai`)

Khi truy cập trang Chat AI từ Bottom Navigation, người dùng sẽ có một không gian tương tác hội thoại độc lập, thoáng đãng giống như một ứng dụng nhắn tin chuyên nghiệp. Thanh Bottom Nav 5 nút vẫn được giữ nguyên ở chân trang để người dùng chuyển đổi tab nhanh chóng.

```text
+-------------------------------------------------------------------------+
|  [🤖 ZUNO Secretary]                                               [:::] | <-- Header trang Chat AI
|  Health Score: 85/100 (Tốt)                                              | <-- Chỉ số Sức khỏe Tài chính
+-------------------------------------------------------------------------+
|                                                                         |
|   🤖 ZUNO Secretary                                                     |
|  +-------------------------------------------------------------------+  |
|  | Chào Hoàng! Hôm nay bạn muốn kiểm tra ngân sách hay chia hóa đơn  |  | <-- Bong bóng chat AI (Màu sáng)
|  | nhóm thế?                                                         |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
|                                                        👤 Bạn           |
|                                          +---------------------------+  |
|                                          | Mình vừa ăn BBQ với nhóm  |  | <-- Bong bóng chat User (Màu tối)
|                                          | 4 người, chia tiền hộ     |  |
|                                          +---------------------------+  |
|                                                                         |
|   🤖 ZUNO Secretary (AI Shared Expense Card)                             |
|  +-------------------------------------------------------------------+  |
|  |  🍽️ HÓA ĐƠN BBQ CHIỂU NAY - TỔNG: 420.000đ                        |  |
|  |  - Phần của bạn: 105.000đ (Trích quỹ Food)                        |  | <-- Rich UI Card tương tác
|  |  - Chờ hoàn lại: 315.000đ (Phát QR động)                          |  |
|  |                                                                   |  |
|  |  [Tạo VietQR Nhóm]                 [Xem Chi Tiết Quỹ]             |  | <-- Các nút hành động
|  +-------------------------------------------------------------------+  |
|                                                                         |
+-------------------------------------------------------------------------+
|   ("Còn bao nhiêu tiền ăn?")         ("Xem đề xuất tối ưu")             | <-- Quick Action Chips
+-------------------------------------------------------------------------+
|  [+] [ Hỏi Secretary hoặc nói chuyện với mình...                ] [🎙️] | <-- Input Bar (Nhập liệu & Voice)
+-------------------------------------------------------------------------+
|    [🏠 Home]    [📊 Thống kê]    [[🤖 AI Secretary]]    [💸 Ngân sách]    [👤 Cá nhân] | <-- Bottom Navigation
+-------------------------------------------------------------------------+
```

*   **Chi tiết vẽ Figma:**
    *   **Header trang Chat:**
        *   Tên trợ lý: **ZUNO Secretary**.
        *   Hiển thị chỉ số Sức khỏe Tài chính hiện tại **Health Score: 85/100** kèm một thanh tiến trình mini màu xanh biểu thị kỷ luật tốt.
    *   **Bong bóng chat AI:** Nền màu xám nhạt (`#F0F4F8`), text màu xanh navy đậm (`#112945`).
    *   **Bong bóng chat User:** Canh phải, nền xanh navy thương hiệu (`#112945`), text màu trắng.
    *   **Rich UI Card (Card chia tiền nhóm):** Có hiển thị icon ăn uống, chi tiết các phần tiền và hai nút hành động tương tác nhanh.
    *   **Quick Action Chips (Nhãn gợi ý nhanh):** Nằm ngang, bo tròn viền mảnh, có thể vuốt cuộn ngang.
    *   **Input Bar:**
        *   Icon `[+]` bên trái để đính kèm hình ảnh hóa đơn.
        *   Khung nhập văn bản bo tròn góc.
        *   Icon `[🎙️]` bên phải: Khi người dùng giữ nút này để nói chuyện (VNPT SmartVoice), sóng âm hoạt họa màu xanh (Waveform) sẽ lan tỏa quanh nút.
    *   **Bottom Navigation:** Luôn được neo ở dưới cùng màn hình chat để giữ tính đồng bộ định vị của ứng dụng ngân hàng số.

---

### 4. Thiết Kế Dashboard Tích Hợp AI Không Quá Tải Thông Tin

Dashboard chính cần được giữ tối giản tối đa. AI chỉ xuất hiện dưới dạng các thông báo mỏng hoặc chỉ báo ngữ cảnh.

#### 4.1. Chỉ báo AI Micro-Insight dưới Lịch Chi Tiêu (Calendar)
Dưới phần Lịch chi tiêu tuần/tháng, thay vì hiển thị biểu đồ phân tích dài dòng, hệ thống chỉ hiển thị một **dòng tóm tắt AI cực ngắn** (chỉ 1 dòng duy nhất) thay đổi linh hoạt theo ngày được chọn.

```text
+-------------------------------------------------------------------------+
|                          LỊCH CHI TIÊU THÁNG 6                          |
|    (T2)     (T3)     (T4)     (T5)     (T6)    [(T7)]    (CN)           |
|    [O]      [O]      [O]      [O]      [O]      [!]      [O]            | <-- Ngày Thứ 7 tô màu vàng (Lố)
+-------------------------------------------------------------------------+
| 🤖 ZUNO AI: Bạn tiêu lố 120k vào Thứ 7 do ăn ngoài.                     | <-- AI Micro-Insight
|    [Click xem chi tiết nguyên nhân & đề xuất điều chỉnh] ->              | <-- Link chuyển hướng
+-------------------------------------------------------------------------+
```

*   **Chi tiết vẽ Figma:** Dòng Micro-Insight này chỉ hiển thị khi người dùng chạm vào một ngày có màu sắc bất thường (vàng - lố cấp 1, đỏ - lố cấp 2/3) để chỉ ra nguyên nhân nhanh chóng và cung cấp link dẫn tới giải pháp.

---

#### 4.2. AI Smart Hub Banner (Banner Động Theo Ngữ Cảnh)
Nằm ở ngay dưới phần thông tin phân bổ ngân sách món chính/món phụ. Banner này đóng vai trò là nơi hiển thị các thông điệp cảnh báo dạng "mềm" của AI.

```text
+-------------------------------------------------------------------------+
|  🤖 ZUNO SMART HUB                                                  [X] | <-- Banner thông minh (Có nút tắt)
|  +-------------------------------------------------------------------+  |
|  | ⚠️ QUỸ ĂN UỐNG SẮP CẠN                                              |  |
|  | AI dự báo bạn sẽ cạn quỹ Food vào ngày 25/6. Hãy giảm chi tiêu    |  | <-- Dự báo dòng tiền (Predictive Cashflow)
|  | trà sữa 20k/ngày để an toàn cuối tháng nhé!                       |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
```
*   **Các trạng thái nội dung khác của Smart Hub Banner:**
    *   *Trạng thái Subscription Leak (Rò rỉ đăng ký):* *"Phát hiện gói Spotify 129k sắp tự động gia hạn sau 7 ngày nữa. Bạn đã không dùng gói này 2 tháng rồi. [Hủy Ngay]"*.
    *   *Trạng thái Weekend Buffer (Cấu hình ngân sách tối ưu):* *"ZUNO thấy bạn hay lố cuối tuần. Đề xuất trích 120k từ quỹ Trải nghiệm sang quỹ Ăn uống làm Weekend Buffer. [Đồng Ý]"*.
        *   **Cơ chế chẩn đoán (Input data & Timing):** Hệ thống Content Agent cần chuỗi hành vi kéo dài trong **3 tuần liên tiếp vào cuối tuần** (tập trung vào Thứ Bảy/Chủ Nhật) để thu thập dữ liệu chẩn đoán đầu vào, sau đó chạy giả lập trade-off dựa trên **lịch sử chi tiêu 7 ngày** gần nhất.
*   **Chi tiết vẽ Figma:** Banner dạng thẻ bo góc phẳng hiện đại, nền xám nhạt, có nút đóng `[X]` nhỏ ở góc phải giúp người dùng dễ dàng tắt đi khi không cần thiết.

---

### 5. Màn Hình Thông Báo Thông Minh (Smart Notifications)

Để tránh việc người dùng bị quá tải thông tin, màn hình thông báo được phân tách thành 2 tab rõ ràng.

```text
+-------------------------------------------------------------------------+
|                                THÔNG BÁO                                |
|             [ HỆ THỐNG ]             [ 🤖 ZUNO SECRETARY (1) ]          | <-- Tab Navigation
+-------------------------------------------------------------------------+
|                                                                         |
|   📍 CẢNH BÁO TỌA ĐỘ CÁM DỖ                                             |
|  +-------------------------------------------------------------------+  |
|  | Bạn vừa bước vào Vincom MegaMall (Tọa độ lố tiền của bạn)             |  | <-- Location-based Nudge Card
|  | Hôm nay quỹ Trải Nghiệm chỉ còn 35k. Hãy giữ ví nhé!              |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
|   💳 CẢNH BÁO GIA HẠN DỊCH VỤ                                           |
|  +-------------------------------------------------------------------+  |
|  | Gói Netflix Premium (260.000đ) sẽ tự động gia hạn sau 7 ngày nữa. |  | <-- Subscription Alert Card
|  | Bạn có muốn hủy gia hạn?                                          |  |
|  |                                                                   |  |
|  | [Hủy Gia Hạn Ngay]                [Để Sau]                        |  | <-- Nút bấm tương tác
|  +-------------------------------------------------------------------+  |
|                                                                         |
+-------------------------------------------------------------------------+
```

---

### 6. Giao Diện Cảnh Báo Trước Chi Tiêu (Pre-spending Risk Intercept)

Đây là tính năng quan trọng nhất của **Risk Manager Agent** nhằm ngăn chặn các giao dịch bốc đồng làm vỡ quỹ hoặc các giao dịch bất thường bị kẻ xấu lừa đảo công nghệ cao, vận hành trên kiến trúc **Học máy và Học sâu lai ghép (Hybrid ML/DL Anomaly Detection Framework)**.

#### 6.1. Giao Diện Bottom Sheet (Cảnh báo Rủi ro Trung bình)
Khi người dùng chuyển khoản gây tiêu lố quỹ nghiêm trọng ($0.45 \le R_{total} < 0.75$), Bottom Sheet trượt lên che 50% màn hình để cảnh báo hành vi.

```text
+-------------------------------------------------------------------------+
|   [XÁC NHẬN GIAO DỊCH CHUYỂN TIỀN]                                      |
|   Số tiền: 450.000đ  |  Người nhận: NGUYEN VAN A                        |
+=========================================================================+ <-- Bottom Sheet trượt lên
|                         [  ==== Vạch Trượt ====  ]                      |
|                                                                         |
|     🤖 ZUNO SECRETARY: "KHOAN ĐÃ HOÀNG ƠI!"                             |
|                                                                         |
|     Hóa đơn BBQ 450k này sẽ ngốn sạch 90% Quỹ Ăn uống của bạn           | <-- Popup kèm phân tích intent từ AI
|     trong 4 ngày còn lại của tuần.                                      |
|                                                                         |
|     Mô phỏng ngân sách sau giao dịch:                                   |
|     Hiện tại: [=========================>     ] 500k                    |
|     Sau GD:   [=>                             ] 50k (Đỏ!)               | <-- Biểu đồ sụt giảm quỹ
|                                                                         |
|     [🛒 Suy Nghĩ Lại (Hủy GD)]                                          | <-- Nút ưu tiên (Màu xanh bảo vệ)
|                                                                         |
|     [Vẫn tiếp tục chuyển khoản và mượn quỹ chéo]                        | <-- Nút phụ
+-------------------------------------------------------------------------+
```

---

#### 6.2. Giao Diện Khóa Tạm Thời (Cảnh báo Rủi ro Cao)
Khi phát hiện rủi ro cao ($R_{total} \ge 0.75$ - lừa đảo đêm muộn từ vị trí lạ sau cuộc gọi dài), màn hình khóa khẩn cấp toàn bộ ứng dụng sẽ xuất hiện.

```text
+-------------------------------------------------------------------------+
|                                                                         |
|                 🛡️ PHÁT HIỆN GIAO DỊCH BẤT THƯỜNG                       |
|                                                                         |
|                              🤖👮‍♂️                                        | <-- Avatar Robot Cảnh Sát
|                                                                         |
|     ZUNO phát hiện giao dịch chuyển tiền 3.200.000đ                     |
|     vào lúc 02:45 AM có độ lệch hành vi dị biệt rất cao.                |
|                                                                         |
|     Hệ thống đã tự động TẠM GIỮ giao dịch này và gửi                    | <-- Tạm giữ & cảnh báo tới ngân hàng
|     yêu cầu xác thực bảo mật tới ngân hàng liên kết.                    |
|                                                                         |
|     Giao dịch được giữ an toàn trong:                                   |
|                              14:59                                      | <-- Bộ đếm ngược thời gian (Đỏ đậm)
|                                                                         |
|     [ HỦY GIAO DỊCH & KHÓA THẺ KHẨN CẤP ]                               | <-- Nút Đỏ to rõ ràng (Hành động ưu tiên)
|                                                             |
|     [ Xác thực Video Call để tự mở khóa chuyển tiền ]                   | <-- Nút phụ (Xác thực khuôn mặt / Sinh trắc)
|                                                                         |
+-------------------------------------------------------------------------+
```

---

### 7. Danh Sách Kiểm Tra Cho Thiết Kế Figma (Figma Checklist)

Đảm bảo các chi tiết sau có mặt đầy đủ trong các bản vẽ Figma:
*   [ ] Thanh Bottom Navigation 5 nút, có nút **[🤖 AI Secretary]** ở giữa nhô lên dạng Floating Button.
*   [ ] Trang Chat AI độc lập đầy đủ có thanh Bottom Nav ở dưới.
*   [ ] Trạng thái biểu cảm của đầu robot ZUNO Secretary tương ứng sức khỏe tài chính: Xanh (Vui vẻ), Vàng (Nghi ngờ/Suy nghĩ), Đỏ (Nghiêm nghị/Cảnh sát).
*   [ ] Có mã VietQR động trên card chia tiền nhóm của Secretary Chat.
*   [ ] Biểu đồ thanh so sánh ngân sách "Trước" và "Sau" giao dịch trên Bottom Sheet cảnh báo lố quỹ.
*   [ ] Bộ đếm ngược hold giao dịch dạng số điện tử màu đỏ và nút Video Call xác thực trên màn hình rủi ro cao.
*   [ ] Nút đóng [X] nhỏ ở góc các banner thông báo gợi ý thông minh trên Dashboard.
