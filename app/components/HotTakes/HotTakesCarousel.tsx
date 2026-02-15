'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Quote } from 'lucide-react'
import type { HotTake } from '@/types'

interface HotTakesCarouselProps {
  autoRotateInterval?: number
}

// Fallback hot takes when none are available from API
const FALLBACK_HOT_TAKES: HotTake[] = [
  { headline: "Your resume is like a beige wall - technically there, but nobody's looking at it.", score: 42 },
  { headline: "Three pages for 2 years experience? This isn't a novel.", score: 35 },
  { headline: "This screams 'I peaked in 2015' louder than a Spotify Wrapped playlist.", score: 28 },
  { headline: "Your skills section is longer than your experience. Suspicious.", score: 45 },
  { headline: "Finally, someone who knows bullet points aren't just decorations.", score: 78 },
]

export function HotTakesCarousel({ autoRotateInterval = 5000 }: HotTakesCarouselProps) {
  const [hotTakes, setHotTakes] = useState<HotTake[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchHotTakes() {
      try {
        const response = await fetch('/api/hot-takes?limit=10')
        if (response.ok) {
          const data = await response.json()
          if (data.hot_takes.length > 0) {
            setHotTakes(data.hot_takes)
          } else {
            setHotTakes(FALLBACK_HOT_TAKES)
          }
        } else {
          setHotTakes(FALLBACK_HOT_TAKES)
        }
      } catch {
        setHotTakes(FALLBACK_HOT_TAKES)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHotTakes()
  }, [])

  useEffect(() => {
    if (hotTakes.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % hotTakes.length)
    }, autoRotateInterval)

    return () => clearInterval(interval)
  }, [hotTakes.length, autoRotateInterval])

  if (isLoading || hotTakes.length === 0) {
    return null
  }

  const currentTake = hotTakes[currentIndex]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200 p-6 mb-8"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-100 rounded-full">
          <Flame className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-semibold text-orange-700">Hot Takes</span>
        </div>
        <span className="text-xs text-gray-500">Real roasts from real resumes</span>
      </div>

      {/* Quote carousel */}
      <div className="relative h-24 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <div className="flex items-start gap-3">
              <Quote className="w-8 h-8 text-orange-300 flex-shrink-0 mt-1" />
              <div>
                <p className="text-lg text-gray-800 font-medium leading-relaxed">
                  {currentTake.headline}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-500">Score:</span>
                  <span className={`
                    text-sm font-bold
                    ${currentTake.score < 40 ? 'text-red-600' : currentTake.score < 60 ? 'text-amber-600' : 'text-green-600'}
                  `}>
                    {currentTake.score}/100
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      {hotTakes.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {hotTakes.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${index === currentIndex ? 'bg-orange-500 w-4' : 'bg-orange-200 hover:bg-orange-300'}
              `}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
