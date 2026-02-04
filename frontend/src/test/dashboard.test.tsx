import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { ResumeList } from '../components/Dashboard/ResumeList'
import { RoastHistory } from '../components/Dashboard/RoastHistory'

// Mock the API module
vi.mock('../lib/api', () => ({
  listResumes: vi.fn(),
  getMyRoasts: vi.fn(),
  downloadResume: vi.fn(),
  deleteResume: vi.fn(),
  login: vi.fn(),
  signup: vi.fn(),
  getCurrentUser: vi.fn(),
  setAuthToken: vi.fn(),
  getStoredToken: vi.fn(() => null),
}))

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  )
}

describe('ResumeList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', async () => {
    const { listResumes } = await import('../lib/api')
    ;(listResumes as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading
    )

    renderWithProviders(<ResumeList />)

    // Should show loading indicator
    await waitFor(() => {
      expect(document.querySelector('.animate-spin')).toBeInTheDocument()
    })
  })

  it('shows empty state when no resumes', async () => {
    const { listResumes } = await import('../lib/api')
    ;(listResumes as ReturnType<typeof vi.fn>).mockResolvedValue({
      resumes: [],
      total: 0,
    })

    renderWithProviders(<ResumeList />)

    await waitFor(() => {
      expect(screen.getByText(/no resumes uploaded/i)).toBeInTheDocument()
    })
  })

  it('displays resumes when available', async () => {
    const { listResumes } = await import('../lib/api')
    ;(listResumes as ReturnType<typeof vi.fn>).mockResolvedValue({
      resumes: [
        {
          id: '1',
          filename: 'resume_v1.pdf',
          version: 1,
          is_latest: false,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          filename: 'resume_v2.pdf',
          version: 2,
          is_latest: true,
          created_at: '2024-01-02T00:00:00Z',
        },
      ],
      total: 2,
    })

    renderWithProviders(<ResumeList />)

    await waitFor(() => {
      expect(screen.getByText('resume_v1.pdf')).toBeInTheDocument()
      expect(screen.getByText('resume_v2.pdf')).toBeInTheDocument()
      expect(screen.getByText('Latest')).toBeInTheDocument()
    })
  })

  it('shows error message on API failure', async () => {
    const { listResumes } = await import('../lib/api')
    ;(listResumes as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API Error'))

    renderWithProviders(<ResumeList />)

    await waitFor(() => {
      expect(screen.getByText(/failed to load resumes/i)).toBeInTheDocument()
    })
  })
})

describe('RoastHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows empty state when no roasts', async () => {
    const { getMyRoasts } = await import('../lib/api')
    ;(getMyRoasts as ReturnType<typeof vi.fn>).mockResolvedValue({
      roasts: [],
      total: 0,
    })

    renderWithProviders(<RoastHistory />)

    await waitFor(() => {
      expect(screen.getByText(/no roasts yet/i)).toBeInTheDocument()
    })
  })

  it('displays roast history when available', async () => {
    const { getMyRoasts } = await import('../lib/api')
    ;(getMyRoasts as ReturnType<typeof vi.fn>).mockResolvedValue({
      roasts: [
        {
          id: '1',
          share_id: 'share_123',
          score: 75,
          headline: 'Test headline for roast',
          created_at: '2024-01-01T00:00:00Z',
          resume_filename: 'resume.pdf',
          resume_version: 1,
        },
      ],
      total: 1,
    })

    renderWithProviders(<RoastHistory />)

    await waitFor(() => {
      expect(screen.getByText(/75/)).toBeInTheDocument()
      expect(screen.getByText(/test headline for roast/i)).toBeInTheDocument()
    })
  })

  it('shows error message on API failure', async () => {
    const { getMyRoasts } = await import('../lib/api')
    ;(getMyRoasts as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API Error'))

    renderWithProviders(<RoastHistory />)

    await waitFor(() => {
      expect(screen.getByText(/failed to load roast history/i)).toBeInTheDocument()
    })
  })
})
