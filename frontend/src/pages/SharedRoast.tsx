import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Container } from '../components/Layout/Container';
import { RoastCard } from '../components/Roast/RoastCard';
import { ShareButton } from '../components/Share/ShareButton';
import { ReactionBar } from '../components/Roast/ReactionBar';
import { getRoast, getOgImageUrl } from '../lib/api';
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

  const handleReactionUpdate = (newReactions: Record<string, number>) => {
    if (roast) {
      setRoast({ ...roast, reactions: newReactions });
    }
  };

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
            Get Your Resume Roasted
          </Link>
        </div>
      </Container>
    );
  }

  const ogImageUrl = shareId ? getOgImageUrl(shareId) : '';
  const shareUrl = roast.share_url || `${window.location.origin}/r/${roast.share_id}`;
  const pageTitle = `Resume Roast: Score ${roast.score}/100`;
  const pageDescription = roast.headline || 'Check out this resume roast!';

  return (
    <>
      {/* SEO and OG Meta Tags */}
      <Helmet>
        <title>{pageTitle} | Resume Roaster</title>
        <meta name="description" content={pageDescription} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>

      <Container>
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Get Your Resume Roasted
            </Link>
            <ShareButton
              shareUrl={shareUrl}
              headline={roast.headline}
              score={roast.score}
            />
          </div>

          <RoastCard roast={roast} />

          {/* Reaction Bar */}
          {shareId && (
            <ReactionBar
              shareId={shareId}
              reactions={roast.reactions || {}}
              onReactionUpdate={handleReactionUpdate}
            />
          )}
        </div>
      </Container>
    </>
  );
}
