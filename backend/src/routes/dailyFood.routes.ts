import { Router } from 'express';
import * as dailyFoodController from '../controllers/dailyFood.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', dailyFoodController.getByDate);
router.get('/month', dailyFoodController.getByMonth);
router.post('/', dailyFoodController.create);
router.post('/bulk', dailyFoodController.createBulk);
router.put('/', dailyFoodController.update);

export default router;
