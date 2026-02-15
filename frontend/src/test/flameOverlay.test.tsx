import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FlameOverlay } from '../components/Effects/FlameOverlay'

describe('FlameOverlay', () => {
  it('renders children', () => {
    render(
      <FlameOverlay intensity={50}>
        <div data-testid="child">Content</div>
      </FlameOverlay>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('renders without fire effects for intensity 0', () => {
    const { container } = render(
      <FlameOverlay intensity={0}>
        <div>Content</div>
      </FlameOverlay>
    )
    // Should not have fire/smoke effects (no red gradient)
    expect(container.querySelector('.from-red-500\\/5')).toBeNull()
    // Should not have smoke wisps
    expect(container.querySelector('.blur-xl')).toBeNull()
  })

  it('renders sparkles for low intensity (under 30)', () => {
    const { container } = render(
      <FlameOverlay intensity={10}>
        <div>Content</div>
      </FlameOverlay>
    )
    // Sparkle particles should be rendered
    const sparkleContainer = container.querySelector('.absolute.inset-0.overflow-hidden')
    expect(sparkleContainer).toBeInTheDocument()
  })

  it('renders cool gradient for very low intensity (under 20)', () => {
    const { container } = render(
      <FlameOverlay intensity={15}>
        <div>Content</div>
      </FlameOverlay>
    )
    // Cool gradient overlay should be present
    expect(container.querySelector('.bg-gradient-to-t')).toBeInTheDocument()
  })

  it('renders smoke wisps for medium intensity (30-60)', () => {
    const { container } = render(
      <FlameOverlay intensity={45}>
        <div>Content</div>
      </FlameOverlay>
    )
    // Smoke elements should be present
    const smokeElements = container.querySelectorAll('.blur-xl')
    expect(smokeElements.length).toBeGreaterThan(0)
  })

  it('renders ember particles for higher intensity (above 40)', () => {
    const { container } = render(
      <FlameOverlay intensity={50}>
        <div>Content</div>
      </FlameOverlay>
    )
    // Ember/particle container should be present
    const particleContainer = container.querySelector('.absolute.bottom-0')
    expect(particleContainer).toBeInTheDocument()
  })

  it('renders fire gradient for high intensity (above 60)', () => {
    const { container } = render(
      <FlameOverlay intensity={70}>
        <div>Content</div>
      </FlameOverlay>
    )
    // Fire gradient overlay should be present
    expect(container.querySelector('.from-red-500\\/5')).toBeInTheDocument()
  })

  it('renders orange particles for intensity between 60-80', () => {
    const { container } = render(
      <FlameOverlay intensity={65}>
        <div>Content</div>
      </FlameOverlay>
    )
    // Orange particles
    expect(container.querySelector('.bg-orange-500')).toBeInTheDocument()
  })

  it('renders red particles for very high intensity (above 80)', () => {
    const { container } = render(
      <FlameOverlay intensity={85}>
        <div>Content</div>
      </FlameOverlay>
    )
    // Red particles
    expect(container.querySelector('.bg-red-500')).toBeInTheDocument()
  })

  it('renders amber particles for medium-high intensity (40-60)', () => {
    const { container } = render(
      <FlameOverlay intensity={45}>
        <div>Content</div>
      </FlameOverlay>
    )
    // Amber particles
    expect(container.querySelector('.bg-amber-500')).toBeInTheDocument()
  })

  it('generates correct number of particles based on intensity', () => {
    // Intensity 50 should generate 5 particles (50/10 = 5)
    const { container } = render(
      <FlameOverlay intensity={50}>
        <div>Content</div>
      </FlameOverlay>
    )
    // Find particle elements (rounded divs inside the bottom container)
    const particleContainer = container.querySelector('.absolute.bottom-0.left-0.right-0')
    const particles = particleContainer?.querySelectorAll('.rounded-full')
    expect(particles?.length).toBe(5)
  })

  it('generates sparkles for cool scores', () => {
    // Intensity 20 should generate sparkles: (30-20)/5 = 2 sparkles
    const { container } = render(
      <FlameOverlay intensity={20}>
        <div>Content</div>
      </FlameOverlay>
    )
    const sparkleContainer = container.querySelector('.absolute.inset-0.overflow-hidden')
    const sparkles = sparkleContainer?.querySelectorAll('.bg-emerald-400')
    expect(sparkles?.length).toBe(2)
  })

  it('renders with max intensity (100)', () => {
    const { container } = render(
      <FlameOverlay intensity={100}>
        <div>Content</div>
      </FlameOverlay>
    )
    // Should have fire gradient and red particles
    expect(container.querySelector('.from-red-500\\/5')).toBeInTheDocument()
    expect(container.querySelector('.bg-red-500')).toBeInTheDocument()
  })

  it('has overflow hidden container', () => {
    const { container } = render(
      <FlameOverlay intensity={50}>
        <div>Content</div>
      </FlameOverlay>
    )
    expect(container.querySelector('.overflow-hidden')).toBeInTheDocument()
  })
})
