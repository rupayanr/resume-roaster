import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateRoast } from '@/lib/roaster'
import { detectBadges } from '@/lib/badges'
import { extractTextFromPdf, validatePdfMagicBytes } from '@/lib/pdf'
import {
  generateShareId,
  generateContentHash,
  VALID_INTENSITIES,
  VALID_INDUSTRIES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
} from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const intensity = (formData.get('intensity') as string) || 'medium'
    const industry = (formData.get('industry') as string) || 'general'

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { detail: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file extension
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { detail: 'Only PDF files are accepted' },
        { status: 400 }
      )
    }

    // Validate intensity
    if (!VALID_INTENSITIES.has(intensity)) {
      return NextResponse.json(
        { detail: `Invalid intensity. Must be one of: ${Array.from(VALID_INTENSITIES).join(', ')}` },
        { status: 400 }
      )
    }

    // Validate industry
    if (!VALID_INDUSTRIES.has(industry)) {
      return NextResponse.json(
        { detail: `Invalid industry. Must be one of: ${Array.from(VALID_INDUSTRIES).join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { detail: `File too large. Max size is ${MAX_FILE_SIZE_MB}MB` },
        { status: 413 }
      )
    }

    // Read file bytes
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Validate PDF magic bytes
    if (!validatePdfMagicBytes(buffer)) {
      return NextResponse.json(
        { detail: 'Invalid PDF file. File does not appear to be a valid PDF.' },
        { status: 400 }
      )
    }

    // Extract text from PDF
    let resumeText: string
    try {
      resumeText = await extractTextFromPdf(buffer)
    } catch {
      return NextResponse.json(
        { detail: 'Failed to parse PDF file' },
        { status: 400 }
      )
    }

    if (!resumeText.trim()) {
      return NextResponse.json(
        { detail: 'Could not extract text from PDF' },
        { status: 400 }
      )
    }

    // Check for existing roast with same content
    const contentHash = generateContentHash(resumeText, intensity, industry)
    const existingRoast = await prisma.roast.findFirst({
      where: { contentHash },
      orderBy: { createdAt: 'desc' },
    })

    if (existingRoast) {
      return NextResponse.json({
        id: existingRoast.id,
        share_id: existingRoast.shareId,
        score: existingRoast.score,
        score_breakdown: existingRoast.scoreBreakdown,
        headline: existingRoast.headline,
        sections: existingRoast.sections,
        suggestions: existingRoast.suggestions,
        ats_tips: existingRoast.atsTips,
        created_at: existingRoast.createdAt.toISOString(),
        intensity: existingRoast.intensity,
        industry: existingRoast.industry,
        badges: existingRoast.badges,
        is_headline_public: existingRoast.isHeadlinePublic,
        reactions: existingRoast.reactions,
        cached: true,
      })
    }

    // Generate roast
    let roastData
    try {
      roastData = await generateRoast(resumeText, intensity, industry)
    } catch (error) {
      console.error('Roast generation error:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      return NextResponse.json(
        { detail: `Failed to generate roast: ${message}` },
        { status: 500 }
      )
    }

    // Detect badges
    const score = roastData.score || 0
    const badges = detectBadges(resumeText, score)

    // Create roast record
    const roast = await prisma.roast.create({
      data: {
        shareId: generateShareId(),
        contentHash,
        score,
        scoreBreakdown: roastData.score_breakdown || {
          clarity: 0,
          impact: 0,
          relevance: 0,
          ats: 0,
        },
        headline: roastData.headline || '',
        sections: roastData.sections || [],
        suggestions: roastData.suggestions || [],
        atsTips: roastData.ats_tips || [],
        intensity,
        industry: industry !== 'general' ? industry : null,
        badges: badges as unknown as object[],
        isHeadlinePublic: false,
        reactions: {},
      },
    })

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
  } catch (error) {
    console.error('Roast API error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
