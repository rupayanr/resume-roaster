import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkRateLimit, RATE_LIMITS } from '../ratelimit'

describe('ratelimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  describe('checkRateLimit', () => {
    const config = { maxRequests: 3, windowMs: 1000 }

    it('allows requests under the limit', () => {
      const result1 = checkRateLimit('test-user-1', config)
      expect(result1.success).toBe(true)
      expect(result1.remaining).toBe(2)

      const result2 = checkRateLimit('test-user-1', config)
      expect(result2.success).toBe(true)
      expect(result2.remaining).toBe(1)

      const result3 = checkRateLimit('test-user-1', config)
      expect(result3.success).toBe(true)
      expect(result3.remaining).toBe(0)
    })

    it('blocks requests over the limit', () => {
      // Use up all requests
      checkRateLimit('test-user-2', config)
      checkRateLimit('test-user-2', config)
      checkRateLimit('test-user-2', config)

      // This should be blocked
      const result = checkRateLimit('test-user-2', config)
      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('resets after window expires', () => {
      // Use up all requests
      checkRateLimit('test-user-3', config)
      checkRateLimit('test-user-3', config)
      checkRateLimit('test-user-3', config)

      // Advance time past the window
      vi.advanceTimersByTime(1001)

      // Should be allowed again
      const result = checkRateLimit('test-user-3', config)
      expect(result.success).toBe(true)
      expect(result.remaining).toBe(2)
    })

    it('tracks different identifiers separately', () => {
      checkRateLimit('user-a', config)
      checkRateLimit('user-a', config)
      checkRateLimit('user-a', config)

      // user-a is blocked
      const resultA = checkRateLimit('user-a', config)
      expect(resultA.success).toBe(false)

      // user-b should still be allowed
      const resultB = checkRateLimit('user-b', config)
      expect(resultB.success).toBe(true)
      expect(resultB.remaining).toBe(2)
    })

    it('returns reset time', () => {
      const now = Date.now()
      const result = checkRateLimit('test-user-4', config)

      expect(result.reset).toBeGreaterThan(now)
      expect(result.reset).toBeLessThanOrEqual(now + config.windowMs)
    })
  })

  describe('RATE_LIMITS', () => {
    it('defines roast rate limit', () => {
      expect(RATE_LIMITS.roast).toBeDefined()
      expect(RATE_LIMITS.roast.maxRequests).toBe(5)
      expect(RATE_LIMITS.roast.windowMs).toBe(60 * 1000)
    })

    it('defines hotTakes rate limit', () => {
      expect(RATE_LIMITS.hotTakes).toBeDefined()
      expect(RATE_LIMITS.hotTakes.maxRequests).toBe(30)
      expect(RATE_LIMITS.hotTakes.windowMs).toBe(60 * 1000)
    })

    it('defines reactions rate limit', () => {
      expect(RATE_LIMITS.reactions).toBeDefined()
      expect(RATE_LIMITS.reactions.maxRequests).toBe(20)
      expect(RATE_LIMITS.reactions.windowMs).toBe(60 * 1000)
    })
  })
})
