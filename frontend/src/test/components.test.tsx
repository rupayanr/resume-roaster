import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Container } from '../components/Layout/Container'
import { FilePreview } from '../components/Upload/FilePreview'
import { ScoreDisplay } from '../components/Roast/ScoreDisplay'
import { FeedbackSection } from '../components/Roast/FeedbackSection'
import { Suggestions } from '../components/Roast/Suggestions'
import { ShareButton } from '../components/Share/ShareButton'

describe('Container', () => {
  it('renders children correctly', () => {
    render(
      <Container>
        <div data-testid="child">Test content</div>
      </Container>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('applies correct styling classes', () => {
    const { container } = render(
      <Container>
        <div>Content</div>
      </Container>
    )

    const outerDiv = container.firstChild as HTMLElement
    expect(outerDiv.className).toContain('min-h-screen')
  })
})

describe('FilePreview', () => {
  const mockFile = new File(['test content'], 'resume.pdf', { type: 'application/pdf' })

  it('displays file name', () => {
    render(<FilePreview file={mockFile} onRemove={() => {}} isUploading={false} />)

    expect(screen.getByText('resume.pdf')).toBeInTheDocument()
  })

  it('displays file size', () => {
    render(<FilePreview file={mockFile} onRemove={() => {}} isUploading={false} />)

    // 12 bytes = 0.0 KB (rounded)
    expect(screen.getByText(/KB/)).toBeInTheDocument()
  })

  it('shows remove button when not uploading', () => {
    render(<FilePreview file={mockFile} onRemove={() => {}} isUploading={false} />)

    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument()
  })

  it('hides remove button when uploading', () => {
    render(<FilePreview file={mockFile} onRemove={() => {}} isUploading={true} />)

    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument()
  })

  it('calls onRemove when button clicked', async () => {
    const user = userEvent.setup()
    const handleRemove = vi.fn()
    render(<FilePreview file={mockFile} onRemove={handleRemove} isUploading={false} />)

    await user.click(screen.getByRole('button', { name: /remove/i }))

    expect(handleRemove).toHaveBeenCalledTimes(1)
  })
})

describe('ScoreDisplay', () => {
  it('displays the score', () => {
    render(<ScoreDisplay score={75} />)

    expect(screen.getByText('75')).toBeInTheDocument()
  })

  it('shows "Excellent" for scores >= 80', () => {
    render(<ScoreDisplay score={85} />)

    expect(screen.getByText('Excellent')).toBeInTheDocument()
  })

  it('shows "Good" for scores 60-79', () => {
    render(<ScoreDisplay score={65} />)

    expect(screen.getByText('Good')).toBeInTheDocument()
  })

  it('shows "Needs Improvement" for scores 40-59', () => {
    render(<ScoreDisplay score={45} />)

    expect(screen.getByText('Needs Improvement')).toBeInTheDocument()
  })

  it('shows "Needs Work" for scores < 40', () => {
    render(<ScoreDisplay score={25} />)

    expect(screen.getByText('Needs Work')).toBeInTheDocument()
  })
})

describe('FeedbackSection', () => {
  const mockSection = {
    title: 'Strengths',
    icon: 'check',
    points: ['Point 1', 'Point 2', 'Point 3'],
  }

  it('displays section title', () => {
    render(<FeedbackSection {...mockSection} />)

    expect(screen.getByText('Strengths')).toBeInTheDocument()
  })

  it('displays all points', () => {
    render(<FeedbackSection {...mockSection} />)

    expect(screen.getByText('Point 1')).toBeInTheDocument()
    expect(screen.getByText('Point 2')).toBeInTheDocument()
    expect(screen.getByText('Point 3')).toBeInTheDocument()
  })

  it('renders correct number of list items', () => {
    render(<FeedbackSection {...mockSection} />)

    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(3)
  })
})

describe('Suggestions', () => {
  const mockSuggestions = [
    {
      original: 'Old text',
      improved: 'New text',
      why: 'Because it is better',
    },
    {
      original: 'Another old text',
      improved: 'Another new text',
      why: 'Another reason',
    },
  ]

  it('renders nothing when suggestions array is empty', () => {
    const { container } = render(<Suggestions suggestions={[]} />)

    expect(container.firstChild).toBeNull()
  })

  it('displays section title', () => {
    render(<Suggestions suggestions={mockSuggestions} />)

    expect(screen.getByText('Suggested Improvements')).toBeInTheDocument()
  })

  it('displays all suggestions', () => {
    render(<Suggestions suggestions={mockSuggestions} />)

    // Text is wrapped in quotes in the component
    expect(screen.getByText(/Old text/)).toBeInTheDocument()
    expect(screen.getByText(/New text/)).toBeInTheDocument()
    expect(screen.getByText('Because it is better')).toBeInTheDocument()
  })

  it('shows Before/After labels', () => {
    render(<Suggestions suggestions={mockSuggestions} />)

    expect(screen.getAllByText('Before')).toHaveLength(2)
    expect(screen.getAllByText('After')).toHaveLength(2)
  })
})

describe('ShareButton', () => {
  it('displays "Share" text initially', () => {
    render(<ShareButton shareUrl="https://example.com/share" />)

    expect(screen.getByText('Share')).toBeInTheDocument()
  })

  it('shows dropdown with "Copy Link" when clicked', async () => {
    const user = userEvent.setup()
    render(<ShareButton shareUrl="https://example.com/share" />)

    // Click to open dropdown
    await user.click(screen.getByText('Share'))

    // Dropdown should show Copy Link option
    await waitFor(() => {
      expect(screen.getByText('Copy Link')).toBeInTheDocument()
    })
  })

  it('shows "Copied!" after clicking Copy Link', async () => {
    const user = userEvent.setup()
    render(<ShareButton shareUrl="https://example.com/share" />)

    // Open dropdown
    await user.click(screen.getByText('Share'))

    // Click Copy Link
    await waitFor(() => {
      expect(screen.getByText('Copy Link')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Copy Link'))

    // Dropdown closes after copying, reopen to see "Copied!" state
    await user.click(screen.getByText('Share'))

    // The component shows "Copied!" which proves clipboard.writeText was called successfully
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })
  })

  it('shows share options in dropdown', async () => {
    const user = userEvent.setup()
    render(<ShareButton shareUrl="https://example.com/share" />)

    // Click to open dropdown
    await user.click(screen.getByText('Share'))

    // Check for social share options
    await waitFor(() => {
      expect(screen.getByText('Share on X')).toBeInTheDocument()
      expect(screen.getByText('Share on LinkedIn')).toBeInTheDocument()
    })
  })
})
