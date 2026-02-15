import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateShareId, VALID_REACTIONS } from '@/lib/utils'

export async function POST(
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

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { detail: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const { reaction } = body

  // Validate reaction type
  if (!reaction || !VALID_REACTIONS.has(reaction)) {
    return NextResponse.json(
      { detail: `Invalid reaction. Must be one of: ${Array.from(VALID_REACTIONS).join(', ')}` },
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

  // Update reaction count
  const currentReactions = (roast.reactions as Record<string, number>) || {}
  currentReactions[reaction] = (currentReactions[reaction] || 0) + 1

  await prisma.roast.update({
    where: { shareId },
    data: { reactions: currentReactions },
  })

  return NextResponse.json({
    reactions: currentReactions,
  })
}
