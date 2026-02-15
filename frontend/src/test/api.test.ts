import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('API', () => {
  const mockRoastResponse = {
    id: 'roast_123',
    share_id: 'share_123',
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

  let mockPost: ReturnType<typeof vi.fn>
  let mockGet: ReturnType<typeof vi.fn>
  let mockPatch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetModules()
    mockPost = vi.fn()
    mockGet = vi.fn()
    mockPatch = vi.fn()

    vi.doMock('axios', () => ({
      default: {
        create: () => ({
          post: mockPost,
          get: mockGet,
          patch: mockPatch,
        }),
      },
    }))
  })

  afterEach(() => {
    vi.doUnmock('axios')
  })

  describe('uploadResume', () => {
    it('sends POST request to /api/v1/roast with FormData', async () => {
      mockPost.mockResolvedValue({ data: mockRoastResponse })

      const { uploadResume } = await import('../lib/api')
      const mockFile = new File(['test'], 'resume.pdf', { type: 'application/pdf' })

      await uploadResume(mockFile)

      expect(mockPost).toHaveBeenCalledWith(
        '/api/v1/roast',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      )
    })

    it('includes file in FormData', async () => {
      mockPost.mockResolvedValue({ data: mockRoastResponse })

      const { uploadResume } = await import('../lib/api')
      const mockFile = new File(['test'], 'resume.pdf', { type: 'application/pdf' })

      await uploadResume(mockFile)

      const formData = mockPost.mock.calls[0][1] as FormData
      expect(formData.get('file')).toBe(mockFile)
    })

    it('includes intensity in FormData', async () => {
      mockPost.mockResolvedValue({ data: mockRoastResponse })

      const { uploadResume } = await import('../lib/api')
      const mockFile = new File(['test'], 'resume.pdf', { type: 'application/pdf' })

      await uploadResume(mockFile, 'brutal')

      const formData = mockPost.mock.calls[0][1] as FormData
      expect(formData.get('intensity')).toBe('brutal')
    })

    it('includes industry in FormData', async () => {
      mockPost.mockResolvedValue({ data: mockRoastResponse })

      const { uploadResume } = await import('../lib/api')
      const mockFile = new File(['test'], 'resume.pdf', { type: 'application/pdf' })

      await uploadResume(mockFile, 'medium', 'tech')

      const formData = mockPost.mock.calls[0][1] as FormData
      expect(formData.get('industry')).toBe('tech')
    })

    it('uses default intensity medium when not specified', async () => {
      mockPost.mockResolvedValue({ data: mockRoastResponse })

      const { uploadResume } = await import('../lib/api')
      const mockFile = new File(['test'], 'resume.pdf', { type: 'application/pdf' })

      await uploadResume(mockFile)

      const formData = mockPost.mock.calls[0][1] as FormData
      expect(formData.get('intensity')).toBe('medium')
    })

    it('uses default industry general when not specified', async () => {
      mockPost.mockResolvedValue({ data: mockRoastResponse })

      const { uploadResume } = await import('../lib/api')
      const mockFile = new File(['test'], 'resume.pdf', { type: 'application/pdf' })

      await uploadResume(mockFile)

      const formData = mockPost.mock.calls[0][1] as FormData
      expect(formData.get('industry')).toBe('general')
    })

    it('returns roast response data', async () => {
      mockPost.mockResolvedValue({ data: mockRoastResponse })

      const { uploadResume } = await import('../lib/api')
      const mockFile = new File(['test'], 'resume.pdf', { type: 'application/pdf' })

      const result = await uploadResume(mockFile)

      expect(result).toEqual(mockRoastResponse)
    })

    it('propagates error on API failure', async () => {
      mockPost.mockRejectedValue(new Error('Network error'))

      const { uploadResume } = await import('../lib/api')
      const mockFile = new File(['test'], 'resume.pdf', { type: 'application/pdf' })

      await expect(uploadResume(mockFile)).rejects.toThrow('Network error')
    })
  })

  describe('getRoast', () => {
    it('sends GET request to correct endpoint', async () => {
      mockGet.mockResolvedValue({ data: mockRoastResponse })

      const { getRoast } = await import('../lib/api')
      await getRoast('share_123')

      expect(mockGet).toHaveBeenCalledWith('/api/v1/roast/share_123')
    })

    it('returns roast response data', async () => {
      mockGet.mockResolvedValue({ data: mockRoastResponse })

      const { getRoast } = await import('../lib/api')
      const result = await getRoast('share_123')

      expect(result).toEqual(mockRoastResponse)
    })

    it('propagates error on API failure', async () => {
      mockGet.mockRejectedValue(new Error('Not found'))

      const { getRoast } = await import('../lib/api')

      await expect(getRoast('invalid_id')).rejects.toThrow('Not found')
    })
  })

  describe('getHotTakes', () => {
    it('sends GET request to /api/v1/hot-takes', async () => {
      mockGet.mockResolvedValue({ data: { hot_takes: [] } })

      const { getHotTakes } = await import('../lib/api')
      await getHotTakes()

      expect(mockGet).toHaveBeenCalledWith('/api/v1/hot-takes', { params: { limit: 10 } })
    })

    it('accepts custom limit', async () => {
      mockGet.mockResolvedValue({ data: { hot_takes: [] } })

      const { getHotTakes } = await import('../lib/api')
      await getHotTakes(5)

      expect(mockGet).toHaveBeenCalledWith('/api/v1/hot-takes', { params: { limit: 5 } })
    })

    it('returns hot takes response', async () => {
      const mockHotTakes = { hot_takes: [{ headline: 'Test', score: 75 }] }
      mockGet.mockResolvedValue({ data: mockHotTakes })

      const { getHotTakes } = await import('../lib/api')
      const result = await getHotTakes()

      expect(result).toEqual(mockHotTakes)
    })
  })

  describe('togglePublicHeadline', () => {
    it('sends PATCH request to toggle headline public to true', async () => {
      mockPatch.mockResolvedValue({})

      const { togglePublicHeadline } = await import('../lib/api')
      await togglePublicHeadline('share_123', true)

      expect(mockPatch).toHaveBeenCalledWith(
        '/api/v1/roast/share_123/public',
        null,
        { params: { is_public: true } }
      )
    })

    it('sends PATCH request to toggle headline public to false', async () => {
      mockPatch.mockResolvedValue({})

      const { togglePublicHeadline } = await import('../lib/api')
      await togglePublicHeadline('share_123', false)

      expect(mockPatch).toHaveBeenCalledWith(
        '/api/v1/roast/share_123/public',
        null,
        { params: { is_public: false } }
      )
    })

    it('propagates error on API failure', async () => {
      mockPatch.mockRejectedValue(new Error('Unauthorized'))

      const { togglePublicHeadline } = await import('../lib/api')

      await expect(togglePublicHeadline('share_123', true)).rejects.toThrow('Unauthorized')
    })
  })

  describe('addReaction', () => {
    it('sends POST request to correct endpoint', async () => {
      mockPost.mockResolvedValue({ data: { reactions: { fire: 1 } } })

      const { addReaction } = await import('../lib/api')
      await addReaction('share_123', 'fire')

      expect(mockPost).toHaveBeenCalledWith('/api/v1/roast/share_123/react', {
        reaction: 'fire',
      })
    })

    it('returns reactions response', async () => {
      const mockReactions = { reactions: { fire: 5, ouch: 3 } }
      mockPost.mockResolvedValue({ data: mockReactions })

      const { addReaction } = await import('../lib/api')
      const result = await addReaction('share_123', 'fire')

      expect(result).toEqual(mockReactions)
    })

    it('handles different reaction types', async () => {
      mockPost.mockResolvedValue({ data: { reactions: { ouch: 1 } } })

      const { addReaction } = await import('../lib/api')
      await addReaction('share_123', 'ouch')

      expect(mockPost).toHaveBeenCalledWith('/api/v1/roast/share_123/react', {
        reaction: 'ouch',
      })
    })
  })

  describe('getOgImageUrl', () => {
    it('returns correct URL', async () => {
      const { getOgImageUrl } = await import('../lib/api')
      const result = getOgImageUrl('share_123')

      expect(result).toContain('/api/v1/roast/share_123/og-image')
    })

    it('handles different share IDs', async () => {
      const { getOgImageUrl } = await import('../lib/api')
      const result1 = getOgImageUrl('abc123')
      const result2 = getOgImageUrl('xyz789')

      expect(result1).toContain('abc123')
      expect(result2).toContain('xyz789')
    })
  })
})
