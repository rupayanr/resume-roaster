import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { SharedRoastPage } from '../pages/SharedRoast'
import * as api from '../lib/api'

// Mock the API module
vi.mock('../lib/api', () => ({
  getRoast: vi.fn(),
  addReaction: vi.fn(),
  getOgImageUrl: vi.fn((shareId: string) => `https://example.com/og/${shareId}`),
}))

// Mock window.location.origin
Object.defineProperty(window, 'location', {
  value: { origin: 'https://example.com' },
  writable: true,
})

describe('SharedRoastPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    vi.mocked(api.getRoast).mockImplementation(() => new Promise(() => {}))

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/r/share123']}>
          <Routes>
            <Route path="/r/:shareId" element={<SharedRoastPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    )

    expect(screen.getByText('Loading roast...')).toBeInTheDocument()
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('shows error state when roast not found', async () => {
    vi.mocked(api.getRoast).mockRejectedValue(new Error('Not found'))

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/r/nonexistent']}>
          <Routes>
            <Route path="/r/:shareId" element={<SharedRoastPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Roast Not Found')).toBeInTheDocument()
    })

    expect(screen.getByText(/This roast may have been deleted/)).toBeInTheDocument()
    expect(screen.getByText('Get Your Resume Roasted')).toBeInTheDocument()
  })

  it('renders roast content when loaded successfully', async () => {
    const mockRoast = {
      id: 'test-id',
      share_id: 'share123',
      score: 75,
      score_breakdown: {
        clarity: 80,
        impact: 70,
        relevance: 75,
        ats: 75,
      },
      headline: 'Great resume with room for improvement',
      sections: [
        {
          title: 'The Good',
          icon: '✅',
          points: ['Clear contact info'],
        },
      ],
      suggestions: [],
      ats_tips: [],
      reactions: {},
    }

    vi.mocked(api.getRoast).mockResolvedValue(mockRoast)

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/r/share123']}>
          <Routes>
            <Route path="/r/:shareId" element={<SharedRoastPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    )

    await waitFor(() => {
      // Headline is rendered with quotes in RoastCard
      expect(screen.getByText(/Great resume with room for improvement/)).toBeInTheDocument()
    })

    expect(screen.getByText('The Good')).toBeInTheDocument()
  })

  it('shows back to analyze link', async () => {
    const mockRoast = {
      id: 'test-id',
      share_id: 'share123',
      score: 75,
      score_breakdown: { clarity: 75, impact: 75, relevance: 75, ats: 75 },
      headline: 'Test headline',
      sections: [],
      suggestions: [],
      ats_tips: [],
      reactions: {},
    }

    vi.mocked(api.getRoast).mockResolvedValue(mockRoast)

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/r/share123']}>
          <Routes>
            <Route path="/r/:shareId" element={<SharedRoastPage />} />
            <Route path="/" element={<div>Home</div>} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Test headline/)).toBeInTheDocument()
    })

    const analyzeLinks = screen.getAllByText('Get Your Resume Roasted')
    expect(analyzeLinks.length).toBeGreaterThan(0)
  })

  it('calls API with correct shareId', async () => {
    vi.mocked(api.getRoast).mockResolvedValue({
      id: 'test-id',
      share_id: 'myshare456',
      score: 80,
      score_breakdown: { clarity: 80, impact: 80, relevance: 80, ats: 80 },
      headline: 'Test headline',
      sections: [],
      suggestions: [],
      ats_tips: [],
      reactions: {},
    })

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/r/myshare456']}>
          <Routes>
            <Route path="/r/:shareId" element={<SharedRoastPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    )

    expect(api.getRoast).toHaveBeenCalledWith('myshare456')

    await waitFor(() => {
      expect(screen.getByText(/Test headline/)).toBeInTheDocument()
    })
  })

  it('renders reaction bar with shareId', async () => {
    const mockRoast = {
      id: 'test-id',
      share_id: 'share123',
      score: 75,
      score_breakdown: { clarity: 75, impact: 75, relevance: 75, ats: 75 },
      headline: 'Test headline',
      sections: [],
      suggestions: [],
      ats_tips: [],
      reactions: { fire: 5 },
    }

    vi.mocked(api.getRoast).mockResolvedValue(mockRoast)

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/r/share123']}>
          <Routes>
            <Route path="/r/:shareId" element={<SharedRoastPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('React to this roast')).toBeInTheDocument()
    })

    // Should show existing reaction count
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('updates reactions when a reaction is added', async () => {
    const mockRoast = {
      id: 'test-id',
      share_id: 'share123',
      score: 75,
      score_breakdown: { clarity: 75, impact: 75, relevance: 75, ats: 75 },
      headline: 'Test headline',
      sections: [],
      suggestions: [],
      ats_tips: [],
      reactions: {},
    }

    vi.mocked(api.getRoast).mockResolvedValue(mockRoast)
    vi.mocked(api.addReaction).mockResolvedValue({ reactions: { fire: 1 } })

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/r/share123']}>
          <Routes>
            <Route path="/r/:shareId" element={<SharedRoastPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Fire')).toBeInTheDocument()
    })

    // Click the fire reaction button
    await act(async () => {
      fireEvent.click(screen.getByText('Fire'))
    })

    // Should show the updated reaction count
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  it('renders share button', async () => {
    const mockRoast = {
      id: 'test-id',
      share_id: 'share123',
      score: 75,
      score_breakdown: { clarity: 75, impact: 75, relevance: 75, ats: 75 },
      headline: 'Test headline',
      sections: [],
      suggestions: [],
      ats_tips: [],
      reactions: {},
    }

    vi.mocked(api.getRoast).mockResolvedValue(mockRoast)

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/r/share123']}>
          <Routes>
            <Route path="/r/:shareId" element={<SharedRoastPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Share')).toBeInTheDocument()
    })
  })

  it('renders score in the roast', async () => {
    const mockRoast = {
      id: 'test-id',
      share_id: 'share123',
      score: 82,
      score_breakdown: { clarity: 85, impact: 80, relevance: 80, ats: 83 },
      headline: 'Solid resume!',
      sections: [],
      suggestions: [],
      ats_tips: [],
      reactions: {},
    }

    vi.mocked(api.getRoast).mockResolvedValue(mockRoast)

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/r/share123']}>
          <Routes>
            <Route path="/r/:shareId" element={<SharedRoastPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('82')).toBeInTheDocument()
    })
  })

  it('handles roast with empty headline gracefully', async () => {
    const mockRoast = {
      id: 'test-id',
      share_id: 'share123',
      score: 50,
      score_breakdown: { clarity: 50, impact: 50, relevance: 50, ats: 50 },
      headline: '',
      sections: [],
      suggestions: [],
      ats_tips: [],
      reactions: {},
    }

    vi.mocked(api.getRoast).mockResolvedValue(mockRoast)

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/r/share123']}>
          <Routes>
            <Route path="/r/:shareId" element={<SharedRoastPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    )

    // Should still render without crashing - use getAllByText since score appears multiple times
    await waitFor(() => {
      const scores = screen.getAllByText('50')
      expect(scores.length).toBeGreaterThan(0)
    })
  })
})
