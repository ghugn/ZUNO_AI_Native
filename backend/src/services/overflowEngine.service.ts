import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import { createNotification } from './notification.service.js';

// ────────────────────────────────────────────────────────────
//  Overflow Engine — "Cơ chế 3 Lố"
//  Xử lý chi tiêu lố quỹ ăn uống theo 3 cấp độ tăng dần.
// ────────────────────────────────────────────────────────────

export interface OverflowResult {
  /** Tổng số tiền tiêu lố ban đầu */
  totalOverspent: bigint;
  /** Cấp độ lố cao nhất đã kích hoạt */
  highestLevel: 'level_1' | 'level_2' | 'level_3';
  /** Chi tiết từng bước xử lý */
  actions: OverflowAction[];
}

export interface OverflowAction {
  level: 'level_1' | 'level_2' | 'level_3';
  amount: bigint;
  source: string;      // e.g. 'budgetSub_remaining_days', 'weekly_savings', 'experience', 'growth', 'future'
  description: string;
}

/**
 * Xử lý chi tiêu lố cho quỹ ăn uống.
 *
 * Quy trình 3 cấp:
 *   Level 1 — Cắt tiền ăn phụ các ngày còn lại trong tháng
 *   Level 2 — Mượn từ tích lũy tuần → quỹ Trải nghiệm → quỹ Phát triển
 *   Level 3 — Rút quỹ Tương lai + phạt gamification
 *
 * @returns null nếu không tiêu lố, hoặc OverflowResult mô tả xử lý.
 */
export async function handleOverspending(params: {
  userId: string;
  transactionId: string;
  /** Ngày giao dịch (ISO string, e.g. '2026-05-23') */
  transactionDate: string;
  /** Tháng (dạng YYYY-MM-01) */
  month: string;
  /** Số tiền tiêu lố (luôn dương) */
  overspentAmount: bigint;
}): Promise<OverflowResult> {
  const { userId, transactionId, transactionDate, month, overspentAmount } = params;

  // Lấy residenceType của user để áp dụng logic phạt tương ứng
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  const residenceType = profile?.residenceType || 'dorm';

  if (residenceType === 'rent' || residenceType === 'professional') {
    // rent và professional quản lý lố theo tuần.
    // Trong tuần các ngày khác vẫn giữ nguyên, cuối tuần mới tổng hợp lại chia đều cho các tuần còn lại.
    return {
      totalOverspent: overspentAmount,
      highestLevel: 'level_1',
      actions: [],
    };
  }

  let remaining = overspentAmount;
  const actions: OverflowAction[] = [];
  let highestLevel: OverflowResult['highestLevel'] = 'level_1';
  const eventDate = transactionDate;

  // ── LEVEL 1: Cắt giảm tiền ăn phụ các ngày còn lại ──────
  remaining = await processLevel1(userId, transactionId, eventDate, month, remaining, actions);

  // ── LEVEL 2: Mượn từ tích lũy tuần / quỹ Trải nghiệm / Phát triển ──
  if (remaining > BigInt(0)) {
    highestLevel = 'level_2';
    remaining = await processLevel2(userId, transactionId, eventDate, month, remaining, actions);
  }

  // ── LEVEL 3: Rút quỹ Tương lai + phạt gamification ───────
  if (remaining > BigInt(0)) {
    highestLevel = 'level_3';
    remaining = await processLevel3(userId, transactionId, eventDate, month, remaining, actions);
  }

  // Generate a notification for the overflow event
  let title = '⚠️ Cảnh báo lố ngân sách!';
  let body = `Bạn đã tiêu lố ${overspentAmount.toLocaleString('vi-VN')}đ. Cơ chế bảo vệ (Level 1) đã được kích hoạt.`;
  if (highestLevel === 'level_2') {
    title = '🚨 Cảnh báo lố ngân sách (Level 2)';
    body = `Bạn đã tiêu lố ${overspentAmount.toLocaleString('vi-VN')}đ. Hệ thống đã phải mượn từ quỹ Giải trí/Phát triển để bù đắp.`;
  } else if (highestLevel === 'level_3') {
    title = '💥 Vi phạm nghiêm trọng (Level 3)';
    body = `Bạn đã tiêu lố ${overspentAmount.toLocaleString('vi-VN')}đ. Hệ thống buộc phải rút tiền từ quỹ Tương lai.`;
  }

  await createNotification({
    userId,
    type: 'overflow',
    title,
    body,
    actionHref: '/budgets',
  });

  return {
    totalOverspent: overspentAmount,
    highestLevel,
    actions,
  };
}

// ════════════════════════════════════════════════════════════
//  LEVEL 1 — Cắt giảm tiền ăn phụ các ngày còn lại
// ════════════════════════════════════════════════════════════

async function processLevel1(
  userId: string,
  transactionId: string,
  eventDate: string,
  month: string,
  overspent: bigint,
  actions: OverflowAction[],
): Promise<bigint> {
  const today = new Date(eventDate);

  // Lấy các ngày SAU ngày hiện tại trong tháng
  const monthStart = new Date(month);
  const monthEnd = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0));

  const tomorrow = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1));

  if (tomorrow > monthEnd) {
    // Không còn ngày nào trong tháng → không thể áp dụng Level 1
    return overspent;
  }

  const futureDays = await prisma.dailyFoodSavings.findMany({
    where: {
      userId,
      date: { gte: tomorrow, lte: monthEnd },
    },
    orderBy: { date: 'asc' },
  });

  if (futureDays.length === 0) return overspent;

  // Tính tổng budgetSub khả dụng của các ngày còn lại
  // (Capped tại 0 để không lạm chi vào tiền ăn chính của ngày khác)
  const totalAvailableSub = futureDays.reduce(
    (sum, day) => {
      const avail = day.budgetSub - day.penaltyAppliedFromYesterday;
      return sum + (avail > BigInt(0) ? avail : BigInt(0));
    },
    BigInt(0),
  );

  if (totalAvailableSub <= BigInt(0)) return overspent;

  // Số tiền có thể xử lý ở Level 1
  const canHandle = overspent <= totalAvailableSub ? overspent : totalAvailableSub;

  // Phân bổ penalty đều cho các ngày còn lại (equal share) và xử lý dư
  const distribution: { dayId: string; amount: string }[] = [];
  const daysCount = futureDays.length;
  if (daysCount === 0) return overspent;

  // Tính share và remainder
  const share = canHandle / BigInt(daysCount);
  let remainder = canHandle % BigInt(daysCount);
  let toDistribute = canHandle;

  for (let i = 0; i < daysCount && toDistribute > BigInt(0); i++) {
    const day = futureDays[i];
    const avail = day.budgetSub - day.penaltyAppliedFromYesterday;
    if (avail <= BigInt(0)) continue;

    // Amount to deduct for this day: base share + 1 if we still have remainder
    let deduct = share + (remainder > BigInt(0) ? BigInt(1) : BigInt(0));
    // Ensure we don't exceed available budget for the day
    if (deduct > avail) {
      // Use what we can and push the excess back to remainder pool
      const excess = deduct - avail;
      deduct = avail;
      remainder += excess; // add excess to remainder for later days
    }

    // Apply deduction
    await prisma.dailyFoodSavings.update({
      where: { id: day.id },
      data: {
        penaltyAppliedFromYesterday: {
          increment: deduct,
        },
      },
    });
    distribution.push({ dayId: day.id, amount: deduct.toString() });
    toDistribute -= deduct;
    if (remainder > BigInt(0)) remainder -= BigInt(1);
  }

  const daysAffected = distribution.length;
  const averagePenalty = daysAffected > 0 ? canHandle / BigInt(daysAffected) : BigInt(0);

  actions.push({
    level: 'level_1',
    amount: canHandle,
    source: 'budgetSub_remaining_days',
    description: `Cắt giảm trung bình ${averagePenalty} VND/ngày tiền ăn phụ cho ${daysAffected} ngày còn lại`,
  });

  // Ghi sự kiện overflow
  await prisma.overflowEvent.create({
    data: {
      userId,
      transactionId,
      eventDate: new Date(eventDate),
      overflowLevel: 'level_1',
      overflowAmount: canHandle,
      sourceFundType: 'food',
      borrowedFromFundType: null,
      status: 'pending',
      penaltyApplied: {
        distribution,
      },
    },
  });

  return overspent - canHandle;
}

// ════════════════════════════════════════════════════════════
//  LEVEL 2 — Mượn từ tích lũy tuần → Trải nghiệm → Phát triển
// ════════════════════════════════════════════════════════════

async function processLevel2(
  userId: string,
  transactionId: string,
  eventDate: string,
  month: string,
  overspent: bigint,
  actions: OverflowAction[],
): Promise<bigint> {
  let remaining = overspent;

  // ── Bước A: Mượn quỹ Trải nghiệm (experience) ─────────
  remaining = await borrowFromFund(userId, transactionId, eventDate, month, 'experience', remaining, actions);
  if (remaining <= BigInt(0)) return BigInt(0);

  // ── Bước B: Mượn quỹ Phát triển (growth) ───────────────
  remaining = await borrowFromFund(userId, transactionId, eventDate, month, 'growth', remaining, actions);

  return remaining;
}

/**
 * Trừ từ tích lũy tuần hiện tại (weekly_rewards.accumulatedSavings)
 */
async function borrowFromWeeklySavings(
  userId: string,
  transactionId: string,
  eventDate: string,
  overspent: bigint,
  actions: OverflowAction[],
): Promise<bigint> {
  const eventDateObj = new Date(eventDate);

  // Tìm weekly reward hiện tại chứa ngày giao dịch
  const weeklyReward = await prisma.weeklyReward.findFirst({
    where: {
      userId,
      weekStart: { lte: eventDateObj },
      weekEnd: { gte: eventDateObj },
    },
  });

  if (!weeklyReward || weeklyReward.accumulatedSavings <= BigInt(0)) {
    return overspent;
  }

  const canTake = weeklyReward.accumulatedSavings < overspent
    ? weeklyReward.accumulatedSavings
    : overspent;

  await prisma.weeklyReward.update({
    where: { id: weeklyReward.id },
    data: {
      accumulatedSavings: { decrement: canTake },
    },
  });

  actions.push({
    level: 'level_2',
    amount: canTake,
    source: 'weekly_savings',
    description: `Trừ ${canTake} VND từ tích lũy tuần hiện tại`,
  });

  // Ghi sự kiện overflow
  await prisma.overflowEvent.create({
    data: {
      userId,
      transactionId,
      eventDate: new Date(eventDate),
      overflowLevel: 'level_2',
      overflowAmount: canTake,
      sourceFundType: 'food',
      borrowedFromFundType: null,
      status: 'repaid',
      penaltyApplied: { source: 'weekly_savings' },
    },
  });

  return overspent - canTake;
}

/**
 * Mượn từ một quỹ cụ thể (experience hoặc growth)
 */
async function borrowFromFund(
  userId: string,
  transactionId: string,
  eventDate: string,
  month: string,
  fundType: 'experience' | 'growth',
  overspent: bigint,
  actions: OverflowAction[],
): Promise<bigint> {
  // Tìm quỹ tương ứng trong tháng
  const fund = await prisma.fund.findFirst({
    where: {
      userId,
      month: new Date(month),
      fundType,
    },
  });

  if (!fund) return overspent;

  // Tính số dư khả dụng = allocatedAmount + borrowAmount - spentAmount
  // borrowAmount là tiền đã mượn từ quỹ khác về (dương), nên cộng vào
  // Nhưng ở đây quỹ đang bị mượn ĐI → ta chỉ tính remaining = allocated - spent
  const balance = fund.allocatedAmount - fund.spentAmount;
  if (balance <= BigInt(0)) return overspent;

  const canBorrow = balance < overspent ? balance : overspent;

  // Cập nhật quỹ bị mượn: tăng spentAmount
  await prisma.fund.update({
    where: { id: fund.id },
    data: {
      spentAmount: { increment: canBorrow },
      version: { increment: 1 },
    },
  });

  // Cập nhật quỹ food: tăng borrowAmount (tiền mượn về)
  const foodFund = await prisma.fund.findFirst({
    where: {
      userId,
      month: new Date(month),
      fundType: 'food',
    },
  });

  if (foodFund) {
    await prisma.fund.update({
      where: { id: foodFund.id },
      data: {
        borrowAmount: { increment: canBorrow },
        version: { increment: 1 },
      },
    });
  }

  const fundLabel = fundType === 'experience' ? 'Trải nghiệm' : 'Phát triển';
  actions.push({
    level: 'level_2',
    amount: canBorrow,
    source: fundType,
    description: `Mượn ${canBorrow} VND từ quỹ ${fundLabel}`,
  });

  // Ghi sự kiện overflow
  await prisma.overflowEvent.create({
    data: {
      userId,
      transactionId,
      eventDate: new Date(eventDate),
      overflowLevel: 'level_2',
      overflowAmount: canBorrow,
      sourceFundType: 'food',
      borrowedFromFundType: fundType,
      status: 'pending',
      penaltyApplied: Prisma.DbNull,
    },
  });

  return overspent - canBorrow;
}

// ════════════════════════════════════════════════════════════
//  LEVEL 3 — Rút quỹ Tương lai + phạt gamification
// ════════════════════════════════════════════════════════════

async function processLevel3(
  userId: string,
  transactionId: string,
  eventDate: string,
  month: string,
  overspent: bigint,
  actions: OverflowAction[],
): Promise<bigint> {
  let remaining = overspent;

  // ── A) Rút quỹ Tương lai (future / savings) ──────────────────────
  const futureFund = await prisma.fund.findFirst({
    where: {
      userId,
      month: new Date(month),
      fundType: 'future',
    },
  });

  let borrowedFromFuture = BigInt(0);

  if (futureFund) {
    const futureBalance = futureFund.allocatedAmount - futureFund.spentAmount;

    if (futureBalance > BigInt(0)) {
      borrowedFromFuture = futureBalance < remaining ? futureBalance : remaining;

      // Cập nhật quỹ tương lai
      await prisma.fund.update({
        where: { id: futureFund.id },
        data: {
          spentAmount: { increment: borrowedFromFuture },
          isLocked: false, // Buộc mở khóa để ghi nhận rút
          version: { increment: 1 },
        },
      });

      // Cập nhật quỹ food borrowAmount
      const foodFund = await prisma.fund.findFirst({
        where: {
          userId,
          month: new Date(month),
          fundType: 'food',
        },
      });

      if (foodFund) {
        await prisma.fund.update({
          where: { id: foodFund.id },
          data: {
            borrowAmount: { increment: borrowedFromFuture },
            version: { increment: 1 },
          },
        });
      }

      remaining -= borrowedFromFuture;
    }
  }

  // ── B) Trừ tích lũy tuần hiện tại (weekly_savings) làm fallback cuối cùng ──
  if (remaining > BigInt(0)) {
    remaining = await borrowFromWeeklySavings(userId, transactionId, eventDate, remaining, actions);
  }

  // ── Phạt Gamification ──────────────────────────────────

  // B) Giảm hệ số nhân điểm thưởng (tối thiểu 0.10)
  const rewardPoints = await prisma.rewardPoints.upsert({
    where: { userId },
    create: { userId, total: 0, multiplier: 1.00 },
    update: {},
  });

  const currentMultiplier = Number(rewardPoints.multiplier);
  const newMultiplier = Math.max(0.10, currentMultiplier - 0.10);

  await prisma.rewardPoints.update({
    where: { userId },
    data: { multiplier: newMultiplier },
  });

  // ── Ghi action & overflow event ─────────────────────────
  const penaltyInfo = {
    lockWeeklyChest: true,
    multiplierDeduction: 0.10,
    previousMultiplier: currentMultiplier,
    newMultiplier,
    borrowedAmount: borrowedFromFuture.toString(),
  };

  if (borrowedFromFuture > BigInt(0)) {
    actions.push({
      level: 'level_3',
      amount: borrowedFromFuture,
      source: 'future',
      description: `Rút ${borrowedFromFuture} VND từ quỹ Tương lai (Savings). Khóa rương tuần. Hệ số nhân giảm từ ${currentMultiplier} → ${newMultiplier}`,
    });
  }

  await prisma.overflowEvent.create({
    data: {
      userId,
      transactionId,
      eventDate: new Date(eventDate),
      overflowLevel: 'level_3',
      overflowAmount: overspent,
      sourceFundType: 'food',
      borrowedFromFundType: 'future',
      status: 'pending',
      penaltyApplied: penaltyInfo,
    },
  });

  return remaining;
}

// ════════════════════════════════════════════════════════════
//  REVERSAL — Đảo ngược sự kiện lố khi xóa giao dịch
// ════════════════════════════════════════════════════════════

/** Type cho bản ghi OverflowEvent đọc từ DB */
type OverflowEventRow = Awaited<ReturnType<typeof prisma.overflowEvent.findMany>>[number];

/**
 * Đảo ngược toàn bộ hiệu ứng của sự kiện lố gắn với một giao dịch.
 * Được gọi khi xóa giao dịch để đảm bảo nhất quán dữ liệu.
 *
 * Hoạt động:
 *   1. Tìm tất cả OverflowEvent liên kết với transactionId
 *   2. Hoàn trả lại các tác động theo từng cấp độ
 *   3. Xóa các bản ghi OverflowEvent
 */
export async function reverseOverflowForTransaction(transactionId: string): Promise<void> {
  const overflowEvents = await prisma.overflowEvent.findMany({
    where: { transactionId },
  });

  if (overflowEvents.length === 0) return;

  for (const event of overflowEvents) {
    if (event.overflowLevel === 'level_1') {
      await reverseLevel1Event(event);
    } else if (event.overflowLevel === 'level_2') {
      await reverseLevel2Event(event);
    } else if (event.overflowLevel === 'level_3') {
      await reverseLevel3Event(event);
    }
  }

  // Xóa tất cả overflow events của giao dịch này
  await prisma.overflowEvent.deleteMany({ where: { transactionId } });
}

// ── Đảo ngược Level 1: Hoàn trả penalty tiền ăn phụ ──────────

async function reverseLevel1Event(event: OverflowEventRow): Promise<void> {
  const penalty = event.penaltyApplied as any;
  if (!penalty) return;

  if (penalty.distribution) {
    for (const item of penalty.distribution) {
      await prisma.dailyFoodSavings.update({
        where: { id: item.dayId },
        data: {
          penaltyAppliedFromYesterday: { decrement: BigInt(item.amount) },
        },
      });
    }
    return;
  }

  // Fallback cho dữ liệu cũ (chia đều)
  if (!penalty.penaltyPerDay || !penalty.daysAffected) return;

  const penaltyPerDay = BigInt(penalty.penaltyPerDay as string);
  const daysAffected = penalty.daysAffected as number;

  const eventDate = new Date(event.eventDate);
  const tomorrow = new Date(Date.UTC(eventDate.getUTCFullYear(), eventDate.getUTCMonth(), eventDate.getUTCDate() + 1));
  const monthEnd = new Date(Date.UTC(eventDate.getUTCFullYear(), eventDate.getUTCMonth() + 1, 0));

  const futureDays = await prisma.dailyFoodSavings.findMany({
    where: {
      userId: event.userId,
      date: { gte: tomorrow, lte: monthEnd },
    },
    orderBy: { date: 'asc' },
  });

  const totalPenalty = event.overflowAmount;
  const remainder = totalPenalty - penaltyPerDay * BigInt(daysAffected);
  const count = Math.min(futureDays.length, daysAffected);

  for (let i = 0; i < count; i++) {
    let toRemove = penaltyPerDay;
    if (i === count - 1) {
      toRemove += remainder;
    }
    await prisma.dailyFoodSavings.update({
      where: { id: futureDays[i].id },
      data: {
        penaltyAppliedFromYesterday: { decrement: toRemove },
      },
    });
  }
}

// ── Đảo ngược Level 2: Hoàn trả tích lũy tuần / quỹ mượn ────

async function reverseLevel2Event(event: OverflowEventRow): Promise<void> {
  const penalty = event.penaltyApplied as Record<string, unknown> | null;

  if (penalty && penalty.source === 'weekly_savings') {
    // Hoàn trả tích lũy tuần
    const eventDate = new Date(event.eventDate);
    const weeklyReward = await prisma.weeklyReward.findFirst({
      where: {
        userId: event.userId,
        weekStart: { lte: eventDate },
        weekEnd: { gte: eventDate },
      },
    });

    if (weeklyReward) {
      await prisma.weeklyReward.update({
        where: { id: weeklyReward.id },
        data: {
          accumulatedSavings: { increment: event.overflowAmount },
        },
      });
    }
  } else if (event.borrowedFromFundType) {
    // Hoàn trả quỹ đã mượn (experience / growth)
    const eventDate = new Date(event.eventDate);
    const monthStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-01`;

    // Giảm spentAmount của quỹ bị mượn
    const borrowedFund = await prisma.fund.findFirst({
      where: {
        userId: event.userId,
        month: new Date(monthStr),
        fundType: event.borrowedFromFundType,
      },
    });

    if (borrowedFund) {
      await prisma.fund.update({
        where: { id: borrowedFund.id },
        data: {
          spentAmount: { decrement: event.overflowAmount },
          version: { increment: 1 },
        },
      });
    }

    // Giảm borrowAmount của quỹ food
    const foodFund = await prisma.fund.findFirst({
      where: {
        userId: event.userId,
        month: new Date(monthStr),
        fundType: 'food',
      },
    });

    if (foodFund) {
      await prisma.fund.update({
        where: { id: foodFund.id },
        data: {
          borrowAmount: { decrement: event.overflowAmount },
          version: { increment: 1 },
        },
      });
    }
  }
}

// ── Đảo ngược Level 3: Hoàn trả quỹ tương lai + multiplier ───

async function reverseLevel3Event(event: OverflowEventRow): Promise<void> {
  const penalty = event.penaltyApplied as Record<string, unknown> | null;
  if (!penalty) return;

  const eventDate = new Date(event.eventDate);
  const monthStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-01`;

  // A) Hoàn trả quỹ Tương lai
  if (event.borrowedFromFundType === 'future') {
    // Ưu tiên dùng borrowedAmount đã lưu, fallback dùng overflowAmount (dữ liệu cũ)
    const borrowedAmount = penalty.borrowedAmount
      ? BigInt(penalty.borrowedAmount as string)
      : event.overflowAmount;

    if (borrowedAmount > BigInt(0)) {
      const futureFund = await prisma.fund.findFirst({
        where: {
          userId: event.userId,
          month: new Date(monthStr),
          fundType: 'future',
        },
      });

      if (futureFund) {
        await prisma.fund.update({
          where: { id: futureFund.id },
          data: {
            spentAmount: { decrement: borrowedAmount },
            version: { increment: 1 },
          },
        });
      }

      // Giảm borrowAmount của quỹ food
      const foodFund = await prisma.fund.findFirst({
        where: {
          userId: event.userId,
          month: new Date(monthStr),
          fundType: 'food',
        },
      });

      if (foodFund) {
        await prisma.fund.update({
          where: { id: foodFund.id },
          data: {
            borrowAmount: { decrement: borrowedAmount },
            version: { increment: 1 },
          },
        });
      }
    }
  }

  // B) Hoàn trả hệ số nhân điểm thưởng về giá trị trước đó (bằng cách cộng lại 0.10, tối đa 1.00)
  const rewardPoints = await prisma.rewardPoints.findUnique({
    where: { userId: event.userId },
  });
  if (rewardPoints) {
    const currentMultiplier = Number(rewardPoints.multiplier);
    const newMultiplier = Math.min(1.00, currentMultiplier + 0.10);
    await prisma.rewardPoints.update({
      where: { userId: event.userId },
      data: { multiplier: newMultiplier },
    });
  }
}

/**
 * Tổng hợp số tiền tiêu lố của tuần vừa qua và chia đều cho các tuần còn lại trong tháng.
 * Chỉ áp dụng cho người dùng Rent (thuê nhà) và Professional (đi làm) quản lý theo tuần.
 * 
 * @param userId ID người dùng
 * @param date Ngày Thứ 2 hiện tại bắt đầu tuần mới (được chạy khi daily drip chạy)
 */
export async function aggregateAndRedistributeWeeklyOverflow(
  userId: string,
  date: Date,
): Promise<void> {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!profile || (profile.residenceType !== 'rent' && profile.residenceType !== 'professional')) {
    return;
  }

  // 1. Xác định tuần vừa kết thúc (Thứ 2 -> Chủ nhật tuần trước)
  const prevWeekStart = new Date(date);
  prevWeekStart.setUTCDate(date.getUTCDate() - 7); // Thứ 2 tuần trước
  const prevWeekEnd = new Date(date);
  prevWeekEnd.setUTCDate(date.getUTCDate() - 1); // Chủ nhật tuần trước

  // 2. Tính tổng overspent của tuần vừa kết thúc
  const pastDays = await prisma.dailyFoodSavings.findMany({
    where: {
      userId,
      date: { gte: prevWeekStart, lte: prevWeekEnd },
    },
  });

  const totalWeeklyOverflow = pastDays.reduce((sum, day) => sum + day.dailyOverflow, BigInt(0));
  if (totalWeeklyOverflow <= BigInt(0)) {
    return; // Không lố
  }

  // 3. Tìm các tuần còn lại của tháng
  const year = prevWeekStart.getUTCFullYear();
  const month = prevWeekStart.getUTCMonth();
  const monthEnd = new Date(Date.UTC(year, month + 1, 0));
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;

  const futureWeeks = await prisma.weeklyReward.findMany({
    where: {
      userId,
      weekStart: { gte: date, lte: monthEnd },
    },
    orderBy: { weekStart: 'asc' },
  });

  const k = futureWeeks.length;
  if (k === 0) {
    // Không còn tuần nào trong tháng -> Khấu trừ trực tiếp vào các quỹ tự do (Level 2 & 3)
    const actions: OverflowAction[] = [];
    const transactionId = `weekly_overflow_${prevWeekStart.toISOString().slice(0, 10)}`;
    const eventDateStr = prevWeekEnd.toISOString().slice(0, 10);
    let remaining = totalWeeklyOverflow;
    remaining = await processLevel2(userId, transactionId, eventDateStr, monthStr, remaining, actions);
    if (remaining > BigInt(0)) {
      await processLevel3(userId, transactionId, eventDateStr, monthStr, remaining, actions);
    }
    return;
  }

  // Lấy danh sách tất cả các ngày trong các tuần tương lai
  const allFutureDays: any[] = [];
  for (const fw of futureWeeks) {
    const fwDays = await prisma.dailyFoodSavings.findMany({
      where: {
        userId,
        date: { gte: fw.weekStart, lte: fw.weekEnd },
      },
      orderBy: { date: 'asc' },
    });
    allFutureDays.push(...fwDays);
  }

  // Tính tổng snack budget khả dụng của tất cả các ngày trong các tuần tương lai
  const totalAvailableSub = allFutureDays.reduce(
    (sum, day) => {
      const avail = day.budgetSub - day.penaltyAppliedFromYesterday;
      return sum + (avail > BigInt(0) ? avail : BigInt(0));
    },
    BigInt(0),
  );

  const canHandle = totalWeeklyOverflow <= totalAvailableSub ? totalWeeklyOverflow : totalAvailableSub;
  const excessPenalty = totalWeeklyOverflow - canHandle;

  // 4. Chia đều canHandle cho các tuần còn lại
  if (canHandle > BigInt(0)) {
    let remainingPenalty = canHandle;
    const baseWeeklyPenalty = canHandle / BigInt(k);
    let remainderWeekly = canHandle % BigInt(k);

    const distribution: { weekId: string; amount: string }[] = [];

    for (let i = 0; i < k && remainingPenalty > BigInt(0); i++) {
      const fw = futureWeeks[i];
      let weekPenalty = baseWeeklyPenalty + (remainderWeekly > BigInt(0) ? BigInt(1) : BigInt(0));
      if (remainderWeekly > BigInt(0)) remainderWeekly -= BigInt(1);

      if (weekPenalty > remainingPenalty) {
        weekPenalty = remainingPenalty;
      }

      // Lọc các ngày của tuần này còn snack budget
      const fwDays = allFutureDays.filter(d => d.date >= fw.weekStart && d.date <= fw.weekEnd);
      const activeDays = fwDays.filter(d => BigInt(d.budgetSub) - BigInt(d.penaltyAppliedFromYesterday) > BigInt(0));
      const numDays = activeDays.length;

      if (numDays > 0) {
        const baseDailyPenalty = weekPenalty / BigInt(numDays);
        let remainderDaily = weekPenalty % BigInt(numDays);
        let weekRemaining = weekPenalty;

        for (let j = 0; j < numDays && weekRemaining > BigInt(0); j++) {
          const day = activeDays[j];
          const avail = BigInt(day.budgetSub) - BigInt(day.penaltyAppliedFromYesterday);

          let deduct = baseDailyPenalty + (remainderDaily > BigInt(0) ? BigInt(1) : BigInt(0));
          if (remainderDaily > BigInt(0)) remainderDaily -= BigInt(1);

          if (deduct > avail) {
            const excess = deduct - avail;
            deduct = avail;
            remainderDaily += excess;
          }

          if (deduct > weekRemaining) {
            deduct = weekRemaining;
          }

          // Áp dụng phạt tăng penaltyAppliedFromYesterday
          await prisma.dailyFoodSavings.update({
            where: { id: day.id },
            data: {
              penaltyAppliedFromYesterday: {
                increment: deduct,
              },
            },
          });

          weekRemaining -= deduct;
        }
      }

      distribution.push({ weekId: fw.id, amount: weekPenalty.toString() });
      remainingPenalty -= weekPenalty;
    }

    // Ghi sự kiện overflow tổng hợp của tuần để lưu lịch sử
    await prisma.overflowEvent.create({
      data: {
        userId,
        transactionId: `weekly_overflow_${prevWeekStart.toISOString().slice(0, 10)}`,
        eventDate: new Date(prevWeekEnd),
        overflowLevel: 'level_1',
        overflowAmount: canHandle,
        sourceFundType: 'food',
        borrowedFromFundType: null,
        status: 'repaid',
        penaltyApplied: {
          type: 'weekly_aggregation',
          distribution,
        },
      },
    });
  }

  // 5. Nếu còn dư tiền lố (excessPenalty) mà Snacks không hấp thụ hết -> Trừ vào Experience / Development (Level 2) và Savings / Future (Level 3)
  if (excessPenalty > BigInt(0)) {
    const actions: OverflowAction[] = [];
    const transactionId = `weekly_overflow_excess_${prevWeekStart.toISOString().slice(0, 10)}`;
    const eventDateStr = prevWeekEnd.toISOString().slice(0, 10);
    let remaining = excessPenalty;

    remaining = await processLevel2(userId, transactionId, eventDateStr, monthStr, remaining, actions);
    if (remaining > BigInt(0)) {
      await processLevel3(userId, transactionId, eventDateStr, monthStr, remaining, actions);
    }
  }

  console.log(`[OverflowEngine] Đã tổng hợp lố tuần cho user ${userId}: ${totalWeeklyOverflow} VND. Phân bổ snack: ${canHandle} VND, Khấu trừ quỹ tự do/tiết kiệm: ${excessPenalty} VND.`);
}

