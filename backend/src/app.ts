import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import fundRoutes from './routes/fund.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import tagRoutes from './routes/tag.routes.js';
import dailyFoodRoutes from './routes/dailyFood.routes.js';
import rewardRoutes from './routes/reward.routes.js';
import overflowRoutes from './routes/overflow.routes.js';
import aiParseLogRoutes from './routes/aiParseLog.routes.js';
import aiMicroInsightRoutes from './routes/aiMicroInsight.routes.js';
import smartHubRoutes from './routes/smartHub.routes.js';
import cronRoutes from './routes/cron.routes.js';
import receiptRoutes from './routes/receiptScan.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import alertRoutes from './routes/alert.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { startDailyDripScheduler } from './services/dripEngine.service.js';

const app = express();

// ── Middleware ──────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://zunov1.vercel.app',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) return callback(null, true);
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-webhook-secret'],
}));
app.use(express.json());

// Serve Static UI for Testing
app.use('/test-ui', express.static(path.join(process.cwd(), 'public')));

// ── Health check ───────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/funds', fundRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/daily-food', dailyFoodRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/overflows', overflowRoutes);
app.use('/api/ai-logs', aiParseLogRoutes);
app.use('/api/ai-micro-insights', aiMicroInsightRoutes);
app.use('/api/smart-hub', smartHubRoutes);
app.use('/api/cron', cronRoutes);
app.use('/api/receipt', receiptRoutes);
app.use('/api/webhook', webhookRoutes);  // Mock Core Banking → ZUNO
app.use('/api/analytics', analyticsRoutes);
app.use('/api/alerts', alertRoutes);     // Pre-Spending Alert (Req 3)
app.use('/api/notifications', notificationRoutes);
app.use('/api/wallet', walletRoutes);

// ── Error handler (must be last) ───────────────────────────
app.use(errorHandler);

// ── Scheduler: Nhỏ giọt quỹ Tương lai hàng ngày ──────────
// Chế độ hoạt động:
//   - DEV (không có CRON_SECRET):  Chạy scheduler nội bộ (setInterval)
//   - PRODUCTION (có CRON_SECRET): Tắt scheduler nội bộ, dùng Cloud Cron
//     gọi vào POST /api/cron/daily-drip với header X-Cron-Secret
if (!process.env.CRON_SECRET) {
  console.log('[Scheduler] DEV MODE — Khởi động scheduler nội bộ (setInterval)');
  startDailyDripScheduler();
} else {
  console.log('[Scheduler] PRODUCTION MODE — Scheduler nội bộ TẮT. Chờ lệnh từ Cloud Cron tại POST /api/cron/daily-drip');
}

export default app;
