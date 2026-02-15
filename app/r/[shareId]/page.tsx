import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { validateShareId } from '@/lib/utils'
import { SharedRoastClient } from './client'

interface PageProps {
  params: Promise<{ shareId: string }>
}

async function getRoast(shareId: string) {
  if (!validateShareId(shareId)) {
    return null
  }

  const roast = await prisma.roast.findUnique({
    where: { shareId },
  })

  if (!roast) {
    return null
  }

  return {
    id: roast.id,
    share_id: roast.shareId,
    score: roast.score,
    score_breakdown: roast.scoreBreakdown as {
      clarity: number
      impact: number
      relevance: number
      ats: number
    },
    headline: roast.headline,
    sections: roast.sections as Array<{
      title: string
      icon: string
      points: string[]
    }>,
    suggestions: roast.suggestions as Array<{
      original: string
      improved: string
      why: string
    }>,
    ats_tips: roast.atsTips as string[],
    created_at: roast.createdAt.toISOString(),
    intensity: roast.intensity as 'mild' | 'medium' | 'brutal',
    industry: roast.industry || undefined,
    badges: (roast.badges || []) as Array<{
      id: string
      name: string
      icon: string
      description?: string
    }>,
    is_headline_public: roast.isHeadlinePublic,
    reactions: (roast.reactions || {}) as Record<string, number>,
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shareId } = await params
  const roast = await getRoast(shareId)

  if (!roast) {
    return {
      title: 'Roast Not Found - Resume Roaster',
    }
  }

  const title = `Score: ${roast.score}/100 - Resume Roaster`
  const description = roast.headline

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [`/api/roast/${shareId}/og-image`],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/api/roast/${shareId}/og-image`],
    },
  }
}

export default async function SharedRoastPage({ params }: PageProps) {
  const { shareId } = await params
  const roast = await getRoast(shareId)

  if (!roast) {
    notFound()
  }

  return <SharedRoastClient roast={roast} />
}
