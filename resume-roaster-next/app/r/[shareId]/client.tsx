'use client'

import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import Link from 'next/link'
import { Navbar } from '@/app/components/Layout/Navbar'
import { RoastCard } from '@/app/components/Roast/RoastCard'
import { ShareButton } from '@/app/components/Share/ShareButton'
import { ReactionBar } from '@/app/components/Roast/ReactionBar'
import type { RoastResponse } from '@/types'

interface SharedRoastClientProps {
  roast: RoastResponse
}

export function SharedRoastClient({ roast }: SharedRoastClientProps) {
  const shareUrl = typeof window !== 'undefined'
    ? window.location.href
    : ''

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 rounded-full text-orange-700 text-sm font-medium mb-4">
            <Flame className="w-4 h-4" />
            Shared Roast
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Someone got roasted!
          </h1>
          <p className="text-gray-600">
            Check out their resume roast results below.
          </p>
        </motion.div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            <Flame className="w-4 h-4" />
            Get Your Own Roast
          </Link>
          <ShareButton
            shareUrl={shareUrl}
            headline={roast.headline}
            score={roast.score}
          />
        </div>

        {/* Roast Card */}
        <RoastCard roast={roast} />

        {/* Reaction Bar */}
        <ReactionBar
          shareId={roast.share_id}
          reactions={roast.reactions}
        />

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 p-8 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Think you can do better?
          </h2>
          <p className="text-gray-600 mb-4">
            Upload your resume and see how you stack up.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            <Flame className="w-5 h-5" />
            Get Roasted Now
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
