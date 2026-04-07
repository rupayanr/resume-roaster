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
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <main className="relative max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full border border-orange-500/30 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-xl">🔥</span>
            <span className="text-orange-400 text-sm font-semibold">Shared Roast</span>
            <span className="text-xl">🔥</span>
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Someone got <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">roasted!</span>
          </h1>
          <p className="text-gray-400">
            Check out their resume roast results below.
          </p>
        </motion.div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all"
            >
              <Flame className="w-4 h-4" />
              Get Your Own Roast
            </Link>
          </motion.div>
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
          className="text-center mt-12 p-8 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20"
        >
          <h2 className="text-xl font-bold text-white mb-2">
            Think you can do better?
          </h2>
          <p className="text-gray-400 mb-4">
            Upload your resume and see how you stack up.
          </p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/20"
            >
              <Flame className="w-5 h-5" />
              Get Roasted Now
            </Link>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-600">
            🔒 Resumes are processed securely and never stored.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
