import { Router } from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', profileController.getProfile);
router.post('/', profileController.createProfile);
router.put('/', profileController.updateProfile);
router.post('/complete-onboarding', profileController.completeOnboarding);
router.get('/mock-banks', profileController.getMockBanks);
router.post('/mock-connect', profileController.mockConnectBank);

export default router;
