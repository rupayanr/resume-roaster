import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { ResumeList } from '../components/Dashboard/ResumeList'
import * as api from '../lib/api'

// Mock the API module
vi.mock('../lib/api', () => ({
  listResumes: vi.fn(),
  downloadResume: vi.fn(),
  deleteResume: vi.fn(),
  setAuthToken: vi.fn(),
  getStoredToken: vi.fn(() => null),
}))

// Mock window.confirm
const mockConfirm = vi.fn()
window.confirm = mockConfirm

// Mock URL methods
const mockCreateObjectURL = vi.fn(() => 'blob:test-url')
const mockRevokeObjectURL = vi.fn()
window.URL.createObjectURL = mockCreateObjectURL
window.URL.revokeObjectURL = mockRevokeObjectURL

describe('ResumeList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConfirm.mockReturnValue(true)
  })

  it('handles download resume', async () => {
    const mockResumes = [
      {
        id: 'resume-1',
        filename: 'my-resume.pdf',
        version: 1,
        is_latest: true,
        created_at: '2024-01-01T00:00:00Z',
      },
    ]
    vi.mocked(api.listResumes).mockResolvedValue({ resumes: mockResumes, total: 1 })
    vi.mocked(api.downloadResume).mockResolvedValue(new Blob(['pdf content']))

    render(<ResumeList />)

    await waitFor(() => {
      expect(screen.getByText('my-resume.pdf')).toBeInTheDocument()
    })

    // Find and click the download button (uses title attribute)
    const downloadButton = screen.getByTitle('Download')
    fireEvent.click(downloadButton)

    await waitFor(() => {
      expect(api.downloadResume).toHaveBeenCalledWith('resume-1')
    })

    expect(mockCreateObjectURL).toHaveBeenCalled()
    expect(mockRevokeObjectURL).toHaveBeenCalled()
  })

  it('handles download error', async () => {
    const mockResumes = [
      {
        id: 'resume-1',
        filename: 'my-resume.pdf',
        version: 1,
        is_latest: true,
        created_at: '2024-01-01T00:00:00Z',
      },
    ]
    vi.mocked(api.listResumes).mockResolvedValue({ resumes: mockResumes, total: 1 })
    vi.mocked(api.downloadResume).mockRejectedValue(new Error('Download failed'))

    render(<ResumeList />)

    await waitFor(() => {
      expect(screen.getByText('my-resume.pdf')).toBeInTheDocument()
    })

    const downloadButton = screen.getByTitle('Download')
    fireEvent.click(downloadButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to download resume')).toBeInTheDocument()
    })
  })

  it('handles delete resume', async () => {
    const mockResumes = [
      {
        id: 'resume-1',
        filename: 'my-resume.pdf',
        version: 1,
        is_latest: true,
        created_at: '2024-01-01T00:00:00Z',
      },
    ]
    vi.mocked(api.listResumes).mockResolvedValue({ resumes: mockResumes, total: 1 })
    vi.mocked(api.deleteResume).mockResolvedValue(undefined)

    render(<ResumeList />)

    await waitFor(() => {
      expect(screen.getByText('my-resume.pdf')).toBeInTheDocument()
    })

    const deleteButton = screen.getByTitle('Delete')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(api.deleteResume).toHaveBeenCalledWith('resume-1')
    })

    // Resume should be removed from the list
    await waitFor(() => {
      expect(screen.queryByText('my-resume.pdf')).not.toBeInTheDocument()
    })
  })

  it('cancels delete when user declines confirmation', async () => {
    mockConfirm.mockReturnValue(false)

    const mockResumes = [
      {
        id: 'resume-1',
        filename: 'my-resume.pdf',
        version: 1,
        is_latest: true,
        created_at: '2024-01-01T00:00:00Z',
      },
    ]
    vi.mocked(api.listResumes).mockResolvedValue({ resumes: mockResumes, total: 1 })

    render(<ResumeList />)

    await waitFor(() => {
      expect(screen.getByText('my-resume.pdf')).toBeInTheDocument()
    })

    const deleteButton = screen.getByTitle('Delete')
    fireEvent.click(deleteButton)

    // deleteResume should not be called
    expect(api.deleteResume).not.toHaveBeenCalled()
    // Resume should still be in the list
    expect(screen.getByText('my-resume.pdf')).toBeInTheDocument()
  })

  it('handles delete error', async () => {
    const mockResumes = [
      {
        id: 'resume-1',
        filename: 'my-resume.pdf',
        version: 1,
        is_latest: true,
        created_at: '2024-01-01T00:00:00Z',
      },
    ]
    vi.mocked(api.listResumes).mockResolvedValue({ resumes: mockResumes, total: 1 })
    vi.mocked(api.deleteResume).mockRejectedValue(new Error('Delete failed'))

    render(<ResumeList />)

    await waitFor(() => {
      expect(screen.getByText('my-resume.pdf')).toBeInTheDocument()
    })

    const deleteButton = screen.getByTitle('Delete')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to delete resume')).toBeInTheDocument()
    })
  })
})
