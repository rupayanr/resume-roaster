'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, Flame } from 'lucide-react'

interface ScoreDisplayProps {
  score: number
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  const getScoreConfig = (score: number) => {
    if (score >= 80) return {
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/50',
      glow: 'shadow-emerald-500/20',
      label: 'Excellent',
      icon: <TrendingUp className="w-5 h-5" />,
    }
    if (score >= 60) return {
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/50',
      glow: 'shadow-blue-500/20',
      label: 'Good',
      icon: <TrendingUp className="w-5 h-5" />,
    }
    if (score >= 40) return {
      color: 'text-amber-400',
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/50',
      glow: 'shadow-amber-500/20',
      label: 'Needs Improvement',
      icon: <Minus className="w-5 h-5" />,
    }
    return {
      color: 'text-red-400',
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      glow: 'shadow-red-500/20',
      label: 'Needs Work',
      icon: <TrendingDown className="w-5 h-5" />,
    }
  }

  const config = getScoreConfig(score)

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className={`relative w-32 h-32 rounded-full ${config.bg} ${config.border} border-4 flex items-center justify-center shadow-lg ${config.glow}`}
      >
        {/* Fire ring for low scores */}
        {score < 40 && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                '0 0 20px rgba(239, 68, 68, 0.3)',
                '0 0 40px rgba(239, 68, 68, 0.5)',
                '0 0 20px rgba(239, 68, 68, 0.3)',
              ],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}
        <div className="text-center">
          <span className={`text-4xl font-bold ${config.color}`}>{score}</span>
          <span className={`text-lg ${config.color}`}>/100</span>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full ${config.bg} ${config.color} border ${config.border}`}
      >
        {config.icon}
        <span className="text-sm font-medium">{config.label}</span>
      </motion.div>
    </div>
  )
}
