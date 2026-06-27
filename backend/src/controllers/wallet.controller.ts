import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import * as walletService from '../services/wallet.service.js';
import { serializeBigInt } from '../lib/serialize.js';

export async function getWallet(req: AuthRequest, res: Response) {
  try {
    const wallet = await walletService.getWallet(req.userId!);
    res.json(serializeBigInt(wallet));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateWallet(req: AuthRequest, res: Response) {
  try {
    const { balance, note } = req.body;
    if (balance === undefined || typeof balance !== 'number') {
      res.status(400).json({ error: 'balance (number) is required' });
      return;
    }
    const wallet = await walletService.updateWallet(req.userId!, balance, note);
    res.json(serializeBigInt(wallet));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
