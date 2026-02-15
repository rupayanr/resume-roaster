'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Flame } from 'lucide-react'
import { Navbar } from './components/Layout/Navbar'
import { DropZone } from './components/Upload/DropZone'
import { RoastCard } from './components/Roast/RoastCard'
import { ShareButton } from './components/Share/ShareButton'
import { HotTakesCarousel } from './components/HotTakes/HotTakesCarousel'
import { ProcessingStepper, type ProcessingStep } from './components/Processing/ProcessingStepper'
import type { RoastResponse, RoastIntensity, Industry } from '@/types'

export default function HomePage() {
  const [roast, setRoast] = useState<RoastResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('uploading')
  const [error, setError] = useState<string | null>(null)
  const [intensity, setIntensity] = useState<RoastIntensity>('medium')
  const [industry, setIndustry] = useState<Industry>('general')

  const submitResume = useCallback(async (file: File) => {
    setIsLoading(true)
    setError(null)
    setProcessingStep('uploading')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('intensity', intensity)
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
  }, [intensity, industry])

  const reset = useCallback(() => {
    setRoast(null)
    setError(null)
  }, [])

  const getShareUrl = () => {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/r/${roast?.share_id}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 rounded-full text-orange-700 text-sm font-medium mb-4">
            <Flame className="w-4 h-4" />
            Get roasted by AI
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Resume Roaster
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your resume and get brutally honest feedback with actionable suggestions.
            No sugarcoating, just the truth.
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
              className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">😬</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-sm text-red-600 mb-6">{error}</p>
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
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
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Roast Another
                </button>
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
            >
              <DropZone
                onUpload={submitResume}
                disabled={isLoading}
                intensity={intensity}
                industry={industry}
                onIntensityChange={setIntensity}
                onIndustryChange={setIndustry}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-sm text-gray-500"
        >
          <p>
            Your resume is processed securely and never stored.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
