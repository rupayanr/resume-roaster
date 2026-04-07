'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

export function Navbar() {
  return (
    <nav className="bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Flame className="w-6 h-6 text-orange-500 group-hover:text-orange-400 transition-colors" />
              </motion.div>
              <span className="text-white font-bold text-lg">
                Resume <span className="text-orange-500">Roaster</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
