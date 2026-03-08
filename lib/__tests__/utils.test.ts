import { describe, it, expect } from 'vitest'
import {
  generateShareId,
  validateShareId,
  VALID_INTENSITIES,
  VALID_INDUSTRIES,
  VALID_REACTIONS,
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES,
} from '../utils'

describe('utils', () => {
  describe('generateShareId', () => {
    it('generates a share ID', () => {
      const shareId = generateShareId()
      expect(typeof shareId).toBe('string')
      expect(shareId.length).toBeGreaterThan(0)
    })

    it('generates 32-character share IDs', () => {
      const shareId = generateShareId()
      expect(shareId.length).toBe(32)
    })

    it('generates unique share IDs', () => {
      const ids = new Set<string>()
      for (let i = 0; i < 100; i++) {
        ids.add(generateShareId())
      }
      expect(ids.size).toBe(100)
    })

    it('generates URL-safe share IDs', () => {
      const shareId = generateShareId()
      // base64url uses alphanumeric, underscore, and hyphen
      expect(shareId).toMatch(/^[a-zA-Z0-9_-]+$/)
    })

    it('generates share IDs that pass validation', () => {
      for (let i = 0; i < 10; i++) {
        const shareId = generateShareId()
        expect(validateShareId(shareId)).toBe(true)
      }
    })
  })

  describe('validateShareId', () => {
    it('validates correctly formatted share IDs', () => {
      expect(validateShareId('abc123def456')).toBe(true)
      expect(validateShareId('ABC123DEF456')).toBe(true)
      expect(validateShareId('abc-123_def')).toBe(true)
    })

    it('validates share IDs at minimum length (10 chars)', () => {
      expect(validateShareId('1234567890')).toBe(true)
    })

    it('validates share IDs at maximum length (32 chars)', () => {
      expect(validateShareId('12345678901234567890123456789012')).toBe(true)
    })

    it('rejects share IDs that are too short', () => {
      expect(validateShareId('abc')).toBe(false)
      expect(validateShareId('123456789')).toBe(false)
    })

    it('rejects share IDs that are too long', () => {
      expect(validateShareId('123456789012345678901234567890123')).toBe(false)
    })

    it('rejects share IDs with invalid characters', () => {
      expect(validateShareId('abc@123')).toBe(false)
      expect(validateShareId('abc 123')).toBe(false)
      expect(validateShareId('abc.123')).toBe(false)
      expect(validateShareId('abc!123def')).toBe(false)
      expect(validateShareId('abc#123def')).toBe(false)
    })

    it('rejects empty string', () => {
      expect(validateShareId('')).toBe(false)
    })

    it('allows underscores and hyphens', () => {
      expect(validateShareId('abc_def_ghi')).toBe(true)
      expect(validateShareId('abc-def-ghi')).toBe(true)
      expect(validateShareId('abc_def-ghi')).toBe(true)
    })
  })

  describe('VALID_INTENSITIES', () => {
    it('contains mild, medium, and brutal', () => {
      expect(VALID_INTENSITIES.has('mild')).toBe(true)
      expect(VALID_INTENSITIES.has('medium')).toBe(true)
      expect(VALID_INTENSITIES.has('brutal')).toBe(true)
    })

    it('contains exactly 3 intensities', () => {
      expect(VALID_INTENSITIES.size).toBe(3)
    })

    it('does not contain invalid intensities', () => {
      expect(VALID_INTENSITIES.has('soft')).toBe(false)
      expect(VALID_INTENSITIES.has('extreme')).toBe(false)
      expect(VALID_INTENSITIES.has('')).toBe(false)
    })
  })

  describe('VALID_INDUSTRIES', () => {
    it('contains all expected industries', () => {
      expect(VALID_INDUSTRIES.has('tech')).toBe(true)
      expect(VALID_INDUSTRIES.has('finance')).toBe(true)
      expect(VALID_INDUSTRIES.has('creative')).toBe(true)
      expect(VALID_INDUSTRIES.has('healthcare')).toBe(true)
      expect(VALID_INDUSTRIES.has('general')).toBe(true)
    })

    it('contains exactly 5 industries', () => {
      expect(VALID_INDUSTRIES.size).toBe(5)
    })

    it('does not contain invalid industries', () => {
      expect(VALID_INDUSTRIES.has('retail')).toBe(false)
      expect(VALID_INDUSTRIES.has('education')).toBe(false)
      expect(VALID_INDUSTRIES.has('')).toBe(false)
    })
  })

  describe('VALID_REACTIONS', () => {
    it('contains all expected reactions', () => {
      expect(VALID_REACTIONS.has('fire')).toBe(true)
      expect(VALID_REACTIONS.has('crying_laughing')).toBe(true)
      expect(VALID_REACTIONS.has('ouch')).toBe(true)
      expect(VALID_REACTIONS.has('facts')).toBe(true)
      expect(VALID_REACTIONS.has('survived')).toBe(true)
    })

    it('contains exactly 5 reactions', () => {
      expect(VALID_REACTIONS.size).toBe(5)
    })

    it('does not contain invalid reactions', () => {
      expect(VALID_REACTIONS.has('thumbs_up')).toBe(false)
      expect(VALID_REACTIONS.has('love')).toBe(false)
      expect(VALID_REACTIONS.has('')).toBe(false)
    })
  })

  describe('MAX_FILE_SIZE constants', () => {
    it('MAX_FILE_SIZE_MB is 5', () => {
      expect(MAX_FILE_SIZE_MB).toBe(5)
    })

    it('MAX_FILE_SIZE_BYTES is correctly calculated', () => {
      expect(MAX_FILE_SIZE_BYTES).toBe(5 * 1024 * 1024)
      expect(MAX_FILE_SIZE_BYTES).toBe(5242880)
    })

    it('MAX_FILE_SIZE_BYTES equals MAX_FILE_SIZE_MB * 1024 * 1024', () => {
      expect(MAX_FILE_SIZE_BYTES).toBe(MAX_FILE_SIZE_MB * 1024 * 1024)
    })
  })
})
