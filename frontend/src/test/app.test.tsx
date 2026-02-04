import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { AuthProvider } from '../contexts/AuthContext'
import * as api from '../lib/api'

// Mock the API module
vi.mock('../lib/api', () => ({
  login: vi.fn(),
  signup: vi.fn(),
  getCurrentUser: vi.fn(),
  setAuthToken: vi.fn(),
  getStoredToken: vi.fn(() => null),
  uploadResume: vi.fn(),
  getRoast: vi.fn(),
  listResumes: vi.fn().mockResolvedValue({ resumes: [], total: 0 }),
  getMyRoasts: vi.fn().mockResolvedValue({ roasts: [], total: 0 }),
}))

const renderApp = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('HomePage', () => {
    it('renders homepage with header', () => {
      renderApp('/')

      // "Resume Analyzer" appears in both Navbar and header
      expect(screen.getAllByText('Resume Analyzer').length).toBeGreaterThan(0)
      expect(screen.getByText(/Get professional feedback/)).toBeInTheDocument()
    })

    it('shows sign up message when not authenticated', () => {
      renderApp('/')

      expect(screen.getByText(/Sign up to save your history/)).toBeInTheDocument()
    })

    it('renders dropzone for file upload', () => {
      renderApp('/')

      expect(screen.getByText('Drop your resume PDF here')).toBeInTheDocument()
    })

    it('shows footer with powered by message', () => {
      renderApp('/')

      expect(screen.getByText(/Powered by Llama/)).toBeInTheDocument()
    })

    it('uploads and processes resume', async () => {
      const mockRoast = {
        id: 'roast-1',
        share_id: 'share-123',
        score: 75,
        score_breakdown: { clarity: 75, impact: 75, relevance: 75, ats: 75 },
        headline: 'Your resume looks good!',
        sections: [],
        suggestions: [],
        ats_tips: [],
      }
      vi.mocked(api.uploadResume).mockResolvedValue(mockRoast)

      renderApp('/')

      // Find the file input and simulate upload
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['pdf content'], 'resume.pdf', { type: 'application/pdf' })

      Object.defineProperty(input, 'files', { value: [file] })
      fireEvent.change(input)

      // Wait for roast to be displayed
      await waitFor(() => {
        expect(screen.getByText('Your resume looks good!')).toBeInTheDocument()
      })

      // Should show "Analyze Another" button
      expect(screen.getByText('Analyze Another')).toBeInTheDocument()
    })

    it('shows error when upload fails', async () => {
      vi.mocked(api.uploadResume).mockRejectedValue(new Error('Upload failed'))

      renderApp('/')

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['pdf content'], 'resume.pdf', { type: 'application/pdf' })

      Object.defineProperty(input, 'files', { value: [file] })
      fireEvent.change(input)

      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      })

      // Should show "Try again" button
      expect(screen.getByText('Try again')).toBeInTheDocument()
    })

    it('resets when clicking "Analyze Another"', async () => {
      const mockRoast = {
        id: 'roast-1',
        share_id: 'share-123',
        score: 75,
        score_breakdown: { clarity: 75, impact: 75, relevance: 75, ats: 75 },
        headline: 'Test headline',
        sections: [],
        suggestions: [],
        ats_tips: [],
      }
      vi.mocked(api.uploadResume).mockResolvedValue(mockRoast)

      renderApp('/')

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['pdf content'], 'resume.pdf', { type: 'application/pdf' })

      Object.defineProperty(input, 'files', { value: [file] })
      fireEvent.change(input)

      await waitFor(() => {
        expect(screen.getByText('Analyze Another')).toBeInTheDocument()
      })

      // Click "Analyze Another"
      fireEvent.click(screen.getByText('Analyze Another'))

      // Should go back to dropzone
      await waitFor(() => {
        expect(screen.getByText('Drop your resume PDF here')).toBeInTheDocument()
      })
    })

    it('resets when clicking "Try again" after error', async () => {
      vi.mocked(api.uploadResume).mockRejectedValue(new Error('Upload failed'))

      renderApp('/')

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['pdf content'], 'resume.pdf', { type: 'application/pdf' })

      Object.defineProperty(input, 'files', { value: [file] })
      fireEvent.change(input)

      await waitFor(() => {
        expect(screen.getByText('Try again')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Try again'))

      // Should go back to dropzone
      await waitFor(() => {
        expect(screen.getByText('Drop your resume PDF here')).toBeInTheDocument()
      })
    })
  })

  describe('Routing', () => {
    it('renders login page at /login', () => {
      renderApp('/login')

      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    })

    it('renders signup page at /signup', () => {
      renderApp('/signup')

      expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument()
    })

    it('renders navbar on all pages', () => {
      renderApp('/')

      // Navbar should have brand name
      expect(screen.getAllByText('Resume Analyzer').length).toBeGreaterThan(0)
    })
  })
})
