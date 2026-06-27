import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.js';
import { scanReceipt } from '../controllers/receiptScan.controller.js';

const router = Router();

// Lưu file vào bộ nhớ (buffer) thay vì disk để xử lý trực tiếp
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Định dạng ảnh không hỗ trợ: ${file.mimetype}`));
    }
  },
});

/**
 * POST /api/receipt/scan
 * Upload ảnh hóa đơn để AI phân tích và trả về thông tin giao dịch.
 *
 * Headers:
 *   Authorization: Bearer <token>
 * Body (multipart/form-data):
 *   image: <file ảnh>
 *
 * Response 200:
 *   { success: true, data: { rawText, amount, category, time, source, description, confidence } }
 */
router.post('/scan', authMiddleware, upload.single('image'), scanReceipt);

export default router;
