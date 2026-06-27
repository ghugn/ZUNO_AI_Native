// ════════════════════════════════════════════════════════════
//  SMART CATEGORIZER — Phân loại giao dịch 3 lớp
//  Layer 1: Core Banking metadata (MCC category)
//  Layer 2: Rule Engine (merchant name pattern matching)
//  Layer 3: Gemini AI fallback
// ════════════════════════════════════════════════════════════

export type FundType = 'living' | 'food' | 'growth' | 'experience' | 'future';
export type MealType = 'main' | 'sub' | null;

export interface CategorizationResult {
  fundType: FundType;
  category: string;
  mealType: MealType;
  method: 'bank_metadata' | 'rule_engine' | 'ai_fallback' | 'default';
  confidence: number; // 0.0 – 1.0
  requiresReview: boolean;
}

// ── Layer 2: Rule Engine ─────────────────────────────────────

interface MerchantRule {
  patterns: RegExp[];
  fundType: FundType;
  category: string;
  mealType?: MealType;
}

const MERCHANT_RULES: MerchantRule[] = [
  // === FOOD — Ăn uống hàng ngày ===
  {
    patterns: [
      /cơm|bún|phở|bánh mì|xôi|hủ tiếu|mì|bếp|nhà hàng|quán ăn|eatery|restaurant|canteen|căng tin|căn tin|bếp ăn|suất ăn|ăn uống|ẩm thực|bistro|cafe|cà phê|trà sữa|nước/i,
    ],
    fundType: 'food',
    category: 'Ăn uống',
    mealType: 'main',
  },
  {
    patterns: [/snack|bánh|kẹo|kem|nước ngọt|pepsi|coca|red bull|highland|starbucks|phúc long|gong cha|the coffee|mixue/i],
    fundType: 'food',
    category: 'Ăn vặt',
    mealType: 'sub',
  },
  {
    patterns: [/grab food|shopeefood|baemin|loship|gofood|now\.vn|delivery/i],
    fundType: 'food',
    category: 'Đặt đồ ăn',
    mealType: 'main',
  },
  // === LIVING — Chi phí sinh hoạt cố định ===
  {
    patterns: [/điện|điện lực|evn|pc|pvn|điện nước|nước sạch|hawaco|water|utility/i],
    fundType: 'living',
    category: 'Điện nước',
    mealType: null,
  },
  {
    patterns: [/internet|wifi|vnpt|viettel|mobifone|vinaphone|fpt|broadband|telecom|viễn thông/i],
    fundType: 'living',
    category: 'Internet & điện thoại',
    mealType: null,
  },
  {
    patterns: [/nhà trọ|phòng trọ|thuê nhà|tiền nhà|rent|landlord|ký túc xá|ktx|dorm/i],
    fundType: 'living',
    category: 'Thuê nhà',
    mealType: null,
  },
  {
    patterns: [/bảo hiểm|insurance|bhxh|bhyt|health/i],
    fundType: 'living',
    category: 'Bảo hiểm',
    mealType: null,
  },
  {
    patterns: [/xe buýt|bus|taxi|grab|be|gojek|uber|di chuyển|xăng|petrol|petrolimex|xăng dầu|parking|đỗ xe|cầu đường|toll/i],
    fundType: 'living',
    category: 'Di chuyển',
    mealType: null,
  },
  // === GROWTH — Học tập & Phát triển bản thân ===
  {
    patterns: [/sách|nhà sách|fahasa|book|tiki sách|học|course|udemy|coursera|edx|khoá học|khóa học|tutorial|learning|education|trường|đại học|university|college|học phí|tuition/i],
    fundType: 'growth',
    category: 'Học tập',
    mealType: null,
  },
  {
    patterns: [/gym|yoga|thể thao|sport|fitness|clb thể|câu lạc bộ|swimming|bơi lội|chạy bộ/i],
    fundType: 'growth',
    category: 'Sức khoẻ & Thể thao',
    mealType: null,
  },
  {
    patterns: [/văn phòng phẩm|stationery|bút|vở|giấy|office supply/i],
    fundType: 'growth',
    category: 'Văn phòng phẩm',
    mealType: null,
  },
  // === EXPERIENCE — Giải trí & Trải nghiệm ===
  {
    patterns: [/shopee|lazada|tiki|sendo|amazon|aliexpress|online shop|mua sắm|fashion|quần áo|giày|túi|accessory|phụ kiện/i],
    fundType: 'experience',
    category: 'Mua sắm online',
    mealType: null,
  },
  {
    patterns: [/cinema|cgv|lotte|galaxy cinema|rạp chiếu|phim|film|concert|event|vé|ticket|karaoke|billiard|bowling|game|gaming|steam|netflix|spotify|youtube premium/i],
    fundType: 'experience',
    category: 'Giải trí',
    mealType: null,
  },
  {
    patterns: [/du lịch|travel|hotel|khách sạn|airbnb|booking|agoda|flight|vé máy bay|tour|resort/i],
    fundType: 'experience',
    category: 'Du lịch',
    mealType: null,
  },
  {
    patterns: [/quà tặng|gift|chúc mừng|tiệc|party|birthday|wedding|đám cưới|sinh nhật/i],
    fundType: 'experience',
    category: 'Quà tặng & Xã giao',
    mealType: null,
  },
  // === FUTURE — Tiết kiệm & Đầu tư ===
  {
    patterns: [/tiết kiệm|savings|đầu tư|invest|chứng khoán|stock|crypto|bitcoin|fund/i],
    fundType: 'future',
    category: 'Tiết kiệm & Đầu tư',
    mealType: null,
  },
];

// ── Layer 1: Core Banking MCC/Category Mapping ───────────────
const BANK_CATEGORY_MAP: Record<string, { fundType: FundType; category: string; mealType?: 'main' | 'sub' }> = {
  'food': { fundType: 'food', category: 'Ăn uống', mealType: 'main' },
  'coffee': { fundType: 'food', category: 'Cà phê', mealType: 'sub' },
  'restaurant': { fundType: 'food', category: 'Nhà hàng', mealType: 'main' },
  'fast_food': { fundType: 'food', category: 'Thức ăn nhanh', mealType: 'main' },
  'grocery': { fundType: 'living', category: 'Siêu thị / Chợ' },
  'supermarket': { fundType: 'living', category: 'Siêu thị / Chợ' },
  'convenience_store': { fundType: 'food', category: 'Cửa hàng tiện lợi', mealType: 'sub' },
  'food_and_beverage': { fundType: 'food', category: 'Ăn uống', mealType: 'main' },
  'utilities': { fundType: 'living', category: 'Điện nước' },
  'telecom': { fundType: 'living', category: 'Viễn thông' },
  'transport': { fundType: 'living', category: 'Di chuyển' },
  'ride_hailing': { fundType: 'living', category: 'Gọi xe' },
  'fuel': { fundType: 'living', category: 'Xăng dầu' },
  'insurance': { fundType: 'living', category: 'Bảo hiểm' },
  'rent': { fundType: 'living', category: 'Thuê nhà' },
  'education': { fundType: 'growth', category: 'Giáo dục' },
  'books': { fundType: 'growth', category: 'Sách' },
  'healthcare': { fundType: 'growth', category: 'Y tế' },
  'fitness': { fundType: 'growth', category: 'Thể thao' },
  'shopping': { fundType: 'experience', category: 'Mua sắm' },
  'entertainment': { fundType: 'experience', category: 'Giải trí' },
  'travel': { fundType: 'experience', category: 'Du lịch' },
  'savings': { fundType: 'future', category: 'Tiết kiệm' },
  'investment': { fundType: 'future', category: 'Đầu tư' },
};

// ── Gemini AI Fallback ────────────────────────────────────────
async function callGeminiCategorize(
  merchantName: string,
  description: string,
  amount: number,
): Promise<{ fundType: FundType; category: string; confidence: number } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const prompt = `Bạn là hệ thống phân loại giao dịch ngân hàng cho người dùng Việt Nam.
Phân loại giao dịch sau vào đúng 1 trong 5 quỹ tài chính:
- living: Chi phí sinh hoạt cố định (thuê nhà, điện nước, internet, di chuyển, bảo hiểm)
- food: Ăn uống hàng ngày (cơm, bún, cafe, đồ ăn vặt, đặt đồ ăn)
- growth: Học tập & Phát triển (sách, khoá học, gym, sức khoẻ)
- experience: Giải trí & Trải nghiệm (mua sắm, phim, du lịch, quà tặng)
- future: Tiết kiệm & Đầu tư

Merchant: "${merchantName}"
Mô tả: "${description}"
Số tiền: ${amount.toLocaleString('vi-VN')} VNĐ

Trả lời JSON (không có markdown):
{"fundType": "...", "category": "Tên danh mục ngắn gọn bằng tiếng Việt", "confidence": 0.0-1.0}`;

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 128 },
        }),
      },
    );

    if (!resp.ok) return null;
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const cleaned = text.replace(/```json?|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (['living', 'food', 'growth', 'experience', 'future'].includes(parsed.fundType)) {
      return {
        fundType: parsed.fundType as FundType,
        category: parsed.category || 'Chi tiêu khác',
        confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.7)),
      };
    }
    return null;
  } catch {
    return null;
  }
}

// ── Main Categorize Function ─────────────────────────────────
export async function categorizeTransaction(input: {
  merchantName: string;
  description?: string;
  amount: number;
  bankCategory?: string; // from Core Banking metadata
}): Promise<CategorizationResult> {
  const { merchantName, description = '', amount, bankCategory } = input;
  const searchText = `${merchantName} ${description}`.toLowerCase();

  // ── Layer 1: Bank metadata ───────────────────────────────
  if (bankCategory) {
    const mapped = BANK_CATEGORY_MAP[bankCategory.toLowerCase()];
    if (mapped) {
      return {
        fundType: mapped.fundType,
        category: mapped.category,
        mealType: (mapped.mealType as MealType) ?? null,
        method: 'bank_metadata',
        confidence: 0.95,
        requiresReview: false,
      };
    }
  }

  // ── Layer 2: Rule Engine ─────────────────────────────────
  for (const rule of MERCHANT_RULES) {
    if (rule.patterns.some((p) => p.test(searchText))) {
      return {
        fundType: rule.fundType,
        category: rule.category,
        mealType: (rule.mealType ?? null) as MealType,
        method: 'rule_engine',
        confidence: 0.85,
        requiresReview: false,
      };
    }
  }

  // ── Layer 3: Gemini AI ───────────────────────────────────
  const aiResult = await callGeminiCategorize(merchantName, description, amount);
  if (aiResult) {
    const requiresReview = aiResult.confidence < 0.70;
    return {
      fundType: aiResult.fundType,
      category: aiResult.category,
      mealType: aiResult.fundType === 'food' ? 'main' : null,
      method: 'ai_fallback',
      confidence: aiResult.confidence,
      requiresReview,
    };
  }

  // ── Default fallback ─────────────────────────────────────
  return {
    fundType: 'experience',
    category: 'Chi tiêu khác',
    mealType: null,
    method: 'default',
    confidence: 0.3,
    requiresReview: true,
  };
}
