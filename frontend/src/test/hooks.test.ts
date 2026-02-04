import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFileUpload } from '../hooks/useFileUpload'
import { useRoast } from '../hooks/useRoast'
import * as api from '../lib/api'

// Mock the API module
vi.mock('../lib/api')

describe('useFileUpload', () => {
  it('initializes with null file and no loading/error', () => {
    const { result } = renderHook(() => useFileUpload())

    expect(result.current.file).toBeNull()
    expect(result.current.isUploading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('sets file correctly', () => {
    const { result } = renderHook(() => useFileUpload())
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    act(() => {
      result.current.setFile(mockFile)
    })

    expect(result.current.file).toBe(mockFile)
    expect(result.current.error).toBeNull()
  })

  it('sets uploading state', () => {
    const { result } = renderHook(() => useFileUpload())

    act(() => {
      result.current.setUploading(true)
    })

    expect(result.current.isUploading).toBe(true)
  })

  it('sets error and clears uploading', () => {
    const { result } = renderHook(() => useFileUpload())

    act(() => {
      result.current.setUploading(true)
    })

    act(() => {
      result.current.setError('Upload failed')
    })

    expect(result.current.error).toBe('Upload failed')
    expect(result.current.isUploading).toBe(false)
  })

  it('resets all state', () => {
    const { result } = renderHook(() => useFileUpload())
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    act(() => {
      result.current.setFile(mockFile)
      result.current.setUploading(true)
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.file).toBeNull()
    expect(result.current.isUploading).toBe(false)
    expect(result.current.error).toBeNull()
  })
})

describe('useRoast', () => {
  const mockRoastResponse = {
    id: 'roast_123',
    score: 75,
    roast: {
      headline: 'Test headline',
      sections: [],
    },
    suggestions: [],
    ats_tips: [],
    share_url: 'https://example.com/r/123',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with null roast and no loading/error', () => {
    const { result } = renderHook(() => useRoast())

    expect(result.current.roast).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('submits resume and sets roast on success', async () => {
    vi.mocked(api.uploadResume).mockResolvedValue(mockRoastResponse)

    const { result } = renderHook(() => useRoast())
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    await act(async () => {
      await result.current.submitResume(mockFile)
    })

    expect(result.current.roast).toEqual(mockRoastResponse)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('sets loading state during submission', async () => {
    let resolvePromise: (value: typeof mockRoastResponse) => void
    vi.mocked(api.uploadResume).mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve })
    )

    const { result } = renderHook(() => useRoast())
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    act(() => {
      result.current.submitResume(mockFile)
    })

    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      resolvePromise!(mockRoastResponse)
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('sets error on submission failure', async () => {
    vi.mocked(api.uploadResume).mockRejectedValue(new Error('API error'))

    const { result } = renderHook(() => useRoast())
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    await act(async () => {
      await result.current.submitResume(mockFile)
    })

    expect(result.current.roast).toBeNull()
    expect(result.current.error).toBe('API error')
    expect(result.current.isLoading).toBe(false)
  })

  it('resets state correctly', async () => {
    vi.mocked(api.uploadResume).mockResolvedValue(mockRoastResponse)

    const { result } = renderHook(() => useRoast())
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    await act(async () => {
      await result.current.submitResume(mockFile)
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.roast).toBeNull()
    expect(result.current.error).toBeNull()
  })
})
