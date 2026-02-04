import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuthContext } from '../contexts/AuthContext'
import * as api from '../lib/api'

// Mock the API module
vi.mock('../lib/api', () => ({
  login: vi.fn(),
  signup: vi.fn(),
  getCurrentUser: vi.fn(),
  setAuthToken: vi.fn(),
  getStoredToken: vi.fn(() => null),
}))

function TestConsumer() {
  const { user, isAuthenticated, isLoading, logout } = useAuthContext()
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user?.email || 'none'}</span>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('loads user from stored token on mount', async () => {
    vi.mocked(api.getStoredToken).mockReturnValue('stored-token')
    vi.mocked(api.getCurrentUser).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      full_name: 'Test User',
    })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    // Initially loading
    expect(screen.getByTestId('loading')).toHaveTextContent('true')

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
  })

  it('handles invalid stored token gracefully', async () => {
    vi.mocked(api.getStoredToken).mockReturnValue('invalid-token')
    vi.mocked(api.getCurrentUser).mockRejectedValue(new Error('Invalid token'))

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    // Token should be cleared
    expect(api.setAuthToken).toHaveBeenCalledWith(null)
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
  })

  it('logout clears user and token', async () => {
    vi.mocked(api.getStoredToken).mockReturnValue('token')
    vi.mocked(api.getCurrentUser).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      full_name: 'Test User',
    })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    })

    // Click logout
    act(() => {
      screen.getByText('Logout').click()
    })

    expect(api.setAuthToken).toHaveBeenCalledWith(null)
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('user')).toHaveTextContent('none')
  })

  it('throws error when useAuthContext is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestConsumer />)
    }).toThrow('useAuthContext must be used within an AuthProvider')

    consoleSpy.mockRestore()
  })

  it('handles no stored token on mount', async () => {
    vi.mocked(api.getStoredToken).mockReturnValue(null)

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(api.getCurrentUser).not.toHaveBeenCalled()
  })
})
