import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import * as overflowService from '../services/overflow.service.js';
import { serializeBigInt } from '../lib/serialize.js';

export async function getOverflowEvents(req: AuthRequest, res: Response) {
  try {
    const month = req.query.month as string | undefined;
    const events = await overflowService.getOverflowEvents(req.userId!, month as string | undefined);
    res.json(serializeBigInt(events));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getOverflowById(req: AuthRequest, res: Response) {
  try {
    const event = await overflowService.getOverflowEventById(req.params.id as string);
    if (!event) {
      res.status(404).json({ error: 'Overflow event not found' });
      return;
    }
    res.json(serializeBigInt(event));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createOverflowEvent(req: AuthRequest, res: Response) {
  try {
    const { transactionId, eventDate, overflowLevel, overflowAmount, sourceFundType, borrowedFromFundType, penaltyApplied } = req.body;
    if (!transactionId || !eventDate || !overflowLevel || !overflowAmount || !sourceFundType) {
      res.status(400).json({ error: 'transactionId, eventDate, overflowLevel, overflowAmount, sourceFundType required' });
      return;
    }
    const event = await overflowService.createOverflowEvent({
      userId: req.userId!,
      transactionId, eventDate, overflowLevel, overflowAmount, sourceFundType,
      borrowedFromFundType, penaltyApplied,
    });
    res.status(201).json(serializeBigInt(event));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateOverflowStatus(req: AuthRequest, res: Response) {
  try {
    const event = await overflowService.updateOverflowStatus(req.params.id as string, req.body);
    res.json(serializeBigInt(event));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function getPendingOverflows(req: AuthRequest, res: Response) {
  try {
    const events = await overflowService.getPendingOverflows(req.userId!);
    res.json(serializeBigInt(events));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
