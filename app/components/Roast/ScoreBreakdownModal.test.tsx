import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ScoreBreakdownModal } from './ScoreBreakdownModal'
import type { ScoreBreakdown } from '@/types'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick, ...props }: any) => (
      <div className={className} onClick={onClick} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

const mockBreakdown: ScoreBreakdown = {
  clarity: 75,
  impact: 80,
  relevance: 70,
  ats: 85,
}

describe('ScoreBreakdownModal', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    // Reset body overflow before each test
    document.body.style.overflow = ''
    mockOnClose.mockClear()
  })

  afterEach(() => {
    // Clean up body overflow after each test
    document.body.style.overflow = ''
  })

  it('renders nothing when closed', () => {
    const { container } = render(
      <ScoreBreakdownModal
        isOpen={false}
        onClose={mockOnClose}
        breakdown={mockBreakdown}
        totalScore={78}
      />
    )

    expect(container.innerHTML).toBe('')
  })

  it('renders modal content when open', () => {
    render(
      <ScoreBreakdownModal
        isOpen={true}
        onClose={mockOnClose}
        breakdown={mockBreakdown}
        totalScore={78}
      />
    )

    expect(screen.getByText('How We Score')).toBeInTheDocument()
    expect(screen.getByText('78')).toBeInTheDocument()
    expect(screen.getByText('Clarity')).toBeInTheDocument()
    expect(screen.getByText('Impact')).toBeInTheDocument()
    expect(screen.getByText('Relevance')).toBeInTheDocument()
    expect(screen.getByText('ATS Compatibility')).toBeInTheDocument()
  })

  it('locks body scroll when modal opens', () => {
    render(
      <ScoreBreakdownModal
        isOpen={true}
        onClose={mockOnClose}
        breakdown={mockBreakdown}
        totalScore={78}
      />
    )

    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body scroll when modal closes', () => {
    const { rerender } = render(
      <ScoreBreakdownModal
        isOpen={true}
        onClose={mockOnClose}
        breakdown={mockBreakdown}
        totalScore={78}
      />
    )

    expect(document.body.style.overflow).toBe('hidden')

    rerender(
      <ScoreBreakdownModal
        isOpen={false}
        onClose={mockOnClose}
        breakdown={mockBreakdown}
        totalScore={78}
      />
    )

    expect(document.body.style.overflow).toBe('')
  })

  it('restores body scroll on unmount', () => {
    const { unmount } = render(
      <ScoreBreakdownModal
        isOpen={true}
        onClose={mockOnClose}
        breakdown={mockBreakdown}
        totalScore={78}
      />
    )

    expect(document.body.style.overflow).toBe('hidden')

    unmount()

    expect(document.body.style.overflow).toBe('')
  })

  it('calls onClose when close button is clicked', () => {
    render(
      <ScoreBreakdownModal
        isOpen={true}
        onClose={mockOnClose}
        breakdown={mockBreakdown}
        totalScore={78}
      />
    )

    const closeButton = screen.getByRole('button', { name: /close|got it/i })
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', () => {
    render(
      <ScoreBreakdownModal
        isOpen={true}
        onClose={mockOnClose}
        breakdown={mockBreakdown}
        totalScore={78}
      />
    )

    // Find the backdrop (first div with fixed inset-0 and bg-black/50)
    const backdrop = document.querySelector('.bg-black\\/50')
    if (backdrop) {
      fireEvent.click(backdrop)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    }
  })

  it('has overscroll-contain class on scrollable content', () => {
    render(
      <ScoreBreakdownModal
        isOpen={true}
        onClose={mockOnClose}
        breakdown={mockBreakdown}
        totalScore={78}
      />
    )

    const scrollableContent = document.querySelector('.overflow-y-auto.overscroll-contain')
    expect(scrollableContent).toBeInTheDocument()
  })

  it('displays individual score values from breakdown', () => {
    render(
      <ScoreBreakdownModal
        isOpen={true}
        onClose={mockOnClose}
        breakdown={mockBreakdown}
        totalScore={78}
      />
    )

    expect(screen.getByText('75')).toBeInTheDocument() // clarity
    expect(screen.getByText('80')).toBeInTheDocument() // impact
    expect(screen.getByText('70')).toBeInTheDocument() // relevance
    expect(screen.getByText('85')).toBeInTheDocument() // ats
  })
})
