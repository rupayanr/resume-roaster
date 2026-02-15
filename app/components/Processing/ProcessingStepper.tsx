'use client'

import { motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'

export type ProcessingStep = 'uploading' | 'parsing' | 'analyzing' | 'generating' | 'complete'

const steps: { id: ProcessingStep; label: string }[] = [
  { id: 'uploading', label: 'Uploading resume' },
  { id: 'parsing', label: 'Parsing PDF' },
  { id: 'analyzing', label: 'Analyzing content' },
  { id: 'generating', label: 'Generating roast' },
]

interface ProcessingStepperProps {
  currentStep: ProcessingStep
}

export function ProcessingStepper({ currentStep }: ProcessingStepperProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 text-center mb-6">
          Preparing your roast...
        </h3>

        <div className="space-y-4">
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
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isCurrent ? 'bg-orange-50' : isComplete ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isComplete
                    ? 'bg-green-500 text-white'
                    : isCurrent
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                }`}>
                  {isComplete ? (
                    <Check className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>

                <span className={`font-medium ${
                  isComplete
                    ? 'text-green-700'
                    : isCurrent
                      ? 'text-orange-700'
                      : 'text-gray-400'
                }`}>
                  {step.label}
                </span>

                {isCurrent && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-auto text-xs text-orange-500"
                  >
                    In progress...
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          This usually takes 10-15 seconds
        </p>
      </div>
    </div>
  )
}
