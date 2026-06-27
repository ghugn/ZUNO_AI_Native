import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import * as fundService from '../services/fund.service.js';
import * as overflowService from '../services/overflow.service.js';
import * as dripEngine from '../services/dripEngine.service.js';
import { serializeBigInt } from '../lib/serialize.js';

function mapSingleFund(fund: any, totalIncome: bigint) {
  const customPct = fund.customPercentage ? Number(fund.customPercentage) : null;
  let allocatedPercent = customPct;
  if (allocatedPercent === null && totalIncome > BigInt(0)) {
    allocatedPercent = Number(fund.allocatedAmount * BigInt(100) / totalIncome);
  }
  if (allocatedPercent === null) {
    const defaults: Record<string, number> = { living: 7.5, food: 65, growth: 7.5, experience: 10, future: 10 };
    allocatedPercent = defaults[fund.fundType] ?? 0;
  }
  return {
    ...fund,
    allocatedPercent,
  };
}

export async function getMyFunds(req: AuthRequest, res: Response) {
  try {
    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7) + '-01';
    const funds = await fundService.getFundsByMonth(req.userId!, month);
    const totalIncome = funds.reduce((sum, f) => sum + f.allocatedAmount, BigInt(0));
    const mapped = funds.map(f => mapSingleFund(f, totalIncome));
    res.json(serializeBigInt(mapped));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getFundById(req: AuthRequest, res: Response) {
  try {
    const fund = await fundService.getFundById(req.params.id as string);
    if (!fund) {
      res.status(404).json({ error: 'Fund not found' });
      return;
    }
    const allFunds = await fundService.getFundsByMonth(fund.userId, fund.month.toISOString().slice(0, 10));
    const totalIncome = allFunds.reduce((sum, f) => sum + f.allocatedAmount, BigInt(0));
    res.json(serializeBigInt(mapSingleFund(fund, totalIncome)));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createMonthlyFunds(req: AuthRequest, res: Response) {
  try {
    const { month, bankBalance, residenceType } = req.body;
    if (!month || bankBalance === undefined || bankBalance === null || !residenceType) {
      res.status(400).json({ error: 'month, bankBalance, residenceType required' });
      return;
    }
    const result = await fundService.createMonthlyFunds(
      req.userId!, month, BigInt(bankBalance), residenceType
    );
    const funds = await fundService.getFundsByMonth(req.userId!, month);
    const totalIncome = funds.reduce((sum, f) => sum + f.allocatedAmount, BigInt(0));
    const mapped = funds.map(f => mapSingleFund(f, totalIncome));
    res.json(serializeBigInt(mapped));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateFund(req: AuthRequest, res: Response) {
  try {
    const pendingOverflows = await overflowService.getPendingOverflows(req.userId!);
    if (pendingOverflows.length > 0) {
      res.status(400).json({ error: 'Vui lòng giải quyết các thông báo lố ngân sách trước khi thay đổi quỹ' });
      return;
    }

    const body = { ...req.body };
    if (body.allocatedPercent !== undefined && body.customPercentage === undefined) {
      body.customPercentage = body.allocatedPercent;
    }
    const fund = await fundService.updateFund(req.params.id as string, body);
    const allFunds = await fundService.getFundsByMonth(fund.userId, fund.month.toISOString().slice(0, 10));
    const totalIncome = allFunds.reduce((sum, f) => sum + f.allocatedAmount, BigInt(0));
    res.json(serializeBigInt(mapSingleFund(fund, totalIncome)));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function getTemplates(req: AuthRequest, res: Response) {
  try {
    const residenceType = req.query.residenceType as string | undefined;
    const templates = await fundService.getFundTemplates(residenceType);
    res.json(serializeBigInt(templates));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getSnapshots(req: AuthRequest, res: Response) {
  try {
    const month = req.query.month as string;
    if (!month) {
      res.status(400).json({ error: 'month query param required' });
      return;
    }
    const snapshots = await fundService.getSnapshotsByUserAndMonth(req.userId!, month);
    res.json(serializeBigInt(snapshots));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createSnapshot(req: AuthRequest, res: Response) {
  try {
    const { fundId, snapshotDate, remainingAmount, dailyDripAmount } = req.body;
    if (!fundId || !snapshotDate || remainingAmount === undefined) {
      res.status(400).json({ error: 'fundId, snapshotDate, remainingAmount required' });
      return;
    }
    const snapshot = await fundService.createSnapshot(
      fundId, snapshotDate, BigInt(remainingAmount), BigInt(dailyDripAmount || 0)
    );
    res.status(201).json(serializeBigInt(snapshot));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// ════════════════════════════════════════════════════════════
//  Tầm nhìn Dài Hạn — Nhỏ giọt, Kết chuyển, Dự phóng Lãi kép
// ════════════════════════════════════════════════════════════

/**
 * Kích hoạt nhỏ giọt (Daily Drip) thủ công cho user hiện tại.
 * POST /api/funds/snapshots/drip
 * Body: { date: 'YYYY-MM-DD' }
 */
export async function triggerDailyDrip(req: AuthRequest, res: Response) {
  try {
    const dateStr = req.body.date as string;
    const date = dateStr ? new Date(dateStr) : new Date();

    const result = await dripEngine.runDailyDripForUser(req.userId!, date);

    if (!result) {
      res.status(404).json({
        error: 'Quỹ Tương lai chưa được khởi tạo cho tháng này',
      });
      return;
    }

    res.json(serializeBigInt({
      message: `Nhỏ giọt thành công cho ngày ${date.toISOString().slice(0, 10)}`,
      ...result,
    }));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Kích hoạt kết chuyển tiền thừa cuối tháng (Monthly Rollover).
 * POST /api/funds/rollover
 * Body: { month: 'YYYY-MM-DD' }
 */
export async function triggerMonthlyRollover(req: AuthRequest, res: Response) {
  try {
    const { month } = req.body;
    if (!month) {
      res.status(400).json({ error: 'month required (format: YYYY-MM-DD)' });
      return;
    }

    const result = await dripEngine.processMonthlyRollover(req.userId!, month);

    res.json(serializeBigInt({
      message: `Kết chuyển tiền thừa tháng ${month} thành công`,
      ...result,
    }));
  } catch (err: any) {
    const isBusinessError = [
      'Quỹ Tương lai không tồn tại',
    ].some(msg => err.message?.includes(msg));

    res.status(isBusinessError ? 400 : 500).json({ error: err.message });
  }
}

/**
 * Tính toán dự phóng lãi kép dài hạn.
 * GET /api/funds/projection?monthlyContribution=X&annualRate=Y&years=Z
 *
 * Nếu không truyền monthlyContribution, tự động lấy từ quỹ future
 * tháng hiện tại của user.
 */
export async function getCompoundProjection(req: AuthRequest, res: Response) {
  try {
    let monthlyContribution = Number(req.query.monthlyContribution) || 0;
    const annualRate = Number(req.query.annualRate) || 6.5;
    const years = Number(req.query.years) || 5;

    // Nếu không truyền monthlyContribution, tự lấy từ quỹ future hiện tại
    if (!monthlyContribution) {
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      const funds = await fundService.getFundsByMonth(req.userId!, currentMonth);
      const futureFund = funds.find((f) => f.fundType === 'future');
      if (futureFund) {
        monthlyContribution = Number(futureFund.allocatedAmount);
      }
    }

    if (!monthlyContribution || monthlyContribution <= 0) {
      res.status(400).json({
        error: 'monthlyContribution required hoặc cần có quỹ Tương lai tháng hiện tại',
      });
      return;
    }

    const projection = fundService.calculateCompoundInterest(
      monthlyContribution,
      annualRate,
      years,
    );

    res.json(projection);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

