import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from '../App'
import * as api from '../lib/api'

// Mock the API module
vi.mock('../lib/api', () => ({
  uploadResume: vi.fn(),
  getRoast: vi.fn(),
  getHotTakes: vi.fn(),
  togglePublicHeadline: vi.fn(),
  addReaction: vi.fn(),
  getOgImageUrl: vi.fn((shareId: string) => `http://localhost/og/${shareId}`),
}))

const renderApp = async (initialRoute = '/') => {
  // Setup mock before rendering
  vi.mocked(api.getHotTakes).mockResolvedValue({ hot_takes: [] })

  let result
  await act(async () => {
    result = render(
      <HelmetProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <App />
        </MemoryRouter>
      </HelmetProvider>
    )
  })

  // Wait for initial data fetch to complete
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0))
  })

  return result!
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('HomePage', () => {
    it('renders homepage with header', async () => {
      await renderApp('/')

      // "Resume Roaster" appears in both Navbar and header
      expect(screen.getAllByText('Resume Roaster').length).toBeGreaterThan(0)
      expect(screen.getByText(/Get brutally honest feedback/)).toBeInTheDocument()
    })

    it('renders dropzone for file upload', async () => {
      await renderApp('/')

      expect(screen.getByText('Drop your resume PDF here')).toBeInTheDocument()
    })

    it('shows footer with powered by message', async () => {
      await renderApp('/')

      expect(screen.getByText(/Powered by Groq/)).toBeInTheDocument()
    })

    it('renders AI-Powered Roast badge', async () => {
      await renderApp('/')

      expect(screen.getByText('AI-Powered Roast')).toBeInTheDocument()
    })

    it('uploads and processes resume', async () => {
      vi.useRealTimers() // Use real timers for this test

      const mockRoast = {
        id: 'roast-1',
        share_id: 'share-123',
        score: 75,
        score_breakdown: { clarity: 75, impact: 75, relevance: 75, ats: 75 },
        headline: 'Your resume looks good!',
        sections: [],
        suggestions: [],
        ats_tips: [],
        intensity: 'medium',
        badges: [],
        is_headline_public: false,
        reactions: {},
      }
      vi.mocked(api.uploadResume).mockResolvedValue(mockRoast)
      vi.mocked(api.getHotTakes).mockResolvedValue({ hot_takes: [] })

      await act(async () => {
        render(
          <HelmetProvider>
            <MemoryRouter initialEntries={['/']}>
              <App />
            </MemoryRouter>
          </HelmetProvider>
        )
      })

      // Find the file input and simulate upload
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['pdf content'], 'resume.pdf', { type: 'application/pdf' })

      await act(async () => {
        Object.defineProperty(input, 'files', { value: [file] })
        fireEvent.change(input)
      })

      // Wait for roast to be displayed
      await waitFor(() => {
        expect(screen.getByText(/Your resume looks good!/)).toBeInTheDocument()
      })

      // Should show "Roast Another" button
      expect(screen.getByText('Roast Another')).toBeInTheDocument()
    })

    it('shows share button after successful upload', async () => {
      vi.useRealTimers()

      const mockRoast = {
        id: 'roast-1',
        share_id: 'share-123',
        score: 75,
        score_breakdown: { clarity: 75, impact: 75, relevance: 75, ats: 75 },
        headline: 'Your resume looks good!',
        sections: [],
        suggestions: [],
        ats_tips: [],
        intensity: 'medium',
        badges: [],
        is_headline_public: false,
        reactions: {},
      }
      vi.mocked(api.uploadResume).mockResolvedValue(mockRoast)
      vi.mocked(api.getHotTakes).mockResolvedValue({ hot_takes: [] })

      await act(async () => {
        render(
          <HelmetProvider>
            <MemoryRouter initialEntries={['/']}>
              <App />
            </MemoryRouter>
          </HelmetProvider>
        )
      })

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['pdf content'], 'resume.pdf', { type: 'application/pdf' })

      await act(async () => {
        Object.defineProperty(input, 'files', { value: [file] })
        fireEvent.change(input)
      })

      await waitFor(() => {
        expect(screen.getByText('Share')).toBeInTheDocument()
      })
    })

    it('shows error when upload fails', async () => {
      vi.useRealTimers()

      vi.mocked(api.uploadResume).mockRejectedValue(new Error('Upload failed'))
      vi.mocked(api.getHotTakes).mockResolvedValue({ hot_takes: [] })

      await act(async () => {
        render(
          <HelmetProvider>
            <MemoryRouter initialEntries={['/']}>
              <App />
            </MemoryRouter>
          </HelmetProvider>
        )
      })

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['pdf content'], 'resume.pdf', { type: 'application/pdf' })

      await act(async () => {
        Object.defineProperty(input, 'files', { value: [file] })
        fireEvent.change(input)
      })

      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      })

      // Should show "Try again" button
      expect(screen.getByText('Try again')).toBeInTheDocument()
    })

    it('resets when clicking "Roast Another"', async () => {
      vi.useRealTimers()

      const mockRoast = {
        id: 'roast-1',
        share_id: 'share-123',
        score: 75,
        score_breakdown: { clarity: 75, impact: 75, relevance: 75, ats: 75 },
        headline: 'Test headline',
        sections: [],
        suggestions: [],
        ats_tips: [],
        intensity: 'medium',
        badges: [],
        is_headline_public: false,
        reactions: {},
      }
      vi.mocked(api.uploadResume).mockResolvedValue(mockRoast)
      vi.mocked(api.getHotTakes).mockResolvedValue({ hot_takes: [] })

      await act(async () => {
        render(
          <HelmetProvider>
            <MemoryRouter initialEntries={['/']}>
              <App />
            </MemoryRouter>
          </HelmetProvider>
        )
      })

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['pdf content'], 'resume.pdf', { type: 'application/pdf' })

      await act(async () => {
        Object.defineProperty(input, 'files', { value: [file] })
        fireEvent.change(input)
      })

      await waitFor(() => {
        expect(screen.getByText('Roast Another')).toBeInTheDocument()
      })

      // Click "Roast Another"
      await act(async () => {
        fireEvent.click(screen.getByText('Roast Another'))
      })

      // Should go back to dropzone
      await waitFor(() => {
        expect(screen.getByText('Drop your resume PDF here')).toBeInTheDocument()
      })
    })

    it('resets when clicking "Try again" after error', async () => {
      vi.useRealTimers()

      vi.mocked(api.uploadResume).mockRejectedValue(new Error('Upload failed'))
      vi.mocked(api.getHotTakes).mockResolvedValue({ hot_takes: [] })

      await act(async () => {
        render(
          <HelmetProvider>
            <MemoryRouter initialEntries={['/']}>
              <App />
            </MemoryRouter>
          </HelmetProvider>
        )
      })

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['pdf content'], 'resume.pdf', { type: 'application/pdf' })

      await act(async () => {
        Object.defineProperty(input, 'files', { value: [file] })
        fireEvent.change(input)
      })

      await waitFor(() => {
        expect(screen.getByText('Try again')).toBeInTheDocument()
      })

      await act(async () => {
        fireEvent.click(screen.getByText('Try again'))
      })

      // Should go back to dropzone
      await waitFor(() => {
        expect(screen.getByText('Drop your resume PDF here')).toBeInTheDocument()
      })
    })

    it('transforms roast data with share_url for backwards compatibility', async () => {
      vi.useRealTimers()

      const mockRoast = {
        id: 'roast-1',
        share_id: 'share-123',
        score: 75,
        score_breakdown: { clarity: 75, impact: 75, relevance: 75, ats: 75 },
        headline: 'Test headline for transform',
        sections: [{ title: 'Good', icon: '✅', points: ['Point 1'] }],
        suggestions: [],
        ats_tips: [],
        intensity: 'medium',
        badges: [],
        is_headline_public: false,
        reactions: {},
      }
      vi.mocked(api.uploadResume).mockResolvedValue(mockRoast)
      vi.mocked(api.getHotTakes).mockResolvedValue({ hot_takes: [] })

      await act(async () => {
        render(
          <HelmetProvider>
            <MemoryRouter initialEntries={['/']}>
              <App />
            </MemoryRouter>
          </HelmetProvider>
        )
      })

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['pdf content'], 'resume.pdf', { type: 'application/pdf' })

      await act(async () => {
        Object.defineProperty(input, 'files', { value: [file] })
        fireEvent.change(input)
      })

      // Verify the roast is displayed (share_url transformation worked)
      await waitFor(() => {
        expect(screen.getByText(/Test headline for transform/)).toBeInTheDocument()
      }, { timeout: 10000 })
    })
  })

  describe('Routing', () => {
    it('renders navbar on all pages', async () => {
      await renderApp('/')

      // Navbar should have brand name
      expect(screen.getAllByText('Resume Roaster').length).toBeGreaterThan(0)
    })

    it('renders shared roast page for /r/:shareId route', async () => {
      vi.useRealTimers()

      const mockRoast = {
        id: 'roast-1',
        share_id: 'abc123',
        score: 70,
        score_breakdown: { clarity: 70, impact: 70, relevance: 70, ats: 70 },
        headline: 'Shared roast headline',
        sections: [],
        suggestions: [],
        ats_tips: [],
        intensity: 'medium',
        badges: [],
        is_headline_public: false,
        reactions: {},
      }
      vi.mocked(api.getRoast).mockResolvedValue(mockRoast)

      await act(async () => {
        render(
          <HelmetProvider>
            <MemoryRouter initialEntries={['/r/abc123']}>
              <App />
            </MemoryRouter>
          </HelmetProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByText(/Shared roast headline/)).toBeInTheDocument()
      })
    })
  })
})
