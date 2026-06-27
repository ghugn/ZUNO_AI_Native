import prisma from '../lib/prisma.js';

// ════════════════════════════════════════════════════════════
//  DRIP ENGINE — Nhỏ giọt hàng ngày & Kết chuyển cuối tháng
// ════════════════════════════════════════════════════════════

// ── 1. Daily Drip: Nhỏ giọt quỹ Tương lai ─────────────────

export interface DripResult {
  userId: string;
  fundId: string;
  snapshotDate: Date;
  allocatedAmount: bigint;
  spentAmount: bigint;
  borrowAmount: bigint;
  remainingAmount: bigint;
  baseDrip: bigint;
  actualDrip: bigint;
  dayOfMonth: number;
  daysInMonth: number;
}

/**
 * Tính toán và tạo bản ghi FundSnapshot cho quỹ Tương lai (future)
 * của một user tại một ngày cụ thể.
 *
 * Logic nhỏ giọt:
 * - Số tiền nhỏ giọt cơ bản đến ngày N = (allocatedAmount / daysInMonth) × N
 * - Trừ đi lượng tiền đã bị rút do lố Cấp 3 (spentAmount + borrowAmount)
 * - dailyDripAmount = max(0, baseDrip - spentAmount - borrowAmount)
 * - remainingAmount = allocatedAmount - spentAmount
 */
export async function runDailyDripForUser(
  userId: string,
  date: Date,
): Promise<DripResult | null> {
  // Nếu là Thứ 2 (UTC day = 1), chạy tổng hợp lố tuần cho Rent & Professional
  if (date.getUTCDay() === 1) {
    try {
      const { aggregateAndRedistributeWeeklyOverflow } = await import('./overflowEngine.service.js');
      await aggregateAndRedistributeWeeklyOverflow(userId, date);
    } catch (overflowErr) {
      console.error(`[DripEngine] Lỗi tổng hợp lố tuần cho user ${userId}:`, overflowErr);
    }
  }

  // Xác định tháng chứa ngày này (dùng UTC để khớp DB)
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const dayOfMonth = date.getUTCDate();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const monthDate = new Date(Date.UTC(year, month, 1));

  // Tìm quỹ future của user trong tháng này
  const futureFund = await prisma.fund.findFirst({
    where: {
      userId,
      month: monthDate,
      fundType: 'future',
    },
  });

  if (!futureFund) {
    // User chưa khởi tạo quỹ cho tháng này → bỏ qua
    return null;
  }

  // Tính toán nhỏ giọt
  const allocated = futureFund.allocatedAmount;
  const spent = futureFund.spentAmount;
  const borrow = futureFund.borrowAmount;
  const remaining = allocated - spent;

  // Nhỏ giọt cơ bản tích lũy đến ngày N
  const baseDrip = (allocated * BigInt(dayOfMonth)) / BigInt(daysInMonth);

  // Nhỏ giọt thực tế sau khi trừ phạt lố Cấp 3
  let actualDrip = baseDrip - spent - borrow;
  if (actualDrip < BigInt(0)) actualDrip = BigInt(0);

  // Tạo hoặc cập nhật FundSnapshot cho ngày này
  const snapshotDate = new Date(Date.UTC(year, month, dayOfMonth));

  // Kiểm tra xem đã có snapshot cho ngày này chưa
  const existingSnapshot = await prisma.fundSnapshot.findFirst({
    where: {
      fundId: futureFund.id,
      snapshotDate,
    },
  });

  if (existingSnapshot) {
    // Cập nhật snapshot đã tồn tại
    await prisma.fundSnapshot.update({
      where: { id: existingSnapshot.id },
      data: {
        remainingAmount: remaining,
        dailyDripAmount: actualDrip,
      },
    });
  } else {
    // Tạo snapshot mới
    await prisma.fundSnapshot.create({
      data: {
        fundId: futureFund.id,
        snapshotDate,
        remainingAmount: remaining,
        dailyDripAmount: actualDrip,
      },
    });
  }

  return {
    userId,
    fundId: futureFund.id,
    snapshotDate,
    allocatedAmount: allocated,
    spentAmount: spent,
    borrowAmount: borrow,
    remainingAmount: remaining,
    baseDrip,
    actualDrip,
    dayOfMonth,
    daysInMonth,
  };
}

/**
 * Quét toàn bộ users đang active và chạy nhỏ giọt cho ngày chỉ định.
 */
export async function runDailyDripForAllUsers(
  date: Date,
): Promise<{ processed: number; skipped: number }> {
  const activeUsers = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  let processed = 0;
  let skipped = 0;

  for (const user of activeUsers) {
    const result = await runDailyDripForUser(user.id, date);
    if (result) {
      processed++;
    } else {
      skipped++;
    }
  }

  return { processed, skipped };
}

// ── 2. Monthly Rollover: Kết chuyển tiền thừa cuối tháng ──

export interface RolloverResult {
  userId: string;
  month: string;
  fundLeftovers: { fundType: string; leftover: bigint }[];
  totalLeftover: bigint;
  futureFundNewAllocated: bigint;
  transferTransactions: number;
}

/**
 * Kết chuyển tiền thừa cuối tháng từ các quỹ ngắn hạn vào quỹ Tương lai.
 *
 * Logic:
 * 1. Với mỗi quỹ ngắn hạn (living, food, experience, growth):
 *    - leftover = allocatedAmount - spentAmount - borrowAmount
 *    - Nếu leftover > 0 → chuyển vào quỹ future
 * 2. Cộng totalLeftover vào allocatedAmount của quỹ future
 * 3. Tạo giao dịch transfer để ghi nhận kế toán
 * 4. Cập nhật snapshot cuối tháng
 */
export async function processMonthlyRollover(
  userId: string,
  monthStr: string,
): Promise<RolloverResult> {
  const monthDate = new Date(monthStr);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

  // Lấy tất cả quỹ của user trong tháng
  const funds = await prisma.fund.findMany({
    where: { userId, month: monthDate },
  });

  const futureFund = funds.find((f) => f.fundType === 'future');
  if (!futureFund) {
    throw new Error('Quỹ Tương lai không tồn tại cho tháng này');
  }

  const shortTermFunds = funds.filter((f) => f.fundType !== 'future');

  const fundLeftovers: { fundType: string; leftover: bigint }[] = [];
  let totalLeftover = BigInt(0);
  let transferCount = 0;

  // Xử lý kết chuyển trong một transaction để đảm bảo tính nguyên tử
  await prisma.$transaction(async (tx) => {
    for (const fund of shortTermFunds) {
      const leftover = fund.allocatedAmount - fund.spentAmount - fund.borrowAmount;

      fundLeftovers.push({
        fundType: fund.fundType,
        leftover: leftover > BigInt(0) ? leftover : BigInt(0),
      });

      if (leftover > BigInt(0)) {
        totalLeftover += leftover;

        // Tăng spentAmount của quỹ ngắn hạn → cân bằng về 0
        await tx.fund.update({
          where: { id: fund.id },
          data: {
            spentAmount: { increment: leftover },
            version: { increment: 1 },
          },
        });

        // Tạo giao dịch transfer ghi nhận kế toán
        await tx.transaction.create({
          data: {
            userId,
            fundId: fund.id,
            amount: leftover,
            transactionType: 'transfer',
            category: 'rollover',
            description: `Kết chuyển tiền thừa cuối tháng từ quỹ ${fund.fundType} sang quỹ Tương lai`,
            transactionDate: new Date(year, month, lastDayOfMonth),
          },
        });

        transferCount++;
      }
    }

    // Cộng totalLeftover vào quỹ future
    if (totalLeftover > BigInt(0)) {
      await tx.fund.update({
        where: { id: futureFund.id },
        data: {
          allocatedAmount: { increment: totalLeftover },
          version: { increment: 1 },
        },
      });

      // Giao dịch nhận tiền vào quỹ future
      await tx.transaction.create({
        data: {
          userId,
          fundId: futureFund.id,
          amount: totalLeftover,
          transactionType: 'income',
          category: 'rollover',
          description: `Nhận kết chuyển tiền thừa cuối tháng (${transferCount} quỹ)`,
          transactionDate: new Date(year, month, lastDayOfMonth),
        },
      });
    }
  });

  // Cập nhật snapshot ngày cuối tháng cho quỹ future (với allocated mới)
  if (totalLeftover > BigInt(0)) {
    await runDailyDripForUser(userId, new Date(year, month, lastDayOfMonth));
  }

  // Lấy lại thông tin quỹ future đã cập nhật
  const updatedFutureFund = await prisma.fund.findUnique({
    where: { id: futureFund.id },
  });

  return {
    userId,
    month: monthStr,
    fundLeftovers,
    totalLeftover,
    futureFundNewAllocated: updatedFutureFund?.allocatedAmount ?? futureFund.allocatedAmount,
    transferTransactions: transferCount,
  };
}

// ── 3. Scheduler Helper ────────────────────────────────────

/**
 * Hàm khởi chạy scheduler nhỏ giọt hàng ngày.
 * Được gọi từ app.ts khi server khởi động.
 *
 * Cơ chế: Tính toán thời gian còn lại đến nửa đêm tiếp theo,
 * đợi đến đó rồi chạy drip, sau đó lặp lại mỗi 24h.
 */
export function startDailyDripScheduler(): void {
  const now = new Date();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 0, 0,
  );
  const msUntilMidnight = nextMidnight.getTime() - now.getTime();

  console.log(
    `[DripScheduler] Khởi động. Lần chạy tiếp theo lúc ${nextMidnight.toISOString()} (sau ${Math.round(msUntilMidnight / 1000 / 60)} phút)`,
  );

  // Đợi đến nửa đêm, rồi chạy lần đầu + lặp mỗi 24h
  setTimeout(() => {
    runDripJob();
    setInterval(runDripJob, 24 * 60 * 60 * 1000); // 24 giờ
  }, msUntilMidnight);
}

async function runDripJob(): Promise<void> {
  const today = new Date();
  console.log(`[DripScheduler] Đang chạy nhỏ giọt cho ngày ${today.toISOString().slice(0, 10)}...`);

  try {
    const result = await runDailyDripForAllUsers(today);
    console.log(
      `[DripScheduler] Hoàn tất: ${result.processed} user đã nhỏ giọt, ${result.skipped} user bỏ qua.`,
    );
  } catch (err) {
    console.error('[DripScheduler] Lỗi khi chạy nhỏ giọt:', err);
  }
}
