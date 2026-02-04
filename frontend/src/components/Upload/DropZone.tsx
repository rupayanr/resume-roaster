import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, FileText } from 'lucide-react';

interface DropZoneProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
}

export function DropZone({ onUpload, disabled }: DropZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled,
    onDrop: (files) => {
      if (files[0]) {
        onUpload(files[0]);
      }
    },
  });

  return (
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
  );
}
