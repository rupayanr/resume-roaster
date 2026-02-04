import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProcessingStepper } from '../components/Processing/ProcessingStepper'

describe('ProcessingStepper', () => {
  it('renders file name', () => {
    render(<ProcessingStepper fileName="resume.pdf" isProcessing={true} />)

    expect(screen.getByText('resume.pdf')).toBeInTheDocument()
    expect(screen.getByText('Processing your resume...')).toBeInTheDocument()
  })

  it('renders all processing steps', () => {
    render(<ProcessingStepper fileName="resume.pdf" isProcessing={true} />)

    expect(screen.getByText('Uploading Resume')).toBeInTheDocument()
    expect(screen.getByText('Extracting Text')).toBeInTheDocument()
    expect(screen.getByText('Analyzing Content')).toBeInTheDocument()
    expect(screen.getByText('Generating Feedback')).toBeInTheDocument()
    expect(screen.getByText('Preparing Suggestions')).toBeInTheDocument()
  })

  it('shows first step description when processing starts', () => {
    render(<ProcessingStepper fileName="resume.pdf" isProcessing={true} />)

    expect(screen.getByText('Securely transferring your file...')).toBeInTheDocument()
  })

  it('shows tip about processing time', () => {
    render(<ProcessingStepper fileName="resume.pdf" isProcessing={true} />)

    expect(screen.getByText(/AI analysis typically takes 10-30 seconds/)).toBeInTheDocument()
  })

  it('shows loading spinner', () => {
    render(<ProcessingStepper fileName="resume.pdf" isProcessing={true} />)

    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('handles long file names with truncation class', () => {
    const longFileName = 'this_is_a_very_long_resume_filename_that_should_be_truncated.pdf'
    render(<ProcessingStepper fileName={longFileName} isProcessing={true} />)

    const fileNameElement = screen.getByText(longFileName)
    expect(fileNameElement).toHaveClass('truncate')
  })
})
