import prisma from '../lib/prisma.js';
import { handleOverspending, reverseOverflowForTransaction, type OverflowResult } from './overflowEngine.service.js';
import { optimisticFundUpdate, redistributeRemainingFoodBudget } from './fund.service.js';

interface CreateTransactionInput {
  userId: string;
  fundId: string;
  amount: number;
  transactionType: string;
  category: string;
  description?: string;
  inputMethod?: string;
  aiConfidence?: number;
  isAiCorrected?: boolean;
  mealType?: string;
  transactionDate?: string;
  /** ID quỹ đích — bắt buộc khi transactionType === 'transfer' */
  targetFundId?: string;
}

interface UpdateTransactionInput {
  amount?: number;
  transactionType?: string;
  category?: string;
  description?: string;
  mealType?: string;
  isAiCorrected?: boolean;
}

export interface CreateTransactionResult {
  transaction: Awaited<ReturnType<typeof prisma.transaction.create>>;
  overflow: OverflowResult | null;
}

export async function createTransaction(input: CreateTransactionInput): Promise<CreateTransactionResult> {
  const txDate = input.transactionDate ? new Date(input.transactionDate) : new Date();

  // Xây dựng description: nhúng targetFundId cho transfer (để rollback chính xác)
  let txDescription = input.description;
  if (input.transactionType === 'transfer' && input.targetFundId) {
    txDescription = JSON.stringify({
      text: input.description || `Chuyển quỹ`,
      targetFundId: input.targetFundId,
    });
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId: input.userId,
      fundId: input.fundId,
      amount: BigInt(input.amount),
      transactionType: input.transactionType,
      category: input.category,
      description: txDescription,
      inputMethod: input.inputMethod || 'manual',
      aiConfidence: input.aiConfidence,
      isAiCorrected: input.isAiCorrected ?? false,
      mealType: input.mealType,
      transactionDate: txDate,
    },
  });

  let overflow: OverflowResult | null = null;
  const amountBigInt = BigInt(input.amount);

  // ── EXPENSE: Tăng spentAmount + kiểm tra lố ─────────────
  if (input.transactionType === 'expense') {
    await optimisticFundUpdate(input.fundId, {
      spentAmount: { increment: amountBigInt },
    });

    // Cập nhật số dư ngân hàng trong UserProfile
    await prisma.userProfile.update({
      where: { userId: input.userId },
      data: { bankBalance: { decrement: amountBigInt } },
    });

    // Kiểm tra nếu giao dịch thuộc quỹ Ăn uống
    overflow = await checkFoodOverspending(
      input.userId,
      transaction.id,
      input.fundId,
      amountBigInt,
      input.mealType || null,
      txDate,
    );
  }

  // ── INCOME: Tăng allocatedAmount quỹ đích ───────────────
  if (input.transactionType === 'income') {
    await optimisticFundUpdate(input.fundId, {
      allocatedAmount: { increment: amountBigInt },
    });

    // Cập nhật số dư ngân hàng trong UserProfile
    await prisma.userProfile.update({
      where: { userId: input.userId },
      data: { bankBalance: { increment: amountBigInt } },
    });

    const fund = await prisma.fund.findUnique({ where: { id: input.fundId } });
    if (fund && fund.fundType === 'food') {
      await redistributeRemainingFoodBudget(input.userId, fund.month, txDate);
    }
  }

  // ── REFUND: Giảm spentAmount và hoàn trả DailyFoodSavings ────────
  if (input.transactionType === 'refund') {
    await optimisticFundUpdate(input.fundId, {
      spentAmount: { decrement: amountBigInt },
    });

    // Cập nhật số dư ngân hàng trong UserProfile
    await prisma.userProfile.update({
      where: { userId: input.userId },
      data: { bankBalance: { increment: amountBigInt } },
    });

    const fund = await prisma.fund.findUnique({ where: { id: input.fundId } });
    if (fund && fund.fundType === 'food') {
      const dateOnly = new Date(Date.UTC(txDate.getFullYear(), txDate.getMonth(), txDate.getDate()));
      const dailyFood = await prisma.dailyFoodSavings.findUnique({
        where: { userId_date: { userId: input.userId, date: dateOnly } },
      });

      if (dailyFood) {
        const updateField = input.mealType === 'sub' ? 'spentSub' : 'spentMain';
        await prisma.dailyFoodSavings.update({
          where: { id: dailyFood.id },
          data: { [updateField]: { decrement: amountBigInt } },
        });

        const updated = await prisma.dailyFoodSavings.findUnique({ where: { id: dailyFood.id } });
        if (updated) {
          const effectiveBudget = updated.budgetMain + updated.budgetSub - updated.penaltyAppliedFromYesterday;
          const totalSpent = updated.spentMain + updated.spentSub;
          if (totalSpent <= effectiveBudget) {
            await prisma.dailyFoodSavings.update({
              where: { id: updated.id },
              data: { savedAmount: effectiveBudget - totalSpent, dailyOverflow: BigInt(0) },
            });
          } else {
            await prisma.dailyFoodSavings.update({
              where: { id: updated.id },
              data: { savedAmount: BigInt(0), dailyOverflow: totalSpent - effectiveBudget },
            });
          }
        }
      }
    }
  }

  // ── TRANSFER: Trừ quỹ nguồn, cộng quỹ đích ─────────────
  if (input.transactionType === 'transfer') {
    if (!input.targetFundId) {
      // Dọn dẹp giao dịch vừa tạo nếu thiếu targetFundId
      await prisma.transaction.delete({ where: { id: transaction.id } });
      throw new Error('targetFundId bắt buộc khi chuyển quỹ (transfer)');
    }

    // Kiểm tra quỹ nguồn có đủ số dư không
    const sourceFund = await prisma.fund.findUnique({ where: { id: input.fundId } });
    if (!sourceFund) throw new Error('Quỹ nguồn không tồn tại');
    const sourceBalance = sourceFund.allocatedAmount - sourceFund.spentAmount;
    if (sourceBalance < amountBigInt) {
      await prisma.transaction.delete({ where: { id: transaction.id } });
      throw new Error(
        `Quỹ nguồn không đủ số dư. Khả dụng: ${sourceBalance}, Yêu cầu: ${amountBigInt}`,
      );
    }

    // Trừ quỹ nguồn (tăng spentAmount)
    await optimisticFundUpdate(input.fundId, {
      spentAmount: { increment: amountBigInt },
    });

    // Cộng quỹ đích (tăng allocatedAmount)
    await optimisticFundUpdate(input.targetFundId, {
      allocatedAmount: { increment: amountBigInt },
    });

    const targetFund = await prisma.fund.findUnique({ where: { id: input.targetFundId } });
    if (targetFund && targetFund.fundType === 'food') {
      await redistributeRemainingFoodBudget(input.userId, targetFund.month, txDate);
    }
  }

  return { transaction, overflow };
}

export async function getTransactions(userId: string, month?: string) {
  const where: Record<string, unknown> = { userId };

  if (month) {
    const start = new Date(month);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);
    where.transactionDate = { gte: start, lte: end };
  }

  return prisma.transaction.findMany({
    where,
    orderBy: { transactionDate: 'desc' },
    take: 100,
  });
}

export async function getTransactionById(transactionId: string) {
  return prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { fund: { select: { fundType: true } } },
  });
}

export async function updateTransaction(transactionId: string, input: UpdateTransactionInput) {
  // 1. Fetch old transaction
  const oldTx = await getTransactionById(transactionId);
  if (!oldTx) throw new Error('Transaction not found');

  // 2. Rollback the old transaction's effects
  await deleteTransaction(transactionId);

  // 3. Re-create the transaction with updated fields
  // Extract targetFundId if it was a transfer
  let targetFundId: string | undefined;
  if (oldTx.transactionType === 'transfer' && oldTx.description) {
    try {
      const parsedDesc = JSON.parse(oldTx.description);
      targetFundId = parsedDesc.targetFundId;
    } catch (e) {
      // Ignore
    }
  }

  // Determine if it was a transfer and targetFundId is needed
  // Note: If they change transactionType to 'transfer', they need to provide targetFundId. But the UI doesn't allow changing TYPE easily, just category/amount.
  
  const result = await createTransaction({
    userId: oldTx.userId,
    fundId: oldTx.fundId,
    amount: input.amount !== undefined ? input.amount : Number(oldTx.amount),
    transactionType: input.transactionType ?? oldTx.transactionType,
    category: input.category ?? oldTx.category,
    description: input.description !== undefined ? input.description : (oldTx.description || undefined),
    inputMethod: oldTx.inputMethod,
    aiConfidence: oldTx.aiConfidence ? Number(oldTx.aiConfidence) : undefined,
    isAiCorrected: input.isAiCorrected ?? oldTx.isAiCorrected,
    mealType: input.mealType !== undefined ? input.mealType : (oldTx.mealType || undefined),
    transactionDate: oldTx.transactionDate.toISOString(),
    targetFundId,
  });

  return result.transaction;
}

export async function deleteTransaction(transactionId: string) {
  // Lấy giao dịch kèm thông tin quỹ
  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { fund: { select: { fundType: true, month: true } } },
  });
  if (!tx) throw new Error('Transaction not found');

  // ── ROLLOVER: xóa cả nhóm rollover cùng ngày (atomic) ───
  if (tx.category === 'rollover') {
    const txDate = tx.transactionDate;
    const dayStart = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());
    const dayEnd   = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate(), 23, 59, 59);

    const rolloverGroup = await prisma.transaction.findMany({
      where: {
        userId: tx.userId,
        category: 'rollover',
        transactionDate: { gte: dayStart, lte: dayEnd },
      },
    });

    await prisma.$transaction(async (prismaTx) => {
      for (const rtx of rolloverGroup) {
        if (rtx.transactionType === 'transfer') {
          await prismaTx.fund.update({
            where: { id: rtx.fundId },
            data: { spentAmount: { decrement: rtx.amount }, version: { increment: 1 } },
          });
        } else if (rtx.transactionType === 'income') {
          await prismaTx.fund.update({
            where: { id: rtx.fundId },
            data: { allocatedAmount: { decrement: rtx.amount }, version: { increment: 1 } },
          });
        }
        await prismaTx.aiParseLog.updateMany({
          where: { transactionId: rtx.id },
          data: { transactionId: null },
        });
      }
      await prismaTx.transaction.deleteMany({
        where: { id: { in: rolloverGroup.map(r => r.id) } },
      });
    });

    return { deleted: rolloverGroup.length };
  }

  // 1a. Hoàn trả spentAmount cho quỹ (expense)
  if (tx.transactionType === 'expense') {
    await optimisticFundUpdate(tx.fundId, {
      spentAmount: { decrement: tx.amount },
    });
    // Hoàn trả bankBalance
    await prisma.userProfile.update({
      where: { userId: tx.userId },
      data: { bankBalance: { increment: tx.amount } },
    });
  }

  // 1b. Hoàn trả allocatedAmount khi xóa giao dịch thu nhập (income)
  if (tx.transactionType === 'income') {
    await optimisticFundUpdate(tx.fundId, {
      allocatedAmount: { decrement: tx.amount },
    });
    // Hoàn trả bankBalance
    await prisma.userProfile.update({
      where: { userId: tx.userId },
      data: { bankBalance: { decrement: tx.amount } },
    });

    if (tx.fund.fundType === 'food') {
      await redistributeRemainingFoodBudget(tx.userId, tx.fund.month, tx.transactionDate);
    }
  }

  // 1c. Hoàn trả chuyển quỹ (transfer)
  if (tx.transactionType === 'transfer') {
    await optimisticFundUpdate(tx.fundId, {
      spentAmount: { decrement: tx.amount },
    });

    let targetFundId: string | null = null;
    try {
      const descMeta = JSON.parse(tx.description || '');
      if (descMeta && descMeta.targetFundId) targetFundId = descMeta.targetFundId;
    } catch { /* description không phải JSON */ }

    if (targetFundId) {
      await optimisticFundUpdate(targetFundId, {
        allocatedAmount: { decrement: tx.amount },
      });

      const targetFund = await prisma.fund.findUnique({ where: { id: targetFundId } });
      if (targetFund && targetFund.fundType === 'food') {
        await redistributeRemainingFoodBudget(tx.userId, targetFund.month, tx.transactionDate);
      }
    }
  }

  // 2. Nếu là chi tiêu quỹ ăn uống → hoàn trả DailyFoodSavings + Overflow
  if (tx.transactionType === 'expense' && tx.fund.fundType === 'food') {
    const dateOnly = new Date(
      Date.UTC(
        tx.transactionDate.getFullYear(),
        tx.transactionDate.getMonth(),
        tx.transactionDate.getDate(),
      )
    );

    const dailyFood = await prisma.dailyFoodSavings.findUnique({
      where: { userId_date: { userId: tx.userId, date: dateOnly } },
    });

    if (dailyFood) {
      const updateField = tx.mealType === 'sub' ? 'spentSub' : 'spentMain';
      await prisma.dailyFoodSavings.update({
        where: { id: dailyFood.id },
        data: { [updateField]: { decrement: tx.amount } },
      });
    }

    await reverseOverflowForTransaction(transactionId);

    if (dailyFood) {
      const updated = await prisma.dailyFoodSavings.findUnique({ where: { id: dailyFood.id } });
      if (updated) {
        const effectiveBudget = updated.budgetMain + updated.budgetSub - updated.penaltyAppliedFromYesterday;
        const totalSpent = updated.spentMain + updated.spentSub;
        if (totalSpent <= effectiveBudget) {
          await prisma.dailyFoodSavings.update({
            where: { id: updated.id },
            data: { savedAmount: effectiveBudget - totalSpent, dailyOverflow: BigInt(0) },
          });
        } else {
          await prisma.dailyFoodSavings.update({
            where: { id: updated.id },
            data: { savedAmount: BigInt(0), dailyOverflow: totalSpent - effectiveBudget },
          });
        }
      }
    }
  }

  // 3. Gỡ FK reference từ AI parse logs
  await prisma.aiParseLog.updateMany({
    where: { transactionId },
    data: { transactionId: null },
  });

  // 4. Xóa giao dịch
  return prisma.transaction.delete({ where: { id: transactionId } });
}

export async function getTransactionsByDate(userId: string, date: string) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return prisma.transaction.findMany({
    where: {
      userId,
      transactionDate: { gte: start, lte: end },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ════════════════════════════════════════════════════════════
//  Kiểm tra chi tiêu lố quỹ ăn uống & kích hoạt Cơ chế 3 Lố
// ════════════════════════════════════════════════════════════

async function checkFoodOverspending(
  userId: string,
  transactionId: string,
  fundId: string,
  amount: bigint,
  mealType: string | null,
  txDate: Date,
): Promise<OverflowResult | null> {
  const fund = await prisma.fund.findUnique({ where: { id: fundId } });
  if (!fund || fund.fundType !== 'food') return null;

  const dateOnly = new Date(Date.UTC(txDate.getFullYear(), txDate.getMonth(), txDate.getDate()));

  let dailyFood = await prisma.dailyFoodSavings.findUnique({
    where: { userId_date: { userId, date: dateOnly } },
  });

  if (!dailyFood) return null;

  const oldOverflow = dailyFood.dailyOverflow;

  const updateField = mealType === 'sub' ? 'spentSub' : 'spentMain';
  dailyFood = await prisma.dailyFoodSavings.update({
    where: { id: dailyFood.id },
    data: { [updateField]: { increment: amount } },
  });

  const effectiveBudget =
    dailyFood.budgetMain +
    dailyFood.budgetSub -
    dailyFood.penaltyAppliedFromYesterday;

  const totalSpent = dailyFood.spentMain + dailyFood.spentSub;

  if (totalSpent <= effectiveBudget) {
    const saved = effectiveBudget - totalSpent;
    await prisma.dailyFoodSavings.update({
      where: { id: dailyFood.id },
      data: { savedAmount: saved, dailyOverflow: BigInt(0) },
    });
    return null;
  }

  const overspent = totalSpent - effectiveBudget;

  await prisma.dailyFoodSavings.update({
    where: { id: dailyFood.id },
    data: { savedAmount: BigInt(0), dailyOverflow: overspent },
  });

  const incrementalOverspent = overspent - oldOverflow;
  if (incrementalOverspent <= BigInt(0)) {
    return null;
  }

  const month = `${dateOnly.getFullYear()}-${String(dateOnly.getMonth() + 1).padStart(2, '0')}-01`;
  const transactionDateStr = dateOnly.toISOString().slice(0, 10);

  return handleOverspending({
    userId,
    transactionId,
    transactionDate: transactionDateStr,
    month,
    overspentAmount: incrementalOverspent,
  });
}

