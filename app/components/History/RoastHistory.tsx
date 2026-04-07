'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { History, TrendingUp, ExternalLink, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { getHistory, clearHistory, getBestScore } from '@/lib/storage'
import type { RoastHistoryEntry } from '@/types'

const PERSONA_EMOJI: Record<string, string> = {
  default: '',
  gordon_ramsay: '',
  supportive_mom: '',
  silicon_valley_vc: '',
  gen_z_intern: '',
  shakespeare: '',
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-yellow-400'
  if (score >= 40) return 'text-orange-400'
  return 'text-red-400'
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-500/20 border-green-500/30'
  if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30'
  if (score >= 40) return 'bg-orange-500/20 border-orange-500/30'
  return 'bg-red-500/20 border-red-500/30'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60))
      return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`
    }
    return `${diffHours}h ago`
  }
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function RoastHistory() {
  const [history, setHistory] = useState<RoastHistoryEntry[]>([])
  const [bestScore, setBestScore] = useState<number | null>(null)

  useEffect(() => {
    setHistory(getHistory())
    setBestScore(getBestScore())
  }, [])

  const handleClear = () => {
    if (confirm('Clear your roast history? This cannot be undone.')) {
      clearHistory()
      setHistory([])
      setBestScore(null)
    }
  }

  if (history.length === 0) {
    return null
  }

  const displayHistory = history.slice(0, 5)
  const avgScore = Math.round(history.reduce((sum, h) => sum + h.score, 0) / history.length)

  return (
    <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
            <History className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Your Roast History</h3>
            <p className="text-sm text-gray-500">
              {history.length} roast{history.length !== 1 ? 's' : ''} tracked
            </p>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Clear history"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            Best Score
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(bestScore || 0)}`}>
            {bestScore || 0}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="text-gray-400 text-sm mb-1">Average</div>
          <div className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>
            {avgScore}
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {displayHistory.map((entry, index) => (
          <motion.div
            key={`${entry.shareId}-${index}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={`/r/${entry.shareId}`}
              className="flex items-center gap-4 p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/60 border border-gray-800 hover:border-gray-700 transition-all group"
            >
              {/* Score Badge */}
              <div className={`w-14 h-14 rounded-xl ${getScoreBgColor(entry.score)} border flex items-center justify-center flex-shrink-0`}>
                <span className={`text-xl font-bold ${getScoreColor(entry.score)}`}>
                  {entry.score}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {entry.persona && PERSONA_EMOJI[entry.persona] && (
                    <span className="text-sm">{PERSONA_EMOJI[entry.persona]}</span>
                  )}
                  <span className="text-xs text-gray-500">{formatDate(entry.date)}</span>
                  {entry.score === bestScore && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">
                      BEST
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300 truncate">
                  {entry.headline}
                </p>
              </div>

              {/* Link Icon */}
              <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-gray-400 flex-shrink-0 transition-colors" />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Motivation */}
      {bestScore !== null && bestScore < 80 && (
        <div className="mt-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <p className="text-sm text-orange-400 text-center">
            Beat your best score of <span className="font-bold">{bestScore}</span>!
            Upload an improved resume to level up.
          </p>
        </div>
      )}
    </div>
  )
}
