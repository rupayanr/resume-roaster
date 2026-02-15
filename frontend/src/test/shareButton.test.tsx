import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ShareButton } from '../components/Share/ShareButton'

describe('ShareButton', () => {
  const mockClipboard = {
    writeText: vi.fn(),
  }

  const mockWindowOpen = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(navigator, { clipboard: mockClipboard })
    vi.stubGlobal('open', mockWindowOpen)
    mockClipboard.writeText.mockResolvedValue(undefined)
  })

  it('renders share button', () => {
    render(<ShareButton shareUrl="https://example.com/roast/123" />)
    expect(screen.getByText('Share')).toBeInTheDocument()
  })

  it('opens menu on click', async () => {
    render(<ShareButton shareUrl="https://example.com/roast/123" />)
    fireEvent.click(screen.getByText('Share'))

    await waitFor(() => {
      expect(screen.getByText('Copy Link')).toBeInTheDocument()
    })
    expect(screen.getByText('Share on X')).toBeInTheDocument()
    expect(screen.getByText('Share on LinkedIn')).toBeInTheDocument()
  })

  it('copies link to clipboard when copy button clicked', async () => {
    render(<ShareButton shareUrl="https://example.com/roast/123" />)
    fireEvent.click(screen.getByText('Share'))

    await waitFor(() => {
      expect(screen.getByText('Copy Link')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Copy Link'))

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith('https://example.com/roast/123')
    })
  })

  it('opens Twitter share in new window', async () => {
    render(
      <ShareButton
        shareUrl="https://example.com/roast/123"
        headline="Test headline"
        score={75}
      />
    )
    fireEvent.click(screen.getByText('Share'))

    await waitFor(() => {
      expect(screen.getByText('Share on X')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Share on X'))

    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank',
      'width=550,height=420'
    )
  })

  it('opens LinkedIn share in new window', async () => {
    render(<ShareButton shareUrl="https://example.com/roast/123" />)
    fireEvent.click(screen.getByText('Share'))

    await waitFor(() => {
      expect(screen.getByText('Share on LinkedIn')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Share on LinkedIn'))

    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining('linkedin.com/sharing'),
      '_blank',
      'width=550,height=420'
    )
  })

  it('includes score in Twitter share URL', async () => {
    render(
      <ShareButton
        shareUrl="https://example.com/roast/123"
        headline="Test headline"
        score={75}
      />
    )
    fireEvent.click(screen.getByText('Share'))

    await waitFor(() => {
      expect(screen.getByText('Share on X')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Share on X'))

    const callArg = mockWindowOpen.mock.calls[0][0]
    expect(callArg).toContain('75')
  })

  it('includes share URL in Twitter params', async () => {
    render(<ShareButton shareUrl="https://example.com/roast/123" />)
    fireEvent.click(screen.getByText('Share'))

    await waitFor(() => {
      expect(screen.getByText('Share on X')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Share on X'))

    const callArg = mockWindowOpen.mock.calls[0][0]
    expect(callArg).toContain('url=')
    expect(callArg).toContain('example.com')
  })

  it('renders chevron icon', () => {
    const { container } = render(<ShareButton shareUrl="https://example.com/roast/123" />)
    // Look for the chevron SVG inside the button
    const button = screen.getByText('Share').closest('button')
    expect(button?.querySelector('svg')).toBeInTheDocument()
  })

  it('renders share icon', () => {
    render(<ShareButton shareUrl="https://example.com/roast/123" />)
    // The button should contain Share2 icon
    const button = screen.getByText('Share').closest('button')
    expect(button).toBeInTheDocument()
  })

  it('has correct button styling', () => {
    render(<ShareButton shareUrl="https://example.com/roast/123" />)
    const button = screen.getByText('Share').closest('button')
    expect(button).toHaveClass('bg-gray-100')
  })
})
