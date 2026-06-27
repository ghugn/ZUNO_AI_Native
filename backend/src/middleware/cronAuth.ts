import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware bảo vệ các API endpoint dành riêng cho Cron Job.
 *
 * Xác thực request bằng header `X-Cron-Secret` so với biến môi trường `CRON_SECRET`.
 * Trong môi trường production, dịch vụ Cloud Cron bên ngoài (AWS EventBridge,
 * Cron-job.org, GitHub Actions…) sẽ gửi kèm header này khi gọi API.
 *
 * Nếu `CRON_SECRET` chưa được cấu hình (dev mode) → cho phép truy cập tự do.
 */
export function cronAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const cronSecret = process.env.CRON_SECRET;

  // Nếu chưa cấu hình CRON_SECRET (dev mode) → bỏ qua xác thực
  if (!cronSecret) {
    next();
    return;
  }

  const headerSecret = req.headers['x-cron-secret'] as string | undefined;

  if (!headerSecret || headerSecret !== cronSecret) {
    res.status(401).json({
      error: 'Unauthorized — X-Cron-Secret header không hợp lệ',
    });
    return;
  }

  next();
}
