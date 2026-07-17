import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Upstash Redis credentials are set in environment variables
const isConfigured = 
  Boolean(process.env.UPSTASH_REDIS_REST_URL) && 
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

// Initialize Redis client or null
export const redis = isConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Individual rate limit configurations for distinct endpoints
const subscribeRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"), // 5 subscriptions per minute per IP
      analytics: true,
      prefix: "linkle:ratelimit:subscribe",
    })
  : null;

const analyticsRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "10 s"), // 30 analytics tracking events per 10 seconds per IP
      analytics: true,
      prefix: "linkle:ratelimit:analytics",
    })
  : null;

const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"), // 10 auth attempts per minute per IP
      analytics: true,
      prefix: "linkle:ratelimit:auth",
    })
  : null;

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Checks the rate limit for a given key and endpoint type.
 * Gracefully falls back to allowing requests if Redis is not configured or throws an error.
 * 
 * @param key Unique key to rate limit (typically visitor's IP address)
 * @param type Target endpoint type mapping to the respective configuration
 */
export async function checkRateLimit(
  key: string,
  type: "subscribe" | "analytics" | "auth"
): Promise<RateLimitResult> {
  if (!redis) {
    // Bypass rate limiting if Upstash Redis is not configured
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    };
  }

  try {
    let limiter: Ratelimit | null = null;

    switch (type) {
      case "subscribe":
        limiter = subscribeRateLimiter;
        break;
      case "analytics":
        limiter = analyticsRateLimiter;
        break;
      case "auth":
        limiter = authRateLimiter;
        break;
    }

    if (!limiter) {
      return { success: true, limit: 0, remaining: 0, reset: 0 };
    }

    const result = await limiter.limit(key);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error(`Rate limit check error for ${type}:`, error);
    // Graceful fallback to prevent user lockout in case of connectivity issues
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    };
  }
}
