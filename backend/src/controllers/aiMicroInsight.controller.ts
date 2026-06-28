import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import * as aiMicroInsightService from '../services/aiMicroInsight.service.js';

export async function list(req: AuthRequest, res: Response) {
  try {
    const weekStart = req.query.weekStart as string | undefined;
    const insights = await aiMicroInsightService.getAiMicroInsights(req.userId!, weekStart);
    res.json(insights);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getByDate(req: AuthRequest, res: Response) {
  try {
    const date = req.query.date as string;
    if (!date) {
      res.status(400).json({ error: 'date query param required' });
      return;
    }

    const insight = await aiMicroInsightService.getAiMicroInsightByDate(req.userId!, date);
    res.json(insight);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
