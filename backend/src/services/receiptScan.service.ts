import { GoogleGenerativeAI, type Part } from '@google/generative-ai';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import prisma from '../lib/prisma.js';

// ── Kiểu trả về của hàm phân tích ảnh ─────────────────────────────────────────

export interface ReceiptScanResult {
  rawText: string;
  amount: number | null;
  category: string | null;
  time: string | null;
  source: string;
  description: string | null;
  confidence: number;
}
// ── Prompt yêu cầu Gemini phân tích hóa đơn ────────────────────────────────────

const SYSTEM_PROMPT = `Bạn là trợ lý phân tích hóa đơn tài chính thông minh. Nhiệm vụ của bạn là đọc hình ảnh hóa đơn/biên lai và trích xuất thông tin giao dịch.

Hãy phân tích ảnh và trả về JSON với đúng cấu trúc sau (không thêm text ngoài JSON):
{
  "rawText": "toàn bộ nội dung văn bản đọc được từ ảnh",
  "amount": <số tiền VND, chỉ là số nguyên, không có đơn vị>,
  "category": "<danh mục bắt buộc chọn 1 trong 5 loại sau: Food and Drinks | Experience | Developement | Fixed bill | Savings>",
  "time": "<thời gian giao dịch định dạng ISO 8601 nếu có, hoặc null>",
  "source": "Receipt",
  "description": "<Tên cửa hàng/quán hoặc tóm tắt cực kỳ ngắn gọn từ 3 đến 5 từ, ví dụ: 'Quán Khói 06' hoặc 'Phúc Long', tuyệt đối KHÔNG liệt kê chi tiết danh sách món ăn hay viết dài dòng>",
  "confidence": <độ tin cậy từ 0.0 đến 1.0>
}

Lưu ý:
- Nếu không đọc được số tiền, đặt "amount" là null.
- Nếu không rõ danh mục, chọn danh mục gần nhất dựa vào ngữ cảnh.
- Nếu không có thông tin thời gian, đặt "time" là null.
- Luôn trả về JSON hợp lệ, không thêm markdown hay backtick.`;

// ── Hàm phân tích ảnh hóa đơn chính ───────────────────────────────────────────

export async function analyzeReceiptImage(
  imageBuffer: Buffer,
  mimeType: string,
  userId: string,
): Promise<ReceiptScanResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY chưa được cấu hình trong file .env');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Chuyển buffer sang base64 để gửi lên Gemini
  const imageBase64 = imageBuffer.toString('base64');

  const imagePart: Part = {
    inlineData: {
      data: imageBase64,
      mimeType: mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/heic' | 'image/heif',
    },
  };

  // Save the image locally for inspection/debugging
  const uploadDir = path.join(process.cwd(), 'uploads', 'receipts');
  await mkdir(uploadDir, { recursive: true });
  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
  };
  const ext = extMap[mimeType] || 'bin';
  const filePath = path.join(uploadDir, `${Date.now()}_${userId}.${ext}`);
  await writeFile(filePath, imageBuffer);
  console.log(`[ReceiptScan] Image saved to ${filePath}`);


  // Gọi API Gemini
  const result = await model.generateContent([SYSTEM_PROMPT, imagePart]);
  const responseText = result.response.text().trim();

  // Parse JSON từ kết quả trả về
  let parsed: ReceiptScanResult;
  try {
    // Xóa markdown code block nếu model trả về dạng ```json ... ```
    const cleanJson = responseText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    parsed = JSON.parse(cleanJson);
  } catch {
    // Nếu không parse được, trả về dữ liệu tối thiểu
    parsed = {
      rawText: responseText,
      amount: null,
      category: null,
      time: null,
      source: 'Receipt',
      description: 'Không thể phân tích hóa đơn',
      confidence: 0,
    };
  }

  // Đảm bảo source luôn là 'Receipt'
  parsed.source = 'Receipt';

  // Lưu log vào DB
  await prisma.aiParseLog.create({
    data: {
      userId,
      rawInput: `[IMAGE] mimeType=${mimeType} size=${imageBuffer.byteLength}B`,
      parsedEntity: parsed.description ?? undefined,
      parsedAmount: parsed.amount ? BigInt(Math.round(parsed.amount)) : null,
      parsedCategory: parsed.category ?? undefined,
    },
  });

  return parsed;
}
