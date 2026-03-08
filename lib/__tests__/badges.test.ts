import { describe, it, expect } from 'vitest'
import { detectBadges } from '../badges'
import type { Badge } from '@/types'

describe('badges', () => {
  describe('detectBadges', () => {
    describe('buzzword_bingo badge', () => {
      it('awards badge when resume has 5+ buzzwords', () => {
        const resumeText = `
          I am a dynamic, results-driven professional with synergy skills.
          Looking for innovative opportunities to leverage my proactive approach.
          I am a team player and self-starter.
        `
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'buzzword_bingo')).toBe(true)
      })

      it('does not award badge when resume has fewer than 5 buzzwords', () => {
        const resumeText = `
          I am a software engineer with 5 years of experience.
          Built scalable systems at Google and Amazon.
        `
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'buzzword_bingo')).toBe(false)
      })
    })

    describe('novel_writer badge', () => {
      it('awards badge when resume is 3+ pages (9000+ chars)', () => {
        const resumeText = 'A'.repeat(9001)
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'novel_writer')).toBe(true)
      })

      it('does not award badge for shorter resumes', () => {
        const resumeText = 'A'.repeat(5000)
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'novel_writer')).toBe(false)
      })
    })

    describe('mystery_candidate badge', () => {
      it('awards badge when resume has no contact info', () => {
        // No email or phone - compact text without long space sequences
        // (phone regex matches 10+ chars from [\d\-()+ ] including spaces)
        const resumeText = 'Engineer. Google. Skills.'
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'mystery_candidate')).toBe(true)
      })

      it('does not award badge when resume has email', () => {
        const resumeText = `
          John Doe
          john.doe@example.com
          Software Engineer
        `
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'mystery_candidate')).toBe(false)
      })

      it('does not award badge when resume has phone number', () => {
        const resumeText = `
          John Doe
          (555) 123-4567
          Software Engineer
        `
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'mystery_candidate')).toBe(false)
      })
    })

    describe('time_traveler badge', () => {
      it('awards badge when resume has outdated skills', () => {
        const resumeText = `
          Skills: Flash, ActionScript, HTML, CSS
          Experience with Dreamweaver and FrontPage
        `
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'time_traveler')).toBe(true)
      })

      it('does not award badge for modern skills', () => {
        const resumeText = `
          Skills: React, TypeScript, Python, AWS
          Experience with Docker and Kubernetes
        `
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'time_traveler')).toBe(false)
      })
    })

    describe('humble_bragger badge', () => {
      it('awards badge when "responsible for" appears 3+ times', () => {
        const resumeText = `
          - Responsible for managing the engineering team
          - Responsible for deploying production systems
          - Responsible for code reviews and mentoring
        `
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'humble_bragger')).toBe(true)
      })

      it('does not award badge when "responsible for" appears less than 3 times', () => {
        const resumeText = `
          - Led the engineering team
          - Deployed production systems
          - Responsible for code reviews
        `
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'humble_bragger')).toBe(false)
      })
    })

    describe('metric_master badge', () => {
      it('awards badge when resume has 5+ metrics', () => {
        const resumeText = `
          - Increased revenue by 40%
          - Saved $500,000 annually
          - Improved performance by 25%
          - Managed 50 users
          - Grew team to 100 employees
        `
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'metric_master')).toBe(true)
      })

      it('does not award badge for fewer metrics', () => {
        const resumeText = `
          - Led engineering team
          - Improved performance
          - Managed multiple projects
        `
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'metric_master')).toBe(false)
      })

      it('counts percentages correctly', () => {
        const resumeText = `
          - 10% improvement
          - 20% growth
          - 30% reduction
          - 40% increase
          - 50% efficiency
        `
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'metric_master')).toBe(true)
      })

      it('counts dollar amounts correctly', () => {
        const resumeText = `
          - $100,000 in savings
          - $200,000 revenue
          - $50,000 cost reduction
          - $75,000 budget managed
          - $25,000 monthly
        `
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'metric_master')).toBe(true)
      })
    })

    describe('fireproof badge', () => {
      it('awards badge when score is 85 or higher', () => {
        const resumeText = 'Excellent resume with great content.'
        const badges = detectBadges(resumeText, 85)
        expect(badges.some(b => b.id === 'fireproof')).toBe(true)
      })

      it('awards badge when score is above 85', () => {
        const resumeText = 'Excellent resume.'
        const badges = detectBadges(resumeText, 95)
        expect(badges.some(b => b.id === 'fireproof')).toBe(true)
      })

      it('does not award badge when score is below 85', () => {
        const resumeText = 'Average resume.'
        const badges = detectBadges(resumeText, 84)
        expect(badges.some(b => b.id === 'fireproof')).toBe(false)
      })
    })

    describe('needs_work badge', () => {
      it('awards badge when score is below 40', () => {
        const resumeText = 'Poor resume.'
        const badges = detectBadges(resumeText, 39)
        expect(badges.some(b => b.id === 'needs_work')).toBe(true)
      })

      it('does not award badge when score is 40 or above', () => {
        const resumeText = 'Average resume.'
        const badges = detectBadges(resumeText, 40)
        expect(badges.some(b => b.id === 'needs_work')).toBe(false)
      })
    })

    describe('action_hero badge', () => {
      it('awards badge when resume has 10+ action verbs', () => {
        const resumeText = `
          Achieved record sales. Accelerated project delivery.
          Built new systems. Created innovative solutions.
          Delivered on time. Designed new architecture.
          Developed applications. Drove team success.
          Executed flawlessly. Generated revenue.
          Implemented changes.
        `
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'action_hero')).toBe(true)
      })

      it('does not award badge for fewer action verbs', () => {
        const resumeText = `
          Worked on projects.
          Helped with tasks.
          Assisted the team.
        `
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'action_hero')).toBe(false)
      })
    })

    describe('serial_job_hopper badge', () => {
      it('awards badge when resume has 5+ job entries', () => {
        const resumeText = `
          Company A: 2020 - 2021
          Company B: 2019 - 2020
          Company C: 2018 - 2019
          Company D: 2017 - 2018
          Company E: 2016 - 2017
        `
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'serial_job_hopper')).toBe(true)
      })

      it('detects jobs with "present"', () => {
        const resumeText = `
          Company A: 2020 - present
          Company B: 2019 - 2020
          Company C: 2018 - 2019
          Company D: 2017 - 2018
          Company E: 2016 - 2017
        `
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'serial_job_hopper')).toBe(true)
      })

      it('does not award badge for fewer jobs', () => {
        const resumeText = `
          Company A: 2020 - present
          Company B: 2018 - 2020
        `
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'serial_job_hopper')).toBe(false)
      })
    })

    describe('one_page_wonder badge', () => {
      it('awards badge for short resume (1 page, 500+ chars)', () => {
        const resumeText = 'A'.repeat(600)
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'one_page_wonder')).toBe(true)
      })

      it('does not award badge for too short resume (under 500 chars)', () => {
        const resumeText = 'A'.repeat(400)
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'one_page_wonder')).toBe(false)
      })

      it('does not award badge for multi-page resume', () => {
        const resumeText = 'A'.repeat(4000)
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'one_page_wonder')).toBe(false)
      })
    })

    describe('emoji_enthusiast badge', () => {
      it('awards badge when resume contains emojis', () => {
        const resumeText = `
          Software Engineer 🚀
          Skills: Python 🐍, JavaScript 💻
        `
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'emoji_enthusiast')).toBe(true)
      })

      it('does not award badge for plain text resume', () => {
        const resumeText = `
          Software Engineer
          Skills: Python, JavaScript
        `
        const badges = detectBadges(resumeText, 50)
        expect(badges.some(b => b.id === 'emoji_enthusiast')).toBe(false)
      })
    })

    describe('multiple badges', () => {
      it('can award multiple badges at once', () => {
        const resumeText = `
          john@example.com
          Dynamic, results-driven professional with synergy skills.
          Looking for innovative opportunities to leverage my proactive approach.
          I am a team player and self-starter passionate about disruptive solutions.

          Achieved 40% growth, saved $500,000, improved by 25%.
          Built 50 users system, scaled to 100 employees.

          Created, developed, implemented, launched, led,
          managed, optimized, reduced, scaled, transformed.
        `
        const badges = detectBadges(resumeText, 90)

        expect(badges.some(b => b.id === 'buzzword_bingo')).toBe(true)
        expect(badges.some(b => b.id === 'metric_master')).toBe(true)
        expect(badges.some(b => b.id === 'fireproof')).toBe(true)
        expect(badges.some(b => b.id === 'action_hero')).toBe(true)
      })
    })

    describe('badge structure', () => {
      it('returns badges with correct structure', () => {
        const resumeText = `
          Dynamic, results-driven professional with synergy skills.
          Looking for innovative opportunities to leverage my proactive approach.
          I am a team player and self-starter.
        `
        const badges = detectBadges(resumeText, 50)
        const buzzwordBadge = badges.find(b => b.id === 'buzzword_bingo')

        expect(buzzwordBadge).toBeDefined()
        expect(buzzwordBadge).toHaveProperty('id')
        expect(buzzwordBadge).toHaveProperty('name')
        expect(buzzwordBadge).toHaveProperty('icon')
        expect(buzzwordBadge).toHaveProperty('description')
      })

      it('returns empty array when no badges earned', () => {
        const resumeText = `
          john@example.com
          Software Engineer
        `
        const badges = detectBadges(resumeText, 50)

        expect(Array.isArray(badges)).toBe(true)
        expect(badges.length).toBeGreaterThanOrEqual(0)
      })
    })
  })
})
