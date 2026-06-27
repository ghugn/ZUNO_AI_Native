import { Router } from 'express';
import * as aiParseLogController from '../controllers/aiParseLog.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', aiParseLogController.getLogs);
router.post('/', aiParseLogController.createLog);
router.get('/:id', aiParseLogController.getLogById);
router.post('/:id/confirm', aiParseLogController.confirmLog);
router.post('/:id/correct', aiParseLogController.correctLog);

export default router;
