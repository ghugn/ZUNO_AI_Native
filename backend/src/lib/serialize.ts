/**
 * Recursively converts all BigInt values in an object to strings
 * for safe JSON serialization. Preserves Date objects as ISO strings.
 */
export function serializeBigInt<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (typeof data === 'bigint') return data.toString() as unknown as T;
  if (data instanceof Date) return data.toISOString() as unknown as T;
  if (Array.isArray(data)) return data.map(serializeBigInt) as unknown as T;
  if (typeof data === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      result[key] = serializeBigInt(value);
    }
    return result as T;
  }
  return data;
}
