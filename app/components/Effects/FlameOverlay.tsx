'use client'

import { motion } from 'framer-motion'
import { ReactNode, useMemo } from 'react'

interface FlameOverlayProps {
  children: ReactNode
  intensity: number // 0-100, higher = more flames (100 - score)
}

export function FlameOverlay({ children, intensity }: FlameOverlayProps) {
  // Generate particles based on intensity
  const particles = useMemo(() => {
    const count = Math.floor(intensity / 10)
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 1.5 + Math.random() * 1,
      size: 4 + Math.random() * 8,
    }))
  }, [intensity])

  // Cool sparkle particles for high scores
  const sparkles = useMemo(() => {
    if (intensity >= 30) return []
    const count = Math.floor((30 - intensity) / 5)
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 1 + Math.random() * 1,
    }))
  }, [intensity])

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Fire gradient overlay for hot scores */}
      {intensity > 60 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`
            absolute inset-0 pointer-events-none z-10
            bg-gradient-to-t from-red-500/5 via-transparent to-transparent
          `}
        />
      )}

      {/* Ember/flame particles for hot scores */}
      {intensity > 40 && (
        <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden pointer-events-none z-10">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ y: 100, opacity: 0 }}
              animate={{
                y: [-20, -100],
                opacity: [0, 1, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: particle.duration,
                delay: particle.delay,
                ease: 'easeOut',
              }}
              style={{
                left: `${particle.x}%`,
                width: particle.size,
                height: particle.size,
              }}
              className={`
                absolute rounded-full
                ${intensity > 80 ? 'bg-red-500' : intensity > 60 ? 'bg-orange-500' : 'bg-amber-500'}
              `}
            />
          ))}
        </div>
      )}

      {/* Smoke wisps for medium scores */}
      {intensity >= 30 && intensity <= 60 && (
        <div className="absolute top-0 left-0 right-0 h-20 overflow-hidden pointer-events-none z-10">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: 0, opacity: 0 }}
              animate={{
                y: [-10, -40],
                opacity: [0, 0.3, 0],
                x: [0, (i - 1) * 20],
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                delay: i * 0.5,
                ease: 'easeOut',
              }}
              style={{ left: `${30 + i * 20}%` }}
              className="absolute w-16 h-16 bg-gray-400 rounded-full blur-xl"
            />
          ))}
        </div>
      )}

      {/* Sparkle particles for cool scores (high score) */}
      {intensity < 30 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          {sparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: sparkle.duration,
                delay: sparkle.delay,
              }}
              style={{
                left: `${sparkle.x}%`,
                top: `${sparkle.y}%`,
              }}
              className="absolute w-2 h-2 bg-emerald-400 rounded-full"
            />
          ))}
        </div>
      )}

      {/* Cool gradient overlay for high scores */}
      {intensity < 20 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-t from-emerald-500/5 via-transparent to-transparent"
        />
      )}

      {/* Content */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  )
}
