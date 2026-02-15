import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { RoastThermometer } from '../components/Roast/RoastThermometer'

describe('RoastThermometer', () => {
  // Component logic: heat = 100 - score
  // HEAT_LEVELS ranges (based on heat value, not score):
  //   heat 0-20: ABSOLUTELY COOKED
  //   heat 21-40: Extra Crispy
  //   heat 41-60: Medium Well
  //   heat 61-80: Lightly Toasted
  //   heat 81-100: Barely Warm

  it('renders for low score (high heat)', () => {
    const { container } = render(<RoastThermometer score={15} />)
    // score 15 → heat 85 → Barely Warm
    expect(container.textContent).toContain('Barely Warm')
  })

  it('renders for medium-low score', () => {
    const { container } = render(<RoastThermometer score={30} />)
    // score 30 → heat 70 → Lightly Toasted
    expect(container.textContent).toContain('Lightly Toasted')
  })

  it('renders for medium score', () => {
    const { container } = render(<RoastThermometer score={50} />)
    // score 50 → heat 50 → Medium Well
    expect(container.textContent).toContain('Medium Well')
  })

  it('renders for medium-high score', () => {
    const { container } = render(<RoastThermometer score={70} />)
    // score 70 → heat 30 → Extra Crispy
    expect(container.textContent).toContain('Extra Crispy')
  })

  it('renders for high score (low heat)', () => {
    const { container } = render(<RoastThermometer score={90} />)
    // score 90 → heat 10 → ABSOLUTELY COOKED
    expect(container.textContent).toContain('ABSOLUTELY COOKED')
  })

  it('renders for score of 0', () => {
    const { container } = render(<RoastThermometer score={0} />)
    // score 0 → heat 100 → Barely Warm
    expect(container.textContent).toContain('Barely Warm')
  })

  it('renders for score of 100', () => {
    const { container } = render(<RoastThermometer score={100} />)
    // score 100 → heat 0 → ABSOLUTELY COOKED
    expect(container.textContent).toContain('ABSOLUTELY COOKED')
  })

  it('renders for boundary score 20', () => {
    const { container } = render(<RoastThermometer score={20} />)
    // score 20 → heat 80 → Lightly Toasted
    expect(container.textContent).toContain('Lightly Toasted')
  })

  it('renders for boundary score 40', () => {
    const { container } = render(<RoastThermometer score={40} />)
    // score 40 → heat 60 → Medium Well
    expect(container.textContent).toContain('Medium Well')
  })

  it('renders for boundary score 60', () => {
    const { container } = render(<RoastThermometer score={60} />)
    // score 60 → heat 40 → Extra Crispy
    expect(container.textContent).toContain('Extra Crispy')
  })

  it('renders for boundary score 80', () => {
    const { container } = render(<RoastThermometer score={80} />)
    // score 80 → heat 20 → ABSOLUTELY COOKED
    expect(container.textContent).toContain('ABSOLUTELY COOKED')
  })

  it('renders thermometer structure', () => {
    const { container } = render(<RoastThermometer score={50} />)
    expect(container.firstChild).not.toBeNull()
  })
})
