import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DropZone } from '../components/Upload/DropZone'

describe('DropZone', () => {
  it('renders upload instructions', () => {
    const onUpload = vi.fn()
    render(<DropZone onUpload={onUpload} />)

    expect(screen.getByText('Drop your resume PDF here')).toBeInTheDocument()
    expect(screen.getByText('browse')).toBeInTheDocument()
    expect(screen.getByText('PDF files only, max 5MB')).toBeInTheDocument()
  })

  it('renders file input', () => {
    const onUpload = vi.fn()
    render(<DropZone onUpload={onUpload} />)

    const input = document.querySelector('input[type="file"]')
    expect(input).toBeInTheDocument()
  })

  it('applies disabled styles when disabled prop is passed', () => {
    const onUpload = vi.fn()
    const { container } = render(<DropZone onUpload={onUpload} disabled />)

    // Check that disabled class is applied somewhere in the dropzone
    expect(container.innerHTML).toContain('cursor-not-allowed')
  })

  it('calls onUpload when file is dropped', async () => {
    const onUpload = vi.fn()
    render(<DropZone onUpload={onUpload} />)

    const file = new File(['pdf content'], 'resume.pdf', { type: 'application/pdf' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    Object.defineProperty(input, 'files', {
      value: [file],
    })

    fireEvent.change(input)

    // Wait for the callback
    await vi.waitFor(() => {
      expect(onUpload).toHaveBeenCalledWith(file)
    })
  })
})
