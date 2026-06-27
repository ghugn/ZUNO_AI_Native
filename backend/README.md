# ZUNO Backend

Express.js + TypeScript + Prisma ORM + PostgreSQL. Đây là dịch vụ backend cốt lõi của ứng dụng quản lý hành vi tài chính ZUNO, cung cấp hệ thống API mạnh mẽ để quản lý ngân sách, giao dịch, cảnh báo chi tiêu (Cơ chế 3 Lố), phần thưởng tuần, tích lũy dài hạn và tích hợp AI.

---

## 🚀 Khởi động nhanh (Quick Start)

### 1. Cài đặt môi trường
Đảm bảo bạn đã cài đặt Node.js và PostgreSQL trên máy của mình.

### 2. Các bước chạy dự án
```bash
# 1. Cài đặt các thư viện phụ thuộc
npm install

# 2. Tạo file cấu hình môi trường từ mẫu
cp .env.example .env
# → Mở file .env và cập nhật đường dẫn DATABASE_URL của PostgreSQL của bạn

# 3. Tạo Prisma Client code từ schema
npx prisma generate

# 4. Đồng bộ cấu trúc bảng vào cơ sở dữ liệu (Database Schema)
npx prisma db push

# 5. Nạp dữ liệu mẫu ban đầu (Seed fund_templates)
npm run db:seed

# 6. Khởi chạy Server ở chế độ Development (tự động reload khi thay đổi code)
npm run dev
```

---

## 🛣️ Hệ thống API Endpoints

### 🔐 1. Xác thực & Tài khoản (`/api/auth`)
| Method | Path | Auth | Description |
|:---|:---|:---:|:---|
| `POST` | `/api/auth/register` | ❌ | Đăng ký tài khoản mới |
| `POST` | `/api/auth/login` | ❌ | Đăng nhập hệ thống |
| `GET` | `/api/auth/me` | ✅ | Lấy thông tin tài khoản hiện tại |

### 👤 2. Hồ sơ người dùng (`/api/profile`)
| Method | Path | Auth | Description |
|:---|:---|:---:|:---|
| `GET` | `/api/profile` | ✅ | Lấy thông tin hồ sơ chi tiết |
| `POST` | `/api/profile` | ✅ | Khởi tạo hồ sơ mới |
| `PUT` | `/api/profile` | ✅ | Cập nhật thông tin hồ sơ |
| `POST` | `/api/profile/complete-onboarding` | ✅ | Đánh dấu hoàn thành Onboarding |

### 💰 3. Quản lý Quỹ Zuno (`/api/funds`)
| Method | Path | Auth | Description |
|:---|:---|:---:|:---|
| `GET` | `/api/funds` | ✅ | Danh sách quỹ của tháng hiện tại (`?month=YYYY-MM-DD`) |
| `POST` | `/api/funds` | ✅ | Khởi tạo 5 quỹ tháng mới từ cấu hình phân bổ |
| `GET` | `/api/funds/templates` | ✅ | Lấy danh sách cấu hình phân bổ mẫu (ở KTX, thuê trọ...) |
| `GET` | `/api/funds/snapshots` | ✅ | Lấy danh sách snapshot tiến độ số dư của các quỹ |
| `POST` | `/api/funds/snapshots` | ✅ | Tạo snapshot mới cho quỹ |
| `POST` | `/api/funds/snapshots/drip` | ✅ | Trigger tiến trình nhỏ giọt tiền dài hạn (thủ công) |
| `POST` | `/api/funds/rollover` | ✅ | Thực hiện kết chuyển số dư thừa cuối tháng (thủ công) |
| `GET` | `/api/funds/projection` | ✅ | Tính toán dự phóng lãi kép dài hạn |
| `GET` | `/api/funds/:id` | ✅ | Chi tiết một quỹ theo ID |
| `PUT` | `/api/funds/:id` | ✅ | Cập nhật cấu hình hoặc số dư của quỹ |

### 📝 4. Giao dịch (`/api/transactions`)
| Method | Path | Auth | Description |
|:---|:---|:---:|:---|
| `POST` | `/api/transactions` | ✅ | Tạo giao dịch mới (áp dụng tự động Cơ chế 3 Lố khi lố ngân sách) |
| `GET` | `/api/transactions` | ✅ | Danh sách giao dịch (`?month=YYYY-MM-DD`) |
| `GET` | `/api/transactions/by-date` | ✅ | Danh sách giao dịch theo khoảng ngày cụ thể |
| `GET` | `/api/transactions/:id` | ✅ | Lấy chi tiết giao dịch |
| `PUT` | `/api/transactions/:id` | ✅ | Cập nhật thông tin giao dịch |
| `DELETE` | `/api/transactions/:id` | ✅ | Xóa giao dịch |

### 🏷️ 5. Thẻ chi tiêu (`/api/tags`)
| Method | Path | Auth | Description |
|:---|:---|:---:|:---|
| `GET` | `/api/tags` | ✅ | Lấy danh sách tất cả các tag chi tiêu |
| `POST` | `/api/tags` | ✅ | Tạo một tag chi tiêu tùy chỉnh |
| `GET` | `/api/tags/fund/:fundType` | ✅ | Lấy danh sách tag theo nhóm quỹ tương ứng |
| `PUT` | `/api/tags/:id` | ✅ | Cập nhật thông tin tag |
| `DELETE` | `/api/tags/:id` | ✅ | Xóa tag |

### 🍲 6. Ngân sách ăn uống hàng ngày (`/api/daily-food`)
| Method | Path | Auth | Description |
|:---|:---|:---:|:---|
| `GET` | `/api/daily-food` | ✅ | Lấy ngân sách và số tiền đã ăn hôm nay (`?date=YYYY-MM-DD`) |
| `GET` | `/api/daily-food/month` | ✅ | Lấy lịch sử ngân sách ăn uống trong tháng |
| `POST` | `/api/daily-food` | ✅ | Khởi tạo ngân sách ăn uống cho ngày mới |
| `POST` | `/api/daily-food/bulk` | ✅ | Khởi tạo hàng loạt ngân sách ăn uống |
| `PUT` | `/api/daily-food` | ✅ | Cập nhật ngân sách ăn uống hiện tại |

### 🏆 7. Nhiệm vụ & Điểm thưởng (`/api/rewards`)
| Method | Path | Auth | Description |
|:---|:---|:---:|:---|
| `GET` | `/api/rewards/weekly` | ✅ | Kiểm tra tiến độ nhiệm vụ tích lũy tuần hiện tại |
| `GET` | `/api/rewards/weekly/month` | ✅ | Lấy lịch sử nhiệm vụ tuần theo tháng |
| `POST` | `/api/rewards/weekly` | ✅ | Tạo nhiệm vụ tuần mới |
| `POST` | `/api/rewards/weekly/:id/claim` | ✅ | Nhận thưởng rương tuần và đổi điểm tích lũy |
| `PUT` | `/api/rewards/weekly/:id` | ✅ | Cập nhật trạng thái nhiệm vụ tuần |
| `GET` | `/api/rewards/points` | ✅ | Lấy số điểm hiện tại và hệ số nhân (multiplier) của user |
| `POST` | `/api/rewards/points/add` | ✅ | Cộng điểm thưởng cho user |
| `PUT` | `/api/rewards/points/multiplier` | ✅ | Cập nhật hệ số nhân điểm (multiplier) |

### ⚠️ 8. Quản lý lố ngân sách (`/api/overflows`)
| Method | Path | Auth | Description |
|:---|:---|:---:|:---|
| `GET` | `/api/overflows` | ✅ | Danh sách tất cả lịch sử các sự kiện lố ngân sách |
| `GET` | `/api/overflows/pending` | ✅ | Danh sách các sự kiện lố chưa hoàn trả (mượn hũ khác) |
| `POST` | `/api/overflows` | ✅ | Ghi nhận sự kiện lố mới |
| `GET` | `/api/overflows/:id` | ✅ | Lấy thông tin chi tiết sự kiện lố |
| `PUT` | `/api/overflows/:id` | ✅ | Cập nhật trạng thái hoặc số tiền đã hoàn trả của sự kiện lố |

### 🤖 9. Nhật ký AI Parser (`/api/ai-logs`)
| Method | Path | Auth | Description |
|:---|:---|:---:|:---|
| `GET` | `/api/ai-logs` | ✅ | Lấy nhật ký các chuỗi input được phân tích bởi AI |
| `POST` | `/api/ai-logs` | ✅ | Ghi nhận log phân tích AI mới |
| `GET` | `/api/ai-logs/:id` | ✅ | Chi tiết log AI |
| `POST` | `/api/ai-logs/:id/confirm` | ✅ | Xác nhận kết quả phân tích AI đúng |
| `POST` | `/api/ai-logs/:id/correct` | ✅ | Chỉnh sửa và lưu kết quả đúng do user sửa thủ công |

### ⏰ 10. Lệnh kích hoạt định kỳ (`/api/cron`)
*Yêu cầu Header:* `X-Cron-Secret` tương ứng biến môi trường `CRON_SECRET` để chạy.
| Method | Path | Auth | Description |
|:---|:---|:---:|:---|
| `POST` | `/api/cron/daily-drip` | 🔒 | Chạy tiến trình nhỏ giọt tiền tiết kiệm dài hạn hàng ngày |
| `POST` | `/api/cron/monthly-rollover` | 🔒 | Kết chuyển tiền thừa của các quỹ cuối tháng sang hũ tích lũy dài hạn |
| `GET` | `/api/cron/status` | 🔒 | Kiểm tra trạng thái scheduler |

---

## 📂 Cấu trúc thư mục

```text
backend/
├── prisma/
│   ├── schema.prisma    # Định nghĩa cấu trúc Database (12 tables)
│   └── seed.ts          # Khởi tạo dữ liệu mẫu cho Quỹ và Thẻ mẫu
├── public/              # Trang Web Test UI tĩnh chạy trực tiếp tại /test-ui
│   └── index.html       # Giao diện kiểm thử API tích hợp
├── src/
│   ├── routes/          # Định nghĩa định tuyến Express API
│   ├── controllers/     # Tiếp nhận request, gọi service và trả response
│   ├── services/        # Logic nghiệp vụ chính & truy vấn Prisma
│   ├── middleware/      # Middleware kiểm tra Token, phân quyền Cron, xử lý lỗi
│   ├── lib/             # Khởi tạo kết nối Prisma, các hằng số chung
│   ├── app.ts           # Cấu hình Express App, đăng ký Route và Scheduler
│   └── server.ts        # Điểm khởi chạy Server chính
├── package.json
└── tsconfig.json
```

---

## ⏰ Cơ chế Scheduler (Tự động nhỏ giọt & Kết chuyển)

Hệ thống hỗ trợ 2 chế độ vận hành để xử lý tiến trình tự động hóa dòng tiền:
1. **Chế độ phát triển (DEV):** Khi không phát hiện biến môi trường `CRON_SECRET`, server sẽ tự khởi chạy bộ lập lịch chạy nền nội bộ (`setInterval`). Thích hợp chạy local không cần cấu hình thêm dịch vụ ngoài.
2. **Chế độ vận hành (PRODUCTION):** Khi phát hiện `CRON_SECRET`, scheduler nội bộ sẽ được **tắt**. Bạn cần thiết lập một dịch vụ gọi định kỳ (như Cloud Scheduler, AWS EventBridge, hoặc Cron-job.org) để trigger trực tiếp vào 2 API `/api/cron/daily-drip` (chạy hàng ngày lúc 00:00) và `/api/cron/monthly-rollover` (chạy vào giây cuối cùng của tháng) kèm theo header bảo mật `X-Cron-Secret`.

---

## 🛠️ Danh sách các Scripts hỗ trợ

Các câu lệnh có sẵn cấu hình trong `package.json`:
* `npm run dev`: Chạy server dev tự động reload (watch mode).
* `npm run build`: Biên dịch mã nguồn TypeScript sang JavaScript (`dist/`).
* `npm start`: Chạy server production sau khi build.
* `npm run db:push`: Đồng bộ schema Prisma lên database PostgreSQL.
* `npm run db:seed`: Nạp dữ liệu mẫu ban đầu từ file `prisma/seed.ts`.
* `npm run db:studio`: Mở giao diện quản trị cơ sở dữ liệu trực quan của Prisma (GUI) tại trình duyệt.

---

## 🎨 Kiểm thử giao diện API (`/test-ui`)

Backend tích hợp sẵn một giao diện kiểm thử API tương tác nhanh tại URL:
`http://localhost:5000/test-ui`

Trang web này cho phép bạn thực hiện đăng ký, đăng nhập, gọi thử tất cả các API, giả lập giao dịch lố để test "Cơ chế 3 Lố", và xem kết quả trả về trực tiếp trên UI một cách trực quan.
