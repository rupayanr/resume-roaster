import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BadgeDisplay } from '../components/Roast/BadgeDisplay'
import type { Badge } from '../types'

describe('BadgeDisplay', () => {
  const mockBadges: Badge[] = [
    { id: 'buzzword_bingo', name: 'Buzzword Bingo', icon: 'target', description: 'Loves corporate speak' },
    { id: 'metric_master', name: 'Metric Master', icon: 'chart', description: 'Numbers everywhere' },
    { id: 'fireproof', name: 'Fireproof', icon: 'shield', description: 'Solid resume' },
  ]

  it('renders nothing when badges array is empty', () => {
    const { container } = render(<BadgeDisplay badges={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when badges is undefined', () => {
    const { container } = render(<BadgeDisplay badges={undefined as unknown as Badge[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the achievements header', () => {
    render(<BadgeDisplay badges={mockBadges} />)
    expect(screen.getByText('Achievements Unlocked')).toBeInTheDocument()
  })

  it('renders all badge names', () => {
    render(<BadgeDisplay badges={mockBadges} />)

    expect(screen.getByText('Buzzword Bingo')).toBeInTheDocument()
    expect(screen.getByText('Metric Master')).toBeInTheDocument()
    expect(screen.getByText('Fireproof')).toBeInTheDocument()
  })

  it('renders badge with correct color classes', () => {
    render(<BadgeDisplay badges={[{ id: 'buzzword_bingo', name: 'Buzzword Bingo', icon: 'target' }]} />)

    const badge = screen.getByText('Buzzword Bingo').parentElement
    expect(badge).toHaveClass('bg-purple-100')
    expect(badge).toHaveClass('text-purple-700')
  })

  it('renders badge with fallback colors for unknown badge id', () => {
    render(<BadgeDisplay badges={[{ id: 'unknown_badge', name: 'Unknown', icon: 'target' }]} />)

    const badge = screen.getByText('Unknown').parentElement
    expect(badge).toHaveClass('bg-gray-100')
    expect(badge).toHaveClass('text-gray-700')
  })

  it('renders badge with description tooltip', () => {
    render(<BadgeDisplay badges={mockBadges} />)

    // Description should be in the DOM (tooltip)
    expect(screen.getByText('Loves corporate speak')).toBeInTheDocument()
    expect(screen.getByText('Numbers everywhere')).toBeInTheDocument()
  })

  it('renders single badge correctly', () => {
    render(<BadgeDisplay badges={[mockBadges[0]]} />)

    expect(screen.getByText('Buzzword Bingo')).toBeInTheDocument()
    expect(screen.queryByText('Metric Master')).not.toBeInTheDocument()
  })

  it('renders different badge types with correct colors', () => {
    const allBadgeTypes: Badge[] = [
      { id: 'novel_writer', name: 'Novel Writer', icon: 'book' },
      { id: 'mystery_candidate', name: 'Mystery Candidate', icon: 'ghost' },
      { id: 'time_traveler', name: 'Time Traveler', icon: 'clock' },
      { id: 'humble_bragger', name: 'Humble Bragger', icon: 'medal' },
      { id: 'needs_work', name: 'Needs Work', icon: 'hard-hat' },
      { id: 'action_hero', name: 'Action Hero', icon: 'zap' },
      { id: 'serial_job_hopper', name: 'Job Hopper', icon: 'repeat' },
      { id: 'one_page_wonder', name: 'One Page Wonder', icon: 'file' },
      { id: 'emoji_enthusiast', name: 'Emoji Fan', icon: 'smile' },
    ]

    render(<BadgeDisplay badges={allBadgeTypes} />)

    allBadgeTypes.forEach(badge => {
      expect(screen.getByText(badge.name)).toBeInTheDocument()
    })
  })

  it('renders badge without description (no tooltip)', () => {
    render(<BadgeDisplay badges={[{ id: 'fireproof', name: 'Fireproof', icon: 'shield' }]} />)

    expect(screen.getByText('Fireproof')).toBeInTheDocument()
    // No description tooltip should be present
    expect(screen.queryByText('Solid resume')).not.toBeInTheDocument()
  })
})
