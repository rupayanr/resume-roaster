'use client'

import { motion } from 'framer-motion'
import { Flame, Snowflake, Thermometer } from 'lucide-react'
import type { RoastIntensity } from '@/types'

interface IntensityDialProps {
  value: RoastIntensity
  onChange: (value: RoastIntensity) => void
  disabled?: boolean
}

const INTENSITY_CONFIG = {
  mild: {
    label: 'Mild',
    description: 'Encouraging & supportive',
    angle: -75,
    color: 'from-cyan-400 to-blue-500',
    glowColor: 'rgba(34, 211, 238, 0.5)',
    textColor: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500',
    pathLength: 0.17,
  },
  medium: {
    label: 'Medium',
    description: 'Witty & balanced',
    angle: 0,
    color: 'from-amber-400 to-orange-500',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500',
    pathLength: 0.5,
  },
  brutal: {
    label: 'Brutal',
    description: 'No mercy 🔥',
    angle: 75,
    color: 'from-orange-500 to-red-600',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    textColor: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500',
    pathLength: 1,
  },
}

export function IntensityDial({ value, onChange, disabled }: IntensityDialProps) {
  const config = INTENSITY_CONFIG[value]

  const handleClick = (intensity: RoastIntensity) => {
    if (!disabled) {
      onChange(intensity)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
        Roast Intensity
      </label>

      {/* Dial Container */}
      <div className="relative w-52 h-32">
        {/* Arc track */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 70">
          {/* Background arc - top semicircle */}
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke="#374151"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Colored arc based on intensity */}
          <motion.path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke="url(#dialGradientDark)"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: config.pathLength }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="dialGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </svg>

        {/* Mild button - left side of arc */}
        <motion.button
          onClick={() => handleClick('mild')}
          disabled={disabled}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`
            absolute w-10 h-10 rounded-full flex items-center justify-center
            transition-all duration-300 cursor-pointer
            ${value === 'mild'
              ? 'bg-gray-800 shadow-lg shadow-cyan-500/30 scale-110 z-10 ring-2 ring-cyan-400'
              : 'bg-gray-800/50 hover:bg-gray-800'
            }
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          `}
          style={{ left: '8px', top: '55%', transform: 'translateY(-50%)' }}
        >
          <Snowflake className={`w-5 h-5 ${value === 'mild' ? 'text-cyan-400' : 'text-gray-500'}`} />
        </motion.button>

        {/* Medium button - top of arc */}
        <motion.button
          onClick={() => handleClick('medium')}
          disabled={disabled}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`
            absolute w-10 h-10 rounded-full flex items-center justify-center
            transition-all duration-300 cursor-pointer
            ${value === 'medium'
              ? 'bg-gray-800 shadow-lg shadow-amber-500/30 scale-110 z-10 ring-2 ring-amber-400'
              : 'bg-gray-800/50 hover:bg-gray-800'
            }
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          `}
          style={{ left: '50%', top: '-8px', transform: 'translateX(-50%)' }}
        >
          <Thermometer className={`w-5 h-5 ${value === 'medium' ? 'text-amber-400' : 'text-gray-500'}`} />
        </motion.button>

        {/* Brutal button - right side of arc */}
        <motion.button
          onClick={() => handleClick('brutal')}
          disabled={disabled}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`
            absolute w-10 h-10 rounded-full flex items-center justify-center
            transition-all duration-300 cursor-pointer
            ${value === 'brutal'
              ? 'bg-gray-800 shadow-lg shadow-red-500/30 scale-110 z-10 ring-2 ring-red-400'
              : 'bg-gray-800/50 hover:bg-gray-800'
            }
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          `}
          style={{ right: '8px', top: '55%', transform: 'translateY(-50%)' }}
        >
          <Flame className={`w-5 h-5 ${value === 'brutal' ? 'text-red-400' : 'text-gray-500'}`} />
        </motion.button>

        {/* Needle/pointer */}
        <motion.div
          className="absolute bottom-0 left-1/2 origin-bottom"
          style={{ marginLeft: '-2px' }}
          animate={{ rotate: config.angle }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className={`w-1 h-14 rounded-full bg-gradient-to-t ${config.color} shadow-lg`} />
          <motion.div
            className={`absolute -bottom-2 left-1/2 w-5 h-5 -ml-2.5 rounded-full bg-gradient-to-br ${config.color}`}
            animate={{ boxShadow: `0 0 25px ${config.glowColor}` }}
          />
        </motion.div>

        {/* Flame particles for brutal mode */}
        {value === 'brutal' && (
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-orange-500 rounded-full"
                style={{ left: '50%', bottom: '0' }}
                animate={{
                  x: [(i - 2) * 8, (i - 2) * 15],
                  y: [0, -50],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Label */}
      <motion.div
        key={value}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 text-center"
      >
        <p className={`text-xl font-bold ${config.textColor}`}>
          {config.label}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {config.description}
        </p>
      </motion.div>
    </div>
  )
}
