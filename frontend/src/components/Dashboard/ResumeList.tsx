import { useState, useEffect } from 'react';
import { ResumeCard } from './ResumeCard';
import { listResumes, downloadResume, deleteResume } from '../../lib/api';
import type { Resume } from '../../types';
import { Loader2, FileText, AlertCircle } from 'lucide-react';

export function ResumeList() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const data = await listResumes();
      setResumes(data.resumes);
    } catch {
      setError('Failed to load resumes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const blob = await downloadResume(id);
      const resume = resumes.find((r) => r.id === id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resume?.filename || 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      setError('Failed to download resume');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      await deleteResume(id);
      setResumes(resumes.filter((r) => r.id !== id));
    } catch {
      setError('Failed to delete resume');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No resumes uploaded yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Upload a resume to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {resumes.map((resume) => (
        <ResumeCard
          key={resume.id}
          resume={resume}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
