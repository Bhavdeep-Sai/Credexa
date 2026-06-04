interface RateLimitEntry {
  count: number;
  resetTime: number;
}

declare global {
  // eslint-disable-next-line no-var
  var rateLimitCache: Record<string, RateLimitEntry> | undefined;
}

const cache = global.rateLimitCache || {};
if (!global.rateLimitCache) {
  global.rateLimitCache = cache;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Basic in-memory rate limiter helper for API routes
 * @param key Unique key to track (e.g. IP address, user ID, or endpoint key)
 * @param limit Max allowed requests within window
 * @param windowMs Window size in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const entry = cache[key];

  if (!entry || now > entry.resetTime) {
    // Start a new window
    cache[key] = {
      count: 1,
      resetTime: now + windowMs,
    };

    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + windowMs,
    };
  }

  // Inside window
  if (entry.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  entry.count += 1;

  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset: entry.resetTime,
  };
}
