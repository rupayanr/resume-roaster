import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ReactionBar } from '../components/Roast/ReactionBar'
import * as api from '../lib/api'

vi.mock('../lib/api', () => ({
  addReaction: vi.fn(),
}))

describe('ReactionBar', () => {
  const defaultProps = {
    shareId: 'test-share-123',
    reactions: {},
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the reaction prompt', () => {
    render(<ReactionBar {...defaultProps} />)
    expect(screen.getByText('React to this roast')).toBeInTheDocument()
  })

  it('renders all reaction buttons', () => {
    render(<ReactionBar {...defaultProps} />)

    expect(screen.getByText('Fire')).toBeInTheDocument()
    expect(screen.getByText('LOL')).toBeInTheDocument()
    expect(screen.getByText('Ouch')).toBeInTheDocument()
    expect(screen.getByText('Facts')).toBeInTheDocument()
    expect(screen.getByText('Survived')).toBeInTheDocument()
  })

  it('displays reaction counts when provided', () => {
    render(
      <ReactionBar
        {...defaultProps}
        reactions={{ fire: 5, ouch: 3 }}
      />
    )

    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('displays total reaction count', () => {
    render(
      <ReactionBar
        {...defaultProps}
        reactions={{ fire: 5, ouch: 3, facts: 2 }}
      />
    )

    expect(screen.getByText('10 reactions')).toBeInTheDocument()
  })

  it('displays singular "reaction" for count of 1', () => {
    render(
      <ReactionBar
        {...defaultProps}
        reactions={{ fire: 1 }}
      />
    )

    expect(screen.getByText('1 reaction')).toBeInTheDocument()
  })

  it('calls addReaction API when clicking a reaction', async () => {
    vi.mocked(api.addReaction).mockResolvedValue({ reactions: { fire: 1 } })

    render(<ReactionBar {...defaultProps} />)

    fireEvent.click(screen.getByText('Fire'))

    await waitFor(() => {
      expect(api.addReaction).toHaveBeenCalledWith('test-share-123', 'fire')
    })
  })

  it('updates local state after successful reaction', async () => {
    vi.mocked(api.addReaction).mockResolvedValue({ reactions: { fire: 1 } })

    render(<ReactionBar {...defaultProps} />)

    fireEvent.click(screen.getByText('Fire'))

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  it('calls onReactionUpdate callback after successful reaction', async () => {
    const onReactionUpdate = vi.fn()
    vi.mocked(api.addReaction).mockResolvedValue({ reactions: { fire: 1 } })

    render(<ReactionBar {...defaultProps} onReactionUpdate={onReactionUpdate} />)

    fireEvent.click(screen.getByText('Fire'))

    await waitFor(() => {
      expect(onReactionUpdate).toHaveBeenCalledWith({ fire: 1 })
    })
  })

  it('disables button after user has reacted', async () => {
    vi.mocked(api.addReaction).mockResolvedValue({ reactions: { fire: 1 } })

    render(<ReactionBar {...defaultProps} />)

    const fireButton = screen.getByText('Fire').closest('button')
    fireEvent.click(fireButton!)

    await waitFor(() => {
      expect(fireButton).toBeDisabled()
    })
  })

  it('handles API error gracefully', async () => {
    vi.mocked(api.addReaction).mockRejectedValue(new Error('API Error'))

    render(<ReactionBar {...defaultProps} />)

    fireEvent.click(screen.getByText('Fire'))

    // Should not throw and button should be enabled again
    await waitFor(() => {
      const fireButton = screen.getByText('Fire').closest('button')
      expect(fireButton).not.toBeDisabled()
    })
  })

  it('prevents multiple simultaneous reactions', async () => {
    let resolvePromise: (value: { reactions: Record<string, number> }) => void
    vi.mocked(api.addReaction).mockImplementation(() =>
      new Promise((resolve) => { resolvePromise = resolve })
    )

    render(<ReactionBar {...defaultProps} />)

    // Click fire
    fireEvent.click(screen.getByText('Fire'))

    // Try to click ouch while fire is loading - should be disabled
    const ouchButton = screen.getByText('Ouch').closest('button')
    expect(ouchButton).toBeDisabled()

    // Resolve the promise
    resolvePromise!({ reactions: { fire: 1 } })

    await waitFor(() => {
      // Ouch should be enabled again (fire is disabled because user reacted)
      expect(ouchButton).not.toBeDisabled()
    })
  })

  it('renders with empty reactions object', () => {
    render(<ReactionBar {...defaultProps} reactions={{}} />)

    // Should not show total count
    expect(screen.queryByText(/reaction/)).not.toBeInTheDocument()
  })

  it('renders reaction emojis', () => {
    render(<ReactionBar {...defaultProps} />)

    // Check emojis are rendered (using their unicode representation)
    expect(screen.getByText('🔥')).toBeInTheDocument()
    expect(screen.getByText('😂')).toBeInTheDocument()
    expect(screen.getByText('😬')).toBeInTheDocument()
    expect(screen.getByText('💯')).toBeInTheDocument()
    expect(screen.getByText('💪')).toBeInTheDocument()
  })
})
