import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import * as dailyFoodService from '../services/dailyFood.service.js';
import { serializeBigInt } from '../lib/serialize.js';

export async function getByDate(req: AuthRequest, res: Response) {
  try {
    const date = req.query.date as string;
    if (!date) {
      res.status(400).json({ error: 'date query param required' });
      return;
    }
    const record = await dailyFoodService.getDailyFoodSavings(req.userId!, date);
    if (!record) {
      res.status(404).json({ error: 'No daily food savings record for this date' });
      return;
    }
    res.json(serializeBigInt(record));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getByMonth(req: AuthRequest, res: Response) {
  try {
    const month = req.query.month as string;
    if (!month) {
      res.status(400).json({ error: 'month query param required (YYYY-MM-01)' });
      return;
    }
    const records = await dailyFoodService.getDailyFoodSavingsByMonth(req.userId!, month);
    res.json(serializeBigInt(records));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const { date, budgetMain, budgetSub } = req.body;
    if (!date || budgetMain === undefined || budgetSub === undefined) {
      res.status(400).json({ error: 'date, budgetMain, budgetSub required' });
      return;
    }
    const record = await dailyFoodService.createDailyFoodSavings({
      userId: req.userId!, date, budgetMain, budgetSub,
    });
    res.status(201).json(serializeBigInt(record));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function createBulk(req: AuthRequest, res: Response) {
  try {
    const { month, budgetMain, budgetSub } = req.body;
    if (!month || budgetMain === undefined || budgetSub === undefined) {
      res.status(400).json({ error: 'month, budgetMain, budgetSub required' });
      return;
    }
    const result = await dailyFoodService.createBulkDailyFoodSavings(
      req.userId!, month, BigInt(budgetMain), BigInt(budgetSub)
    );
    res.status(201).json({ created: result.count });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const date = req.query.date as string;
    if (!date) {
      res.status(400).json({ error: 'date query param required' });
      return;
    }
    const record = await dailyFoodService.updateDailyFoodSavings(req.userId!, date, req.body);
    res.json(serializeBigInt(record));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
