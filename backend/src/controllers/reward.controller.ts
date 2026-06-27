import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import * as rewardService from '../services/reward.service.js';
import { serializeBigInt } from '../lib/serialize.js';

// ── Weekly Rewards ─────────────────────────────────────────

export async function getWeeklyReward(req: AuthRequest, res: Response) {
  try {
    const weekStart = req.query.weekStart as string;
    if (!weekStart) {
      res.status(400).json({ error: 'weekStart query param required' });
      return;
    }

    // Đồng bộ rương tuần trước khi trả dữ liệu (auto-create nếu chưa có)
    const syncResult = await rewardService.syncWeeklyReward(req.userId!, weekStart);

    // Lấy bản ghi đã cập nhật để trả về đầy đủ fields
    const reward = await rewardService.getWeeklyReward(req.userId!, weekStart);
    if (!reward) {
      res.status(404).json({ error: 'Weekly reward not found' });
      return;
    }

    res.json(serializeBigInt({
      ...reward,
      syncDetails: syncResult.details,
    }));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getWeeklyRewardsByMonth(req: AuthRequest, res: Response) {
  try {
    const month = req.query.month as string;
    if (!month) {
      res.status(400).json({ error: 'month query param required' });
      return;
    }
    const rewards = await rewardService.getWeeklyRewardsByMonth(req.userId!, month);
    res.json(serializeBigInt(rewards));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createWeeklyReward(req: AuthRequest, res: Response) {
  try {
    const { weekStart, weekEnd } = req.body;
    if (!weekStart || !weekEnd) {
      res.status(400).json({ error: 'weekStart, weekEnd required' });
      return;
    }
    const reward = await rewardService.createWeeklyReward({
      userId: req.userId!, weekStart, weekEnd,
    });
    res.status(201).json(serializeBigInt(reward));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateWeeklyReward(req: AuthRequest, res: Response) {
  try {
    const reward = await rewardService.updateWeeklyReward(req.params.id as string, req.body);
    res.json(serializeBigInt(reward));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * Mở khóa rương tuần và nhận điểm thưởng.
 * POST /api/rewards/weekly/:id/claim
 *
 * Kiểm tra an toàn:
 * - Rương phải thuộc về user hiện tại
 * - Rương chưa được mở trước đó
 * Khi mở: đồng bộ rương → cộng điểm → đánh dấu unlocked
 */
export async function claimWeeklyReward(req: AuthRequest, res: Response) {
  try {
    const result = await rewardService.claimWeeklyReward(
      req.params.id as string,
      req.userId!,
    );

    res.json(serializeBigInt({
      message: 'Mở rương thành công!',
      reward: result.reward,
      pointsAwarded: result.pointsAwarded,
      newTotalPoints: result.newTotalPoints,
    }));
  } catch (err: any) {
    // Phân biệt lỗi nghiệp vụ (400) vs lỗi hệ thống (500)
    const isBusinessError = [
      'Rương tuần không tồn tại',
      'Không có quyền truy cập rương này',
      'Rương đã được mở trước đó',
      'Rương bị khóa do tiêu lố Cấp 3',
    ].some(msg => err.message?.includes(msg));

    res.status(isBusinessError ? 400 : 500).json({ error: err.message });
  }
}

// ── Reward Points ──────────────────────────────────────────

export async function getPoints(req: AuthRequest, res: Response) {
  try {
    const points = await rewardService.getRewardPoints(req.userId!);
    const streak = await rewardService.getTransactionStreak(req.userId!);
    res.json(serializeBigInt({
      ...points,
      streak,
    }));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function addPoints(req: AuthRequest, res: Response) {
  try {
    const { points } = req.body;
    if (!points) {
      res.status(400).json({ error: 'points required' });
      return;
    }
    const result = await rewardService.addPoints(req.userId!, points);
    res.json(serializeBigInt(result));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateMultiplier(req: AuthRequest, res: Response) {
  try {
    const { multiplier } = req.body;
    if (multiplier === undefined) {
      res.status(400).json({ error: 'multiplier required' });
      return;
    }
    const result = await rewardService.updateMultiplier(req.userId!, multiplier);
    res.json(serializeBigInt(result));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

