import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock react-dom/client before importing main
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
  })),
}))

describe('main', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Create root element
    document.body.innerHTML = '<div id="root"></div>'
  })

  it('renders the app', async () => {
    const { createRoot } = await import('react-dom/client')

    // Import main.tsx to trigger the render
    await import('../main')

    expect(createRoot).toHaveBeenCalled()
    const rootElement = document.getElementById('root')
    expect(rootElement).not.toBeNull()
  })
})
