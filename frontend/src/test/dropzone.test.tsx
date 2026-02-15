import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
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

    await act(async () => {
      Object.defineProperty(input, 'files', {
        value: [file],
      })
      fireEvent.change(input)
    })

    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledWith(file)
    })
  })

  it('renders intensity selector', () => {
    const onUpload = vi.fn()
    render(<DropZone onUpload={onUpload} intensity="medium" onIntensityChange={vi.fn()} />)

    expect(screen.getByText('Mild')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Brutal')).toBeInTheDocument()
  })

  it('calls onIntensityChange when intensity is changed', async () => {
    const onUpload = vi.fn()
    const onIntensityChange = vi.fn()
    render(
      <DropZone
        onUpload={onUpload}
        intensity="medium"
        onIntensityChange={onIntensityChange}
      />
    )

    await act(async () => {
      fireEvent.click(screen.getByText('Brutal'))
    })

    expect(onIntensityChange).toHaveBeenCalledWith('brutal')
  })

  it('renders industry selector', () => {
    const onUpload = vi.fn()
    render(
      <DropZone
        onUpload={onUpload}
        industry="general"
        onIndustryChange={vi.fn()}
      />
    )

    expect(screen.getByText('General')).toBeInTheDocument()
  })

  it('calls onIndustryChange when industry is changed', async () => {
    const onUpload = vi.fn()
    const onIndustryChange = vi.fn()
    render(
      <DropZone
        onUpload={onUpload}
        industry="general"
        onIndustryChange={onIndustryChange}
      />
    )

    await act(async () => {
      fireEvent.click(screen.getByText('Tech'))
    })

    expect(onIndustryChange).toHaveBeenCalledWith('tech')
  })
})
