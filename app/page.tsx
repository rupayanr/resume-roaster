'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Flame, Upload, Sparkles, Target } from 'lucide-react'
import { Navbar } from './components/Layout/Navbar'
import { DropZone } from './components/Upload/DropZone'
import { RoastCard } from './components/Roast/RoastCard'
import { ShareButton } from './components/Share/ShareButton'
import { HotTakesCarousel } from './components/HotTakes/HotTakesCarousel'
import { ProcessingStepper, type ProcessingStep } from './components/Processing/ProcessingStepper'
import type { RoastResponse, Industry } from '@/types'

export default function HomePage() {
  const [roast, setRoast] = useState<RoastResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('uploading')
  const [error, setError] = useState<string | null>(null)
  const [industry, setIndustry] = useState<Industry>('general')

  const submitResume = useCallback(async (file: File) => {
    setIsLoading(true)
    setError(null)
    setProcessingStep('uploading')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('intensity', 'medium')
      formData.append('industry', industry)

      // Simulate step progression
      setProcessingStep('parsing')
      await new Promise(r => setTimeout(r, 500))

      setProcessingStep('analyzing')
      await new Promise(r => setTimeout(r, 500))

      setProcessingStep('generating')

      const response = await fetch('/api/roast', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Failed to roast resume')
      }

      setProcessingStep('complete')
      await new Promise(r => setTimeout(r, 300))

      const data = await response.json()
      setRoast(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to roast resume'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [industry])

  const reset = useCallback(() => {
    setRoast(null)
    setError(null)
  }, [])

  const getShareUrl = () => {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/r/${roast?.share_id}`
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <main className="relative max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          {/* Fire badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full border border-orange-500/30 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-2xl">🔥</span>
            <span className="text-orange-400 text-sm font-semibold tracking-wide">
              AI-POWERED ROASTS
            </span>
            <span className="text-2xl">🔥</span>
          </motion.div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
            Get your resume{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-400">
              roasted
            </span>
            <br />
            <span className="text-gray-400 text-3xl sm:text-4xl md:text-5xl font-bold">
              by AI that doesn&apos;t hold back.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto px-4">
            Upload your resume and get{' '}
            <span className="text-orange-400 font-semibold">brutally honest feedback</span>
            {' '}with real suggestions to make it better. The truth hurts, but it works.
          </p>
        </motion.div>

        {/* Hot Takes Carousel */}
        {!roast && !isLoading && <HotTakesCarousel />}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProcessingStepper currentStep={processingStep} />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-red-500/30 p-8 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">😬</span>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-sm text-red-400 mb-6">{error}</p>
              <motion.button
                onClick={reset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </motion.button>
            </motion.div>
          ) : roast ? (
            <motion.div
              key="roast"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Action Bar */}
              <div className="flex items-center justify-between mb-6">
                <motion.button
                  onClick={reset}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white font-medium transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Roast Another
                </motion.button>
                <ShareButton
                  shareUrl={getShareUrl()}
                  headline={roast.headline}
                  score={roast.score}
                />
              </div>

              {/* Roast Card */}
              <RoastCard roast={roast} />
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              {/* Glowing border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-2xl opacity-30 blur-sm" />

              <div className="relative bg-gray-900 rounded-2xl border border-gray-800 p-4 sm:p-8">
                <DropZone
                  onUpload={submitResume}
                  disabled={isLoading}
                  industry={industry}
                  onIndustryChange={setIndustry}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How It Works */}
        {!roast && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">1. Upload</h3>
                <p className="text-gray-400 text-sm">
                  Drop your resume PDF into the fire. We accept any format, any length.
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">2. Get Roasted</h3>
                <p className="text-gray-400 text-sm">
                  AI analyzes your resume and delivers honest feedback with a side of humor.
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">3. Improve</h3>
                <p className="text-gray-400 text-sm">
                  Get actionable suggestions to fix what&apos;s broken and land more interviews.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-gray-600">
            Your resume is processed securely and never stored.
          </p>
          <p className="text-xs text-gray-700 mt-2">
            Built with questionable humor and actual AI
          </p>
        </motion.div>
      </main>
    </div>
  )
}
