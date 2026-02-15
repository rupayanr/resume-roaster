'use client'

import Link from 'next/link'
import { Flame } from 'lucide-react'

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-gray-900 font-semibold">
              <Flame className="w-6 h-6 text-orange-500" />
              <span>Resume Roaster</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
