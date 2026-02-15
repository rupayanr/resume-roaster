'use client'

import { motion } from 'framer-motion'
import { Flame, Thermometer, Sun, Snowflake } from 'lucide-react'

interface RoastThermometerProps {
  score: number
}

const HEAT_LEVELS = [
  { min: 0, max: 20, label: 'Ice Cold', color: 'from-cyan-500 to-blue-400', textColor: 'text-cyan-600', bgColor: 'bg-cyan-500', icon: Snowflake },
  { min: 21, max: 40, label: 'Barely Warm', color: 'from-green-500 to-green-400', textColor: 'text-green-600', bgColor: 'bg-green-500', icon: Sun },
  { min: 41, max: 60, label: 'Getting Toasty', color: 'from-yellow-500 to-amber-400', textColor: 'text-amber-600', bgColor: 'bg-amber-500', icon: Thermometer },
  { min: 61, max: 80, label: 'Extra Crispy', color: 'from-orange-500 to-orange-400', textColor: 'text-orange-600', bgColor: 'bg-orange-500', icon: Flame },
  { min: 81, max: 100, label: 'ABSOLUTELY COOKED', color: 'from-red-600 to-red-500', textColor: 'text-red-600', bgColor: 'bg-red-500', icon: Flame },
]

function getHeatLevel(score: number) {
  // Invert score for heat (low score = hot)
  const heat = 100 - score
  return HEAT_LEVELS.find(level => heat >= level.min && heat <= level.max) || HEAT_LEVELS[2]
}

export function RoastThermometer({ score }: RoastThermometerProps) {
  const heatLevel = getHeatLevel(score)
  const heat = 100 - score // Invert for display
  const Icon = heatLevel.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="flex flex-col items-center"
    >
      {/* Thermometer container */}
      <div className="relative w-20 h-48">
        {/* Thermometer body */}
        <div className="absolute inset-x-0 top-0 bottom-10 mx-auto w-8 bg-gray-200 rounded-t-full overflow-hidden">
          {/* Mercury fill */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${heat}%` }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${heatLevel.color} rounded-t-full`}
          />

          {/* Tick marks */}
          <div className="absolute inset-0 flex flex-col justify-between py-2 px-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-2 h-0.5 bg-gray-400" />
            ))}
          </div>
        </div>

        {/* Thermometer bulb */}
        <motion.div
          animate={{
            scale: heat > 60 ? [1, 1.05, 1] : 1,
            boxShadow: heat > 80
              ? ['0 0 0 0 rgba(239, 68, 68, 0)', '0 0 20px 10px rgba(239, 68, 68, 0.3)', '0 0 0 0 rgba(239, 68, 68, 0)']
              : undefined,
          }}
          transition={{ repeat: heat > 60 ? Infinity : 0, duration: 1.5 }}
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full ${heatLevel.bgColor} flex items-center justify-center shadow-lg`}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>

        {/* Fire particles for hot scores */}
        {heat > 70 && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: 0, opacity: 1 }}
                animate={{
                  y: [-5, -20],
                  opacity: [1, 0],
                  x: [0, (i - 1) * 10],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                  delay: i * 0.2,
                }}
                className="absolute w-2 h-2 bg-orange-500 rounded-full"
              />
            ))}
          </div>
        )}
      </div>

      {/* Heat label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-4 text-center"
      >
        <p className={`text-sm font-bold ${heatLevel.textColor}`}>
          {heatLevel.label}
        </p>
      </motion.div>
    </motion.div>
  )
}
