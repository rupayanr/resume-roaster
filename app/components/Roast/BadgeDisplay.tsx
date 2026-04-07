'use client'

import { motion } from 'framer-motion'
import {
  Target,
  BookOpen,
  Ghost,
  Clock,
  Medal,
  BarChart3,
  Shield,
  HardHat,
  Zap,
  Repeat,
  FileText,
  Smile,
} from 'lucide-react'
import type { Badge } from '@/types'

interface BadgeDisplayProps {
  badges: Badge[]
}

const BADGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  target: Target,
  book: BookOpen,
  ghost: Ghost,
  clock: Clock,
  medal: Medal,
  chart: BarChart3,
  shield: Shield,
  'hard-hat': HardHat,
  zap: Zap,
  repeat: Repeat,
  file: FileText,
  smile: Smile,
}

const BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  buzzword_bingo: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  novel_writer: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  mystery_candidate: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' },
  time_traveler: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  humble_bragger: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
  metric_master: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  fireproof: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  needs_work: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  action_hero: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  serial_job_hopper: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  one_page_wonder: { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/30' },
  emoji_enthusiast: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
}

export function BadgeDisplay({ badges }: BadgeDisplayProps) {
  if (!badges || badges.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mt-6"
    >
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Achievements Unlocked
      </h3>
      <div className="flex flex-wrap gap-2">
        {badges.map((badge, index) => {
          const Icon = BADGE_ICONS[badge.icon] || Target
          const colors = BADGE_COLORS[badge.id] || { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' }

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="group relative"
            >
              <div
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg border
                  ${colors.bg} ${colors.text} ${colors.border}
                  transition-all duration-200 hover:shadow-lg hover:shadow-white/5 cursor-help
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{badge.name}</span>
              </div>

              {/* Tooltip */}
              {badge.description && (
                <div className="
                  absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                  px-3 py-2 bg-gray-800 text-white text-xs rounded-lg
                  opacity-0 group-hover:opacity-100 transition-opacity
                  pointer-events-none whitespace-nowrap z-10
                  shadow-lg border border-gray-700
                ">
                  {badge.description}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                    <div className="w-2 h-2 bg-gray-800 rotate-45 border-r border-b border-gray-700" />
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
