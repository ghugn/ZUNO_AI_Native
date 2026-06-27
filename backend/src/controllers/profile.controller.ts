import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import * as profileService from '../services/profile.service.js';
import { serializeBigInt } from '../lib/serialize.js';
import * as fundService from '../services/fund.service.js';
import * as overflowService from '../services/overflow.service.js';
import * as transactionService from '../services/transaction.service.js';
import prisma from '../lib/prisma.js';

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const profile = await profileService.getProfile(req.userId!);
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    res.json(serializeBigInt(profile));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createProfile(req: AuthRequest, res: Response) {
  try {
    const { residenceType, bankBalance, dormPaidSemester, hasFoodFromFamily } = req.body;
    if (!residenceType || bankBalance === undefined || bankBalance === null) {
      res.status(400).json({ error: 'residenceType, bankBalance required' });
      return;
    }
    const profile = await profileService.createProfile({
      userId: req.userId!,
      residenceType,
      bankBalance,
      dormPaidSemester,
      hasFoodFromFamily,
    });
    res.status(201).json(serializeBigInt(profile));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    if (req.body.residenceType !== undefined) {
      const pendingOverflows = await overflowService.getPendingOverflows(req.userId!);
      if (pendingOverflows.length > 0) {
        res.status(400).json({ error: 'Vui lòng giải quyết các thông báo lố ngân sách trước khi thay đổi lifestyle' });
        return;
      }
    }
    const profile = await profileService.updateProfile(req.userId!, req.body);
    res.json(serializeBigInt(profile));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function completeOnboarding(req: AuthRequest, res: Response) {
  try {
    const profile = await profileService.completeOnboarding(req.userId!);
    res.json(serializeBigInt(profile));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// ── Single source of truth for all mock banks ─────────────────
export const MOCK_BANKS = [
  { id: 'mbb', name: 'ZUNO Bank Demo', balance: 5_000_000, color: '#174f84' },
];

export async function getMockBanks(req: AuthRequest, res: Response) {
  try {
    res.json(MOCK_BANKS);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function mockConnectBank(req: AuthRequest, res: Response) {
  try {
    const { accountId } = req.body;
    const userId = req.userId!;

    const bank = MOCK_BANKS.find(b => b.id === accountId);
    const bankBalance = bank?.balance ?? 5_000_000;

    const existing = await prisma.userProfile.findUnique({ where: { bankAccountId: accountId } });
    if (existing && existing.userId !== userId) {
      // For demo robustness: automatically unlink the old user's bank connection
      await prisma.userProfile.update({
        where: { userId: existing.userId },
        data: { bankAccountId: null },
      });
    }

    // Clear user demo data first to start completely clean (no transactions, no overflows)
    await fundService.clearUserDemoData(userId);

    // Update the profile balance and link the bank account
    const profile = await profileService.updateProfile(userId, { bankBalance, bankAccountId: accountId });

    // Recreate funds for current month with correct bank balance
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    await fundService.createMonthlyFunds(userId, currentMonth, BigInt(bankBalance), profile?.residenceType || 'dorm');

    res.json(serializeBigInt(profile));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
