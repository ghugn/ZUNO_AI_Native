import { Router } from 'express';
import * as tagController from '../controllers/tag.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', tagController.getAllTags);
router.post('/', tagController.createTag);
router.get('/fund/:fundType', tagController.getTagsByFundType);
router.put('/:id', tagController.updateTag);
router.delete('/:id', tagController.deleteTag);

export default router;
