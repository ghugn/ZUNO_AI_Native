# BÁO CÁO ĐỀ XUẤT GIẢI PHÁP: HỆ THỐNG AI MULTI-AGENT TÀI CHÍNH HÀNH VI ZUNO
## (ZUNO Multi-Agent Financial Behavioral System - ZUNO-MAFBS)

---

### Giới thiệu chung & Tầm nhìn
ZUNO đang chuyển dịch từ một ứng dụng quản lý tài chính cá nhân độc lập thành một **Behavioral Intelligence Layer** (Lớp trí tuệ hành vi) tích hợp trực tiếp vào hệ thống Ngân hàng số thông qua cơ chế cắm nối **Plug-and-Play**.

Tài liệu này đề xuất giải pháp kỹ thuật tích hợp hệ thống **AI Multi-Agent** cho ZUNO, được thiết kế kế thừa trực tiếp cấu trúc cộng tác **3 Agent** cốt lõi của Agicom (bao gồm: **Agent CSKH**, **Content Agent** và **Risk Manager Agent**). Hệ thống được vận hành trên nền tảng **Hệ sinh thái VNPT AI Platform** (VNPT Smartbot, VNPT Smartbot nâng cao, VNPT SmartVoice), tích hợp các tính năng tài chính hành vi đột phá nhằm giải quyết triệt để bài toán kỷ luật tài chính và an toàn bảo mật giao dịch cho thế hệ trẻ.

---

### 1. Cơ cấu Tài chính 5 Quỹ & Ngân sách Vi mô

Hệ thống ZUNO quản lý dòng tiền của người dùng dựa trên cấu trúc 5 Quỹ tài chính cốt lõi. Thu nhập hàng tháng sẽ tự động phân bổ vào các quỹ sau:

1. **Living Fund (Quỹ Sinh hoạt cố định):** Chi trả hóa đơn cố định, tiền điện nước, nhà trọ.
2. **Food Fund (Quỹ Ăn uống):** Chi phí ăn uống hàng ngày, quản lý dưới dạng ngân sách vi mô.
3. **Growth Fund (Quỹ Phát triển bản thân):** Chi phí học tập, mua sách, các khóa học kỹ năng.
4. **Experience Fund (Quỹ Trải nghiệm & Giải trí):** Chi phí đi chơi, mua sắm e-commerce, café, xem phim.
5. **Future Fund (Quỹ Tích lũy dài hạn - Tiết kiệm):** Tiền nhàn rỗi sinh lãi, được bảo vệ nghiêm ngặt.

#### Tỷ lệ phân bổ mặc định dựa trên Hồ sơ Người dùng (Residence Type):

| Quỹ tài chính | Nhóm Ký túc xá (Dormitory) | Nhóm Thuê nhà ngoài (Rental) | Nhóm Đi làm (Professional) |
| :--- | :---: | :---: | :---: |
| **Living** | 15% | 30% | 35% |
| **Food** | 30% | 25% | 20% |
| **Growth** | 15% | 15% | 20% |
| **Experience** | 20% | 15% | 15% |
| **Future** | 20% | 15% | 10% |

#### Cơ chế điều hành ngân sách vi mô & Can thiệp 3 Lố:
- **Quỹ Food** được chia nhỏ thành ngân sách **ngày (Daily Budget)** và tiếp tục chia thành **Ăn chính** (Main Meals) và **Ăn phụ/Snack/Coffee** (Supplementary) dựa trên phong cách sống. Quỹ Growth và Experience được quản lý theo ngân sách **tuần (Weekly Budget)**.
- **Cơ chế Tích lũy Cuối tháng (Rollover):** Khi tháng kết thúc, toàn bộ số dư chưa chi tiêu ở các quỹ ngắn hạn sẽ tự động quét sạch chuyển vào **Future Fund** để gửi tiết kiệm sinh lãi kép.
- **Cơ chế Can thiệp Hành vi 3 Lố (Three-Level Overflow):** Khi vượt ngân sách vi mô, hệ thống kích hoạt can thiệp tăng dần (Cấp 1: soft warning khuyên giảm ăn phụ; Cấp 2: cho phép mượn tiền chéo từ quỹ Growth/Experience; Cấp 3: tất toán khẩn cấp Future Fund qua Deep Link ngân hàng để tạo tâm lý "tiếc nuối").

---

### 2. Thiết kế Kiến trúc AI Multi-Agent dựa trên Cấu trúc Agicom

Mô hình Multi-Agent của ZUNO được xây dựng dựa trên sự cộng tác chéo và chia sẻ tín hiệu hành vi giữa 3 thực thể Agent, tương thích hoàn toàn với cấu trúc hệ thống của Agicom và Ngân hàng số:

```mermaid
flowchart TB
    %% Styling
    classDef agentBox fill:#e1f5fe,stroke:#0288d1,stroke-width:2px,color:#01579b,font-weight:bold
    classDef coreBox fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px,color:#4a148c
    classDef vnptBox fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#1b5e20
    
    subgraph CoreBanking["🏦 Hệ thống Ngân hàng & User App"]
        direction TB
        App[📱 Mobile App UI]
        TS[💰 Transaction Stream]
        API[🔗 Open Banking API]
        GPS[📍 GPS/Location]
    end

    subgraph ZUNOMultiAgent["🧠 ZUNO MULTI-AGENT INTELLIGENCE LAYER"]
        direction LR
        CSKH["🤖 1. Agent CSKH (Buddy)\n- Tương tác trực tiếp\n- Giải đáp thắc mắc\n- Phân tích User Profile"]:::agentBox
        Content["📝 2. Content Agent (Planner)\n- Lập kế hoạch tài chính\n- Cá nhân hóa Nudges\n- Đề xuất giải cứu"]:::agentBox
        Risk["🛡️ 3. Risk Manager Agent\n- Phát hiện dị biệt (Anomaly)\n- Ngăn chặn lừa đảo\n- Cảnh báo vị trí"]:::agentBox
        
        %% Cross-Agent Communication
        CSKH <-->|1. Tín hiệu Tiêu lố / Thói quen| Content
        Risk <-->|2. Tín hiệu Tọa độ rủi ro / Leak| Content
        Content -->|3. Đề xuất Nhiệm vụ Giải cứu| CSKH
        Risk -->|4. Yêu cầu Cảnh báo Khẩn| CSKH
    end

    subgraph VNPT_AI["☁️ Hệ sinh thái VNPT AI Platform"]
        direction TB
        Smartbot["🧠 VNPT Smartbot\n(Phân loại Ý định / NLP)"]:::vnptBox
        SmartbotLLM["🤖 VNPT Smartbot Nâng cao\n(LLM & RAG)"]:::vnptBox
        SmartVoice["🎙️ VNPT SmartVoice\n(STT & TTS)"]:::vnptBox
    end

    %% Connections User <-> Agents
    App <-->|Chat / Voice / Giao diện| CSKH
    
    %% Connections Core <-> Agents
    TS -->|Phân tích luồng tiền Real-time| Risk
    TS -->|Cập nhật Số dư 5 Quỹ| CSKH
    GPS -->|Định vị / Geofencing| Risk
    Risk -->|Lệnh Tạm giữ (Hold) / Block| API

    %% Connections Agents <-> VNPT AI
    CSKH <-->|Nhận diện Ý định| Smartbot
    CSKH <-->|Chuyển đổi Giọng nói| SmartVoice
    Content <-->|Tạo kịch bản / Sinh đề xuất| SmartbotLLM
    Risk <-->|Sinh thông điệp rủi ro Nudge| SmartbotLLM

    class CoreBanking coreBox
    class ZUNOMultiAgent agentBox
    class VNPT_AI vnptBox
```

---

### 3. Phân nhiệm và Tích hợp các Tính năng Ưu tiên vào 3 Agent

#### 3.1. Agent CSKH (ZUNO Buddy & Secretary Agent)
Đóng vai trò là **Người bạn đồng hành & Thư ký tài chính cá nhân** trực tiếp tương tác với từng người dùng qua giao diện Chatbot, Voice và Reviews.

*   **Phân nhiệm theo cấu trúc Agicom:**
    - **CSKH qua chat, reviews:** Tương tác hàng ngày, giải đáp các thắc mắc của người dùng bằng ngôn ngữ tự nhiên.
    - **Phân tích hồ sơ khách hàng + Dữ liệu từ Core Banking:** Phân tích dữ liệu giao dịch thời gian thực để cập nhật số dư 5 quỹ và Atomic Budget.
    - **Safety guardrail + Human-in-the-loop:** Thiết lập rào chắn ngăn chặn tư vấn đầu tư mạo hiểm; tự động chuyển tiếp đến chuyên viên tư vấn khi vượt quá thẩm quyền.
    - **Rút ra insight khách hàng:** Tổng hợp các thắc mắc chi tiêu thực tế của người dùng để chuyển tiếp tín hiệu hành vi sang cho *Content Agent* xử lý tiếp.
*   **Tính năng ưu tiên tích hợp:**
    1.  **AI Financial Health Coach & Chatbot (Tương tác tự nhiên & Voice):** Sử dụng **VNPT Smartbot** (phân loại ý định) kết hợp **VNPT SmartVoice** (STT & TTS) để người dùng hỏi đáp rảnh tay và nhận câu trả lời dạng nói tự nhiên từ AI. Tích hợp **Gamification** (tặng rương thưởng), cho phép gửi quà tài chính và ghi chép nhật ký hành vi bằng giọng nói.
    2.  **AI Shared Expense Intelligence (Tách chiết chi tiêu nhóm):** 
        - *Phát hiện chi tiêu nhóm:* Tác tử AI nhận diện hóa đơn ăn uống nhóm (ví dụ: hóa đơn BBQ 420.000đ cao gấp 3.8 lần ngày thường, hóa đơn có 4 phần ăn chính vào ngày cuối tuần) và đề xuất chia 4 người (phần của bạn: 105k, chờ hoàn: 315k).
        - *Cơ chế QR động ngân hàng (VietQR Dynamic):* Khi xác nhận đơn nhóm, CSKH Agent sẽ gọi **Open Banking API / VietQR** của ngân hàng liên kết để sinh các mã QR động (Dynamic QR Code) gửi cho các thành viên trong nhóm. Mã QR này đã chứa sẵn số tiền cần hoàn (105.000đ) và nội dung chuyển khoản được cấu trúc sẵn (ví dụ: `ZUNO REIMBURSE BBQ 12345`). Điều này giúp bạn bè thanh toán chính xác, rảnh tay không cần nhập thủ công.
        - *Khớp hoàn tiền tự động:* Khi có dòng tiền vào qua Transaction Stream, AI sẽ tự động đọc cấu trúc nội dung chuyển khoản và đối khớp chính xác kể cả trường hợp lệch nhỏ do làm tròn (ví dụ bạn bè chuyển 100k ghi "bbq nha" đối lệch 5k), tự động gạch nợ và phân biệt rõ dòng tiền thu nhập thật (Income) với tiền hoàn trả hộ (Reimbursement) để tránh làm sai lệch số liệu chi tiêu thực tế.
        - *Xử lý chênh lệch & Bù đắp thâm hụt (Variance Resolution):* Trong trường hợp có sự chênh lệch số tiền hoàn (ví dụ chia 105k nhưng bạn chỉ chuyển sẵn 100k), AI sẽ nhận diện độ chênh lệch 5k và đưa vào danh sách tự động theo dõi trong thời hạn **1 tuần**. Nếu sau 1 tuần số tiền hoàn vẫn chưa đủ, hệ thống sẽ phát cảnh báo nhắc nhợ. Nếu bạn bè đã chuyển đủ phần của họ nhưng hóa đơn nhóm vẫn bị thâm hụt (do làm tròn số hoặc phí phát sinh phụ), AI sẽ gửi thông báo gợi ý người dùng **sử dụng số dư chưa tiêu (số tiền tiết kiệm được) từ quỹ Experience hoặc quỹ Food của ngày hôm đó để tự động bù đắp**, giữ an toàn cho số dư Future Fund.

#### 3.2. Content Agent (Tác tử Lập kế hoạch & Tạo đề xuất)
Đóng vai trò lập kế hoạch, tạo ra các đề xuất ngân sách tối ưu và nội dung giáo dục tài chính cá nhân hóa từ các tín hiệu hành vi được gửi đến từ Agent CSKH và Risk Manager Agent.

*   **Phân nhiệm theo cấu trúc Agicom:**
    - **Tạo đề xuất nội dung từ tín hiệu các agent:** Nhận tín hiệu tiêu lố từ Agent CSKH hoặc tín hiệu rò rỉ quỹ từ Risk Manager để tự động soạn thảo các đề xuất điều chỉnh hành vi.
    - **Quản lý timeline content:** Lên lịch trình gửi thông điệp can thiệp hành vi (nudging) hoăc báo cáo tài chính hàng ngày, hàng tuần vào các thời điểm thích hợp.
    - **Phân tích sản phẩm và tạo content script:** Phân tích các gói tích lũy của ngân hàng và thói quen của user để tạo các kịch bản khuyên bảo tài chính cá nhân hóa sâu sắc (chữa bệnh lãng phí, giáo dục tài chính).
*   **Tính năng ưu tiên tích hợp:**
    1.  **ZUNO Budget Strategy Agent (Tối ưu hóa hệ 5 quỹ):**
        - *Ví dụ thực tế:* Nhận tín hiệu từ Agent CSKH báo quỹ Food của user thường bị lố mạnh vào cuối tuần. Content Agent tự động chạy mô phỏng 3 phương án (A: Food +5%, Experience -5%; B: Food +3%, Weekend Buffer 120.000đ; C: Giới hạn trà sữa 2 lần/tuần) và đề xuất **Phương án B** vì qua mô phỏng giúp giảm 3 lần lố/tháng mà không ảnh hưởng Future Fund.
            *   *Giải nghĩa Weekend Buffer (Khoản dự phòng cuối tuần):* Thay vì phân bổ tiền ăn đều 50k/ngày (khiến user dễ bị cảnh báo lố vào thứ 7/CN khi tụ tập ăn uống với bạn bè), AI đề xuất trích một khoản nhỏ từ quỹ Experience (Trải nghiệm) tạo "hộp dự phòng cuối tuần 120.000đ" (nâng hạn mức thứ 7 & CN lên 110k/ngày). Ngày thường vẫn giữ nguyên định mức 50k kỷ luật, giúp user thoải mái sinh hoạt cuối tuần mà không làm thâm hụt Future Fund.
        - *Cơ chế AI (Tránh Rule-based):* Dùng **VNPT Smartbot nâng cao (LLM)** để chẩn đoán nguyên nhân lố chi tiêu mang tính chu kỳ (Diagnose), tạo ra các plan điều chỉnh sáng tạo (Generate) và mô phỏng trade-off trên lịch sử 90 ngày (Simulate) để tìm ra đề xuất tốt nhất. Việc tính toán các ràng buộc (tổng = 100%, min Future) vẫn được xử lý deterministic.
        - *Luồng hoạt động từng bước (User & Agent Flow):*
            *   **Bước 1 (Ghi nhận tín hiệu):** Agent CSKH phát hiện user lố quỹ Food 4 tuần liên tiếp vào cuối tuần và gửi tín hiệu kèm lịch sử chi tiêu 90 ngày sang cho Content Agent.
            *   **Bước 2 (Chẩn đoán & Tạo phương án):** Content Agent sử dụng VNPT Smartbot nâng cao (LLM) để chẩn đoán nguyên nhân (do thói quen đi ăn ngoài cuối tuần với bạn bè) và tự động thiết kế ra 3 giải pháp A, B, C.
            *   **Bước 3 (Giả lập Trade-off):** Engine tính toán chạy giả lập lịch sử 90 ngày của chính user dưới 3 phương án này để đo lường thực tế số lần giảm lố và biến động của quỹ Future (tiết kiệm).
            *   **Bước 4 (Đề xuất trực quan):** Agent CSKH gửi một thông điệp đề xuất dạng biểu đồ so sánh cho user: *"ZUNO thấy bạn hay lố cuối tuần. Đề xuất tạo Weekend Buffer 120.000đ trích từ quỹ Experience. Phương án này giảm 85% số lần lố mà không giảm Future Fund. Bạn có đồng ý áp dụng?"*
            *   **Bước 5 (Xác nhận & Cấu hình):** User bấm "Đồng ý", hệ thống Backend tự động cập nhật lại cơ sở dữ liệu tỷ lệ quỹ và phân bổ Atomic Budget cho các ngày/tuần còn lại.
    2.  **Phương án xử lý khi vượt ngân sách (Smart Rescue Suggestions - Nhiệm vụ giải cứu):**
        - *Cơ chế hoạt động:* Thay vì chỉ áp dụng hình phạt máy móc khi user tiêu vượt ngân sách, AI của Content Agent sẽ phân tích dữ liệu chi tiêu gần đây để thiết kế các **"Nhiệm vụ giải cứu"** cá nhân hóa. Nhiệm vụ này giúp user gỡ lại điểm kỷ luật (Financial Health Score) hoặc tự bù đắp lại số tiền đã tiêu lố bằng các hành động thực tế.
        - *Ví dụ thực tế:* *"Cảnh báo: Bạn vừa chạm ngưỡng Lố 2 vì mua vé concert. Để không bị giảm điểm và không phải tất toán Quỹ Tích Lũy (Future Fund), ZUNO đề xuất 3 giải pháp giải cứu tuần này: (1) Tự nấu ăn ở nhà 5 ngày liên tiếp - Tiết kiệm dự kiến: 200k; (2) Tạm thời hủy gia hạn gói Spotify/Netflix tháng này - Tiết kiệm dự kiến: 150k; (3) Đăng bán cuốn sách kỹ năng bạn vừa đọc xong tuần trước trên group trường."*
    3.  **Invest Readiness Agent (Cố vấn sẵn sàng đầu tư):**
        - *Ví dụ thực tế:* AI đánh giá sức khỏe tài chính đạt mức Vàng (Yellow), Safe Invest Amount: 80.000đ. Đề xuất: Chỉ nên học đầu tư số nhỏ, lý do: quỹ Food chỉ đủ ăn 4 ngày, quỹ khẩn cấp mới đạt 32% và tuần sau có khoản tiền phòng trọ phát sinh. Gợi ý giữ 80% ở Future, 20% học đầu tư định kỳ số nhỏ, không dùng Food/Living để đầu tư.
        - *Cơ chế AI (Tránh Rule-based):* Xây dựng khẩu vị rủi ro động từ chi tiêu thực tế, chạy giả lập cú sốc thua lỗ (Loss Shock) để đo độ ảnh hưởng tới các quỹ sinh hoạt, tính toán số tiền an toàn động, thực hiện Monthly Review để hỏi lại khi mục tiêu đầu tư chưa rõ ràng.
    4.  **Predictive Cashflow & Run-out Forecaster:** Dự báo ngày cạn quỹ Food/Living, LLM viết tóm tắt phân tích và tạo JSON vẽ biểu đồ dự phòng.

#### 3.3. Risk Manager Agent (Cảnh sát tài chính & Bảo mật an toàn giao dịch)
Đóng vai trò quản lý chất lượng giao dịch, phát hiện các rủi ro bảo mật & lừa đảo dựa trên tín hiệu dòng giao dịch thời gian thực và tạo kế hoạch xử lý khủng hoảng khẩn cấp.

*   **Phân nhiệm theo cấu trúc Agicom:**
    - **Quản lý chất lượng sản phẩm (giao dịch):** Đảm bảo tính an toàn cho từng giao dịch chuyển tiền đi ra ngoài.
    - **Phát hiện rủi ro chất lượng từ tín hiệu các agent:** Nhận diện các hành vi bất thường, leak tài khoản, subscription rò rỉ.
    - **Tạo kế hoạch xử lý khủng hoảng:** Tạm dừng giao dịch (Hold), yêu cầu xác thực bổ sung hoặc phối hợp chặn dòng tiền đi.
*   **Tính năng ưu tiên tích hợp:**
    1.  **AI Transaction Risk Agent (Cảnh báo giả mạo trước chi tiêu):**
        - *Cơ chế hoạt động:* Quét giao dịch thô thời gian thực và phát hiện bất thường dựa trên dữ liệu hành vi lịch sử. ZUNO chuyển dịch hoàn toàn từ hệ thống tập luật cứng (rule-based) hoặc các công thức trọng số tĩnh sang kiến trúc **Mô hình AI học sâu và học máy hợp nhất** (Unified AI Risk Detection Framework) để tự động học phân phối giao dịch bình thường (normal distribution boundary) và nhận diện các điểm ngoại lai (outliers).
        - *Hệ thống Mô hình Anomaly Detection tích hợp:*
            *   **Mô hình Học máy (Machine Learning):**
                *   *One-Class SVM & Isolation Forest:* Dùng để phân tích phân phối không gian (Spatial Distribution Boundary) và phân tách nhanh các điểm dữ liệu dị biệt khỏi tập giao dịch an toàn quen thuộc (baseline).
                *   *Random Forest:* Huấn luyện trên tập dữ liệu giao dịch mẫu đã gán nhãn từ ngân hàng đối tác để nhận biết các mẫu lừa đảo phổ biến.
            *   **Mô hình Học sâu (Deep Learning):**
                *   *Autoencoder (Mạng tự mã hóa):* Học cách nén và tái cấu trúc (reconstruction) chuỗi giao dịch bình thường của user. Khi gặp giao dịch lừa đảo/bất thường, Autoencoder sẽ tạo ra sai số tái cấu trúc (Reconstruction Error) lớn. Sai số này được chuẩn hóa làm điểm bất thường gốc ($R_{anomaly} \in [0, 1]$).
                *   *LSTM / RNN (Mạng hồi quy):* Học sự phụ thuộc chuỗi theo thời gian (Temporal Anomaly) giữa các giao dịch để phát hiện nhịp độ chi tiêu dồn dập phi thực tế.
                *   *Transformer-based Sequence Model:* Áp dụng cơ chế Self-Attention để mô hình hóa chuỗi hành vi phức tạp xuyên suốt lịch sử giao dịch (ví dụ: chuỗi "đăng nhập thiết bị lạ $\rightarrow$ đổi hạn mức $\rightarrow$ gọi điện dài $\rightarrow$ chuyển tiền quét sạch ví" sẽ tạo ra điểm dị biệt chuỗi cực kỳ cao).
        - *Cơ chế Chấm điểm tự động bằng mô hình AI hợp nhất (Unified AI Risk Scoring Model):*
            Hệ thống loại bỏ hoàn toàn các công thức tính điểm thủ công dựa trên trọng số cố định (rule-based/heuristics). Thay vào đó, điểm rủi ro tổng hợp $R_{total} \in [0, 1]$ được tính toán trực tiếp thông qua một **Mô hình Trí tuệ Nhân tạo Hợp nhất** ($f_{AI}$):
            $$R_{total} = f_{AI}(\mathbf{x})$$
            Trong đó:
            *   **$\mathbf{x}$**: Vector đặc trưng đa chiều (Feature Vector) được trích xuất thời gian thực bao gồm:
                *   *Đặc trưng Không gian - Thời gian (Spatial-Temporal Features):* Vị trí giao dịch (GPS/IP), thời gian (giờ đêm muộn), độ lệch địa lý phi thực tế.
                *   *Đặc trưng Giao dịch (Transaction Features):* Số tiền giao dịch, lịch sử tài khoản thụ hưởng, loại hóa đơn.
                *   *Đặc trưng Thiết bị & Giao tiếp (Device & Communication Features):* Thiết bị thực thi giao dịch, thời lượng và lịch sử cuộc gọi thoại trước giao dịch.
                *   *Đặc trưng Hành vi lịch sử (Historical Baseline):* Bản đồ phân bổ giao dịch bình thường của chính người dùng.
            *   **$f_{AI}$**: Mô hình học sâu kết hợp giữa **Autoencoder/Deep SVDD** (đo độ lệch phân phối) và mạng **Transformer Encoder** (phân tích chuỗi hành vi), sau đó được phân loại bởi bộ phân loại học máy **Gradient Boosting (LightGBM/XGBoost)** đã huấn luyện trên dữ liệu gian lận thực tế để xuất ra xác suất rủi ro trực tiếp $R_{total}$.
        - *Ma trận Xử lý & Can thiệp (Slide Concept):*
            *   **$R_{total} < 0.45$ (Rủi ro Thấp):** **[CHO QUA]** - Thực thi giao dịch bình thường.
            *   **$0.45 \le R_{total} < 0.75$ (Rủi ro Trung bình):** **[CẢNH BÁO AI]** - Hiển thị popup giải thích lý do nghi ngờ dựa trên phân tích dị biệt baseline từ mô hình AI (Ví dụ: *"ZUNO phát hiện giao dịch có độ lệch phân phối hành vi $R_{total}$ cao kết hợp vị trí lạ LFL..."*).
            *   **$R_{total} \ge 0.75$ (Rủi ro Cao):** **[KHÓA & XÁC THỰC]** - Tạm giữ giao dịch (Hold) 15-30 phút để người dùng bình tĩnh thoát khỏi cuộc gọi đe dọa, hoặc bắt buộc gọi Video Call/Xác thực khuôn mặt nâng cao.
        - *Quy tắc Địa điểm theo ý kiến Lead:*
            *   *Tại HFL (Quen thuộc):* Chỉ cảnh báo khi mô hình AI phát hiện giao dịch lệch baseline và ở mức **Cao (> 500k VND)**.
            *   *Tại LFL (Vị trí lạ):* Cảnh báo ngay khi chi tiêu ở mức **Trung bình (200k - 500k VND)** hoặc **Cao (> 500k VND)**. Đêm muộn tại vị trí lạ tự động khóa giao dịch (Hold).
        - *Ví dụ thực tế:* 
            Một sinh viên chuyển khoản **3.200.000đ** lúc **02:45 AM** (giờ ngủ) tại một địa điểm **LFL (vị trí lạ)** sau cuộc gọi dài **20 phút** để đặt cọc tiền **hợp đồng kỳ nghỉ dài hạn**.
            *   *Cơ chế hoạt động của AI:* Vector đặc trưng $\mathbf{x}$ của giao dịch được đưa vào mô hình $f_{AI}$. Mạng Autoencoder phát hiện sai số tái cấu trúc cực lớn do hành vi này lệch hẳn khỏi phân phối lịch sử của sinh viên (chưa bao giờ giao dịch đêm muộn số tiền lớn tại vị trí lạ). Đồng thời, Transformer phát hiện chuỗi hành vi bất thường (giao dịch ngay sau cuộc gọi dài).
            *   *Kết quả:* Mô hình $f_{AI}$ phân loại và trả về điểm số rủi ro trực tiếp $R_{total} = 0.94$ (mức Cao). Hệ thống lập tức tạm giữ giao dịch (Hold) và yêu cầu xác thực Video Call để ngăn chặn lừa đảo.
            *   *Subscription leak:* Phát hiện giao dịch trừ tự động học tiếng Anh 129k khi 2 tháng qua user không có hành vi học tập liên quan. Gửi cảnh báo rò rỉ và nhắc hủy gói trước 2 ngày tự động gia hạn.
    2.  **Chống Cám dỗ theo Vị trí (Location-Based Smart Nudging):**
        - *Cơ chế hoạt động:* Risk Manager Agent liên tục phân tích lịch sử địa điểm của các giao dịch bị Lố 1 và Lố 2 để tự động dán nhãn các **"Tọa độ rủi ro"** (như quán café, trung tâm thương mại, khu ăn vặt cạnh trường học/phòng trọ). Khi Geofencing (định vị địa lý từ GPS của app ngân hàng) phát hiện người dùng bước vào các tọa độ này vào thời điểm tan tầm, đồng thời số dư Quỹ Ăn uống/Trải nghiệm của ngày hôm đó đã chạm ngưỡng báo động, Risk Manager sẽ gửi tín hiệu yêu cầu CSKH Agent thực hiện can thiệp tức thì bằng thông điệp khuyên bảo theo ngữ cảnh (Contextual Nudging).
        - *Ví dụ thực tế:* Bạn vừa tan học và bước vào trung tâm thương mại MegaMall quen thuộc. App gửi Push Notification: *"Khu vực này có vẻ hay làm ví mình 'đau'! Hôm nay Quỹ Ăn uống của bạn chỉ còn 20k thôi, hãy lướt qua thật nhanh và về nhà nấu bữa tối nhé!"*
    3.  **AI Cognitive Pre-Spending Interceptor (Bộ lọc rủi ro chi tiêu trước giao dịch):**
        - Khi user bắt đầu giao dịch thanh toán giả lập gây lố quỹ nặng hoặc đẩy hạn mức ngân sách được chia (ngày/tuần) của quỹ tương ứng xuống mức báo động (dưới 10%), hệ thống sẽ gọi **VNPT Smartbot nâng cao (LLM)** để sinh ra một thông điệp can thiệp hành vi (behavioral nudge) cá nhân hóa hài hước và thực tế (ví dụ: *"Món nướng này trông rất hấp dẫn, nhưng nếu chốt giao dịch này, quỹ Ăn uống của bạn sẽ chỉ còn 30.000đ cho 4 ngày còn lại..."*).
    4.  **Subscription & Latte Factor Optimizer (Tối ưu hóa các khoản chi lặp lại):**
        - *Cơ chế hoạt động:* Nhận diện các khoản chi nhỏ lặp lại gây lãng phí (café, trà sữa) và các gói đăng ký dịch vụ trùng lặp định kỳ (Netflix, Spotify, Gemini AI...). AI tự động phân tích dữ liệu giao dịch (Transaction Stream) thời gian thực để đối khớp đối tác nhận tiền và mô tả giao dịch. Nếu phát hiện đó là hóa đơn/invoice của các dịch vụ đăng ký định kỳ (ví dụ: Spotify, Netflix, Gemini AI, Youtube Premium, iCloud...), AI sẽ tự động phân loại, trích xuất số tiền, chu kỳ thanh toán và lưu vào danh sách các gói đăng ký (Subscription List) của người dùng để đề xuất tối ưu hóa cước cước (gói sinh viên, share gia đình) và gửi cảnh báo trước 2 ngày khi gói đăng ký sắp tự động gia hạn giúp người dùng chủ động hủy gói nếu không còn sử dụng.
    5.  **Cơ chế Cảnh báo An ninh Lừa đảo (Temporal, Spatial, Behavioral, Profile-Based):**
        - *Temporal Anomaly:* Giao dịch dồn dập từ 2:00 AM - 5:00 AM.
        - *Spatial Anomaly:* Thay đổi vị trí địa lý hoặc IP phi thực tế.
        - *Behavioral Anomaly:* Quét sạch số dư tài khoản sang tài khoản mới sau cuộc gọi kéo dài.
        - *Profile-Based Spending Anomaly:* Khách hàng là **sinh viên** đột nhiên chuyển khoản một số tiền lớn vượt quá 50% thu nhập/số dư trung bình sang tài khoản lạ do bị đe dọa phạt nguội, đóng tiền học gấp giả mạo, đa cấp.
        - **Yêu cầu độ trễ (Latency):** Phân tích thời gian thực và đưa ra tín hiệu phản hồi dưới **200 milliseconds** để tạm khóa giao dịch trước khi core banking thực thi, kích thực sinh trắc học bổ sung.

---

### 4. Sức mạnh Công nghệ VNPT AI Platform làm Nền tảng

Hệ thống ZUNO Multi-Agent vận hành trơn tru nhờ sự bổ trợ đắc lực từ 3 dịch vụ API cốt lõi trong hệ sinh thái VNPT AI Platform:

1.  **VNPT Smartbot (Nhận diện ý định & NLP):**
    - Hỗ trợ phân loại ý định người dùng (Intent Classification) trong các cuộc hội thoại chat/giọng nói.
    - Hỗ trợ tách chiết các thực thể (Entity Extraction) phục vụ cho phân hệ *AI Shared Expense Intelligence* và *AI Transaction Risk Agent*.
2.  **VNPT Smartbot nâng cao (Hỏi đáp dùng LLM & RAG):**
    - Cung cấp mô hình ngôn ngữ lớn (LLM) để chẩn đoán nguyên nhân lố quỹ, tạo ra các kịch bản và plan điều chỉnh ngân sách cho ZUNO Budget Strategy Agent (nằm trong Content Agent) và các nhiệm vụ giải cứu.
    - Sinh ra các thông điệp can thiệp hành vi cá nhân hóa (behavioral nudge) mang giọng điệu hài hước, dí dỏm.
    - Thực hiện truy vấn dữ liệu chi tiêu an sau qua cơ chế RAG (Retrieval-Augmented Generation) trên CSDL PostgreSQL của ZUNO Backend.
3.  **VNPT SmartVoice (Speech-to-Text & Text-to-Speech):**
    - Chuyển đổi giọng nói của người dùng thành văn bản (STT) với độ chính xác cao giúp ghi chép chi tiêu hoặc đặt câu hỏi rảnh tay.
    - Chuyển đổi câu trả lời dạng chữ của AI thành giọng nói tự nhiên (TTS) để đọc báo cáo tài chính hàng ngày cho người dùng.

---

### 5. Tính Linh Hoạt Trong Triển Khai Cho Ngân Hàng (Integration Flexibility)

Kiến trúc hệ thống ZUNO được thiết kế theo dạng module độc lập (Modular Behavioral Layer). Ngân hàng đối tác hoàn toàn có thể lựa chọn 1 trong 2 hình thức tích hợp tùy theo nhu cầu thực tế và tài nguyên kỹ thuật:

- **Tùy chọn 1: Chỉ tích hợp ZUNO Core (ZUNO Core Only)**
  - *Mô tả:* Ngân hàng chỉ triển khai phần công cụ quản lý tài chính hành vi cốt lõi (gồm 5 Quỹ, ngân sách vi mô Atomic Budget và cơ chế can thiệp lố 3 cấp độ chạy hoàn toàn bằng Rule-based Engine deterministic).
  - *Ưu điểm:* Cực kỳ tối giản, nhẹ nhàng, triển khai nhanh chóng, không tốn chi phí gọi API AI bên ngoài, độ trễ tối thiểu và đảm bảo tính riêng tư tối đa.
- **Tùy chọn 2: Tích hợp ZUNO Core kết hợp AI Multi-Agent**
  - *Mô tả:* Kích hoạt toàn bộ lớp AI Multi-Agent (CSKH Agent, Content Agent, Risk Manager Agent) kết nối với VNPT AI Platform để chạy các tính năng nâng cao (AI Coach, Smart Rescue, Transaction Risk, Location-Based Nudging).
  - *Ưu điểm:* Tạo trải nghiệm cá nhân hóa tối đa (WOW factor), tăng trưởng CASA đột phá và bảo vệ người dùng toàn diện nhờ lớp lọc rủi ro AI.

> [!TIP]
> **Cơ chế Nâng Cấp "Không Chạm" (Plug-and-Play Upgrade):** Nhờ cổng kết nối Connector Agent chuẩn hóa, ngân hàng có thể triển khai trước **Tùy chọn 1** cho giai đoạn MVP. Khi muốn nâng cấp lên **Tùy chọn 2**, quản trị viên chỉ cần bật switch kích hoạt AI trên Admin Portal để cắm nối luồng AI vào mà **không cần phải biên dịch lại ứng dụng di động hay viết lại mã nguồn Core Banking**.

---

### 7. Cơ chế Cộng tác Chéo giữa các Agent (Cross-Agent Collaboration Flow)

Sự phối hợp đồng bộ giữa 3 Agent (CSKH, Content, Risk Manager) tạo nên cơ chế vận hành thông minh của ZUNO qua 3 luồng cộng tác tiêu biểu:

1. **Luồng Tối ưu rò rỉ đăng ký (Subscription Leak Optimization Flow):**
   - **Risk Manager Agent:** Phân tích giao dịch thời gian thực (`Transaction Stream`) -> Phát hiện hóa đơn đăng ký định kỳ (Spotify, Netflix, Gemini...) -> Tự động lưu vào danh sách đăng ký.
   - **Content Agent:** Nhận diện và soạn phương án tối ưu (ví dụ: chuyển sang gói sinh viên, share gia đình) -> Thiết lập lịch nhắc nhở trước 2 ngày.
   - **Agent CSKH:** Chủ động gửi cảnh báo nhắc nhở qua Chatbot/Voice và hỗ trợ người dùng thao tác hủy/thay đổi gói dịch vụ.

2. **Luồng Chống cám dỗ theo vị trí (Location-Based Impulse Spending Mitigation Flow):**
   - **Risk Manager Agent:** Đọc tín hiệu GPS/Geofencing -> Phát hiện user bước vào "Tọa độ rủi ro" (TTTM, khu ăn vặt) lúc ví cạn (ngân sách ngày/tuần dưới 10%).
   - **Content Agent:** Chẩn đoán hành vi từ tín hiệu gửi sang -> Tạo nội dung can thiệp (`behavioral nudge`) cá nhân hóa hài hước và thực tế.
   - **Agent CSKH:** Thực thi bắn thông báo đẩy (Push Notification) cảnh báo ngữ cảnh thời gian thực trước khi người dùng thực hiện giao dịch chi tiêu bốc đồng.

3. **Luồng Nhiệm vụ giải cứu ngân sách (Smart Budget Rescue Flow):**
   - **Agent CSKH:** Phát hiện user tiêu lố ngân sách vi mô (Chạm ngưỡng Lố 1, Lố 2) -> Ghi nhận thâm hụt và gửi cảnh báo giảm điểm kỷ luật tài chính (`Financial Health Score`).
   - **Content Agent:** Phân tích hành vi chi tiêu gần đây để thiết kế **3 Nhiệm vụ giải cứu** cá nhân hóa (ví dụ: tự nấu ăn 5 ngày để tiết kiệm 200k, bán sách cũ, tạm dừng dịch vụ phụ).
   - **Agent CSKH:** Giao nhiệm vụ cho người dùng dưới dạng game hóa (Gamification), giám sát kết quả thực hiện và hoàn lại điểm kỷ luật khi hoàn thành nhiệm vụ.

---

### 8. Cam kết An toàn Thông tin & Quyền riêng tư (Privacy & Security)

Hệ thống ZUNO tuân thủ các tiêu chuẩn bảo mật khắt khe nhất của ngành tài chính:
- **Ẩn danh hóa dữ liệu (Anonymization):** Không lưu trữ số tài khoản ngân hàng thực tế, tên thật hay số định danh cá nhân của khách hàng. Mọi liên kết giữa thực thể Agent và khách hàng đều thông qua các token bảo mật ngẫu nhiên (UUID).
- **Mã hóa dữ liệu:** Mã hóa toàn bộ dữ liệu lưu trữ (Data-at-rest) bằng thuật toán AES-256 và dữ liệu truyền tải (Data-in-transit) bằng giao thức TLS 1.3.
- **Quyền kiểm soát của Người dùng (User Consent):** Khách hàng có quyền bật/tắt tính năng AI Bạn đồng hành bất kỳ lúc nào. Khi tắt, toàn bộ dữ liệu hành vi sẽ được đánh dấu xóa sạch khỏi cơ sở dữ liệu phân tích trong vòng 7 ngày.

#### 8.1. Đảm bảo Tính Hợp pháp & Chất lượng Dữ liệu Sạch (Data Legality & Quality Assurance)
ZUNO thiết lập quy trình kiểm soát và tiền xử lý dữ liệu đầu vào nghiêm ngặt để đảm bảo an toàn pháp lý và chất lượng huấn luyện mô hình AI:
- **Tuân thủ Pháp lý tuyệt đối (Regulatory Compliance):** Hệ thống tuân thủ đầy đủ **Nghị định 13/2023/NĐ-CP** của Việt Nam về Bảo vệ dữ liệu cá nhân (PDPA) và tiêu chuẩn bảo mật thẻ thanh toán **PCI-DSS**. Mọi dữ liệu chỉ được xử lý khi có sự đồng ý rõ ràng (Consent) của chủ thể dữ liệu.
- **Nguồn dữ liệu Hợp pháp (Legal Sourcing):** Cam kết chỉ sử dụng dữ liệu chi tiêu phát sinh hợp pháp thông qua luồng Open Banking API được ngân hàng đối tác liên kết ủy quyền trực tiếp. ZUNO nói không với dữ liệu mua bán từ bên thứ ba hoặc các nguồn khai thác bất hợp pháp.
- **Quy trình làm sạch dữ liệu (Data Cleaning Pipeline):** Dữ liệu thô từ ngân hàng được chạy qua pipeline tự động để loại bỏ nhiễu (noise), chuẩn hóa các bản ghi giao dịch bị thiếu thông tin hoặc sai lệch trước khi đưa vào mô hình học máy. Điều này đảm bảo AI luôn được huấn luyện trên nguồn **dữ liệu sạch (clean data)**, nâng cao độ chính xác và tránh hiện tượng lệch lạc mô hình (model drift).
- **Che giấu dữ liệu nhạy cảm (Data Masking):** Toàn bộ các trường thông tin nhạy cảm của khách hàng (như số tài khoản, mã xác thực) đều được mã hóa một chiều (hashing) hoặc che giấu trước khi đưa vào hệ thống phân tích AI.

---
### 9. Vì sao nên chọn Giải pháp AI Multi-Agent của ZUNO? (ZUNO AI Competitive Advantages)

Giải pháp AI Multi-Agent của ZUNO mang lại những giá trị vượt trội và là sự lựa chọn tối ưu cho các ngân hàng liên kết nhờ các ưu thế cạnh tranh cốt lõi sau:

1. **Thay đổi hành vi thực tế thay vì báo cáo tĩnh (Behavioral Transformation vs. Static Reporting):**
   - Các ứng dụng tài chính thông thường chỉ dừng lại ở việc thống kê chi tiêu sau khi giao dịch đã xảy ra (Post-spending analysis). AI của ZUNO can thiệp chủ động tại **thời điểm vàng trước khi chi tiêu** (Pre-spending gold standard time) bằng cơ chế can thiệp hành vi dí dỏm, Weekend Buffer thông minh và các nhiệm vụ giải cứu ngân sách giúp thay đổi thói quen tài chính của người dùng một cách thực chất.

2. **Kiến trúc cắm nối tối giản cho ngân hàng (Plug-and-Play Integration):**
   - ZUNO được thiết kế dưới dạng một lớp trí tuệ hành vi độc lập (Modular Behavioral Layer). Ngân hàng có thể triển khai ZUNO dưới dạng module nhúng trực tiếp vào ứng dụng ngân hàng số hiện tại mà không cần cấu trúc lại Core Banking hay biên dịch lại mã nguồn ứng dụng gốc, giúp giảm thiểu rủi ro hệ thống và rút ngắn thời gian đưa sản phẩm ra thị trường (Time-to-market).

3. **Hệ thống bảo vệ tài sản thời gian thực dưới 200ms (Active Fraud Prevention):**
   - Sử dụng các mô hình học sâu hàng đầu (Autoencoders, Transformers, One-Class SVM) chạy trực tiếp trên luồng giao dịch thời gian thực để chặn đứng các hành vi lừa đảo công nghệ cao phổ biến (như giả mạo phạt nguội, cọc hợp đồng kỳ nghỉ dài hạn, đa cấp...). AI phản hồi với độ trễ cực thấp (< 200ms), tạm hold giao dịch để bảo vệ ví tiền của người dùng trước khi tiền thực sự rời khỏi tài khoản.

4. **Tối ưu hóa Việt hóa và Bản địa hóa sâu sắc nhờ VNPT AI Platform (Localized & Cost-Efficient):**
   - Kế thừa các giải pháp NLP, LLM RAG và Voice hàng đầu từ VNPT AI Platform, ZUNO mang lại trải nghiệm tương tác bằng tiếng Việt tự nhiên, hài hước, bắt kịp xu hướng giới trẻ. Sự hợp tác này cũng giúp tối ưu hóa chi phí hạ tầng máy chủ AI, đảm bảo an toàn thông tin nội địa và giảm thiểu phụ thuộc vào các API mô hình lớn của nước ngoài.

5. **Tối ưu hóa CASA dự báo và Game hóa thích ứng bằng AI (AI-Driven CASA & Adaptive Gamification):** AI tự động dự báo dòng tiền nhàn rỗi để đề xuất tích lũy sớm (tối ưu CASA) và thiết lập động các nhiệm vụ tài chính cá nhân hóa theo điểm kỷ luật thời gian thực của người dùng.

---

### 10. Dự toán Chi phí Hạ tầng & Vận hành AI (AI Infrastructure & Operational Cost Estimation)

Để triển khai hệ thống AI Multi-Agent cho tập đối tượng kiểm thử **100,000 người dùng hoạt động hàng tháng (100k MAU)**, dự toán chi phí vận hành hàng tháng trên hệ sinh thái VNPT AI Platform và hạ tầng Cloud được thiết lập tối ưu như sau:

#### Bảng Dự toán Chi phí Hàng tháng (Cho 100k MAU):

| Hạng mục chi phí | Đơn vị tính | Đơn giá ước tính (VND) | Tần suất sử dụng trung bình | Chi phí/Tháng (VND) |
| :--- | :--- | :---: | :---: | :---: |
| **1. VNPT Smartbot NLP** *(Phân loại intent)* | 1,000 requests | 25,000đ | 30 requests / user / tháng (3M requests) | 75,000,000đ |
| **2. VNPT Smartbot nâng cao** *(LLM & RAG)* | 1M tokens | 40,000đ | 10 sessions / user / tháng (~1,000M tokens) | 40,000,000đ |
| **3. VNPT SmartVoice** *(STT/TTS thoại rảnh tay)* | 1 phút thoại | 200đ | 5 phút thoại / user / tháng (500,000 phút) | 100,000,000đ |
| **4. Cloud Hosting (Container App Core)** | Instance / Giờ | Trọn gói | 4 Instances CPU/RAM (vận hành 3 Agent core) | 15,000,000đ |
| **5. Database & Vector DB (pgvector)** | Storage / I/O | Trọn gói | Lưu trữ 100k profiles và lịch sử chi tiêu | 5,000,000đ |
| **Tổng chi phí vận hành ước tính** | | | **~2,350đ / người dùng / tháng** | **235,000,000đ** |

#### Các Giải pháp Tối ưu hóa Chi phí Hạ tầng (Cost Optimization Strategies):
* **Chạy cục bộ các mô hình Anomaly Detection (Local ML Processing):** Các mô hình học máy và học sâu phát hiện bất thường giao dịch (*One-Class SVM*, *Isolation Forest*, *Autoencoders*) được đóng gói gọn nhẹ và chạy trực tiếp trên các CPU instances của ZUNO Core thay vì gọi API bên ngoài cho mỗi giao dịch chuyển tiền. Điều này giúp triệt tiêu hoàn toàn chi phí API rủi ro giao dịch đồng thời giảm độ trễ xuống dưới **200ms**.
* **Lớp Đệm Cảnh báo (Nudge Caching Layer):** Cấu trúc lưu trữ sẵn các thông điệp can thiệp hành vi mẫu phổ biến cho các lỗi tiêu lố tương tự. Các cuộc gọi đến VNPT Smartbot nâng cao (LLM) chỉ được kích hoạt khi cần sinh thông điệp cá nhân hóa sâu sắc hoặc phân tích tình huống tài chính phức tạp, giúp giảm 60% số lượng token tiêu thụ.
* **Quy trình Lọc Ý định Cục bộ (Rule-based Intent Filtering):** Tích hợp bộ lọc ý định cơ bản bằng regex/cây quyết định tại Gateway để xử lý các câu lệnh nhập liệu đơn giản trước khi chuyển tiếp lên VNPT Smartbot NLP, tiết kiệm đáng kể chi phí gọi API.

---

*(Tài liệu này được biên soạn cho Ban Giám đốc ZUNO & Đối tác Ngân hàng liên kết)*
