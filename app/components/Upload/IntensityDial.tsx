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
    glowColor: 'rgba(59, 130, 246, 0.5)',
    textColor: 'text-blue-600',
    pathLength: 0.17,
  },
  medium: {
    label: 'Medium',
    description: 'Witty & balanced',
    angle: 0,
    color: 'from-amber-400 to-orange-500',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    textColor: 'text-amber-600',
    pathLength: 0.5,
  },
  brutal: {
    label: 'Brutal',
    description: 'No mercy',
    angle: 75,
    color: 'from-orange-500 to-red-600',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    textColor: 'text-red-600',
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
      <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
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
            stroke="#e5e7eb"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Colored arc based on intensity */}
          <motion.path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke="url(#dialGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: config.pathLength }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="dialGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </svg>

        {/* Mild button - left side of arc */}
        <button
          onClick={() => handleClick('mild')}
          disabled={disabled}
          className={`
            absolute w-10 h-10 rounded-full flex items-center justify-center
            transition-all duration-300 cursor-pointer
            ${value === 'mild'
              ? 'bg-white shadow-lg scale-110 z-10 ring-2 ring-blue-400'
              : 'bg-gray-50 hover:bg-white hover:shadow-md'
            }
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          `}
          style={{ left: '8px', top: '55%', transform: 'translateY(-50%)' }}
        >
          <Snowflake className={`w-5 h-5 ${value === 'mild' ? 'text-blue-500' : 'text-gray-400'}`} />
        </button>

        {/* Medium button - top of arc */}
        <button
          onClick={() => handleClick('medium')}
          disabled={disabled}
          className={`
            absolute w-10 h-10 rounded-full flex items-center justify-center
            transition-all duration-300 cursor-pointer
            ${value === 'medium'
              ? 'bg-white shadow-lg scale-110 z-10 ring-2 ring-amber-400'
              : 'bg-gray-50 hover:bg-white hover:shadow-md'
            }
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          `}
          style={{ left: '50%', top: '-8px', transform: 'translateX(-50%)' }}
        >
          <Thermometer className={`w-5 h-5 ${value === 'medium' ? 'text-amber-500' : 'text-gray-400'}`} />
        </button>

        {/* Brutal button - right side of arc */}
        <button
          onClick={() => handleClick('brutal')}
          disabled={disabled}
          className={`
            absolute w-10 h-10 rounded-full flex items-center justify-center
            transition-all duration-300 cursor-pointer
            ${value === 'brutal'
              ? 'bg-white shadow-lg scale-110 z-10 ring-2 ring-red-400'
              : 'bg-gray-50 hover:bg-white hover:shadow-md'
            }
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          `}
          style={{ right: '8px', top: '55%', transform: 'translateY(-50%)' }}
        >
          <Flame className={`w-5 h-5 ${value === 'brutal' ? 'text-red-500' : 'text-gray-400'}`} />
        </button>

        {/* Needle/pointer */}
        <motion.div
          className="absolute bottom-0 left-1/2 origin-bottom"
          style={{ marginLeft: '-2px' }}
          animate={{ rotate: config.angle }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className={`w-1 h-14 rounded-full bg-gradient-to-t ${config.color} shadow-lg`} />
          <motion.div
            className={`absolute -bottom-2 left-1/2 w-5 h-5 -ml-2.5 rounded-full bg-gradient-to-br ${config.color} shadow-lg`}
            animate={{ boxShadow: `0 0 20px ${config.glowColor}` }}
          />
        </motion.div>

        {/* Flame particles for brutal mode */}
        {value === 'brutal' && (
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-orange-500 rounded-full"
                style={{ left: '50%', bottom: '0' }}
                animate={{
                  x: [(i - 1) * 10, (i - 1) * 15],
                  y: [0, -40],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                  delay: i * 0.3,
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
