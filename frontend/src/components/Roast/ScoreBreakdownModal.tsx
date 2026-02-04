import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Target, Sparkles, FileSearch, Info } from 'lucide-react';
import type { ScoreBreakdown } from '../../types';

interface ScoreBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakdown?: ScoreBreakdown;
  totalScore: number;
}

type ColorKey = 'blue' | 'emerald' | 'purple' | 'amber';

const criteria: Array<{
  key: 'clarity' | 'impact' | 'relevance' | 'ats';
  label: string;
  icon: React.ReactNode;
  color: ColorKey;
  description: string;
  factors: string[];
}> = [
  {
    key: 'clarity',
    label: 'Clarity',
    icon: <Eye className="w-5 h-5" />,
    color: 'blue',
    description: 'How clear and readable is your resume?',
    factors: [
      'Clean, organized structure',
      'Easy to scan quickly',
      'Concise, jargon-free language',
      'Logical flow of information',
      'Proper use of bullet points',
    ],
  },
  {
    key: 'impact',
    label: 'Impact',
    icon: <Target className="w-5 h-5" />,
    color: 'emerald',
    description: 'Do you showcase measurable achievements?',
    factors: [
      'Quantifiable results (%, $, #)',
      'Strong action verbs',
      'Specific accomplishments',
      'Business impact highlighted',
      'Awards and recognition',
    ],
  },
  {
    key: 'relevance',
    label: 'Relevance',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'purple',
    description: 'Does your content match the job market?',
    factors: [
      'Skills align with industry needs',
      'Recent, relevant experience',
      'Appropriate level of detail',
      'Targeted to role type',
      'Current technologies/methods',
    ],
  },
  {
    key: 'ats',
    label: 'ATS Compatibility',
    icon: <FileSearch className="w-5 h-5" />,
    color: 'amber',
    description: 'Can applicant tracking systems read it?',
    factors: [
      'Standard section headings',
      'No tables or complex formatting',
      'Relevant keywords present',
      'Clean, parseable layout',
      'Common file format (.pdf)',
    ],
  },
];

const colorClasses = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    bar: 'bg-blue-500',
    border: 'border-blue-200',
  },
  emerald: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    bar: 'bg-emerald-500',
    border: 'border-emerald-200',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    bar: 'bg-purple-500',
    border: 'border-purple-200',
  },
  amber: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    bar: 'bg-amber-500',
    border: 'border-amber-200',
  },
};

export function ScoreBreakdownModal({ isOpen, onClose, breakdown, totalScore }: ScoreBreakdownModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl md:w-full bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">How We Score</h2>
                  <p className="text-sm text-gray-500">Your resume is evaluated on 4 key criteria</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Overall Score */}
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Overall Score</p>
                <p className="text-4xl font-bold text-gray-900">{totalScore}<span className="text-lg text-gray-400">/100</span></p>
                <p className="text-xs text-gray-500 mt-1">Average of all 4 criteria (25% each)</p>
              </div>

              {/* Criteria Breakdown */}
              <div className="space-y-4">
                {criteria.map((criterion, index) => {
                  const score = breakdown?.[criterion.key] ?? 0;
                  const colors = colorClasses[criterion.color];

                  return (
                    <motion.div
                      key={criterion.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl border ${colors.border} ${colors.bg}/30`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0 ${colors.text}`}>
                          {criterion.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900">{criterion.label}</h3>
                            <span className={`text-lg font-bold ${colors.text}`}>{score}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{criterion.description}</p>

                          {/* Progress bar */}
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${score}%` }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                              className={`h-full ${colors.bar} rounded-full`}
                            />
                          </div>

                          {/* Factors */}
                          <div className="flex flex-wrap gap-1.5">
                            {criterion.factors.map((factor) => (
                              <span
                                key={factor}
                                className="text-xs px-2 py-0.5 bg-white rounded border border-gray-200 text-gray-600"
                              >
                                {factor}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Formula */}
              <div className="p-4 bg-gray-900 rounded-xl text-center">
                <p className="text-xs text-gray-400 mb-2">Scoring Formula</p>
                <p className="text-sm font-mono text-white">
                  Score = (Clarity + Impact + Relevance + ATS) / 4
                </p>
                {breakdown && (
                  <p className="text-xs font-mono text-gray-400 mt-2">
                    {totalScore} = ({breakdown.clarity} + {breakdown.impact} + {breakdown.relevance} + {breakdown.ats}) / 4
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
