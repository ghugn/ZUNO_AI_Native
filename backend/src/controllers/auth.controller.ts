import type { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import * as authService from '../services/auth.service.js';
import { serializeBigInt } from '../lib/serialize.js';

export async function register(req: Request, res: Response) {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) {
      res.status(400).json({ error: 'email, password, fullName required' });
      return;
    }
    const result = await authService.register(email, password, fullName);
    res.status(201).json(serializeBigInt(result));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'email, password required' });
      return;
    }
    const result = await authService.login(email, password);
    res.json(serializeBigInt(result));
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const user = await authService.getMe(req.userId!);
    res.json(serializeBigInt(user));
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}
