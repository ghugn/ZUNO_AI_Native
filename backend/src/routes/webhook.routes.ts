// ════════════════════════════════════════════════════════════
//  WEBHOOK ROUTES — Nhận giao dịch từ Mock Core Banking
// ════════════════════════════════════════════════════════════

import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { categorizeTransaction } from '../services/smartCategorizer.service.js';
import { createTransaction } from '../services/transaction.service.js';
import { serializeBigInt } from '../lib/serialize.js';
import { createMonthlyFunds, clearUserDemoData } from '../services/fund.service.js';

const router = Router();

/**
 * Xác thực nguồn gọi từ Mock Bank bằng webhook secret
 */
function validateWebhookSecret(req: Request): boolean {
  const secret = req.headers['x-webhook-secret'];
  const expected = process.env.MOCK_BANK_WEBHOOK_SECRET || 'mock-bank-secret-2024';
  return secret === expected;
}

// ── POST /api/webhook/bank-init ───────────────────────
// Khởi tạo số dư ngân hàng 1 lần duy nhất
router.post('/bank-init', async (req: Request, res: Response) => {
  try {
    if (!validateWebhookSecret(req)) {
      res.status(403).json({ error: 'Invalid webhook secret' });
      return;
    }

    const { userId, balance } = req.body;
    if (!userId || balance === undefined) {
      res.status(400).json({ error: 'Missing userId or balance' });
      return;
    }

    const amount = BigInt(balance);
    if (amount <= BigInt(0)) {
      res.status(400).json({ error: 'Balance must be positive' });
      return;
    }

    // Kiểm tra xem UserProfile đã có bankBalance chưa
    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      res.status(404).json({ error: 'UserProfile not found' });
      return;
    }

    if (profile.bankBalance > BigInt(0)) {
      res.status(400).json({ error: 'Tài khoản này đã được khởi tạo số dư. Vui lòng tạo giao dịch (transaction) để thay đổi số dư!' });
      return;
    }

    // Cập nhật bankBalance
    await prisma.userProfile.update({
      where: { userId },
      data: { bankBalance: amount }
    });

    // Tạo 5 quỹ (Funds) với tỷ lệ 0% (allocatedAmount = 0) cho tháng hiện tại
    const month = new Date().toISOString().slice(0, 7) + '-01';
    
    // Tự tạo bằng prisma.fund.createMany để đảm bảo 0đ (không dùng createMonthlyFunds vì hàm đó tự lấy % từ template)
    const fundTypes = ['food', 'living', 'growth', 'experience', 'future'];
    const fundsData = fundTypes.map(type => ({
      userId,
      month: new Date(month),
      fundType: type,
      allocatedAmount: BigInt(0),
      spentAmount: BigInt(0),
      borrowAmount: BigInt(0),
      isLocked: false,
    }));

    await prisma.fund.createMany({
      data: fundsData,
    });

    // Tạo luôn daily food savings (0đ)
    const daysInMonth = new Date(new Date(month).getFullYear(), new Date(month).getMonth() + 1, 0).getDate();
    const dailyFoodRecords = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(new Date(month).getFullYear(), new Date(month).getMonth(), day);
      dailyFoodRecords.push({
        userId,
        date,
        budgetMain: BigInt(0),
        budgetSub: BigInt(0),
        spentMain: BigInt(0),
        spentSub: BigInt(0),
        savedAmount: BigInt(0),
        dailyOverflow: BigInt(0),
        penaltyAppliedFromYesterday: BigInt(0),
      });
    }
    await prisma.dailyFoodSavings.createMany({
      data: dailyFoodRecords,
    });

    res.json(serializeBigInt({
      message: 'Khởi tạo số dư ngân hàng và 5 quỹ (0%) thành công',
      bankBalance: amount,
    }));
  } catch (err: any) {
    console.error('Webhook /bank-init Error:', err);
    res.status(500).json({ error: 'Lỗi server khi khởi tạo số dư ngân hàng' });
  }
});

// ── POST /api/webhook/bank-transaction ───────────────────────
// Payload từ Mock Bank:
// {
//   userId: string,           // ZUNO user ID (hoặc email để lookup)
//   merchantName: string,
//   amount: number,           // VND
//   transactionDate?: string, // ISO date string (optional, default: now)
//   description?: string,
//   bankCategory?: string,    // Core Banking MCC category (optional)
//   bankTransactionId?: string // ID giao dịch từ ngân hàng (idempotency)
// }
router.post('/bank-transaction', async (req: Request, res: Response) => {
  try {
    // Xác thực webhook secret
    if (!validateWebhookSecret(req)) {
      res.status(403).json({ error: 'Invalid webhook secret' });
      return;
    }

    const {
      userId,
      userEmail,
      merchantName,
      amount,
      transactionDate,
      description,
      bankCategory,
      bankTransactionId,
    } = req.body;

    // Validate required fields
    if ((!userId && !userEmail) || !merchantName || !amount) {
      res.status(400).json({
        error: 'Missing required fields: (userId or userEmail), merchantName, amount',
      });
      return;
    }

    if (amount <= 0) {
      res.status(400).json({ error: 'amount must be positive' });
      return;
    }

    // Lookup user by ID or email
    let user;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { email: userEmail },
        include: { profile: true },
      });
    }

    if (!user || !user.isActive) {
      res.status(404).json({ error: 'User not found or inactive' });
      return;
    }

    if (!user.profile) {
      res.status(422).json({ error: 'User has not completed onboarding (no profile)' });
      return;
    }

    // Idempotency check: tránh duplicate nếu webhook bị gọi 2 lần
    if (bankTransactionId) {
      const existing = await prisma.transaction.findFirst({
        where: { description: { contains: `bankTxId:${bankTransactionId}` } },
      });
      if (existing) {
        res.json({
          status: 'duplicate',
          message: 'Transaction already processed',
          transactionId: existing.id,
        });
        return;
      }
    }

    // ── Smart Categorization ─────────────────────────────────
    const categorization = await categorizeTransaction({
      merchantName,
      description,
      amount: Number(amount),
      bankCategory,
    });

    // ── Tìm quỹ phù hợp trong tháng hiện tại ────────────────
    const txDate = transactionDate ? new Date(transactionDate) : new Date();
    const monthStart = new Date(Date.UTC(txDate.getFullYear(), txDate.getMonth(), 1));
    const monthStr = monthStart.toISOString().slice(0, 10);

    // Tìm hoặc tạo funds cho tháng nếu chưa có
    let targetFund = await prisma.fund.findFirst({
      where: {
        userId: user.id,
        month: monthStart,
        fundType: categorization.fundType,
      },
    });

    if (!targetFund) {
      // Tự động tạo funds cho tháng nếu chưa có
      try {
        await createMonthlyFunds(
          user.id,
          monthStr,
          user.profile.bankBalance,
          user.profile.residenceType,
        );
        targetFund = await prisma.fund.findFirst({
          where: {
            userId: user.id,
            month: monthStart,
            fundType: categorization.fundType,
          },
        });
      } catch (fundErr: any) {
        // Có thể fund đã được tạo bởi request concurrent
        if (!fundErr.message?.includes('already exist')) {
          throw fundErr;
        }
        targetFund = await prisma.fund.findFirst({
          where: {
            userId: user.id,
            month: monthStart,
            fundType: categorization.fundType,
          },
        });
      }
    }

    if (!targetFund) {
      res.status(500).json({ error: 'Could not find or create fund for this month' });
      return;
    }

    // ── Tạo giao dịch trong ZUNO ─────────────────────────────
    const descriptionWithMeta = [
      description || merchantName,
      bankTransactionId ? `[bankTxId:${bankTransactionId}]` : '',
      `[via:mock-bank]`,
    ].filter(Boolean).join(' ');

    const { transaction, overflow } = await createTransaction({
      userId: user.id,
      fundId: targetFund.id,
      amount: Number(amount),
      transactionType: 'expense',
      category: categorization.category,
      description: descriptionWithMeta,
      inputMethod: 'ai_text', // đánh dấu từ ngân hàng tự động
      aiConfidence: categorization.confidence,
      mealType: categorization.mealType ?? undefined,
      transactionDate: txDate.toISOString(),
    });

    // ── Response ─────────────────────────────────────────────
    res.status(201).json({
      status: 'success',
      transaction: serializeBigInt(transaction),
      categorization: {
        fundType: categorization.fundType,
        category: categorization.category,
        method: categorization.method,
        confidence: categorization.confidence,
        requiresReview: categorization.requiresReview,
        mealType: categorization.mealType,
      },
      overflow: overflow
        ? {
            triggered: true,
            highestLevel: overflow.highestLevel,
            totalOverspent: overflow.totalOverspent.toString(),
          }
        : { triggered: false },
    });
  } catch (err: any) {
    console.error('[Webhook] Error processing bank transaction:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ── POST /api/webhook/preview-transaction ────────────────────
router.post('/preview-transaction', async (req: Request, res: Response) => {
  try {
    if (!validateWebhookSecret(req)) {
      res.status(403).json({ error: 'Invalid webhook secret' });
      return;
    }

    const {
      userId,
      userEmail,
      merchantName,
      amount,
      transactionDate,
      bankCategory,
      description,
    } = req.body;

    if ((!userId && !userEmail) || !merchantName || !amount) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    let user;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { email: userEmail },
        include: { profile: true },
      });
    }

    if (!user || !user.profile) {
      res.status(404).json({ error: 'User or profile not found' });
      return;
    }

    // Phân loại tự động để biết quỹ nào sẽ nhận
    const categorization = await categorizeTransaction({
      merchantName,
      description,
      amount: Number(amount),
      bankCategory,
    });

    if (categorization.fundType === 'food') {
      const txDate = transactionDate ? new Date(transactionDate) : new Date();
      const dateOnly = new Date(Date.UTC(txDate.getFullYear(), txDate.getMonth(), txDate.getDate()));

      const dailyFood = await prisma.dailyFoodSavings.findUnique({
        where: { userId_date: { userId: user.id, date: dateOnly } },
      });

      if (dailyFood) {
        const effectiveBudget =
          dailyFood.budgetMain +
          dailyFood.budgetSub -
          dailyFood.penaltyAppliedFromYesterday;

        const totalSpent = dailyFood.spentMain + dailyFood.spentSub;
        const newTotalSpent = totalSpent + BigInt(amount);

        if (newTotalSpent > effectiveBudget) {
          res.json({
            willOverflow: true,
            categorization: {
              fundType: categorization.fundType,
              category: categorization.category,
            },
            currentRemaining: (effectiveBudget - totalSpent).toString(),
          });
          return;
        }
      }
    }

    res.json({ willOverflow: false });
  } catch (err: any) {
    console.error('[Webhook] Error previewing transaction:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ── GET /api/webhook/users — Danh sách users có thể chọn ────
// (dùng cho Mock Bank UI để populate dropdown)
router.get('/users', async (req: Request, res: Response) => {
  if (!validateWebhookSecret(req)) {
    res.status(403).json({ error: 'Invalid webhook secret' });
    return;
  }

  const users = await prisma.user.findMany({
    where: { isActive: true },
    include: {
      profile: {
        select: {
          residenceType: true,
          bankBalance: true,
          bankAccountId: true,
          onboardingCompleted: true,
        },
      },
    },
  });

  // Strip passwordHash before sending
  const safeUsers = users.map(({ passwordHash: _, ...u }) => u);
  res.json(serializeBigInt(safeUsers));
});

// ── GET /api/webhook/transactions — Lịch sử giao dịch ngân hàng ──
router.get('/transactions', async (req: Request, res: Response) => {
  if (!validateWebhookSecret(req)) {
    res.status(403).json({ error: 'Invalid webhook secret' });
    return;
  }

  const { userId } = req.query;
  try {
    const whereClause: any = {
      description: { contains: '[via:mock-bank]' }
    };
    if (userId && typeof userId === 'string') {
      whereClause.userId = userId;
    }

    const dbTxs = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        fund: true,
        overflowEvents: true,
      },
      orderBy: {
        transactionDate: 'desc',
      },
      take: 50,
    });

    const mappedTxs = dbTxs.map(tx => {
      const cleanMerchant = tx.description
        ? tx.description.replace(/\[via:mock-bank\]/g, '').replace(/\[bankTxId:[^\]]+\]/g, '').trim()
        : tx.category;

      const hasOverflow = tx.overflowEvents && tx.overflowEvents.length > 0;
      const highestOverflowLevel = hasOverflow
        ? tx.overflowEvents.reduce((max, e) => {
            const lvl = e.overflowLevel;
            return lvl > max ? lvl : max;
          }, 'level_1')
        : null;

      return {
        status: hasOverflow ? 'overflow' : 'success',
        merchant: cleanMerchant,
        amount: Number(tx.amount),
        category: tx.category,
        fundType: tx.fund.fundType,
        method: tx.inputMethod === 'ai_text' ? 'rule_engine' : 'default',
        confidence: tx.aiConfidence ? Number(tx.aiConfidence) : 1.0,
        time: tx.transactionDate,
        overflow: hasOverflow ? { triggered: true, highestLevel: highestOverflowLevel } : { triggered: false },
      };
    });

    res.json(mappedTxs);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ── POST /api/webhook/categorize-preview — Preview phân loại (không tạo giao dịch) ──
router.post('/categorize-preview', async (req: Request, res: Response) => {
  if (!validateWebhookSecret(req)) {
    res.status(403).json({ error: 'Invalid webhook secret' });
    return;
  }

  const { merchantName, description, amount, bankCategory } = req.body;
  if (!merchantName || !amount) {
    res.status(400).json({ error: 'merchantName and amount required' });
    return;
  }

  const result = await categorizeTransaction({
    merchantName,
    description,
    amount: Number(amount),
    bankCategory,
  });

  res.json(result);
});

// ── POST /api/webhook/disconnect-demo — Hủy liên kết ngân hàng ────────────────
router.post('/disconnect-demo', async (req: Request, res: Response) => {
  if (!validateWebhookSecret(req)) {
    res.status(403).json({ error: 'Invalid webhook secret' });
    return;
  }

  const { userId } = req.body;
  if (!userId) {
    res.status(400).json({ error: 'userId is required' });
    return;
  }

  try {
    // Clear user demo data (no transactions, reset spent/borrow amounts)
    await clearUserDemoData(userId);

    await prisma.userProfile.update({
      where: { userId },
      data: {
        bankAccountId: null,
      },
    });

    res.json({
      success: true,
      message: 'Đã hủy liên kết ngân hàng thành công',
    });
  } catch (err: any) {
    console.error('[Webhook] disconnect-demo error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ── POST /api/webhook/reset-demo — Reset toàn bộ data demo ──────────────
// Dùng cho MVP demo: xóa hết transaction, reset số dư về 5tr, reset quỹ
router.post('/reset-demo', async (req: Request, res: Response) => {
  if (!validateWebhookSecret(req)) {
    res.status(403).json({ error: 'Invalid webhook secret' });
    return;
  }

  const RESET_BALANCE = 5_000_000;

  try {
    // Lấy user đầu tiên (demo user)
    const { userId } = req.body;
    let targetUserId = userId;

    if (!targetUserId) {
      const firstUser = await prisma.user.findFirst({ where: { isActive: true } });
      if (!firstUser) {
        res.status(404).json({ error: 'No active user found' });
        return;
      }
      targetUserId = firstUser.id;
    }

    // 1. Xóa overflow_events trước (FK RESTRICT → transactions)
    await prisma.overflowEvent.deleteMany({ where: { userId: targetUserId } });

    // 2. Xóa tất cả transactions của user
    await prisma.transaction.deleteMany({ where: { userId: targetUserId } });

    // 3. Reset fund spentAmount và borrowAmount về 0
    await prisma.fund.updateMany({
      where: { userId: targetUserId },
      data: {
        spentAmount: BigInt(0),
        borrowAmount: BigInt(0),
      },
    });

    // 4. Reset bankBalance về 5 triệu và XÓA bankAccountId (chờ ZUNO connect lại)
    await prisma.userProfile.update({
      where: { userId: targetUserId },
      data: {
        bankBalance: BigInt(RESET_BALANCE),
        bankAccountId: null,
      },
    });

    // 5. Xóa và tạo lại funds tháng hiện tại nếu cần
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    const existingFunds = await prisma.fund.findMany({
      where: { userId: targetUserId, month: new Date(currentMonth) },
    });
    if (existingFunds.length === 0) {
      await createMonthlyFunds(targetUserId, currentMonth, BigInt(RESET_BALANCE), 'dorm');
    }

    res.json({
      success: true,
      message: 'Demo đã được reset thành công',
      userId: targetUserId,
      newBalance: RESET_BALANCE,
    });
  } catch (err: any) {
    console.error('[Webhook] reset-demo error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;
