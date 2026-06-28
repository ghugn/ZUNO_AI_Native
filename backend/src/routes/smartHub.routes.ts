import { Router } from 'express';
import * as smartHubController from '../controllers/smartHub.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', smartHubController.getByDate);

export default router;
