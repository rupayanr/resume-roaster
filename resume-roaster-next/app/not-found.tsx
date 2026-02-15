import Link from 'next/link'
import { Flame } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
          <Flame className="w-10 h-10 text-orange-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Roast Not Found
        </h1>
        <p className="text-gray-600 mb-8 max-w-md">
          This roast doesn&apos;t exist or has been removed.
          Maybe it was too spicy to handle?
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
        >
          <Flame className="w-5 h-5" />
          Get Your Own Roast
        </Link>
      </div>
    </div>
  )
}
