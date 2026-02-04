import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('API', () => {
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

  const mockUser = {
    id: 'user_1',
    email: 'test@example.com',
    full_name: 'Test User',
  }

  const mockToken = { access_token: 'test-jwt-token' }

  let mockPost: ReturnType<typeof vi.fn>
  let mockGet: ReturnType<typeof vi.fn>
  let mockDelete: ReturnType<typeof vi.fn>
  let mockDefaults: { headers: { common: Record<string, string> } }

  beforeEach(() => {
    vi.resetModules()
    mockPost = vi.fn()
    mockGet = vi.fn()
    mockDelete = vi.fn()
    mockDefaults = { headers: { common: {} } }

    // Clear localStorage
    localStorage.clear()

    vi.doMock('axios', () => ({
      default: {
        create: () => ({
          post: mockPost,
          get: mockGet,
          delete: mockDelete,
          defaults: mockDefaults,
        }),
      },
    }))
  })

  afterEach(() => {
    vi.doUnmock('axios')
    localStorage.clear()
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
      await getRoast('roast_123')

      expect(mockGet).toHaveBeenCalledWith('/api/v1/roast/roast_123')
    })

    it('returns roast response data', async () => {
      mockGet.mockResolvedValue({ data: mockRoastResponse })

      const { getRoast } = await import('../lib/api')
      const result = await getRoast('roast_123')

      expect(result).toEqual(mockRoastResponse)
    })

    it('propagates error on API failure', async () => {
      mockGet.mockRejectedValue(new Error('Not found'))

      const { getRoast } = await import('../lib/api')

      await expect(getRoast('invalid_id')).rejects.toThrow('Not found')
    })
  })

  describe('signup', () => {
    it('sends POST request to /api/v1/auth/signup', async () => {
      mockPost.mockResolvedValue({ data: mockUser })

      const { signup } = await import('../lib/api')
      await signup({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
      })

      expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/signup', {
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
      })
    })

    it('returns user data', async () => {
      mockPost.mockResolvedValue({ data: mockUser })

      const { signup } = await import('../lib/api')
      const result = await signup({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
      })

      expect(result).toEqual(mockUser)
    })
  })

  describe('login', () => {
    it('sends POST request to /api/v1/auth/login', async () => {
      mockPost.mockResolvedValue({ data: mockToken })

      const { login } = await import('../lib/api')
      await login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('returns token response', async () => {
      mockPost.mockResolvedValue({ data: mockToken })

      const { login } = await import('../lib/api')
      const result = await login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result).toEqual(mockToken)
    })
  })

  describe('getCurrentUser', () => {
    it('sends GET request to /api/v1/auth/me', async () => {
      mockGet.mockResolvedValue({ data: mockUser })

      const { getCurrentUser } = await import('../lib/api')
      await getCurrentUser()

      expect(mockGet).toHaveBeenCalledWith('/api/v1/auth/me')
    })

    it('returns user data', async () => {
      mockGet.mockResolvedValue({ data: mockUser })

      const { getCurrentUser } = await import('../lib/api')
      const result = await getCurrentUser()

      expect(result).toEqual(mockUser)
    })
  })

  describe('listResumes', () => {
    it('sends GET request to /api/v1/resumes', async () => {
      mockGet.mockResolvedValue({ data: { resumes: [], total: 0 } })

      const { listResumes } = await import('../lib/api')
      await listResumes()

      expect(mockGet).toHaveBeenCalledWith('/api/v1/resumes')
    })

    it('returns resume list', async () => {
      const mockResumes = {
        resumes: [{ id: '1', filename: 'resume.pdf', version: 1 }],
        total: 1,
      }
      mockGet.mockResolvedValue({ data: mockResumes })

      const { listResumes } = await import('../lib/api')
      const result = await listResumes()

      expect(result).toEqual(mockResumes)
    })
  })

  describe('getResume', () => {
    it('sends GET request to correct endpoint', async () => {
      mockGet.mockResolvedValue({ data: { id: '1', filename: 'resume.pdf' } })

      const { getResume } = await import('../lib/api')
      await getResume('resume_1')

      expect(mockGet).toHaveBeenCalledWith('/api/v1/resumes/resume_1')
    })
  })

  describe('downloadResume', () => {
    it('sends GET request with blob response type', async () => {
      const mockBlob = new Blob(['pdf content'])
      mockGet.mockResolvedValue({ data: mockBlob })

      const { downloadResume } = await import('../lib/api')
      await downloadResume('resume_1')

      expect(mockGet).toHaveBeenCalledWith('/api/v1/resumes/resume_1/download', {
        responseType: 'blob',
      })
    })

    it('returns blob data', async () => {
      const mockBlob = new Blob(['pdf content'])
      mockGet.mockResolvedValue({ data: mockBlob })

      const { downloadResume } = await import('../lib/api')
      const result = await downloadResume('resume_1')

      expect(result).toEqual(mockBlob)
    })
  })

  describe('deleteResume', () => {
    it('sends DELETE request to correct endpoint', async () => {
      mockDelete.mockResolvedValue({})

      const { deleteResume } = await import('../lib/api')
      await deleteResume('resume_1')

      expect(mockDelete).toHaveBeenCalledWith('/api/v1/resumes/resume_1')
    })
  })

  describe('getMyRoasts', () => {
    it('sends GET request to /api/v1/my-roasts', async () => {
      mockGet.mockResolvedValue({ data: { roasts: [], total: 0 } })

      const { getMyRoasts } = await import('../lib/api')
      await getMyRoasts()

      expect(mockGet).toHaveBeenCalledWith('/api/v1/my-roasts')
    })

    it('returns roast history', async () => {
      const mockRoasts = {
        roasts: [{ id: '1', score: 75, headline: 'Test' }],
        total: 1,
      }
      mockGet.mockResolvedValue({ data: mockRoasts })

      const { getMyRoasts } = await import('../lib/api')
      const result = await getMyRoasts()

      expect(result).toEqual(mockRoasts)
    })
  })

  describe('setAuthToken', () => {
    it('sets token in localStorage when provided', async () => {
      const { setAuthToken } = await import('../lib/api')
      setAuthToken('test-token')

      expect(localStorage.getItem('token')).toBe('test-token')
    })

    it('removes token from localStorage when null', async () => {
      localStorage.setItem('token', 'old-token')

      const { setAuthToken } = await import('../lib/api')
      setAuthToken(null)

      expect(localStorage.getItem('token')).toBeNull()
    })
  })

  describe('getStoredToken', () => {
    it('returns token from localStorage', async () => {
      localStorage.setItem('token', 'stored-token')

      const { getStoredToken } = await import('../lib/api')
      const result = getStoredToken()

      expect(result).toBe('stored-token')
    })

    it('returns null when no token stored', async () => {
      const { getStoredToken } = await import('../lib/api')
      const result = getStoredToken()

      expect(result).toBeNull()
    })
  })
})
