import prisma from '../lib/prisma.js';

// ── Milestone thresholds & point rewards ───────────────────
const MILESTONES = [
  { threshold: BigInt(150_000), label: '150k', points: 200 },
  { threshold: BigInt(100_000), label: '100k', points: 100 },
  { threshold: BigInt(50_000), label: '50k', points: 50 },
] as const;

// ── Weekly Rewards ─────────────────────────────────────────

export async function getWeeklyReward(userId: string, weekStart: string) {
  return prisma.weeklyReward.findFirst({
    where: { userId, weekStart: new Date(weekStart) },
  });
}

export async function getWeeklyRewardsByMonth(userId: string, month: string) {
  const start = new Date(month);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);

  const rewards = await prisma.weeklyReward.findMany({
    where: {
      userId,
      weekStart: { gte: start, lte: end },
    },
    orderBy: { weekStart: 'asc' },
  });

  // Đồng bộ từng rương tuần trước khi trả về để số liệu luôn mới nhất
  const syncedRewards = [];
  for (const reward of rewards) {
    const weekStartStr = reward.weekStart.toISOString().slice(0, 10);
    const syncResult = await syncWeeklyReward(userId, weekStartStr);

    // Lấy lại bản ghi đã cập nhật từ DB
    const updated = await prisma.weeklyReward.findUnique({
      where: { id: reward.id },
    });

    syncedRewards.push({
      ...updated,
      syncDetails: syncResult.details,
    });
  }

  return syncedRewards;
}

export async function createWeeklyReward(data: {
  userId: string;
  weekStart: string;
  weekEnd: string;
}) {
  return prisma.weeklyReward.create({
    data: {
      userId: data.userId,
      weekStart: new Date(data.weekStart),
      weekEnd: new Date(data.weekEnd),
    },
  });
}

export async function updateWeeklyReward(rewardId: string, data: {
  accumulatedSavings?: number;
  milestoneReached?: string;
  isUnlocked?: boolean;
  pointsEarned?: number;
}) {
  const updateData: Record<string, unknown> = {};
  if (data.accumulatedSavings !== undefined) updateData.accumulatedSavings = BigInt(data.accumulatedSavings);
  if (data.milestoneReached !== undefined) updateData.milestoneReached = data.milestoneReached;
  if (data.isUnlocked !== undefined) {
    updateData.isUnlocked = data.isUnlocked;
    if (data.isUnlocked) updateData.unlockedAt = new Date();
  }
  if (data.pointsEarned !== undefined) updateData.pointsEarned = data.pointsEarned;

  return prisma.weeklyReward.update({
    where: { id: rewardId },
    data: updateData,
  });
}

// ════════════════════════════════════════════════════════════
//  createWeeklyRewardsForMonth — Tự động tạo rương tuần cho cả tháng
// ════════════════════════════════════════════════════════════

/**
 * Tạo tự động 4-5 bản ghi WeeklyReward tương ứng với các tuần (Thứ 2 → CN)
 * nằm trong tháng chỉ định. Được gọi từ createMonthlyFunds.
 *
 * Logic tính tuần:
 * - Tuần bắt đầu từ Thứ 2 (Monday) và kết thúc Chủ nhật (Sunday).
 * - Tuần đầu tiên: Thứ 2 gần nhất ≤ ngày 1 của tháng.
 * - Tuần cuối cùng: chứa ngày cuối cùng của tháng.
 * - weekStart/weekEnd được giữ nguyên theo tuần thực tế (có thể vượt ra
 *   ngoài tháng), nhưng chỉ tạo cho các tuần có ít nhất 1 ngày rơi vào tháng.
 */
export async function createWeeklyRewardsForMonth(
  userId: string,
  month: string,
): Promise<{ weeksCreated: number }> {
  const monthDate = new Date(month);
  const year = monthDate.getUTCFullYear();
  const m = monthDate.getUTCMonth();

  const firstDayOfMonth = new Date(Date.UTC(year, m, 1));
  const lastDayOfMonth = new Date(Date.UTC(year, m + 1, 0));

  // Tìm Thứ 2 gần nhất ≤ ngày 1 tháng
  // getUTCDay(): 0=CN, 1=T2, ..., 6=T7
  const firstDow = firstDayOfMonth.getUTCDay();
  const offsetToMonday = firstDow === 0 ? 6 : firstDow - 1; // số ngày lùi về T2
  const firstMonday = new Date(Date.UTC(year, m, 1 - offsetToMonday));

  const weeks: { weekStart: Date; weekEnd: Date }[] = [];
  let currentMonday = new Date(firstMonday);

  while (currentMonday <= lastDayOfMonth) {
    const weekEnd = new Date(currentMonday);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6); // Chủ nhật

    weeks.push({
      weekStart: new Date(currentMonday),
      weekEnd: new Date(weekEnd),
    });

    // Chuyển sang thứ 2 tuần tiếp theo
    currentMonday.setUTCDate(currentMonday.getUTCDate() + 7);
  }

  // Tạo bản ghi, kiểm tra trước khi insert vì prisma schema chưa có unique constraint
  let weeksCreated = 0;
  for (const w of weeks) {
    const existing = await prisma.weeklyReward.findFirst({
      where: { userId, weekStart: w.weekStart },
    });
    if (!existing) {
      await prisma.weeklyReward.create({
        data: {
          userId,
          weekStart: w.weekStart,
          weekEnd: w.weekEnd,
        }
      });
      weeksCreated++;
    }
  }

  return { weeksCreated };
}

// ════════════════════════════════════════════════════════════
//  syncWeeklyReward — Đồng bộ số dư rương tuần theo thời gian thực
// ════════════════════════════════════════════════════════════

export interface SyncResult {
  accumulatedSavings: bigint;
  milestoneReached: string;
  pointsEarned: number;
  isUnlocked: boolean;
  details: {
    totalDailySaved: bigint;
    totalBorrowedFromChest: bigint;
    daysWithData: number;
  };
}

/**
 * Đồng bộ hóa rương tích lũy tuần:
 * 1. Tìm hoặc tạo mới bản ghi WeeklyReward cho tuần chỉ định.
 * 2. Quét DailyFoodSavings trong tuần → tính tổng tiền ăn dư (savedAmount).
 * 3. Trừ đi số tiền đã bị mượn do tiêu lố Cấp 2 (weekly_savings).
 * 4. Tính toán mốc (milestone) và điểm thưởng dự kiến.
 * 5. Lưu kết quả vào DB.
 *
 * Lưu ý: Nếu rương đã được mở (isUnlocked = true), chỉ đồng bộ
 * accumulatedSavings mà không ghi đè milestone/points (đã chốt).
 */
export async function syncWeeklyReward(userId: string, weekStartStr: string): Promise<SyncResult> {
  const weekStartDate = new Date(weekStartStr);

  // ── Bước 1: Tìm hoặc tạo bản ghi rương tuần ────────────
  let reward = await prisma.weeklyReward.findFirst({
    where: { userId, weekStart: weekStartDate },
  });

  if (!reward) {
    // Tự động tạo rương tuần mới (weekEnd = weekStart + 6 ngày)
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    reward = await prisma.weeklyReward.create({
      data: {
        userId,
        weekStart: weekStartDate,
        weekEnd: weekEndDate,
      },
    });
  }

  // ── Bước 2: Tính tổng tiền ăn tiết kiệm trong tuần ─────
  const dailyRecords = await prisma.dailyFoodSavings.findMany({
    where: {
      userId,
      date: { gte: reward.weekStart, lte: reward.weekEnd },
    },
  });

  const totalDailySaved = dailyRecords.reduce(
    (sum, day) => sum + day.savedAmount,
    BigInt(0),
  );

  // ── Bước 3: Trừ đi số tiền đã bị mượn do Lố Cấp 2 ─────
  // Tìm các OverflowEvent level_2 có source = 'weekly_savings'
  // xảy ra trong khoảng thời gian của tuần này
  const overflowEvents = await prisma.overflowEvent.findMany({
    where: {
      userId,
      overflowLevel: 'level_2',
      eventDate: { gte: reward.weekStart, lte: reward.weekEnd },
    },
  });

  // Lọc chỉ lấy các event có penaltyApplied.source === 'weekly_savings'
  const totalBorrowedFromChest = overflowEvents
    .filter((evt) => {
      const penalty = evt.penaltyApplied as Record<string, unknown> | null;
      return penalty && penalty.source === 'weekly_savings';
    })
    .reduce((sum, evt) => sum + evt.overflowAmount, BigInt(0));

  // ── Bước 4: Tính số dư thực tế ──────────────────────────
  let currentSavings = totalDailySaved - totalBorrowedFromChest;
  if (currentSavings < BigInt(0)) currentSavings = BigInt(0);

  // ── Bước 5: Tính mốc và điểm thưởng ─────────────────────
  let milestoneReached = 'none';
  let pointsEarned = 0;

  for (const m of MILESTONES) {
    if (currentSavings >= m.threshold) {
      milestoneReached = m.label;
      pointsEarned = m.points;
      break;
    }
  }

  // ── Bước 6: Lưu kết quả vào DB ──────────────────────────
  // Nếu rương đã mở, không ghi đè milestone/points (đã chốt khi claim)
  if (reward.isUnlocked) {
    await prisma.weeklyReward.update({
      where: { id: reward.id },
      data: { accumulatedSavings: currentSavings },
    });
  } else {
    await prisma.weeklyReward.update({
      where: { id: reward.id },
      data: {
        accumulatedSavings: currentSavings,
        milestoneReached,
        pointsEarned,
      },
    });
  }

  return {
    accumulatedSavings: currentSavings,
    milestoneReached: reward.isUnlocked ? reward.milestoneReached : milestoneReached,
    pointsEarned: reward.isUnlocked ? reward.pointsEarned : pointsEarned,
    isUnlocked: reward.isUnlocked,
    details: {
      totalDailySaved,
      totalBorrowedFromChest,
      daysWithData: dailyRecords.length,
    },
  };
}

// ════════════════════════════════════════════════════════════
//  claimWeeklyReward — Mở khóa rương tuần & cộng điểm thưởng
// ════════════════════════════════════════════════════════════

export interface ClaimResult {
  reward: Awaited<ReturnType<typeof prisma.weeklyReward.update>>;
  pointsAwarded: number;
  newTotalPoints: number;
}

/**
 * Mở khóa rương tuần và cộng điểm thưởng cho người dùng.
 *
 * Các kiểm tra an toàn:
 * - Rương phải tồn tại và thuộc về userId hiện tại.
 * - Rương chưa được mở trước đó (tránh duplicate points).
 *
 * Khi mở:
 * - Đồng bộ dữ liệu rương lần cuối (syncWeeklyReward).
 * - Cộng điểm thưởng (đã nhân multiplier) vào RewardPoints.
 * - Đánh dấu rương đã mở (isUnlocked = true, unlockedAt = now).
 */
export async function claimWeeklyReward(rewardId: string, userId: string): Promise<ClaimResult> {
  // ── Kiểm tra bản ghi rương ──────────────────────────────
  const reward = await prisma.weeklyReward.findUnique({
    where: { id: rewardId },
  });

  if (!reward) {
    throw new Error('Rương tuần không tồn tại');
  }
  if (reward.userId !== userId) {
    throw new Error('Không có quyền truy cập rương này');
  }
  if (reward.isUnlocked) {
    throw new Error('Rương đã được mở trước đó. Không thể nhận thưởng lần nữa.');
  }

  // ── Kiểm tra Lố Cấp 3 trong tuần → khóa rương ──────────
  const level3Event = await prisma.overflowEvent.findFirst({
    where: {
      userId,
      overflowLevel: 'level_3',
      eventDate: { gte: reward.weekStart, lte: reward.weekEnd },
    },
  });
  if (level3Event) {
    throw new Error('Rương bị khóa do tiêu lố Cấp 3 trong tuần này. Không thể nhận thưởng.');
  }

  // ── Đồng bộ dữ liệu rương lần cuối trước khi chốt ─────
  const weekStartStr = reward.weekStart.toISOString().slice(0, 10);
  const syncResult = await syncWeeklyReward(userId, weekStartStr);

  // ── Cộng điểm thưởng ────────────────────────────────────
  let pointsAwarded = 0;
  let newTotalPoints = 0;

  if (syncResult.pointsEarned > 0) {
    const updatedPoints = await addPoints(userId, syncResult.pointsEarned);
    pointsAwarded = Math.round(syncResult.pointsEarned * Number((await getRewardPoints(userId)).multiplier));
    newTotalPoints = updatedPoints.total;
  } else {
    const currentPoints = await getRewardPoints(userId);
    newTotalPoints = currentPoints.total;
  }

  // ── Cập nhật trạng thái rương ───────────────────────────
  const updatedReward = await prisma.weeklyReward.update({
    where: { id: rewardId },
    data: {
      isUnlocked: true,
      unlockedAt: new Date(),
      accumulatedSavings: syncResult.accumulatedSavings,
      milestoneReached: syncResult.milestoneReached,
      pointsEarned: syncResult.pointsEarned,
    },
  });

  return {
    reward: updatedReward,
    pointsAwarded,
    newTotalPoints,
  };
}

// ── Reward Points ──────────────────────────────────────────

export async function getRewardPoints(userId: string) {
  // Upsert: if not exists, create with defaults
  return prisma.rewardPoints.upsert({
    where: { userId },
    create: { userId, total: 0, multiplier: 1.00 },
    update: {},
  });
}

export async function addPoints(userId: string, points: number) {
  // Get current multiplier
  const current = await getRewardPoints(userId);
  const effectivePoints = Math.round(points * Number(current.multiplier));

  return prisma.rewardPoints.update({
    where: { userId },
    data: { total: { increment: effectivePoints } },
  });
}

export async function updateMultiplier(userId: string, multiplier: number) {
  return prisma.rewardPoints.update({
    where: { userId },
    data: { multiplier },
  });
}

export async function getTransactionStreak(userId: string): Promise<number> {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    select: { transactionDate: true },
    orderBy: { transactionDate: 'desc' },
  });

  if (transactions.length === 0) {
    return 0;
  }

  // Get unique dates in YYYY-MM-DD format (timezone local to server date/UTC string)
  const uniqueDates = new Set<string>();
  for (const tx of transactions) {
    uniqueDates.add(tx.transactionDate.toISOString().slice(0, 10));
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterdayStr = yesterdayObj.toISOString().slice(0, 10);

  const hasToday = uniqueDates.has(todayStr);
  const hasYesterday = uniqueDates.has(yesterdayStr);

  if (!hasToday && !hasYesterday) {
    return 0;
  }

  let streak = 0;
  let currentDate = hasToday ? new Date() : yesterdayObj;

  while (true) {
    const dateStr = currentDate.toISOString().slice(0, 10);
    if (uniqueDates.has(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
