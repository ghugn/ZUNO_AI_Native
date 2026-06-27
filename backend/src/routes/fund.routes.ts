import { Router } from 'express';
import * as fundController from '../controllers/fund.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// Fund CRUD
router.get('/', fundController.getMyFunds);
router.post('/', fundController.createMonthlyFunds);
router.get('/templates', fundController.getTemplates);
router.get('/snapshots', fundController.getSnapshots);
router.post('/snapshots', fundController.createSnapshot);

// Tầm nhìn Dài Hạn — Nhỏ giọt, Kết chuyển, Lãi kép
router.post('/snapshots/drip', fundController.triggerDailyDrip);
router.post('/rollover', fundController.triggerMonthlyRollover);
router.get('/projection', fundController.getCompoundProjection);

// Parameterized routes (must come last)
router.get('/:id', fundController.getFundById);
router.put('/:id', fundController.updateFund);

export default router;
