# VietBank Digital — Mock Core Banking Simulator

Đây là web app mô phỏng hệ thống Core Banking của ngân hàng. Khi bạn thêm giao dịch ở đây, nó sẽ tự động được phân loại và đẩy vào ZUNO qua webhook.

## Khởi chạy nhanh

### Cách 1: Live Server (VSCode)
Cài extension **Live Server** → Click chuột phải vào `index.html` → **Open with Live Server**

### Cách 2: Python HTTP Server
```bash
cd mock-bank
python -m http.server 8080
```
Mở trình duyệt tại: http://localhost:8080

### Cách 3: Node.js serve
```bash
npx serve mock-bank -p 8080
```

## Tính năng

- 🏦 **Tài khoản ngân hàng** — Hiển thị danh sách users từ ZUNO
- 📤 **Tạo giao dịch** — Form nhập merchant name + số tiền + danh mục MCC
- 🤖 **Preview phân loại** — Xem ZUNO sẽ phân loại vào quỹ nào TRƯỚC khi gửi
- ▶️ **Demo tự động** — Tự động phát giao dịch mẫu mỗi 2.5 giây
- 📊 **Live feed** — Xem kết quả real-time: quỹ được phân loại, có lố không
- ⚠️ **Overflow alert** — Khi giao dịch kích hoạt cơ chế 3 Lố sẽ hiện cảnh báo

## Flow hoạt động

```
VietBank Digital (mock-bank/index.html)
    ↓ POST /api/webhook/bank-transaction
    ↓ Header: x-webhook-secret: mock-bank-secret-2024
ZUNO Backend (localhost:5000)
    ↓ SmartCategorizer (3-layer: MCC → Rule Engine → Gemini AI)
    ↓ createTransaction()
    ↓ checkFoodOverspending() → OverflowEngine
ZUNO Database (PostgreSQL)
```

## Config

Webhook secret mặc định: `mock-bank-secret-2024` (set trong `backend/.env`)

Để đổi secret, sửa cả:
1. `backend/.env` → `MOCK_BANK_WEBHOOK_SECRET=your-new-secret`
2. `mock-bank/index.html` → `CONFIG.webhookSecret = 'your-new-secret'`
