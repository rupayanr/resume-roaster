'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ScoreDisplayProps {
  score: number
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  const getScoreConfig = (score: number) => {
    if (score >= 80) return {
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      border: 'border-emerald-300',
      label: 'Excellent',
      icon: <TrendingUp className="w-5 h-5" />,
    }
    if (score >= 60) return {
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      border: 'border-blue-300',
      label: 'Good',
      icon: <TrendingUp className="w-5 h-5" />,
    }
    if (score >= 40) return {
      color: 'text-amber-600',
      bg: 'bg-amber-100',
      border: 'border-amber-300',
      label: 'Needs Improvement',
      icon: <Minus className="w-5 h-5" />,
    }
    return {
      color: 'text-red-600',
      bg: 'bg-red-100',
      border: 'border-red-300',
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
        className={`relative w-32 h-32 rounded-full ${config.bg} ${config.border} border-4 flex items-center justify-center`}
      >
        <div className="text-center">
          <span className={`text-4xl font-bold ${config.color}`}>{score}</span>
          <span className={`text-lg ${config.color}`}>/100</span>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full ${config.bg} ${config.color}`}
      >
        {config.icon}
        <span className="text-sm font-medium">{config.label}</span>
      </motion.div>
    </div>
  )
}
