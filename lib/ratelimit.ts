// Simple in-memory rate limiter for single-instance deployments
// For production with multiple instances, use @upstash/ratelimit with Redis

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  rateLimitMap.forEach((entry, key) => {
    if (entry.resetTime < now) {
      rateLimitMap.delete(key)
    }
  })
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const key = identifier
  const entry = rateLimitMap.get(key)

  // Create new entry or reset if window expired
  if (!entry || entry.resetTime < now) {
    const resetTime = now + config.windowMs
    rateLimitMap.set(key, { count: 1, resetTime })
    return {
      success: true,
      remaining: config.maxRequests - 1,
      reset: resetTime,
    }
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      reset: entry.resetTime,
    }
  }

  // Increment count
  entry.count++
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    reset: entry.resetTime,
  }
}

// Predefined rate limit configs
export const RATE_LIMITS = {
  // Roast endpoint: 5 requests per minute (expensive AI operation)
  roast: { maxRequests: 5, windowMs: 60 * 1000 },
  // Hot takes: 30 requests per minute (read-only)
  hotTakes: { maxRequests: 30, windowMs: 60 * 1000 },
  // Reactions: 20 requests per minute
  reactions: { maxRequests: 20, windowMs: 60 * 1000 },
}
