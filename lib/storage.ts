import type { RoastHistoryEntry } from '@/types'

const STORAGE_KEY = 'resume_roaster_history'
const MAX_HISTORY_ENTRIES = 10

/**
 * Save a roast to localStorage history
 */
export function saveToHistory(entry: RoastHistoryEntry): void {
  if (typeof window === 'undefined') return

  try {
    const history = getHistory()

    // Add new entry at the beginning
    history.unshift(entry)

    // Keep only the last MAX_HISTORY_ENTRIES
    const trimmedHistory = history.slice(0, MAX_HISTORY_ENTRIES)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory))
  } catch {
    // Silently fail if localStorage is unavailable
    console.warn('Failed to save to localStorage')
  }
}

/**
 * Get all roast history from localStorage
 */
export function getHistory(): RoastHistoryEntry[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []

    return parsed as RoastHistoryEntry[]
  } catch {
    // Silently fail if localStorage is unavailable or corrupted
    return []
  }
}

/**
 * Clear all roast history from localStorage
 */
export function clearHistory(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Silently fail if localStorage is unavailable
    console.warn('Failed to clear localStorage')
  }
}

/**
 * Get the best score from history
 */
export function getBestScore(): number | null {
  const history = getHistory()
  if (history.length === 0) return null

  return Math.max(...history.map(entry => entry.score))
}

/**
 * Check if the current score is a new personal best
 */
export function isNewBest(score: number): boolean {
  const bestScore = getBestScore()
  return bestScore === null || score > bestScore
}
