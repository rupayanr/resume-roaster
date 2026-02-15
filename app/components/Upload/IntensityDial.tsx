'use client'

import { motion } from 'framer-motion'
import { Flame, Snowflake } from 'lucide-react'
import type { RoastIntensity } from '@/types'

interface IntensityDialProps {
  value: RoastIntensity
  onChange: (value: RoastIntensity) => void
  disabled?: boolean
}

const INTENSITIES: RoastIntensity[] = ['mild', 'medium', 'brutal']

const INTENSITY_CONFIG = {
  mild: {
    label: 'Mild',
    description: 'Encouraging & supportive',
    angle: -45,
    color: 'from-cyan-400 to-blue-500',
    glowColor: 'rgba(59, 130, 246, 0.5)',
    textColor: 'text-blue-600',
  },
  medium: {
    label: 'Medium',
    description: 'Witty & balanced',
    angle: 0,
    color: 'from-amber-400 to-orange-500',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    textColor: 'text-amber-600',
  },
  brutal: {
    label: 'Brutal',
    description: 'No mercy',
    angle: 45,
    color: 'from-orange-500 to-red-600',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    textColor: 'text-red-600',
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
      <div className="relative w-48 h-48">
        {/* Outer ring with gradient */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner" />

        {/* Heat zone indicators */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {/* Background arc */}
          <path
            d="M 20 80 A 40 40 0 0 1 80 80"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Colored arc based on intensity */}
          <motion.path
            d="M 20 80 A 40 40 0 0 1 80 80"
            fill="none"
            stroke="url(#dialGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{
              pathLength: value === 'mild' ? 0.33 : value === 'medium' ? 0.66 : 1
            }}
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

        {/* Tick marks and labels */}
        {INTENSITIES.map((intensity) => {
          const cfg = INTENSITY_CONFIG[intensity]
          const isActive = value === intensity
          return (
            <button
              key={intensity}
              onClick={() => handleClick(intensity)}
              disabled={disabled}
              className={`
                absolute w-12 h-12 rounded-full flex items-center justify-center
                transition-all duration-300 cursor-pointer
                ${isActive
                  ? 'bg-white shadow-lg scale-110 z-10'
                  : 'bg-gray-50 hover:bg-white hover:shadow-md'
                }
                ${disabled ? 'cursor-not-allowed opacity-50' : ''}
              `}
              style={{
                top: intensity === 'medium' ? '8px' : '60px',
                left: intensity === 'mild' ? '8px' : intensity === 'brutal' ? 'auto' : '50%',
                right: intensity === 'brutal' ? '8px' : 'auto',
                transform: intensity === 'medium' ? 'translateX(-50%)' : 'none',
              }}
            >
              {intensity === 'mild' && <Snowflake className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />}
              {intensity === 'medium' && <span className={`text-lg ${isActive ? '' : 'grayscale opacity-50'}`}>🌡️</span>}
              {intensity === 'brutal' && <Flame className={`w-5 h-5 ${isActive ? 'text-red-500' : 'text-gray-400'}`} />}
            </button>
          )
        })}

        {/* Center dial knob */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-20 h-20 -mt-10 -ml-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 shadow-xl flex items-center justify-center cursor-pointer"
          animate={{
            rotate: config.angle,
            boxShadow: `0 0 30px ${config.glowColor}`,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{ transformOrigin: 'center center' }}
        >
          {/* Knob indicator line */}
          <div className="absolute top-2 left-1/2 -ml-0.5 w-1 h-4 rounded-full bg-gradient-to-b from-white to-gray-300" />

          {/* Inner circle */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`w-8 h-8 rounded-full bg-gradient-to-br ${config.color} shadow-inner`}
            />
          </div>
        </motion.div>

        {/* Flame particles for brutal mode */}
        {value === 'brutal' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-orange-500 rounded-full"
                initial={{
                  x: 96,
                  y: 96,
                  opacity: 0,
                }}
                animate={{
                  x: [96, 96 + (Math.random() - 0.5) * 40],
                  y: [96, 96 - 30 - Math.random() * 20],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1 + Math.random() * 0.5,
                  delay: i * 0.2,
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
        className="mt-4 text-center"
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
