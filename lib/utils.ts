import crypto from 'crypto'

// Share ID validation pattern (alphanumeric, underscore, hyphen)
const SHARE_ID_PATTERN = /^[a-zA-Z0-9_-]{10,32}$/

export function generateShareId(): string {
  // Generate a cryptographically secure share ID (32 chars)
  return crypto.randomBytes(24).toString('base64url')
}

export function validateShareId(shareId: string): boolean {
  return SHARE_ID_PATTERN.test(shareId)
}

export const VALID_INTENSITIES = new Set(['mild', 'medium', 'brutal'])
export const VALID_INDUSTRIES = new Set(['tech', 'finance', 'creative', 'healthcare', 'general'])
export const VALID_REACTIONS = new Set(['fire', 'crying_laughing', 'ouch', 'facts', 'survived'])

export const MAX_FILE_SIZE_MB = 5
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export function generateContentHash(content: string, intensity: string, industry: string): string {
  // Hash the content + settings to ensure same doc with same settings = same result
  const data = `${content}|${intensity}|${industry}`
  return crypto.createHash('sha256').update(data).digest('hex')
}
