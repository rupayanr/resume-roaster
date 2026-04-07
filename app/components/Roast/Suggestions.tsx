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
    <div className="mt-0">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-amber-400" />
        Suggested Improvements
      </h3>
      <div className="space-y-4">
        {safeSuggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden"
          >
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-700">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 rounded border border-red-500/30">
                    Before
                  </span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  &ldquo;{suggestion.original}&rdquo;
                </p>
              </div>
              <div className="p-4 bg-emerald-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">
                    After
                  </span>
                </div>
                <p className="text-sm text-gray-200 leading-relaxed font-medium">
                  &ldquo;{suggestion.improved}&rdquo;
                </p>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-800/80 border-t border-gray-700">
              <div className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-400">{suggestion.why}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
