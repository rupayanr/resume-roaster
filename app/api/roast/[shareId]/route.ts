import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateShareId } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params

  // Validate share ID format
  if (!validateShareId(shareId)) {
    return NextResponse.json(
      { detail: 'Invalid share ID format' },
      { status: 400 }
    )
  }

  const roast = await prisma.roast.findUnique({
    where: { shareId },
  })

  if (!roast) {
    return NextResponse.json(
      { detail: 'Roast not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    id: roast.id,
    share_id: roast.shareId,
    score: roast.score,
    score_breakdown: roast.scoreBreakdown,
    headline: roast.headline,
    sections: roast.sections,
    suggestions: roast.suggestions,
    ats_tips: roast.atsTips,
    created_at: roast.createdAt.toISOString(),
    intensity: roast.intensity,
    industry: roast.industry,
    badges: roast.badges,
    is_headline_public: roast.isHeadlinePublic,
    reactions: roast.reactions,
  })
}
