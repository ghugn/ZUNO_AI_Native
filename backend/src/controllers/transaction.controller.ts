import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import * as transactionService from '../services/transaction.service.js';
import { serializeBigInt } from '../lib/serialize.js';

export async function create(req: AuthRequest, res: Response) {
  try {
    const { fundId, amount, transactionType, category, description, inputMethod, aiConfidence, isAiCorrected, mealType, transactionDate, targetFundId } = req.body;
    if (!fundId || !amount || !transactionType || !category) {
      res.status(400).json({ error: 'fundId, amount, transactionType, category required' });
      return;
    }
    const { transaction, overflow } = await transactionService.createTransaction({
      userId: req.userId!,
      fundId, amount, transactionType, category,
      description, inputMethod, aiConfidence, isAiCorrected, mealType, transactionDate,
      targetFundId,
    });

    const response: Record<string, unknown> = {
      ...serializeBigInt(transaction),
    };

    if (overflow) {
      response.overflow = {
        totalOverspent: overflow.totalOverspent.toString(),
        highestLevel: overflow.highestLevel,
        actions: overflow.actions.map((a) => ({
          level: a.level,
          amount: a.amount.toString(),
          source: a.source,
          description: a.description,
        })),
      };
    }

    res.status(201).json(response);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function list(req: AuthRequest, res: Response) {
  try {
    const month = req.query.month as string | undefined;
    const transactions = await transactionService.getTransactions(req.userId!, month);
    res.json(serializeBigInt(transactions));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getById(req: AuthRequest, res: Response) {
  try {
    const transaction = await transactionService.getTransactionById(req.params.id as string);
    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    res.json(serializeBigInt(transaction));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const transaction = await transactionService.updateTransaction(req.params.id as string, req.body);
    res.json(serializeBigInt(transaction));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    await transactionService.deleteTransaction(req.params.id as string);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function listByDate(req: AuthRequest, res: Response) {
  try {
    const date = req.query.date as string;
    if (!date) {
      res.status(400).json({ error: 'date query param required' });
      return;
    }
    const transactions = await transactionService.getTransactionsByDate(req.userId!, date);
    res.json(serializeBigInt(transactions));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
