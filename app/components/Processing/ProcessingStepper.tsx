'use client'

import { motion } from 'framer-motion'
import { Check, Loader2, Flame } from 'lucide-react'

export type ProcessingStep = 'uploading' | 'parsing' | 'analyzing' | 'generating' | 'complete'

const steps: { id: ProcessingStep; label: string; emoji: string }[] = [
  { id: 'uploading', label: 'Uploading resume', emoji: '📄' },
  { id: 'parsing', label: 'Parsing PDF', emoji: '🔍' },
  { id: 'analyzing', label: 'Analyzing content', emoji: '🧠' },
  { id: 'generating', label: 'Generating roast', emoji: '🔥' },
]

interface ProcessingStepperProps {
  currentStep: ProcessingStep
}

export function ProcessingStepper({ currentStep }: ProcessingStepperProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep)

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-center gap-3 mb-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            <Flame className="w-6 h-6 text-orange-500" />
          </motion.div>
          <h3 className="text-lg font-semibold text-white text-center">
            Preparing your roast...
          </h3>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => {
            const isComplete = index < currentIndex || currentStep === 'complete'
            const isCurrent = index === currentIndex && currentStep !== 'complete'
            const isPending = index > currentIndex

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  isCurrent
                    ? 'bg-orange-500/10 border border-orange-500/30'
                    : isComplete
                      ? 'bg-emerald-500/10 border border-emerald-500/30'
                      : 'bg-gray-800/50 border border-gray-800'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isComplete
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-700 text-gray-500'
                }`}>
                  {isComplete ? (
                    <Check className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="text-sm">{step.emoji}</span>
                  )}
                </div>

                <span className={`font-medium flex-1 ${
                  isComplete
                    ? 'text-emerald-400'
                    : isCurrent
                      ? 'text-orange-400'
                      : 'text-gray-500'
                }`}>
                  {step.label}
                </span>

                {isCurrent && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-xs text-orange-400 font-medium"
                  >
                    In progress...
                  </motion.span>
                )}

                {isComplete && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs text-emerald-400"
                  >
                    ✓
                  </motion.span>
                )}
              </motion.div>
            )
          })}
        </div>

        <div className="mt-6 text-center">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-full"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <span className="text-sm text-gray-400">
              The hotter the roast, the longer it takes... 🔥
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
