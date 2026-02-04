import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { SharedRoastPage } from '../pages/SharedRoast'
import * as api from '../lib/api'

// Mock the API module
vi.mock('../lib/api', () => ({
  getRoast: vi.fn(),
  setAuthToken: vi.fn(),
  getStoredToken: vi.fn(() => null),
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
      <MemoryRouter initialEntries={['/r/share123']}>
        <Routes>
          <Route path="/r/:shareId" element={<SharedRoastPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Loading roast...')).toBeInTheDocument()
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('shows error state when roast not found', async () => {
    vi.mocked(api.getRoast).mockRejectedValue(new Error('Not found'))

    render(
      <MemoryRouter initialEntries={['/r/nonexistent']}>
        <Routes>
          <Route path="/r/:shareId" element={<SharedRoastPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Roast Not Found')).toBeInTheDocument()
    })

    expect(screen.getByText(/This roast may have been deleted/)).toBeInTheDocument()
    expect(screen.getByText('Analyze Your Resume')).toBeInTheDocument()
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
    }

    vi.mocked(api.getRoast).mockResolvedValue(mockRoast)

    render(
      <MemoryRouter initialEntries={['/r/share123']}>
        <Routes>
          <Route path="/r/:shareId" element={<SharedRoastPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Great resume with room for improvement')).toBeInTheDocument()
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
    }

    vi.mocked(api.getRoast).mockResolvedValue(mockRoast)

    render(
      <MemoryRouter initialEntries={['/r/share123']}>
        <Routes>
          <Route path="/r/:shareId" element={<SharedRoastPage />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Test headline')).toBeInTheDocument()
    })

    const analyzeLinks = screen.getAllByText('Analyze Your Resume')
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
    })

    render(
      <MemoryRouter initialEntries={['/r/myshare456']}>
        <Routes>
          <Route path="/r/:shareId" element={<SharedRoastPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(api.getRoast).toHaveBeenCalledWith('myshare456')

    await waitFor(() => {
      expect(screen.getByText('Test headline')).toBeInTheDocument()
    })
  })
})
