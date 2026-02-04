import { FileText, Download, Trash2, Clock } from 'lucide-react';
import type { Resume } from '../../types';

interface ResumeCardProps {
  resume: Resume;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ResumeCard({ resume, onDownload, onDelete }: ResumeCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 truncate max-w-[200px]">
              {resume.filename}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-gray-500">
                Version {resume.version}
              </span>
              {resume.is_latest && (
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                  Latest
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDownload(resume.id)}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(resume.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
        <Clock className="w-3 h-3" />
        <span>Uploaded {formatDate(resume.created_at)}</span>
      </div>
    </div>
  );
}
