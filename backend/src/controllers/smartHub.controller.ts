import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import * as smartHubService from '../services/smartHub.service.js';

export async function getByDate(req: AuthRequest, res: Response) {
  try {
    const date = req.query.date as string;
    if (!date) {
      res.status(400).json({ error: 'date query param required' });
      return;
    }

    const suggestion = await smartHubService.getSmartHubSuggestion(req.userId!, date);
    res.json(suggestion);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
