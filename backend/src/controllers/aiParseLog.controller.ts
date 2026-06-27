import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import * as aiParseLogService from '../services/aiParseLog.service.js';
import { serializeBigInt } from '../lib/serialize.js';

export async function getLogs(req: AuthRequest, res: Response) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const logs = await aiParseLogService.getAiParseLogs(req.userId!, limit);
    res.json(serializeBigInt(logs));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getLogById(req: AuthRequest, res: Response) {
  try {
    const log = await aiParseLogService.getAiParseLogById(req.params.id as string);
    if (!log) {
      res.status(404).json({ error: 'AI parse log not found' });
      return;
    }
    res.json(serializeBigInt(log));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createLog(req: AuthRequest, res: Response) {
  try {
    const { rawInput, parsedEntity, parsedAmount, parsedCategory } = req.body;
    if (!rawInput) {
      res.status(400).json({ error: 'rawInput required' });
      return;
    }
    const log = await aiParseLogService.createAiParseLog({
      userId: req.userId!, rawInput, parsedEntity, parsedAmount, parsedCategory,
    });
    res.status(201).json(serializeBigInt(log));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function confirmLog(req: AuthRequest, res: Response) {
  try {
    const { transactionId } = req.body;
    if (!transactionId) {
      res.status(400).json({ error: 'transactionId required' });
      return;
    }
    const log = await aiParseLogService.confirmAiParseLog(req.params.id as string, transactionId);
    res.json(serializeBigInt(log));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function correctLog(req: AuthRequest, res: Response) {
  try {
    const { userCorrection } = req.body;
    if (!userCorrection) {
      res.status(400).json({ error: 'userCorrection required' });
      return;
    }
    const log = await aiParseLogService.correctAiParseLog(req.params.id as string, userCorrection);
    res.json(serializeBigInt(log));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
