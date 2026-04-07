'use client'

import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Pencil, ChevronRight, Quote } from 'lucide-react'
import type { RoastSection } from '@/types'

const iconMap: Record<string, React.ReactNode> = {
  check: <CheckCircle className="w-5 h-5 text-emerald-400" />,
  alert: <AlertCircle className="w-5 h-5 text-amber-400" />,
  edit: <Pencil className="w-5 h-5 text-blue-400" />,
}

const bgColorMap: Record<string, string> = {
  check: 'bg-emerald-500/10 border-emerald-500/20',
  alert: 'bg-amber-500/10 border-amber-500/20',
  edit: 'bg-blue-500/10 border-blue-500/20',
}

const titleColorMap: Record<string, string> = {
  check: 'text-emerald-400',
  alert: 'text-amber-400',
  edit: 'text-blue-400',
}

const bulletColorMap: Record<string, string> = {
  check: 'bg-emerald-500',
  alert: 'bg-amber-500',
  edit: 'bg-blue-500',
}

const quoteStyleMap: Record<string, string> = {
  check: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
  alert: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
  edit: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
}

// Helper to detect and style quoted text
function formatPointText(text: string, iconKey: string) {
  const quoteStyle = quoteStyleMap[iconKey] || quoteStyleMap.edit

  // Match text in single or double quotes
  const parts = text.split(/(['"][^'"]+['"])/g)

  return parts.map((part, i) => {
    if (part.match(/^['"].*['"]$/)) {
      // This is a quoted section
      return (
        <span
          key={i}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border ${quoteStyle}`}
        >
          <Quote className="w-3 h-3 opacity-60" />
          {part.slice(1, -1)}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export function FeedbackSection({ title, icon, points }: RoastSection) {
  const safePoints = Array.isArray(points) ? points : []
  const iconKey = typeof icon === 'string' ? icon.toLowerCase() : 'edit'
  const iconElement = iconMap[iconKey] || iconMap.edit
  const bgColor = bgColorMap[iconKey] || bgColorMap.edit
  const titleColor = titleColorMap[iconKey] || titleColorMap.edit
  const bulletColor = bulletColorMap[iconKey] || bulletColorMap.edit

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-5 ${bgColor}`}
    >
      <h3 className={`text-base font-semibold flex items-center gap-2 ${titleColor}`}>
        {iconElement}
        {title}
      </h3>
      <ul className="mt-4 space-y-3">
        {safePoints.map((point, index) => {
          const pointText = typeof point === 'string'
            ? point
            : (point as { description?: string }).description || JSON.stringify(point)
          return (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 group"
            >
              <span className={`flex-shrink-0 w-6 h-6 rounded-full ${bulletColor} text-white flex items-center justify-center mt-0.5 shadow-sm`}>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
              <p className="text-sm text-gray-300 leading-relaxed flex-1">
                {formatPointText(pointText, iconKey)}
              </p>
            </motion.li>
          )
        })}
      </ul>
    </motion.div>
  )
}
