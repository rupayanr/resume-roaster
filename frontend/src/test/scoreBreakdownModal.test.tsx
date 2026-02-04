import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ScoreBreakdownModal } from '../components/Roast/ScoreBreakdownModal'

describe('ScoreBreakdownModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    breakdown: {
      clarity: 80,
      impact: 70,
      relevance: 75,
      ats: 75,
    },
    totalScore: 75,
  }

  it('renders nothing when closed', () => {
    render(<ScoreBreakdownModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('How We Score')).not.toBeInTheDocument()
  })

  it('renders modal content when open', () => {
    render(<ScoreBreakdownModal {...defaultProps} />)

    expect(screen.getByText('How We Score')).toBeInTheDocument()
    expect(screen.getByText('Your resume is evaluated on 4 key criteria')).toBeInTheDocument()
  })

  it('displays overall score section', () => {
    render(<ScoreBreakdownModal {...defaultProps} />)

    expect(screen.getByText('Overall Score')).toBeInTheDocument()
    expect(screen.getByText('/100')).toBeInTheDocument()
  })

  it('displays all four criteria', () => {
    render(<ScoreBreakdownModal {...defaultProps} />)

    expect(screen.getByText('Clarity')).toBeInTheDocument()
    expect(screen.getByText('Impact')).toBeInTheDocument()
    expect(screen.getByText('Relevance')).toBeInTheDocument()
    expect(screen.getByText('ATS Compatibility')).toBeInTheDocument()
  })

  it('displays criterion descriptions', () => {
    render(<ScoreBreakdownModal {...defaultProps} />)

    expect(screen.getByText('How clear and readable is your resume?')).toBeInTheDocument()
    expect(screen.getByText('Do you showcase measurable achievements?')).toBeInTheDocument()
    expect(screen.getByText('Does your content match the job market?')).toBeInTheDocument()
    expect(screen.getByText('Can applicant tracking systems read it?')).toBeInTheDocument()
  })

  it('displays scoring formula', () => {
    render(<ScoreBreakdownModal {...defaultProps} />)

    expect(screen.getByText('Scoring Formula')).toBeInTheDocument()
    expect(screen.getByText('Score = (Clarity + Impact + Relevance + ATS) / 4')).toBeInTheDocument()
  })

  it('calls onClose when clicking backdrop', () => {
    const onClose = vi.fn()
    render(<ScoreBreakdownModal {...defaultProps} onClose={onClose} />)

    // Find and click the backdrop (has bg-black/50 class)
    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50')
    fireEvent.click(backdrop!)

    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when clicking "Got it" button', () => {
    const onClose = vi.fn()
    render(<ScoreBreakdownModal {...defaultProps} onClose={onClose} />)

    fireEvent.click(screen.getByText('Got it'))

    expect(onClose).toHaveBeenCalled()
  })

  it('displays factors for each criterion', () => {
    render(<ScoreBreakdownModal {...defaultProps} />)

    // Clarity factors
    expect(screen.getByText('Clean, organized structure')).toBeInTheDocument()
    expect(screen.getByText('Easy to scan quickly')).toBeInTheDocument()

    // Impact factors
    expect(screen.getByText('Quantifiable results (%, $, #)')).toBeInTheDocument()
    expect(screen.getByText('Strong action verbs')).toBeInTheDocument()

    // ATS factors
    expect(screen.getByText('Standard section headings')).toBeInTheDocument()
    expect(screen.getByText('Relevant keywords present')).toBeInTheDocument()
  })
})
