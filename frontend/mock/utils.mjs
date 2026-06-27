import { readFile, writeFile } from 'node:fs/promises';

export async function readDb(dbPath) {
  const raw = await readFile(dbPath, 'utf8');
  return JSON.parse(raw);
}

export async function writeDb(dbPath, db) {
  await writeFile(dbPath, `${JSON.stringify(db, null, 2)}\n`, 'utf8');
}

export function sendJson(res, status, data) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Content-Type': 'application/json; charset=utf-8',
  });
  res.end(JSON.stringify(data));
}

export function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

export async function readRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error('Invalid JSON body');
    error.status = 400;
    throw error;
  }
}

export function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toMoneyString(value) {
  return String(Math.max(0, Math.round(toNumber(value))));
}

export function getDateOnly(value = new Date()) {
  return new Date(value).toISOString().slice(0, 10);
}

export function getMonthStart(value = new Date()) {
  return `${getDateOnly(value).slice(0, 7)}-01`;
}

export function isSameMonth(value, month) {
  return getMonthStart(value) === month;
}

export function sortByDateDesc(items, field) {
  return [...items].sort((left, right) => new Date(right[field]).getTime() - new Date(left[field]).getTime());
}
