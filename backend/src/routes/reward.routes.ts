import { Router } from 'express';
import * as rewardController from '../controllers/reward.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// Weekly Rewards
router.get('/weekly', rewardController.getWeeklyReward);
router.get('/weekly/month', rewardController.getWeeklyRewardsByMonth);
router.post('/weekly', rewardController.createWeeklyReward);
router.post('/weekly/:id/claim', rewardController.claimWeeklyReward);
router.put('/weekly/:id', rewardController.updateWeeklyReward);

// Reward Points
router.get('/points', rewardController.getPoints);
router.post('/points/add', rewardController.addPoints);
router.put('/points/multiplier', rewardController.updateMultiplier);

export default router;
