import { Router } from 'express';
import * as walletController from '../controllers/wallet.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', walletController.getWallet);
router.put('/', walletController.updateWallet);

export default router;
