import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RoastCard } from '../components/Roast/RoastCard'
import type { RoastResponse } from '../types'

const mockRoast: RoastResponse = {
  id: 'test-id',
  share_id: 'share-123',
  score: 75,
  score_breakdown: {
    clarity: 80,
    impact: 70,
    relevance: 75,
    ats: 75,
  },
  roast: {
    headline: 'Your resume shows promise but needs polish.',
    sections: [
      {
        title: 'The Good',
        icon: '✅',
        points: ['Clear contact info', 'Good structure'],
      },
      {
        title: 'The Bad',
        icon: '😬',
        points: ['Lacks metrics', 'Generic objective'],
      },
    ],
  },
  suggestions: [
    {
      original: 'Managed team projects',
      improved: 'Led 5-person team delivering $2M product',
      why: 'Specifics matter',
    },
  ],
  ats_tips: ['Use standard headers', 'Avoid tables'],
  headline: 'Your resume shows promise but needs polish.',
  sections: [],
  share_url: 'https://example.com/r/share-123',
}

describe('RoastCard', () => {
  it('renders score display', () => {
    render(<RoastCard roast={mockRoast} />)

    // Score appears in multiple places, just check it's present
    expect(screen.getAllByText('75').length).toBeGreaterThan(0)
  })

  it('renders headline', () => {
    render(<RoastCard roast={mockRoast} />)

    // Headline is rendered with surrounding quotes in the component
    expect(screen.getByText(/Your resume shows promise but needs polish/)).toBeInTheDocument()
  })

  it('renders feedback sections', () => {
    render(<RoastCard roast={mockRoast} />)

    expect(screen.getByText('The Good')).toBeInTheDocument()
    expect(screen.getByText('The Bad')).toBeInTheDocument()
    expect(screen.getByText('Clear contact info')).toBeInTheDocument()
    expect(screen.getByText('Lacks metrics')).toBeInTheDocument()
  })

  it('renders suggestions', () => {
    render(<RoastCard roast={mockRoast} />)

    // Suggestions are wrapped in quotes in the rendered output
    expect(screen.getByText('"Managed team projects"')).toBeInTheDocument()
    expect(screen.getByText('"Led 5-person team delivering $2M product"')).toBeInTheDocument()
  })

  it('renders ATS tips', () => {
    render(<RoastCard roast={mockRoast} />)

    expect(screen.getByText('ATS Optimization Tips')).toBeInTheDocument()
    expect(screen.getByText('Use standard headers')).toBeInTheDocument()
    expect(screen.getByText('Avoid tables')).toBeInTheDocument()
  })

  it('renders score breakdown bars', () => {
    render(<RoastCard roast={mockRoast} />)

    expect(screen.getByText('Clarity')).toBeInTheDocument()
    expect(screen.getByText('Impact')).toBeInTheDocument()
    expect(screen.getByText('Relevance')).toBeInTheDocument()
    expect(screen.getByText('ATS')).toBeInTheDocument()
    // Individual scores are rendered
    expect(screen.getAllByText('80').length).toBeGreaterThan(0)
    expect(screen.getAllByText('70').length).toBeGreaterThan(0)
  })

  it('shows "How we score" button', () => {
    render(<RoastCard roast={mockRoast} />)

    expect(screen.getByText('How we score')).toBeInTheDocument()
  })

  it('opens score breakdown modal when clicking "How we score"', () => {
    render(<RoastCard roast={mockRoast} />)

    fireEvent.click(screen.getByText('How we score'))

    expect(screen.getByText('How We Score')).toBeInTheDocument()
  })

  it('handles roast without suggestions gracefully', () => {
    const roastWithoutSuggestions = {
      ...mockRoast,
      suggestions: [],
    }

    render(<RoastCard roast={roastWithoutSuggestions} />)

    // Score is rendered
    expect(screen.getAllByText('75').length).toBeGreaterThan(0)
  })

  it('handles roast without ATS tips gracefully', () => {
    const roastWithoutAtsTips = {
      ...mockRoast,
      ats_tips: [],
    }

    render(<RoastCard roast={roastWithoutAtsTips} />)

    // Score is rendered
    expect(screen.getAllByText('75').length).toBeGreaterThan(0)
    expect(screen.queryByText('ATS Optimization Tips')).not.toBeInTheDocument()
  })

  it('handles different tip formats in ATS tips', () => {
    const roastWithObjectTips = {
      ...mockRoast,
      ats_tips: [
        { tip: 'Tip from object format' },
        'Simple string tip format',
        { text: 'Text from object format' },
      ],
    }

    render(<RoastCard roast={roastWithObjectTips} />)

    expect(screen.getByText('Tip from object format')).toBeInTheDocument()
    expect(screen.getByText('Simple string tip format')).toBeInTheDocument()
    expect(screen.getByText('Text from object format')).toBeInTheDocument()
  })
})
