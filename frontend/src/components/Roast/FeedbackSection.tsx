import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Pencil } from 'lucide-react';
import type { RoastSection } from '../../types';

const iconMap: Record<string, React.ReactNode> = {
  check: <CheckCircle className="w-5 h-5 text-emerald-600" />,
  alert: <AlertCircle className="w-5 h-5 text-amber-600" />,
  edit: <Pencil className="w-5 h-5 text-blue-600" />,
};

const bgColorMap: Record<string, string> = {
  check: 'bg-emerald-50 border-emerald-200',
  alert: 'bg-amber-50 border-amber-200',
  edit: 'bg-blue-50 border-blue-200',
};

const titleColorMap: Record<string, string> = {
  check: 'text-emerald-800',
  alert: 'text-amber-800',
  edit: 'text-blue-800',
};

export function FeedbackSection({ title, icon, points }: RoastSection) {
  const safePoints = Array.isArray(points) ? points : [];
  const iconKey = typeof icon === 'string' ? icon.toLowerCase() : 'edit';
  const iconElement = iconMap[iconKey] || iconMap.edit;
  const bgColor = bgColorMap[iconKey] || bgColorMap.edit;
  const titleColor = titleColorMap[iconKey] || titleColorMap.edit;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-5 ${bgColor}`}
    >
      <h3 className={`text-base font-semibold flex items-center gap-2 ${titleColor}`}>
        {iconElement}
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {safePoints.map((point, index) => {
          const pointText = typeof point === 'string'
            ? point
            : (point as { description?: string }).description || JSON.stringify(point);
          return (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="text-sm text-gray-700 leading-relaxed pl-4 border-l-2 border-gray-300"
            >
              {pointText}
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
}
