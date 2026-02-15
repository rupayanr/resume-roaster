'use client'

import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Upload, FileText, Flame, Thermometer, Snowflake, Briefcase, Code, DollarSign, Palette, Heart } from 'lucide-react'
import type { RoastIntensity, Industry } from '@/types'

interface DropZoneProps {
  onUpload: (file: File) => void
  disabled?: boolean
  intensity: RoastIntensity
  industry: Industry
  onIntensityChange: (intensity: RoastIntensity) => void
  onIndustryChange: (industry: Industry) => void
}

const INTENSITY_OPTIONS: { value: RoastIntensity; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { value: 'mild', label: 'Mild', icon: Snowflake, description: 'Encouraging & supportive' },
  { value: 'medium', label: 'Medium', icon: Thermometer, description: 'Witty & balanced' },
  { value: 'brutal', label: 'Brutal', icon: Flame, description: 'No mercy' },
]

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
      {/* Intensity Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Roast Intensity
        </label>
        <div className="grid grid-cols-3 gap-3">
          {INTENSITY_OPTIONS.map(({ value, label, icon: Icon, description }) => (
            <motion.button
              key={value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onIntensityChange(value)}
              disabled={disabled}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200
                ${intensity === value
                  ? value === 'mild'
                    ? 'border-blue-500 bg-blue-50'
                    : value === 'medium'
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex flex-col items-center text-center">
                <Icon className={`
                  w-6 h-6 mb-2
                  ${intensity === value
                    ? value === 'mild'
                      ? 'text-blue-600'
                      : value === 'medium'
                      ? 'text-amber-600'
                      : 'text-red-600'
                    : 'text-gray-400'
                  }
                `} />
                <span className={`
                  font-semibold text-sm
                  ${intensity === value ? 'text-gray-900' : 'text-gray-600'}
                `}>
                  {label}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {description}
                </span>
              </div>
              {intensity === value && (
                <motion.div
                  layoutId="intensity-indicator"
                  className={`
                    absolute inset-0 rounded-xl border-2
                    ${value === 'mild' ? 'border-blue-500' : value === 'medium' ? 'border-amber-500' : 'border-red-500'}
                  `}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Industry Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Industry Focus <span className="text-gray-400 font-normal">(optional)</span>
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
                flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200
                ${industry === value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Drop Zone */}
      <motion.div
        whileHover={disabled ? {} : { scale: 1.01 }}
        whileTap={disabled ? {} : { scale: 0.99 }}
      >
        <div
          {...getRootProps()}
          className={`
            relative overflow-hidden
            border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
            transition-all duration-300 ease-out
            ${isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />

          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: isDragActive ? 1.1 : 1 }}
            className="flex flex-col items-center"
          >
            <div className={`
              w-16 h-16 rounded-2xl flex items-center justify-center mb-4
              ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'}
            `}>
              {isDragActive ? (
                <FileText className="w-8 h-8 text-blue-600" />
              ) : (
                <Upload className="w-8 h-8 text-gray-500" />
              )}
            </div>

            {isDragActive ? (
              <p className="text-lg text-blue-600 font-medium">
                Drop your resume here
              </p>
            ) : (
              <div>
                <p className="text-lg text-gray-700 font-medium">
                  Drop your resume PDF here
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  or <span className="text-blue-600 font-medium">browse</span> to upload
                </p>
              </div>
            )}

            <p className="text-xs text-gray-400 mt-4">
              PDF files only, max 5MB
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
