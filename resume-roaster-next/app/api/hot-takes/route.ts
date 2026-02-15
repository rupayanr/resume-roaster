import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  let limit = parseInt(url.searchParams.get('limit') || '10', 10)

  // Validate and cap limit
  if (limit < 1) limit = 1
  if (limit > 50) limit = 50

  const roasts = await prisma.roast.findMany({
    where: { isHeadlinePublic: true },
    select: {
      headline: true,
      score: true,
    },
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Shuffle the results for randomness
  const shuffled = roasts.sort(() => Math.random() - 0.5)

  return NextResponse.json({
    hot_takes: shuffled.map(r => ({
      headline: r.headline,
      score: r.score,
    })),
  })
}
