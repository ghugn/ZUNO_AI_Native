import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { analyzeReceiptImage } from '../services/receiptScan.service.js';

export async function scanReceipt(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Multer đặt file vào req.file
  const file = req.file as Express.Multer.File | undefined;
  console.log(`[ReceiptScan] Nhận yêu cầu quét ảnh từ user ${userId}. File: ${file?.originalname}, size: ${file?.size}B, mime: ${file?.mimetype}`);
  if (!file) {
    res.status(400).json({ error: 'Vui lòng upload một file ảnh (field: "image")' });
    return;
  }

  // Kiểm tra MIME type hợp lệ
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    res.status(400).json({
      error: `Định dạng ảnh không hỗ trợ. Chỉ chấp nhận: ${allowedMimeTypes.join(', ')}`,
    });
    return;
  }

  // Giới hạn kích thước: 10 MB
  const MAX_SIZE_BYTES = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    res.status(400).json({ error: 'File ảnh quá lớn. Kích thước tối đa là 10 MB.' });
    return;
  }

  try {
    const result = await analyzeReceiptImage(file.buffer, file.mimetype, userId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định';

    // Phân biệt lỗi cấu hình và lỗi API
    if (message.includes('GEMINI_API_KEY')) {
      res.status(503).json({
        error: 'Dịch vụ AI chưa được cấu hình. Vui lòng liên hệ quản trị viên.',
        detail: message,
      });
    } else {
      res.status(500).json({
        error: 'Không thể phân tích hóa đơn. Vui lòng thử lại.',
        detail: message,
      });
    }
  }
}
