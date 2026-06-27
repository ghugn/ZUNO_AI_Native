import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.post('/', transactionController.create);
router.get('/', transactionController.list);
router.get('/by-date', transactionController.listByDate);
router.get('/:id', transactionController.getById);
router.put('/:id', transactionController.update);
router.delete('/:id', transactionController.remove);

export default router;
