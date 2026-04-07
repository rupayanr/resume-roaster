'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Copy, Share2, Twitter, Linkedin, ChevronDown } from 'lucide-react'

interface ShareButtonProps {
  shareUrl: string
  headline?: string
  score?: number
}

export function ShareButton({ shareUrl, headline, score }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    setIsMenuOpen(false)
  }

  const shareText = score !== undefined
    ? `I got roasted! 🔥 Score: ${score}/100 ${headline ? `- "${headline.slice(0, 50)}${headline.length > 50 ? '...' : ''}"` : ''}`
    : 'Check out my resume roast! 🔥'

  const handleTwitterShare = () => {
    const twitterUrl = new URL('https://twitter.com/intent/tweet')
    twitterUrl.searchParams.set('text', shareText)
    twitterUrl.searchParams.set('url', shareUrl)
    window.open(twitterUrl.toString(), '_blank', 'width=550,height=420')
    setIsMenuOpen(false)
  }

  const handleLinkedInShare = () => {
    const linkedInUrl = new URL('https://www.linkedin.com/sharing/share-offsite/')
    linkedInUrl.searchParams.set('url', shareUrl)
    window.open(linkedInUrl.toString(), '_blank', 'width=550,height=420')
    setIsMenuOpen(false)
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
          transition-colors duration-200
          bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600
        `}
      >
        <Share2 className="w-4 h-4" />
        Share
        <ChevronDown className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Dropdown menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-lg border border-gray-700 py-2 z-20"
            >
              {/* Copy Link */}
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <div className="h-px bg-gray-700 my-1" />

              {/* Twitter/X */}
              <button
                onClick={handleTwitterShare}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <Twitter className="w-4 h-4" />
                <span>Share on X</span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={handleLinkedInShare}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                <span>Share on LinkedIn</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
