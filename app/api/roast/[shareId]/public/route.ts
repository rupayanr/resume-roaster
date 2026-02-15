import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateShareId } from '@/lib/utils'

export async function PATCH(
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

  // Get is_public from query params or body
  const url = new URL(request.url)
  let isPublic = url.searchParams.get('is_public') === 'true'

  // Try to get from body if not in query params
  try {
    const body = await request.json()
    if (typeof body.is_public === 'boolean') {
      isPublic = body.is_public
    }
  } catch {
    // Body parsing failed, use query param value
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

  await prisma.roast.update({
    where: { shareId },
    data: { isHeadlinePublic: isPublic },
  })

  return NextResponse.json({
    message: 'Updated',
    is_headline_public: isPublic,
  })
}
