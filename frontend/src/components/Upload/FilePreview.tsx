import { motion } from 'framer-motion';
import { FileText, X, Loader2 } from 'lucide-react';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
  isUploading: boolean;
}

export function FilePreview({ file, onRemove, isUploading }: FilePreviewProps) {
  const fileSizeKB = (file.size / 1024).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-gray-800 text-sm">{file.name}</p>
          <p className="text-xs text-gray-500">{fileSizeKB} KB</p>
        </div>
      </div>
      {isUploading ? (
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
      ) : (
        <button
          onClick={onRemove}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          aria-label="Remove file"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}
