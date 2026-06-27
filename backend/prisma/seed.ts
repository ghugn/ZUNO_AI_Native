/**
 * ZUNO Seed — chỉ seed FundTemplates.
 * 10 tài khoản ngân hàng mock đã có sẵn hardcode trong frontend (connect-bank/page.tsx).
 * Chạy: npm run db:seed
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const templates = [
    { id: 'template-dorm', name: 'Dorm Student',        residenceType: 'dorm',         livingPct: 7.5, foodPct: 65, growthPct: 10, experiencePct: 7.5, futurePct: 10, isDefault: true  },
    { id: 'template-rent', name: 'Room Renter',          residenceType: 'rent',         livingPct: 20,  foodPct: 45, growthPct: 10, experiencePct: 15,  futurePct: 10, isDefault: true  },
    { id: 'template-pro',  name: 'Working Professional', residenceType: 'professional', livingPct: 40,  foodPct: 25, growthPct: 10, experiencePct: 15,  futurePct: 10, isDefault: false },
  ];

  for (const t of templates) {
    await prisma.fundTemplate.upsert({ where: { id: t.id }, update: t, create: t });
    console.log(`✅ FundTemplate: ${t.name}`);
  }

  console.log('\n✨ Seed xong!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
