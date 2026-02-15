'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Lightbulb } from 'lucide-react'
import type { Suggestion } from '@/types'

interface SuggestionsProps {
  suggestions: Suggestion[]
}

export function Suggestions({ suggestions }: SuggestionsProps) {
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : []
  if (!safeSuggestions.length) return null

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        Suggested Improvements
      </h3>
      <div className="space-y-4">
        {safeSuggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
          >
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                    Before
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  &ldquo;{suggestion.original}&rdquo;
                </p>
              </div>
              <div className="p-4 bg-emerald-50/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded">
                    After
                  </span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed font-medium">
                  &ldquo;{suggestion.improved}&rdquo;
                </p>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600">{suggestion.why}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
