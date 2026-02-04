import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Brain,
  MessageSquare,
  Lightbulb,
  Check,
  Loader2
} from 'lucide-react';

interface Step {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  duration: number; // ms to stay on this step
}

const steps: Step[] = [
  {
    id: 'upload',
    label: 'Uploading Resume',
    description: 'Securely transferring your file...',
    icon: <Upload className="w-5 h-5" />,
    duration: 800,
  },
  {
    id: 'extract',
    label: 'Extracting Text',
    description: 'Reading content from your PDF...',
    icon: <FileText className="w-5 h-5" />,
    duration: 1200,
  },
  {
    id: 'analyze',
    label: 'Analyzing Content',
    description: 'AI is reviewing your experience and skills...',
    icon: <Brain className="w-5 h-5" />,
    duration: 3000,
  },
  {
    id: 'feedback',
    label: 'Generating Feedback',
    description: 'Crafting personalized recommendations...',
    icon: <MessageSquare className="w-5 h-5" />,
    duration: 2500,
  },
  {
    id: 'suggestions',
    label: 'Preparing Suggestions',
    description: 'Creating before/after improvements...',
    icon: <Lightbulb className="w-5 h-5" />,
    duration: 2000,
  },
];

interface ProcessingStepperProps {
  fileName: string;
  isProcessing: boolean;
}

export function ProcessingStepper({ fileName, isProcessing }: ProcessingStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isProcessing) {
      setCurrentStep(0);
      setCompletedSteps(new Set());
      return;
    }

    let stepIndex = 0;
    const advanceStep = () => {
      if (stepIndex < steps.length - 1) {
        setCompletedSteps(prev => new Set([...prev, stepIndex]));
        stepIndex++;
        setCurrentStep(stepIndex);
        setTimeout(advanceStep, steps[stepIndex].duration);
      }
    };

    const timer = setTimeout(advanceStep, steps[0].duration);
    return () => clearTimeout(timer);
  }, [isProcessing]);

  return (
    <div className="max-w-lg mx-auto">
      {/* File being processed */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
            <p className="text-xs text-gray-500">Processing your resume...</p>
          </div>
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        </div>
      </motion.div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(index);
          const isCurrent = index === currentStep;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-300
                ${isCurrent
                  ? 'bg-blue-50 border-blue-200 shadow-sm'
                  : isCompleted
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-gray-50 border-gray-200 opacity-60'}
              `}
            >
              {/* Step indicator */}
              <div className={`
                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                ${isCurrent
                  ? 'bg-blue-600 text-white'
                  : isCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-300 text-gray-500'}
              `}>
                <AnimatePresence mode="wait">
                  {isCompleted ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : isCurrent ? (
                    <motion.div
                      key="loading"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      {step.icon}
                    </motion.div>
                  ) : (
                    <motion.div key="icon">
                      {step.icon}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0 pt-1">
                <p className={`
                  text-sm font-medium transition-colors
                  ${isCurrent
                    ? 'text-blue-900'
                    : isCompleted
                      ? 'text-emerald-900'
                      : 'text-gray-600'}
                `}>
                  {step.label}
                </p>
                {(isCurrent || isCompleted) && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`
                      text-xs mt-0.5
                      ${isCurrent ? 'text-blue-600' : 'text-emerald-600'}
                    `}
                  >
                    {isCompleted ? 'Completed' : step.description}
                  </motion.p>
                )}
              </div>

              {/* Progress indicator for current step */}
              {isCurrent && (
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-blue-600 rounded-b-xl"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: step.duration / 1000, ease: 'linear' }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Tip */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs text-gray-500 mt-6"
      >
        AI analysis typically takes 10-30 seconds depending on resume length
      </motion.p>
    </div>
  );
}
