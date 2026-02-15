'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ReactionType } from '@/types'

interface ReactionBarProps {
  shareId: string
  reactions: Record<string, number>
  onReactionUpdate?: (reactions: Record<string, number>) => void
}

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'fire', emoji: '\uD83D\uDD25', label: 'Fire' },
  { type: 'crying_laughing', emoji: '\uD83D\uDE02', label: 'LOL' },
  { type: 'ouch', emoji: '\uD83D\uDE2C', label: 'Ouch' },
  { type: 'facts', emoji: '\uD83D\uDCAF', label: 'Facts' },
  { type: 'survived', emoji: '\uD83D\uDCAA', label: 'Survived' },
]

export function ReactionBar({ shareId, reactions, onReactionUpdate }: ReactionBarProps) {
  const [localReactions, setLocalReactions] = useState(reactions)
  const [reacting, setReacting] = useState<string | null>(null)
  const [hasReacted, setHasReacted] = useState<Set<string>>(new Set())

  const handleReaction = async (type: ReactionType) => {
    if (hasReacted.has(type) || reacting) return

    setReacting(type)
    try {
      const response = await fetch(`/api/roast/${shareId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction: type }),
      })
      if (response.ok) {
        const data = await response.json()
        setLocalReactions(data.reactions)
        setHasReacted((prev) => new Set(Array.from(prev).concat(type)))
        onReactionUpdate?.(data.reactions)
      }
    } catch {
      // Silently fail - reactions are not critical
    } finally {
      setReacting(null)
    }
  }

  const totalReactions = Object.values(localReactions).reduce((a, b) => a + b, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 p-4 bg-gray-50 rounded-xl"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">
          React to this roast
        </span>
        {totalReactions > 0 && (
          <span className="text-xs text-gray-500">
            {totalReactions} reaction{totalReactions !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {REACTIONS.map(({ type, emoji, label }) => {
          const count = localReactions[type] || 0
          const isSelected = hasReacted.has(type)
          const isLoading = reacting === type

          return (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleReaction(type)}
              disabled={isSelected || !!reacting}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-full
                text-sm font-medium transition-all duration-200
                ${isSelected
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }
                ${isLoading ? 'opacity-50' : ''}
                disabled:cursor-not-allowed
              `}
            >
              <span className="text-lg">{emoji}</span>
              <span>{label}</span>
              {count > 0 && (
                <span className={`
                  ml-1 px-1.5 py-0.5 rounded-full text-xs
                  ${isSelected ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-600'}
                `}>
                  {count}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
