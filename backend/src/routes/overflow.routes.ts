import { Router } from 'express';
import * as overflowController from '../controllers/overflow.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', overflowController.getOverflowEvents);
router.get('/pending', overflowController.getPendingOverflows);
router.post('/', overflowController.createOverflowEvent);
router.get('/:id', overflowController.getOverflowById);
router.put('/:id', overflowController.updateOverflowStatus);

export default router;
