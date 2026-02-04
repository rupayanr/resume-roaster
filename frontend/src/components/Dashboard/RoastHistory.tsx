import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyRoasts } from '../../lib/api';
import type { RoastHistoryItem } from '../../types';
import { Loader2, FileText, AlertCircle, ExternalLink, Clock } from 'lucide-react';

export function RoastHistory() {
  const [roasts, setRoasts] = useState<RoastHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoasts() {
      try {
        const data = await getMyRoasts();
        setRoasts(data.roasts);
      } catch {
        setError('Failed to load roast history');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRoasts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
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

  if (roasts.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No roasts yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Upload a resume to get your first roast
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {roasts.map((roast) => (
        <Link
          key={roast.id}
          to={`/r/${roast.share_id}`}
          className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-sm font-bold px-2 py-0.5 rounded ${getScoreColor(
                    roast.score
                  )}`}
                >
                  {roast.score}
                </span>
                {roast.resume_filename && (
                  <span className="text-sm text-gray-500 truncate">
                    {roast.resume_filename}
                    {roast.resume_version && (
                      <span className="text-xs text-gray-400 ml-1">
                        (v{roast.resume_version})
                      </span>
                    )}
                  </span>
                )}
              </div>
              <p className="text-gray-700 text-sm line-clamp-2">{roast.headline}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{formatDate(roast.created_at)}</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
        </Link>
      ))}
    </div>
  );
}
