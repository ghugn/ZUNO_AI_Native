// ════════════════════════════════════════════════════════════
//  ALERT ROUTES — Pre-Spending Budget Check
//  POST /api/alerts/pre-spending
// ════════════════════════════════════════════════════════════

import { Router } from 'express';
import type { Response } from 'express';
import { evaluatePreSpending } from '../services/preSpendingAlert.service.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/alerts/pre-spending
 * Evaluate whether a proposed transaction will overflow the user's budget.
 * Called BEFORE submitting a transaction to give the user a warning.
 *
 * Body: { merchantName, amount, bankCategory?, description? }
 * Returns: PreSpendingAlertResult
 */
router.post('/pre-spending', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { merchantName, amount, bankCategory, description } = req.body;

    if (!merchantName || !amount) {
      res.status(400).json({ error: 'merchantName and amount are required' });
      return;
    }

    if (typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ error: 'amount must be a positive number' });
      return;
    }

    const result = await evaluatePreSpending({
      userId,
      merchantName,
      amount,
      bankCategory,
      description,
    });

    res.json(result);
  } catch (err: any) {
    console.error('[Alert] Pre-spending check error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;
