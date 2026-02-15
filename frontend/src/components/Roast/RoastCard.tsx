import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, Info, Flame, Thermometer, Snowflake } from 'lucide-react';
import { ScoreDisplay } from './ScoreDisplay';
import { FeedbackSection } from './FeedbackSection';
import { Suggestions } from './Suggestions';
import { ScoreBreakdownModal } from './ScoreBreakdownModal';
import { RoastThermometer } from './RoastThermometer';
import { BadgeDisplay } from './BadgeDisplay';
import { FlameOverlay } from '../Effects/FlameOverlay';
import type { RoastResponse } from '../../types';

interface RoastCardProps {
  roast: RoastResponse;
}

function getTipText(tip: unknown): string {
  if (typeof tip === 'string') return tip;
  if (typeof tip === 'object' && tip !== null) {
    const t = tip as Record<string, unknown>;
    return (t.tip || t.text || t.description || JSON.stringify(tip)) as string;
  }
  return String(tip);
}

function getIntensityLabel(intensity: string) {
  switch (intensity) {
    case 'mild':
      return { label: 'Mild Roast', icon: Snowflake, color: 'text-blue-600 bg-blue-50 border-blue-200' };
    case 'brutal':
      return { label: 'Brutal Roast', icon: Flame, color: 'text-red-600 bg-red-50 border-red-200' };
    default:
      return { label: 'Medium Roast', icon: Thermometer, color: 'text-amber-600 bg-amber-50 border-amber-200' };
  }
}

export function RoastCard({ roast }: RoastCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sections = roast.roast?.sections || roast.sections || [];
  const atsTips = Array.isArray(roast.ats_tips) ? roast.ats_tips : [];
  const intensityInfo = getIntensityLabel(roast.intensity || 'medium');
  const IntensityIcon = intensityInfo.icon;

  return (
    <>
      <FlameOverlay intensity={100 - roast.score}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Score Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {/* Intensity badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-4"
            >
              <span className={`
                inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border
                ${intensityInfo.color}
              `}>
                <IntensityIcon className="w-3.5 h-3.5" />
                {intensityInfo.label}
              </span>
            </motion.div>

            {/* Score and Thermometer row */}
            <div className="flex items-center justify-center gap-8">
              <ScoreDisplay score={roast.score} />
              <RoastThermometer score={roast.score} />
            </div>

            {/* How we score button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-4 text-center"
            >
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <Info className="w-4 h-4" />
                How we score
              </button>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-center"
            >
              <p className="text-lg text-gray-700 font-medium leading-relaxed max-w-2xl mx-auto">
                "{roast.roast?.headline || roast.headline || 'Your resume has been analyzed.'}"
              </p>
            </motion.div>

            {/* Score breakdown mini-bars */}
            {roast.score_breakdown && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 grid grid-cols-4 gap-3"
              >
                {[
                  { key: 'clarity', label: 'Clarity', color: 'bg-blue-500' },
                  { key: 'impact', label: 'Impact', color: 'bg-emerald-500' },
                  { key: 'relevance', label: 'Relevance', color: 'bg-purple-500' },
                  { key: 'ats', label: 'ATS', color: 'bg-amber-500' },
                ].map(({ key, label, color }) => (
                  <div key={key} className="text-center">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${roast.score_breakdown?.[key as keyof typeof roast.score_breakdown] ?? 0}%` }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className={`h-full ${color} rounded-full`}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {roast.score_breakdown?.[key as keyof typeof roast.score_breakdown] ?? 0}
                    </p>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Badges */}
            {roast.badges && roast.badges.length > 0 && (
              <BadgeDisplay badges={roast.badges} />
            )}
          </div>

          {/* Feedback Sections */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-5">
              <FileText className="w-5 h-5 text-gray-600" />
              Detailed Analysis
            </h2>
            <div className="grid gap-4">
              {sections.map((section, index) => (
                <FeedbackSection key={section.title || index} {...section} />
              ))}
            </div>
          </div>

          {/* Suggestions */}
          {(roast.suggestions?.length > 0) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <Suggestions suggestions={roast.suggestions || []} />
            </div>
          )}

          {/* ATS Tips */}
          {atsTips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200 p-6"
            >
              <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                ATS Optimization Tips
              </h3>
              <ul className="space-y-2">
                {atsTips.map((tip, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm text-indigo-800"
                  >
                    <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    {getTipText(tip)}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </motion.div>
      </FlameOverlay>

      {/* Score Breakdown Modal */}
      <ScoreBreakdownModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        breakdown={roast.score_breakdown}
        totalScore={roast.score}
      />
    </>
  );
}
