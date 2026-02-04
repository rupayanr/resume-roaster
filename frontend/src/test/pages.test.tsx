import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from '../pages/Login'
import { SignupPage } from '../pages/Signup'
import { DashboardPage } from '../pages/Dashboard'
import { AuthProvider } from '../contexts/AuthContext'
import * as useAuthModule from '../hooks/useAuth'

// Mock the API module
vi.mock('../lib/api', () => ({
  login: vi.fn(),
  signup: vi.fn(),
  getCurrentUser: vi.fn(),
  setAuthToken: vi.fn(),
  getStoredToken: vi.fn(() => null),
  listResumes: vi.fn().mockResolvedValue({ resumes: [], total: 0 }),
  getMyRoasts: vi.fn().mockResolvedValue({ roasts: [], total: 0 }),
}))

const renderWithProviders = (
  ui: React.ReactNode,
  { initialEntries = ['/'], routes }: { initialEntries?: string[]; routes?: React.ReactNode } = {}
) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <Routes>
          {routes || <Route path="*" element={ui} />}
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page title and description', () => {
    renderWithProviders(<LoginPage />)

    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByText('Sign in to access your resume history')).toBeInTheDocument()
  })

  it('renders Resume Analyzer badge', () => {
    renderWithProviders(<LoginPage />)

    expect(screen.getByText('Resume Analyzer')).toBeInTheDocument()
  })

  it('renders login form', () => {
    renderWithProviders(<LoginPage />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('navigates to home after successful login', async () => {
    const { login, getCurrentUser } = await import('../lib/api')
    vi.mocked(login).mockResolvedValue({ access_token: 'token' })
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      full_name: 'Test',
    })

    renderWithProviders(<LoginPage />, {
      initialEntries: ['/login'],
      routes: (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>Home Page</div>} />
        </>
      ),
    })

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument()
    })
  })

  it('navigates to original destination after login', async () => {
    const { login, getCurrentUser } = await import('../lib/api')
    vi.mocked(login).mockResolvedValue({ access_token: 'token' })
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      full_name: 'Test',
    })

    render(
      <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: { pathname: '/dashboard' } } }]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<div>Dashboard Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
    })
  })
})

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page title and description', () => {
    renderWithProviders(<SignupPage />)

    // "Create Account" appears in both heading and button, check for heading
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument()
    expect(screen.getByText('Save your resume history and roast results')).toBeInTheDocument()
  })

  it('renders Resume Analyzer badge', () => {
    renderWithProviders(<SignupPage />)

    expect(screen.getByText('Resume Analyzer')).toBeInTheDocument()
  })

  it('renders signup form', () => {
    renderWithProviders(<SignupPage />)

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
  })

  it('navigates to home after successful signup', async () => {
    const { signup, login, getCurrentUser } = await import('../lib/api')
    vi.mocked(signup).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      full_name: 'Test User',
    })
    vi.mocked(login).mockResolvedValue({ access_token: 'token' })
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      full_name: 'Test User',
    })

    renderWithProviders(<SignupPage />, {
      initialEntries: ['/signup'],
      routes: (
        <>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<div>Home Page</div>} />
        </>
      ),
    })

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' },
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument()
    })
  })
})

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page title', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { id: '1', email: 'test@example.com', full_name: 'John Doe' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })

    renderWithProviders(<DashboardPage />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('displays personalized greeting with first name', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { id: '1', email: 'test@example.com', full_name: 'John Doe' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })

    renderWithProviders(<DashboardPage />)

    expect(screen.getByText('Welcome back, John')).toBeInTheDocument()
  })

  it('shows fallback greeting when no name', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { id: '1', email: 'test@example.com', full_name: '' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })

    renderWithProviders(<DashboardPage />)

    expect(screen.getByText('Welcome back, there')).toBeInTheDocument()
  })

  it('renders Upload New Resume button', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { id: '1', email: 'test@example.com', full_name: 'Test User' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })

    renderWithProviders(<DashboardPage />)

    expect(screen.getByText('Upload New Resume')).toBeInTheDocument()
    expect(screen.getByText('Upload New Resume').closest('a')).toHaveAttribute('href', '/')
  })

  it('renders section headers', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { id: '1', email: 'test@example.com', full_name: 'Test User' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })

    renderWithProviders(<DashboardPage />)

    expect(screen.getByText('My Resumes')).toBeInTheDocument()
    expect(screen.getByText('Roast History')).toBeInTheDocument()
  })
})
