import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Navbar } from '../components/Layout/Navbar'
import * as useAuthModule from '../hooks/useAuth'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders logo and brand name', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )

    expect(screen.getByText('Resume Analyzer')).toBeInTheDocument()
  })

  it('shows Sign In and Sign Up links when not authenticated', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )

    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
  })

  it('shows Dashboard and Logout when authenticated', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { id: '1', email: 'test@example.com', full_name: 'Test User' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('calls logout and navigates to home on logout click', () => {
    const mockLogout = vi.fn()
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { id: '1', email: 'test@example.com', full_name: 'Test User' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: mockLogout,
    })

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )

    fireEvent.click(screen.getByText('Logout'))

    expect(mockLogout).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('has correct link destinations', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )

    expect(screen.getByText('Sign In').closest('a')).toHaveAttribute('href', '/login')
    expect(screen.getByText('Sign Up').closest('a')).toHaveAttribute('href', '/signup')
  })

  it('has dashboard link when authenticated', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { id: '1', email: 'test@example.com', full_name: 'Test User' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )

    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard')
  })
})
