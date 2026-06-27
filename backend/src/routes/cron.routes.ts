import { Router } from 'express';
import * as cronController from '../controllers/cron.controller.js';
import { cronAuthMiddleware } from '../middleware/cronAuth.js';

const router = Router();

// Tất cả cron routes đều yêu cầu X-Cron-Secret header (trừ dev mode)
router.use(cronAuthMiddleware);

// ── Cron Endpoints ─────────────────────────────────────────
// Các endpoint này được thiết kế để Cloud Scheduler gọi vào.
// Trong dev mode (chưa có CRON_SECRET), có thể gọi trực tiếp.
//
// Hướng dẫn cấu hình Cloud Cron (khi deploy):
//   1. Tạo biến môi trường CRON_SECRET trên server production.
//   2. Cấu hình Cloud Scheduler (AWS EventBridge / Cron-job.org):
//      - Daily Drip:      POST https://your-api.com/api/cron/daily-drip
//                         Cron: 0 17 * * * (= 00:00 UTC+7)
//                         Header: X-Cron-Secret: <giá trị CRON_SECRET>
//
//      - Monthly Rollover: POST https://your-api.com/api/cron/monthly-rollover
//                          Cron: 0 18 L * * (ngày cuối tháng, 01:00 UTC+7)
//                          Header: X-Cron-Secret: <giá trị CRON_SECRET>

router.post('/daily-drip', cronController.dailyDrip);
router.post('/monthly-rollover', cronController.monthlyRollover);
router.get('/status', cronController.cronStatus);

export default router;
