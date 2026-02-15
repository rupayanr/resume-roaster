import Groq from 'groq-sdk'
import { getRoastPrompt } from './prompts'

interface RoastResult {
  score: number
  score_breakdown: {
    clarity: number
    impact: number
    relevance: number
    ats: number
  }
  headline: string
  sections: Array<{
    title: string
    icon: string
    points: string[]
  }>
  suggestions: Array<{
    original: string
    improved: string
    why: string
  }>
  ats_tips: string[]
}

export async function generateRoast(
  resumeText: string,
  intensity: string = 'medium',
  industry: string = 'general'
): Promise<RoastResult> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set')
  }

  const client = new Groq({ apiKey })
  const prompt = getRoastPrompt(resumeText, intensity, industry)

  // Adjust temperature based on intensity for more creative brutal roasts
  const temperature = intensity === 'mild' ? 0.1 : intensity === 'medium' ? 0.2 : 0.3

  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'You are a witty resume critic. Always respond with valid JSON only, no markdown code blocks.',
      },
      { role: 'user', content: prompt },
    ],
    temperature,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from Groq API')
  }

  return JSON.parse(content) as RoastResult
}
