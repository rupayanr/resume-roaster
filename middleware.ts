import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter for middleware
// Note: This runs on the Edge runtime, so we use a simple Map
// For production with multiple instances, use @upstash/ratelimit

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || entry.resetTime < now) {
    const resetTime = now + config.windowMs
    rateLimitMap.set(identifier, { count: 1, resetTime })
    return { success: true, remaining: config.maxRequests - 1, reset: resetTime }
  }

  if (entry.count >= config.maxRequests) {
    return { success: false, remaining: 0, reset: entry.resetTime }
  }

  entry.count++
  return { success: true, remaining: config.maxRequests - entry.count, reset: entry.resetTime }
}

// Rate limit configs per endpoint
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  '/api/roast': { maxRequests: 5, windowMs: 60 * 1000 },
  '/api/hot-takes': { maxRequests: 30, windowMs: 60 * 1000 },
  '/api/reactions': { maxRequests: 20, windowMs: 60 * 1000 },
}

export function middleware(request: NextRequest) {
  // Only rate limit API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Get client identifier (IP address or forwarded header)
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'

  // Find matching rate limit config
  let config: RateLimitConfig | undefined
  for (const [path, pathConfig] of Object.entries(RATE_LIMITS)) {
    if (request.nextUrl.pathname.startsWith(path)) {
      config = pathConfig
      break
    }
  }

  // No rate limit for this path
  if (!config) {
    return NextResponse.next()
  }

  const identifier = `${ip}:${request.nextUrl.pathname}`
  const result = checkRateLimit(identifier, config)

  // Add rate limit headers
  const response = result.success
    ? NextResponse.next()
    : NextResponse.json(
        { detail: 'Too many requests. Please try again later.' },
        { status: 429 }
      )

  response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', result.reset.toString())

  if (!result.success) {
    response.headers.set('Retry-After', Math.ceil((result.reset - Date.now()) / 1000).toString())
  }

  return response
}

export const config = {
  matcher: '/api/:path*',
}
