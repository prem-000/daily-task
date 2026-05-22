interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory rate limiter store.
// In high-scale multi-instance production environments, this can be swapped with Redis.
// For self-contained robust servers, an in-memory sliding-window cache prevents brute-force.
const ipCache = new Map<string, RateLimitRecord>();

interface RateLimitConfig {
  limit: number;      // Maximum requests allowed in the interval window
  windowMs: number;   // Time window in milliseconds
}

/**
 * Slide-window rate limiter to protect critical routes (login, register).
 * Returns an object indicating whether request was allowed, remaining requests, and wait duration.
 */
export function rateLimit(ip: string, config: RateLimitConfig = { limit: 5, windowMs: 60 * 1000 }) {
  const now = Date.now();
  const record = ipCache.get(ip);

  if (!record) {
    ipCache.set(ip, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: Math.ceil(config.windowMs / 1000),
    };
  }

  if (now > record.resetTime) {
    // Window expired, reset record
    record.count = 1;
    record.resetTime = now + config.windowMs;
    ipCache.set(ip, record);
    
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: Math.ceil(config.windowMs / 1000),
    };
  }

  // Under window, increment count
  record.count += 1;
  ipCache.set(ip, record);

  const remaining = Math.max(0, config.limit - record.count);
  const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

  if (record.count > config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: resetSeconds,
    };
  }

  return {
    success: true,
    limit: config.limit,
    remaining: remaining,
    reset: resetSeconds,
  };
}
