import type { Request, Response } from 'express';
import { runDailyDripForAllUsers, processMonthlyRollover } from '../services/dripEngine.service.js';
import prisma from '../lib/prisma.js';
import { serializeBigInt } from '../lib/serialize.js';

// ════════════════════════════════════════════════════════════
//  CRON CONTROLLER — Endpoint cho Cloud Scheduler gọi vào
// ════════════════════════════════════════════════════════════

/**
 * POST /api/cron/daily-drip
 *
 * Chạy nhỏ giọt quỹ Tương lai cho toàn bộ users active.
 * Được thiết kế để Cloud Cron (AWS EventBridge, Cron-job.org…) gọi
 * đúng 1 lần mỗi ngày vào lúc 00:00 UTC+7.
 *
 * Body (tùy chọn):
 *   { "date": "2026-05-24" }  — chỉ định ngày cụ thể (dùng để test)
 *   Nếu không truyền → tự lấy ngày hiện tại.
 */
export async function dailyDrip(req: Request, res: Response) {
  try {
    const dateStr = req.body?.date as string | undefined;
    const date = dateStr ? new Date(dateStr) : new Date();

    console.log(`[Cron] Nhận lệnh nhỏ giọt cho ngày ${date.toISOString().slice(0, 10)}`);

    const result = await runDailyDripForAllUsers(date);

    console.log(
      `[Cron] Hoàn tất nhỏ giọt: ${result.processed} user xử lý, ${result.skipped} user bỏ qua.`,
    );

    res.json({
      success: true,
      date: date.toISOString().slice(0, 10),
      ...result,
    });
  } catch (err: any) {
    console.error('[Cron] Lỗi khi chạy nhỏ giọt:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /api/cron/monthly-rollover
 *
 * Chạy kết chuyển tiền thừa cuối tháng cho toàn bộ users active.
 * Nên được cài đặt chạy vào ngày cuối cùng của tháng (hoặc ngày 1 tháng sau).
 *
 * Body (tùy chọn):
 *   { "month": "2026-05-01" }  — chỉ định tháng cụ thể
 *   Nếu không truyền → tự lấy tháng hiện tại.
 */
export async function monthlyRollover(req: Request, res: Response) {
  try {
    const monthStr = req.body?.month as string | undefined;
    const now = new Date();
    const month = monthStr || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    console.log(`[Cron] Nhận lệnh kết chuyển tháng ${month}`);

    // Lấy danh sách users active
    const activeUsers = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    let processed = 0;
    let skipped = 0;
    const errors: { userId: string; error: string }[] = [];

    for (const user of activeUsers) {
      try {
        await processMonthlyRollover(user.id, month);
        processed++;
      } catch (err: any) {
        // Nếu user chưa có quỹ tháng → bỏ qua
        if (err.message?.includes('Quỹ Tương lai không tồn tại')) {
          skipped++;
        } else {
          errors.push({ userId: user.id, error: err.message });
        }
      }
    }

    console.log(
      `[Cron] Hoàn tất kết chuyển tháng ${month}: ${processed} user xử lý, ${skipped} user bỏ qua, ${errors.length} lỗi.`,
    );

    res.json(serializeBigInt({
      success: true,
      month,
      processed,
      skipped,
      errors,
    }));
  } catch (err: any) {
    console.error('[Cron] Lỗi khi chạy kết chuyển:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/cron/status
 *
 * Kiểm tra trạng thái scheduler — dùng để monitoring.
 */
export async function cronStatus(_req: Request, res: Response) {
  const schedulerMode = process.env.CRON_SECRET
    ? 'external (Cloud Cron)'
    : 'internal (setInterval — development only)';

  res.json({
    status: 'ok',
    schedulerMode,
    serverTime: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    note: schedulerMode.includes('internal')
      ? '⚠️ Đang dùng scheduler nội bộ. Không phù hợp cho production multi-instance.'
      : '✅ Sẵn sàng nhận lệnh từ Cloud Cron bên ngoài.',
  });
}
