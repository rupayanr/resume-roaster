import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuthContext } from '../contexts/AuthContext'
import { LoginForm } from '../components/Auth/LoginForm'
import { SignupForm } from '../components/Auth/SignupForm'

// Mock the API module
vi.mock('../lib/api', () => ({
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

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email and password fields', () => {
    renderWithProviders(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders sign in button', () => {
    renderWithProviders(<LoginForm />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows link to signup page', () => {
    renderWithProviders(<LoginForm />)
    expect(screen.getByText(/sign up/i)).toBeInTheDocument()
  })

  it('validates email format', async () => {
    renderWithProviders(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'invalidemail' } })
    fireEvent.click(submitButton)

    // HTML5 validation should prevent submission
    expect(emailInput).toBeInvalid()
  })

  it('submits form with valid credentials', async () => {
    const { login, getCurrentUser } = await import('../lib/api')
    ;(login as ReturnType<typeof vi.fn>).mockResolvedValue({ access_token: 'test-token' })
    ;(getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      full_name: 'Test User',
    })

    const onSuccess = vi.fn()
    renderWithProviders(<LoginForm onSuccess={onSuccess} />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })
})

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all required fields', () => {
    renderWithProviders(<SignupForm />)
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
  })

  it('renders create account button', () => {
    renderWithProviders(<SignupForm />)
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('shows link to login page', () => {
    renderWithProviders(<SignupForm />)
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
  })

  it('validates password match', async () => {
    renderWithProviders(<SignupForm />)

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
      target: { value: 'differentpassword' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it('validates password length', async () => {
    renderWithProviders(<SignupForm />)

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' },
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: '12345' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: '12345' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument()
    })
  })
})

describe('AuthContext', () => {
  it('provides authentication state', () => {
    const TestComponent = () => {
      const { isAuthenticated, isLoading } = useAuthContext()
      return (
        <div>
          <span data-testid="authenticated">{String(isAuthenticated)}</span>
          <span data-testid="loading">{String(isLoading)}</span>
        </div>
      )
    }

    renderWithProviders(<TestComponent />)

    // Initially should not be authenticated (after loading completes)
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
  })
})
