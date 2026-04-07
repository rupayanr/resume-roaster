'use client'

import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Upload, FileText, Briefcase, Code, DollarSign, Palette, Heart, Flame } from 'lucide-react'
import { IntensityDial } from './IntensityDial'
import type { RoastIntensity, Industry } from '@/types'

interface DropZoneProps {
  onUpload: (file: File) => void
  disabled?: boolean
  intensity: RoastIntensity
  industry: Industry
  onIntensityChange: (intensity: RoastIntensity) => void
  onIndustryChange: (industry: Industry) => void
}

const INDUSTRY_OPTIONS: { value: Industry; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'general', label: 'General', icon: Briefcase },
  { value: 'tech', label: 'Tech', icon: Code },
  { value: 'finance', label: 'Finance', icon: DollarSign },
  { value: 'creative', label: 'Creative', icon: Palette },
  { value: 'healthcare', label: 'Healthcare', icon: Heart },
]

export function DropZone({
  onUpload,
  disabled,
  intensity,
  industry,
  onIntensityChange,
  onIndustryChange,
}: DropZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled,
    onDrop: (files) => {
      if (files[0]) {
        onUpload(files[0])
      }
    },
  })

  return (
    <div className="space-y-6">
      {/* Drop Zone - Prominent at top */}
      <motion.div
        whileHover={disabled ? {} : { scale: 1.005 }}
        whileTap={disabled ? {} : { scale: 0.995 }}
      >
        <div
          {...getRootProps()}
          className={`
            relative overflow-hidden
            border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer
            transition-all duration-300 ease-out
            ${isDragActive
              ? 'border-orange-500 bg-orange-500/10'
              : 'border-gray-700 bg-gray-800/50 hover:border-orange-500/50 hover:bg-gray-800'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />

          {/* Animated fire particles on drag */}
          {isDragActive && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 bg-orange-500/60 rounded-full"
                  style={{
                    left: `${15 + i * 15}%`,
                    bottom: '0%',
                  }}
                  animate={{
                    y: [0, -100, -200],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          )}

          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: isDragActive ? 1.1 : 1 }}
            className="flex flex-col items-center relative z-10"
          >
            <motion.div
              className={`
                w-20 h-20 rounded-2xl flex items-center justify-center mb-4
                ${isDragActive
                  ? 'bg-gradient-to-br from-orange-500 to-red-500'
                  : 'bg-gray-700/50 group-hover:bg-gray-700'}
              `}
              animate={isDragActive ? { rotate: [0, -5, 5, 0] } : {}}
              transition={{ repeat: isDragActive ? Infinity : 0, duration: 0.5 }}
            >
              {isDragActive ? (
                <Flame className="w-10 h-10 text-white" />
              ) : (
                <Upload className="w-10 h-10 text-gray-400" />
              )}
            </motion.div>

            {isDragActive ? (
              <p className="text-xl text-orange-400 font-bold">
                Drop it like it&apos;s hot! 🔥
              </p>
            ) : (
              <div>
                <p className="text-xl text-white font-semibold mb-2">
                  Drop your resume here
                </p>
                <p className="text-gray-400">
                  or <span className="text-orange-400 font-medium hover:text-orange-300 transition-colors">browse</span> to upload
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 mt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-800 text-xs text-gray-400">
                <FileText className="w-3 h-3" />
                PDF only
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-800 text-xs text-gray-400">
                Max 5MB
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Settings Row - stacked on mobile, side by side on desktop */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pt-2">
        {/* Industry Selector - left on desktop */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Industry Focus <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRY_OPTIONS.map(({ value, label, icon: Icon }) => (
              <motion.button
                key={value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onIndustryChange(value)}
                disabled={disabled}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 text-sm
                  ${industry === value
                    ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                    : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Intensity Dial - right on desktop */}
        <div className="flex-shrink-0">
          <IntensityDial
            value={intensity}
            onChange={onIntensityChange}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}
