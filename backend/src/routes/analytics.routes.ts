import { Router } from 'express';
import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { calculateHealthScore, getDashboardData } from '../services/analytics.service.js';
import { generateSuggestions } from '../services/smartSuggestions.service.js';
import { createSuggestionNotificationIfUnique } from '../services/notification.service.js';
import { serializeBigInt } from '../lib/serialize.js';

const router = Router();
router.use(authMiddleware);

// ── GET /api/analytics/dashboard?month=YYYY-MM-DD ───────────
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7) + '-01';
    const data = await getDashboardData(req.userId!, month);
    res.json(serializeBigInt(data));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/analytics/health-score?month=YYYY-MM-DD ────────
router.get('/health-score', async (req: AuthRequest, res: Response) => {
  try {
    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7) + '-01';
    const score = await calculateHealthScore(req.userId!, month);
    res.json(score);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/analytics/suggestions?month=YYYY-MM-DD ─────────
router.get('/suggestions', async (req: AuthRequest, res: Response) => {
  try {
    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7) + '-01';
    const suggestions = await generateSuggestions(req.userId!, month);
    
    // Sync urgent/warning suggestions to notifications
    for (const sug of suggestions) {
      if (sug.level === 'urgent' || sug.level === 'warning') {
        await createSuggestionNotificationIfUnique(
          req.userId!,
          sug.title,
          sug.body,
          sug.actionHref
        );
      }
    }

    res.json(suggestions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
