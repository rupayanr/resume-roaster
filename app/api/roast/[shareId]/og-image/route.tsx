import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params

  // Fetch roast data from our own API
  const baseUrl = request.nextUrl.origin
  const roastResponse = await fetch(`${baseUrl}/api/roast/${shareId}`)

  if (!roastResponse.ok) {
    return new Response('Roast not found', { status: 404 })
  }

  const roast = await roastResponse.json()
  const score = roast.score
  const headline = roast.headline
  const intensity = roast.intensity

  // Determine colors based on intensity
  const bgGradient = intensity === 'brutal'
    ? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)'
    : intensity === 'medium'
    ? 'linear-gradient(135deg, #92400e 0%, #b45309 100%)'
    : 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)'

  const scoreColor = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : score >= 40 ? '#f97316' : '#ef4444'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: bgGradient,
          padding: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '24px',
            padding: '48px',
            width: '90%',
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: 'white',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            Resume Roaster
          </div>

          {/* Score */}
          <div
            style={{
              fontSize: 120,
              fontWeight: 800,
              color: scoreColor,
              lineHeight: 1,
              marginBottom: '24px',
            }}
          >
            {score}
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: 28,
              color: 'white',
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.4,
              opacity: 0.9,
            }}
          >
            &ldquo;{headline}&rdquo;
          </div>

          {/* Intensity badge */}
          <div
            style={{
              marginTop: '32px',
              fontSize: 18,
              fontWeight: 600,
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '8px 24px',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            {intensity} roast
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
