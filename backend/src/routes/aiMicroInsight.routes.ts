import { Router } from 'express';
import * as aiMicroInsightController from '../controllers/aiMicroInsight.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', aiMicroInsightController.list);
router.get('/by-date', aiMicroInsightController.getByDate);

export default router;
