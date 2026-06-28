import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  createId,
  getDateOnly,
  getMonthStart,
  isSameMonth,
  readDb,
  readRequestBody,
  sendError,
  sendJson,
  sortByDateDesc,
  toMoneyString,
  toNumber,
  writeDb,
} from './utils.mjs';

const PORT = Number(process.env.MOCK_API_PORT || 4000);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.MOCK_DB_PATH || path.join(__dirname, 'db.json');

function getPathParts(url) {
  return url.pathname.split('/').filter(Boolean);
}

function getCollection(db, key) {
  if (!Array.isArray(db[key])) {
    db[key] = [];
  }
  return db[key];
}

function getFundById(db, fundId) {
  return getCollection(db, 'funds').find((fund) => fund.id === fundId);
}

function addDaysToDateOnly(value, days) {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getWeekStart(value = new Date()) {
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00.000Z`) : new Date(value);
  const dayIndex = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayIndex);
  return date.toISOString().slice(0, 10);
}

function getCurrentWeekAiMicroInsights() {
  const weekStart = getWeekStart(new Date());
  return [
    {
      id: `ai_micro_${weekStart}_0`,
      date: addDaysToDateOnly(weekStart, 0),
      severity: 'warning',
      overflowLevel: 'level_1',
      overflowAmount: 36000,
      reason: 'ăn sáng và cà phê',
      message: 'Bạn tiêu lố 36k do ăn sáng và cà phê. Giảm nhẹ bữa phụ hôm sau là đủ quay về nhịp an toàn.',
      actionLabel: 'Details',
      actionHref: '/notifications',
    },
    {
      id: `ai_micro_${weekStart}_1`,
      date: addDaysToDateOnly(weekStart, 1),
      severity: 'warning',
      overflowLevel: 'level_1',
      overflowAmount: 42000,
      reason: 'ăn ngoài và đồ uống',
      message: 'Bạn tiêu lố 42k do ăn ngoài và đồ uống. Giảm 14k/ngày trong 3 ngày tới là đủ kéo Food về vùng an toàn.',
      actionLabel: 'Xem đề xuất điều chỉnh',
      actionHref: '/notifications',
    },
    {
      id: `ai_micro_${weekStart}_2`,
      date: addDaysToDateOnly(weekStart, 2),
      severity: 'danger',
      overflowLevel: 'level_2',
      overflowAmount: 120000,
      reason: 'ăn ngoài',
      message: 'Bạn tiêu lố 120k do ăn ngoài. ZUNO gợi ý giảm bữa chính ngày mai để giữ streak tuần này.',
      actionLabel: 'Details',
      actionHref: '/notifications',
    },
    {
      id: `ai_micro_${weekStart}_3`,
      date: addDaysToDateOnly(weekStart, 3),
      severity: 'warning',
      overflowLevel: 'level_1',
      overflowAmount: 68000,
      reason: 'đặt đồ ăn khuya',
      message: 'Bạn lố 68k vì đặt đồ ăn khuya. ZUNO gợi ý chuyển bữa phụ ngày mai về 20k để không chạm quỹ dự phòng.',
      actionLabel: 'Xem chi tiết nguyên nhân',
      actionHref: '/notifications',
    },
    {
      id: `ai_micro_${weekStart}_4`,
      date: addDaysToDateOnly(weekStart, 4),
      severity: 'warning',
      overflowLevel: 'level_1',
      overflowAmount: 54000,
      reason: 'Food and Drinks',
      message: 'Bạn tiêu lố 54k cho Food and Drinks. Dời một bữa phụ sang ngày mai sẽ giúp cân lại ngân sách.',
      actionLabel: 'Details',
      actionHref: '/notifications',
    },
    {
      id: `ai_micro_${weekStart}_5`,
      date: addDaysToDateOnly(weekStart, 5),
      severity: 'danger',
      overflowLevel: 'level_2',
      overflowAmount: 120000,
      reason: 'ăn ngoài cuối tuần',
      message: 'Bạn tiêu lố 120k vào cuối tuần do ăn ngoài. Nếu giữ bữa chính dưới 55k hôm sau, tuần này vẫn có thể giữ streak.',
      actionLabel: 'Mở phân tích tối ưu',
      actionHref: '/notifications',
    },
  ];
}

function formatMonthDay(value) {
  return new Date(`${value}T00:00:00.000Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

function getSmartHubMockSuggestion(date) {
  const dateValue = new Date(`${date}T00:00:00.000Z`);
  const isWeekendBuffer = dateValue.getUTCDay() === 5 || dateValue.getUTCDay() === 6 || dateValue.getUTCDay() === 0;

  if (isWeekendBuffer) {
    return {
      id: `smart_hub_weekend_${date}`,
      date,
      scenario: 'weekend_buffer',
      title: 'ZUNO SMART HUB',
      suggestions: [
        `AI estimates that your Food and Drinks budget will exhaust on ${formatMonthDay(addDaysToDateOnly(date, 1))}.`,
        'You usually overspend on Saturday snacks. Set aside a 120.000 VNĐ weekend buffer from Experience?',
      ],
      primaryActionLabel: 'Yes',
      secondaryActionLabel: 'No',
    };
  }

  return {
    id: `smart_hub_subscription_${date}`,
    date,
    scenario: 'subscription_leak',
    title: 'ZUNO SMART HUB',
    suggestions: [
      `AI found a recurring subscription renewal in 7 days on ${formatMonthDay(addDaysToDateOnly(date, 7))}.`,
      'Spotify Student may renew for 59.000 VNĐ. Do you want to renew this subscription?',
    ],
    primaryActionLabel: 'Yes',
    secondaryActionLabel: 'No',
  };
}

function updateFundForTransaction(db, transaction) {
  const fund = getFundById(db, transaction.fundId);
  if (!fund) {
    return;
  }

  const amount = toNumber(transaction.amount);
  if (transaction.transactionType === 'expense' || transaction.transactionType === 'transfer') {
    fund.spentAmount = toMoneyString(toNumber(fund.spentAmount) + amount);
  }

  if (transaction.transactionType === 'income') {
    fund.allocatedAmount = toMoneyString(toNumber(fund.allocatedAmount) + amount);
  }

  if (transaction.transactionType === 'transfer' && transaction.targetFundId) {
    const targetFund = getFundById(db, transaction.targetFundId);
    if (targetFund) {
      targetFund.allocatedAmount = toMoneyString(toNumber(targetFund.allocatedAmount) + amount);
      targetFund.updatedAt = new Date().toISOString();
      targetFund.version = toNumber(targetFund.version, 1) + 1;
    }
  }

  fund.updatedAt = new Date().toISOString();
  fund.version = toNumber(fund.version, 1) + 1;
}

function updateDailyFoodForTransaction(db, transaction) {
  const fund = getFundById(db, transaction.fundId);
  if (!fund || fund.fundType !== 'food' || transaction.transactionType !== 'expense') {
    return null;
  }

  const date = getDateOnly(transaction.transactionDate);
  const dailyFood = getCollection(db, 'dailyFood').find((record) => record.date === date);
  if (!dailyFood) {
    return null;
  }

  const amount = toNumber(transaction.amount);
  const spentField = transaction.mealType === 'sub' ? 'spentSub' : 'spentMain';
  dailyFood[spentField] = toMoneyString(toNumber(dailyFood[spentField]) + amount);

  const effectiveBudget =
    toNumber(dailyFood.budgetMain) +
    toNumber(dailyFood.budgetSub) -
    toNumber(dailyFood.penaltyAppliedFromYesterday);
  const totalSpent = toNumber(dailyFood.spentMain) + toNumber(dailyFood.spentSub);
  const overflow = Math.max(0, totalSpent - effectiveBudget);

  dailyFood.dailyOverflow = toMoneyString(overflow);
  dailyFood.savedAmount = toMoneyString(Math.max(0, effectiveBudget - totalSpent));

  return { dailyFood, overflow };
}

function createOverflowForTransaction(db, transaction, dailyFoodResult) {
  if (!dailyFoodResult || dailyFoodResult.overflow <= 0) {
    return null;
  }

  const eventDate = getDateOnly(transaction.transactionDate);
  const month = getMonthStart(eventDate);
  const actions = [];
  let remaining = dailyFoodResult.overflow;
  let highestLevel = 'level_1';

  const pushOverflow = ({ level, amount, borrowedFromFundType = null, status, penaltyApplied }) => {
    getCollection(db, 'overflows').push({
      id: createId('overflow'),
      userId: transaction.userId,
      transactionId: transaction.id,
      eventDate,
      overflowLevel: level,
      overflowAmount: toMoneyString(amount),
      sourceFundType: 'food',
      borrowedFromFundType,
      repaidAmount: '0',
      status,
      penaltyApplied,
    });
  };

  const futureDays = getCollection(db, 'dailyFood')
    .filter((record) => record.date > eventDate && getMonthStart(record.date) === month)
    .sort((left, right) => left.date.localeCompare(right.date));
  const totalAvailableSub = futureDays.reduce(
    (sum, record) => sum + Math.max(0, toNumber(record.budgetSub) - toNumber(record.penaltyAppliedFromYesterday)),
    0,
  );
  const level1Amount = Math.min(remaining, totalAvailableSub);
  if (level1Amount > 0 && futureDays.length > 0) {
    const penaltyPerDay = Math.floor(level1Amount / futureDays.length);
    const remainder = level1Amount - penaltyPerDay * futureDays.length;
    futureDays.forEach((record, index) => {
      const penalty = penaltyPerDay + (index === futureDays.length - 1 ? remainder : 0);
      record.penaltyAppliedFromYesterday = toMoneyString(toNumber(record.penaltyAppliedFromYesterday) + penalty);
    });
    actions.push({
      level: 'level_1',
      amount: toMoneyString(level1Amount),
      source: 'budgetSub_remaining_days',
      description: `Reduce snack budget by ${penaltyPerDay} VND/day for ${futureDays.length} remaining days`,
    });
    pushOverflow({
      level: 'level_1',
      amount: level1Amount,
      status: 'repaid',
      penaltyApplied: { penaltyPerDay: toMoneyString(penaltyPerDay), daysAffected: futureDays.length },
    });
    remaining -= level1Amount;
  }

  const borrowFromWeeklySavings = () => {
    const reward = getCollection(db, 'weeklyRewards').find((item) => item.weekStart <= eventDate && item.weekEnd >= eventDate);
    const amount = Math.min(remaining, toNumber(reward?.accumulatedSavings));
    if (!reward || amount <= 0) return;
    highestLevel = 'level_2';
    reward.accumulatedSavings = toMoneyString(toNumber(reward.accumulatedSavings) - amount);
    actions.push({ level: 'level_2', amount: toMoneyString(amount), source: 'weekly_savings', description: `Use ${amount} VND from weekly savings` });
    pushOverflow({ level: 'level_2', amount, status: 'repaid', penaltyApplied: { source: 'weekly_savings' } });
    remaining -= amount;
  };

  const borrowFromFund = (fundType) => {
    const fund = getCollection(db, 'funds').find((item) => item.month === month && item.fundType === fundType);
    const amount = Math.min(remaining, Math.max(0, toNumber(fund?.allocatedAmount) - toNumber(fund?.spentAmount)));
    if (!fund || amount <= 0) return;
    highestLevel = 'level_2';
    fund.spentAmount = toMoneyString(toNumber(fund.spentAmount) + amount);
    const foodFund = getCollection(db, 'funds').find((item) => item.month === month && item.fundType === 'food');
    if (foodFund) foodFund.borrowAmount = toMoneyString(toNumber(foodFund.borrowAmount) + amount);
    actions.push({ level: 'level_2', amount: toMoneyString(amount), source: fundType, description: `Borrow ${amount} VND from ${fundType}` });
    pushOverflow({ level: 'level_2', amount, borrowedFromFundType: fundType, status: 'pending', penaltyApplied: null });
    remaining -= amount;
  };

  if (remaining > 0) borrowFromWeeklySavings();
  if (remaining > 0) borrowFromFund('experience');
  if (remaining > 0) borrowFromFund('growth');

  if (remaining > 0) {
    highestLevel = 'level_3';
    const futureFund = getCollection(db, 'funds').find((item) => item.month === month && item.fundType === 'future');
    const amount = Math.min(remaining, Math.max(0, toNumber(futureFund?.allocatedAmount) - toNumber(futureFund?.spentAmount)));
    if (futureFund && amount > 0) {
      futureFund.spentAmount = toMoneyString(toNumber(futureFund.spentAmount) + amount);
      futureFund.isLocked = false;
      const foodFund = getCollection(db, 'funds').find((item) => item.month === month && item.fundType === 'food');
      if (foodFund) foodFund.borrowAmount = toMoneyString(toNumber(foodFund.borrowAmount) + amount);
    }
    const previousMultiplier = toNumber(db.rewardPoints?.multiplier, 1);
    const newMultiplier = Math.max(0.1, previousMultiplier - 0.1);
    if (db.rewardPoints) db.rewardPoints.multiplier = newMultiplier.toFixed(2);
    const reward = getCollection(db, 'weeklyRewards').find((item) => item.weekStart <= eventDate && item.weekEnd >= eventDate);
    if (reward) reward.isUnlocked = false;
    if (amount > 0) actions.push({ level: 'level_3', amount: toMoneyString(amount), source: 'future', description: `Use ${amount} VND from future savings` });
    pushOverflow({
      level: 'level_3',
      amount: remaining,
      borrowedFromFundType: 'future',
      status: 'pending',
      penaltyApplied: { lockWeeklyChest: true, multiplierDeduction: 0.1, previousMultiplier, newMultiplier, borrowedAmount: toMoneyString(amount) },
    });
  }

  return { totalOverspent: toMoneyString(dailyFoodResult.overflow), highestLevel, actions };
}

function parseMockInput(rawInput) {
  const amountMatch = rawInput.match(/(\d+(?:[.,]\d+)?)\s*(k|nghin|ngàn|000)?/i);
  const parsedAmount = amountMatch
    ? Math.round(toNumber(amountMatch[1].replace(',', '.')) * (amountMatch[2] ? 1000 : 1))
    : null;
  const normalized = rawInput.toLowerCase();
  const parsedCategory =
    normalized.includes('cafe') ||
    normalized.includes('coffee') ||
    normalized.includes('tra') ||
    normalized.includes('bun') ||
    normalized.includes('com')
      ? 'Food and Drinks'
      : normalized.includes('movie') || normalized.includes('game')
        ? 'Experience'
        : 'Food and Drinks';

  return {
    parsedEntity: rawInput.replace(amountMatch?.[0] || '', '').trim() || rawInput,
    parsedAmount,
    parsedCategory,
  };
}

async function handleRequest(req, res) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const parts = getPathParts(url);

  if (parts[0] !== 'api') {
    sendError(res, 404, 'Mock API route not found');
    return;
  }

  try {
    const db = await readDb(DB_PATH);
    const method = req.method || 'GET';
    const resource = parts[1];

    if (method === 'GET' && resource === 'profile' && parts.length === 2) {
      sendJson(res, 200, db.profile);
      return;
    }

    if (method === 'GET' && resource === 'funds') {
      if (parts[2] === 'templates') {
        sendJson(res, 200, getCollection(db, 'fundTemplates'));
        return;
      }

      if (parts.length === 2) {
        const month = url.searchParams.get('month') || getMonthStart();
        sendJson(res, 200, getCollection(db, 'funds').filter((fund) => getMonthStart(fund.month) === month));
        return;
      }
    }

    if (resource === 'transactions') {
      if (method === 'GET' && parts.length === 2) {
        const month = url.searchParams.get('month');
        const transactions = month
          ? getCollection(db, 'transactions').filter((transaction) => isSameMonth(transaction.transactionDate, month))
          : getCollection(db, 'transactions');
        sendJson(res, 200, sortByDateDesc(transactions, 'transactionDate'));
        return;
      }

      if (method === 'POST' && parts.length === 2) {
        const body = await readRequestBody(req);
        const { fundId, amount, transactionType, category } = body;
        if (!fundId || amount === undefined || !transactionType || !category) {
          sendError(res, 400, 'fundId, amount, transactionType, category required');
          return;
        }

        if (transactionType === 'transfer' && !body.targetFundId) {
          sendError(res, 400, 'targetFundId required for transfer');
          return;
        }

        const fund = getFundById(db, fundId);
        if (!fund) {
          sendError(res, 404, 'Fund not found');
          return;
        }

        const now = new Date().toISOString();
        const transaction = {
          id: createId('tx'),
          userId: db.profile?.userId || 'user_demo',
          fundId,
          amount: toMoneyString(amount),
          transactionType,
          category,
          description: body.description || null,
          inputMethod: body.inputMethod || 'manual',
          aiConfidence: body.aiConfidence ?? null,
          isAiCorrected: body.isAiCorrected ?? false,
          mealType: body.mealType ?? null,
          transactionDate: body.transactionDate || now,
          targetFundId: body.targetFundId ?? null,
          createdAt: now,
        };

        getCollection(db, 'transactions').push(transaction);
        updateFundForTransaction(db, transaction);
        const dailyFoodResult = updateDailyFoodForTransaction(db, transaction);
        const overflow = createOverflowForTransaction(db, transaction, dailyFoodResult);

        await writeDb(DB_PATH, db);
        sendJson(res, 201, {
          ...transaction,
          ...(overflow ? { overflow } : {}),
        });
        return;
      }
    }

    if (resource === 'daily-food') {
      if (method === 'GET' && parts[2] === 'month') {
        const month = url.searchParams.get('month');
        if (!month) {
          sendError(res, 400, 'month query param required (YYYY-MM-01)');
          return;
        }

        sendJson(res, 200, getCollection(db, 'dailyFood').filter((record) => getMonthStart(record.date) === month));
        return;
      }

      if (method === 'GET' && parts.length === 2) {
        const date = url.searchParams.get('date');
        if (!date) {
          sendError(res, 400, 'date query param required');
          return;
        }

        const record = getCollection(db, 'dailyFood').find((item) => item.date === date);
        if (!record) {
          sendError(res, 404, 'No daily food savings record for this date');
          return;
        }

        sendJson(res, 200, record);
        return;
      }
    }

    if (resource === 'overflows') {
      if (method === 'GET' && parts[2] === 'pending') {
        sendJson(res, 200, getCollection(db, 'overflows').filter((event) => event.status === 'pending' || event.status === 'partial'));
        return;
      }

      if (method === 'GET' && parts.length === 2) {
        const month = url.searchParams.get('month');
        const overflows = month
          ? getCollection(db, 'overflows').filter((event) => getMonthStart(event.eventDate) === month)
          : getCollection(db, 'overflows');
        sendJson(res, 200, sortByDateDesc(overflows, 'eventDate'));
        return;
      }
    }

    if (resource === 'ai-micro-insights') {
      if (method === 'GET' && parts[2] === 'by-date') {
        const date = url.searchParams.get('date');
        if (!date) {
          sendError(res, 400, 'date query param required');
          return;
        }
        const insight = getCurrentWeekAiMicroInsights().find((item) => item.date === date) || null;
        sendJson(res, 200, insight);
        return;
      }

      if (method === 'GET' && parts.length === 2) {
        const weekStart = url.searchParams.get('weekStart') || getWeekStart(new Date());
        sendJson(res, 200, getCurrentWeekAiMicroInsights().filter((item) => getWeekStart(item.date) === weekStart));
        return;
      }
    }

    if (resource === 'smart-hub') {
      if (method === 'GET' && parts.length === 2) {
        const date = url.searchParams.get('date');
        if (!date) {
          sendError(res, 400, 'date query param required');
          return;
        }
        sendJson(res, 200, getSmartHubMockSuggestion(date));
        return;
      }
    }

    if (resource === 'rewards') {
      if (method === 'GET' && parts[2] === 'weekly' && parts.length === 3) {
        const weekStart = url.searchParams.get('weekStart');
        if (!weekStart) {
          sendError(res, 400, 'weekStart query param required');
          return;
        }

        const reward = getCollection(db, 'weeklyRewards').find((item) => item.weekStart === weekStart);
        if (!reward) {
          sendError(res, 404, 'Weekly reward not found');
          return;
        }

        sendJson(res, 200, reward);
        return;
      }

      if (method === 'GET' && parts[2] === 'weekly' && parts[3] === 'month') {
        const month = url.searchParams.get('month');
        if (!month) {
          sendError(res, 400, 'month query param required');
          return;
        }
        sendJson(res, 200, getCollection(db, 'weeklyRewards').filter((reward) => getMonthStart(reward.weekStart) === month));
        return;
      }

      if (method === 'GET' && parts[2] === 'points') {
        sendJson(res, 200, db.rewardPoints);
        return;
      }
    }

    if (resource === 'ai-logs') {
      if (method === 'GET' && parts.length === 2) {
        const limit = Number(url.searchParams.get('limit') || 50);
        sendJson(res, 200, sortByDateDesc(getCollection(db, 'aiLogs'), 'createdAt').slice(0, limit));
        return;
      }

      if (method === 'POST' && parts.length === 2) {
        const body = await readRequestBody(req);
        if (!body.rawInput) {
          sendError(res, 400, 'rawInput required');
          return;
        }

        const parsed = parseMockInput(body.rawInput);
        const log = {
          id: createId('ai_log'),
          userId: db.profile?.userId || 'user_demo',
          transactionId: null,
          rawInput: body.rawInput,
          parsedEntity: body.parsedEntity ?? parsed.parsedEntity,
          parsedAmount: body.parsedAmount ?? parsed.parsedAmount,
          parsedCategory: body.parsedCategory ?? parsed.parsedCategory,
          userCorrection: null,
          createdAt: new Date().toISOString(),
        };
        getCollection(db, 'aiLogs').push(log);
        await writeDb(DB_PATH, db);
        sendJson(res, 201, log);
        return;
      }
    }

    sendError(res, 404, 'Mock API route not found');
  } catch (error) {
    sendError(res, error.status || 500, error.message || 'Mock API error');
  }
}

createServer(handleRequest).listen(PORT, () => {
  console.log(`[mock-api] Zuno mock API running at http://localhost:${PORT}`);
});
