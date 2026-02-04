import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container } from '../components/Layout/Container';
import { RoastCard } from '../components/Roast/RoastCard';
import { ShareButton } from '../components/Share/ShareButton';
import { getRoast } from '../lib/api';
import type { RoastResponse } from '../types';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export function SharedRoastPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [roast, setRoast] = useState<RoastResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoast() {
      if (!shareId) return;

      try {
        const data = await getRoast(shareId);
        // Transform the data to match the expected format
        const transformedData: RoastResponse = {
          ...data,
          share_url: `${window.location.origin}/r/${data.share_id}`,
          roast: {
            headline: data.headline,
            sections: data.sections,
          },
        };
        setRoast(transformedData);
      } catch {
        setError('Roast not found');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRoast();
  }, [shareId]);

  if (isLoading) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Loading roast...</p>
        </div>
      </Container>
    );
  }

  if (error || !roast) {
    return (
      <Container>
        <div className="max-w-md mx-auto mt-16 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Roast Not Found</h1>
          <p className="text-gray-600 mb-6">
            This roast may have been deleted or the link is invalid.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Analyze Your Resume
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Analyze Your Resume
          </Link>
          <ShareButton shareUrl={roast.share_url || `${window.location.origin}/r/${roast.share_id}`} />
        </div>

        <RoastCard roast={roast} />
      </div>
    </Container>
  );
}
