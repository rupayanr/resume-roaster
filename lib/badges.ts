import type { Badge } from '@/types'

// Common buzzwords to detect
const BUZZWORDS = [
  'synergy', 'leverage', 'paradigm', 'proactive', 'innovative',
  'dynamic', 'strategic', 'results-driven', 'team player',
  'self-starter', 'detail-oriented', 'passionate', 'guru',
  'ninja', 'rockstar', 'thought leader', 'visionary',
  'disruptive', 'scalable', 'agile', 'cross-functional',
]

// Outdated skills that suggest time traveler
const OUTDATED_SKILLS = [
  'flash', 'actionscript', 'coldfusion', 'dreamweaver',
  'frontpage', 'vbscript', 'cobol', 'fortran', 'pascal',
  'delphi', 'foxpro', 'clipper', 'lotus notes', 'microsoft office 2003',
  'internet explorer', 'silverlight', 'visual basic 6',
]

const BADGE_DEFINITIONS: Badge[] = [
  {
    id: 'buzzword_bingo',
    name: 'Buzzword Bingo',
    icon: 'target',
    description: 'Resume is overflowing with corporate jargon',
  },
  {
    id: 'novel_writer',
    name: 'Novel Writer',
    icon: 'book',
    description: 'Resume longer than most Netflix episodes',
  },
  {
    id: 'mystery_candidate',
    name: 'Mystery Candidate',
    icon: 'ghost',
    description: 'Missing basic contact information',
  },
  {
    id: 'time_traveler',
    name: 'Time Traveler',
    icon: 'clock',
    description: 'Skills from a bygone era detected',
  },
  {
    id: 'humble_bragger',
    name: 'Humble Bragger',
    icon: 'medal',
    description: '"Responsible for" everything, apparently',
  },
  {
    id: 'metric_master',
    name: 'Metric Master',
    icon: 'chart',
    description: 'Numbers game is strong',
  },
  {
    id: 'fireproof',
    name: 'Fireproof',
    icon: 'shield',
    description: 'Escaped the roast nearly unscathed',
  },
  {
    id: 'needs_work',
    name: 'Work in Progress',
    icon: 'hard-hat',
    description: 'This resume needs some serious TLC',
  },
  {
    id: 'action_hero',
    name: 'Action Hero',
    icon: 'zap',
    description: 'Strong action verbs throughout',
  },
  {
    id: 'serial_job_hopper',
    name: 'Serial Job Hopper',
    icon: 'repeat',
    description: 'More jobs than years of experience',
  },
  {
    id: 'one_page_wonder',
    name: 'One Page Wonder',
    icon: 'file',
    description: 'Kept it concise and clean',
  },
  {
    id: 'emoji_enthusiast',
    name: 'Emoji Enthusiast',
    icon: 'smile',
    description: 'Emojis detected in a resume... bold choice',
  },
]

function countBuzzwords(text: string): number {
  const textLower = text.toLowerCase()
  return BUZZWORDS.filter(word => textLower.includes(word)).length
}

function hasContactInfo(text: string): boolean {
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text)
  const hasPhone = /[\d\-()+ ]{10,}/.test(text)
  return hasEmail || hasPhone
}

function hasOutdatedSkills(text: string): boolean {
  const textLower = text.toLowerCase()
  return OUTDATED_SKILLS.some(skill => textLower.includes(skill))
}

function countMetrics(text: string): number {
  const percentageMatches = (text.match(/\d+%/g) || []).length
  const dollarMatches = (text.match(/\$[\d,]+/g) || []).length
  const numberMatches = (text.match(/\b\d+[kKmMbB]?\+?\s*(users|customers|clients|team|people|employees|revenue|sales)/gi) || []).length
  return percentageMatches + dollarMatches + numberMatches
}

function countActionVerbs(text: string): number {
  const actionVerbs = [
    'achieved', 'accelerated', 'built', 'created', 'delivered',
    'designed', 'developed', 'drove', 'executed', 'generated',
    'implemented', 'increased', 'launched', 'led', 'managed',
    'optimized', 'reduced', 'scaled', 'spearheaded', 'transformed',
  ]
  const textLower = text.toLowerCase()
  return actionVerbs.reduce((count, verb) => count + (textLower.split(verb).length - 1), 0)
}

function countJobs(text: string): number {
  const datePatterns = text.match(/\b(19|20)\d{2}\s*[-–]\s*(present|19|20)\d{0,2}/gi) || []
  return Math.max(datePatterns.length, 1)
}

function estimateLength(text: string): number {
  // Rough estimate: ~3000 chars per page
  return Math.floor(text.length / 3000) + 1
}

function hasEmojis(text: string): boolean {
  const emojiPattern = /[\uD83C-\uDBFF\uDC00-\uDFFF]|\u00A9|\u00AE|[\u2000-\u3300]|\uD83C[\uD000-\uDFFF]|\uD83D[\uD000-\uDFFF]|\uD83E[\uD000-\uDFFF]/
  return emojiPattern.test(text)
}

export function detectBadges(resumeText: string, score: number): Badge[] {
  const earnedBadges: Badge[] = []

  // Buzzword Bingo - 5+ buzzwords
  if (countBuzzwords(resumeText) >= 5) {
    earnedBadges.push(BADGE_DEFINITIONS.find(b => b.id === 'buzzword_bingo')!)
  }

  // Novel Writer - Very long resume (3+ pages worth of text)
  if (estimateLength(resumeText) >= 3) {
    earnedBadges.push(BADGE_DEFINITIONS.find(b => b.id === 'novel_writer')!)
  }

  // Mystery Candidate - No contact info
  if (!hasContactInfo(resumeText)) {
    earnedBadges.push(BADGE_DEFINITIONS.find(b => b.id === 'mystery_candidate')!)
  }

  // Time Traveler - Outdated skills
  if (hasOutdatedSkills(resumeText)) {
    earnedBadges.push(BADGE_DEFINITIONS.find(b => b.id === 'time_traveler')!)
  }

  // Humble Bragger - Overuse of "responsible for"
  if ((resumeText.toLowerCase().match(/responsible for/g) || []).length >= 3) {
    earnedBadges.push(BADGE_DEFINITIONS.find(b => b.id === 'humble_bragger')!)
  }

  // Metric Master - Lots of quantifiable achievements
  if (countMetrics(resumeText) >= 5) {
    earnedBadges.push(BADGE_DEFINITIONS.find(b => b.id === 'metric_master')!)
  }

  // Fireproof - Excellent score
  if (score >= 85) {
    earnedBadges.push(BADGE_DEFINITIONS.find(b => b.id === 'fireproof')!)
  }

  // Needs Work - Poor score
  if (score < 40) {
    earnedBadges.push(BADGE_DEFINITIONS.find(b => b.id === 'needs_work')!)
  }

  // Action Hero - Lots of action verbs
  if (countActionVerbs(resumeText) >= 10) {
    earnedBadges.push(BADGE_DEFINITIONS.find(b => b.id === 'action_hero')!)
  }

  // Serial Job Hopper - Many jobs
  if (countJobs(resumeText) >= 5) {
    earnedBadges.push(BADGE_DEFINITIONS.find(b => b.id === 'serial_job_hopper')!)
  }

  // One Page Wonder - Short and sweet
  if (estimateLength(resumeText) === 1 && resumeText.length >= 500) {
    earnedBadges.push(BADGE_DEFINITIONS.find(b => b.id === 'one_page_wonder')!)
  }

  // Emoji Enthusiast - Emojis in resume
  if (hasEmojis(resumeText)) {
    earnedBadges.push(BADGE_DEFINITIONS.find(b => b.id === 'emoji_enthusiast')!)
  }

  return earnedBadges.filter(Boolean)
}
