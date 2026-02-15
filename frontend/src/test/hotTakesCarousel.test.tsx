import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { HotTakesCarousel } from '../components/HotTakes/HotTakesCarousel'
import * as api from '../lib/api'

vi.mock('../lib/api', () => ({
  getHotTakes: vi.fn(),
}))

describe('HotTakesCarousel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing while loading', () => {
    vi.mocked(api.getHotTakes).mockImplementation(() => new Promise(() => {}))

    const { container } = render(<HotTakesCarousel />)

    expect(container.firstChild).toBeNull()
  })

  it('renders hot takes from API', async () => {
    vi.mocked(api.getHotTakes).mockResolvedValue({
      hot_takes: [
        { headline: 'Test headline 1', score: 45 },
        { headline: 'Test headline 2', score: 72 },
      ],
    })

    render(<HotTakesCarousel />)

    await waitFor(() => {
      expect(screen.getByText('Hot Takes')).toBeInTheDocument()
    })

    expect(screen.getByText('Test headline 1')).toBeInTheDocument()
  })

  it('renders fallback hot takes when API returns empty', async () => {
    vi.mocked(api.getHotTakes).mockResolvedValue({ hot_takes: [] })

    render(<HotTakesCarousel />)

    await waitFor(() => {
      expect(screen.getByText('Hot Takes')).toBeInTheDocument()
    })

    // Should show one of the fallback headlines
    expect(screen.getByText(/beige wall|Three pages|peaked|skills section|bullet points/)).toBeInTheDocument()
  })

  it('renders fallback hot takes when API fails', async () => {
    vi.mocked(api.getHotTakes).mockRejectedValue(new Error('API Error'))

    render(<HotTakesCarousel />)

    await waitFor(() => {
      expect(screen.getByText('Hot Takes')).toBeInTheDocument()
    })
  })

  it('displays score with correct color for low score', async () => {
    vi.mocked(api.getHotTakes).mockResolvedValue({
      hot_takes: [{ headline: 'Bad resume', score: 25 }],
    })

    render(<HotTakesCarousel />)

    await waitFor(() => {
      const scoreElement = screen.getByText('25/100')
      expect(scoreElement).toHaveClass('text-red-600')
    })
  })

  it('displays score with correct color for medium score', async () => {
    vi.mocked(api.getHotTakes).mockResolvedValue({
      hot_takes: [{ headline: 'OK resume', score: 50 }],
    })

    render(<HotTakesCarousel />)

    await waitFor(() => {
      const scoreElement = screen.getByText('50/100')
      expect(scoreElement).toHaveClass('text-amber-600')
    })
  })

  it('displays score with correct color for high score', async () => {
    vi.mocked(api.getHotTakes).mockResolvedValue({
      hot_takes: [{ headline: 'Great resume', score: 75 }],
    })

    render(<HotTakesCarousel />)

    await waitFor(() => {
      const scoreElement = screen.getByText('75/100')
      expect(scoreElement).toHaveClass('text-green-600')
    })
  })

  it('renders progress dots for multiple hot takes', async () => {
    vi.mocked(api.getHotTakes).mockResolvedValue({
      hot_takes: [
        { headline: 'Take 1', score: 40 },
        { headline: 'Take 2', score: 50 },
        { headline: 'Take 3', score: 60 },
      ],
    })

    render(<HotTakesCarousel />)

    await waitFor(() => {
      const dots = screen.getAllByRole('button')
      expect(dots).toHaveLength(3)
    })
  })

  it('does not render progress dots for single hot take', async () => {
    vi.mocked(api.getHotTakes).mockResolvedValue({
      hot_takes: [{ headline: 'Single take', score: 50 }],
    })

    render(<HotTakesCarousel />)

    await waitFor(() => {
      expect(screen.getByText('Single take')).toBeInTheDocument()
    })

    // No dots should be rendered
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('changes slide when clicking progress dot', async () => {
    vi.mocked(api.getHotTakes).mockResolvedValue({
      hot_takes: [
        { headline: 'First headline', score: 40 },
        { headline: 'Second headline', score: 50 },
      ],
    })

    render(<HotTakesCarousel />)

    await waitFor(() => {
      expect(screen.getByText('First headline')).toBeInTheDocument()
    })

    const dots = screen.getAllByRole('button')

    fireEvent.click(dots[1])

    await waitFor(() => {
      expect(screen.getByText('Second headline')).toBeInTheDocument()
    })
  })

  it('renders subtitle text', async () => {
    vi.mocked(api.getHotTakes).mockResolvedValue({
      hot_takes: [{ headline: 'Test', score: 50 }],
    })

    render(<HotTakesCarousel />)

    await waitFor(() => {
      expect(screen.getByText('Real roasts from real resumes')).toBeInTheDocument()
    })
  })
})
