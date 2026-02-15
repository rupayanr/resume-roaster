import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Navbar } from '../components/Layout/Navbar'

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders logo and brand name', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )

    expect(screen.getByText('Resume Roaster')).toBeInTheDocument()
  })

  it('has home link destination', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )

    expect(screen.getByText('Resume Roaster').closest('a')).toHaveAttribute('href', '/')
  })

  it('renders favicon as logo', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )

    const logo = screen.getByAltText('Resume Roaster')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', '/favicon.svg')
  })
})
