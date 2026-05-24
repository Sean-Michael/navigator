import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

function mockFetch(impl: typeof fetch) {
  vi.stubGlobal('fetch', vi.fn(impl))
}

describe('App', () => {
  it('renders the app title', () => {
    mockFetch(async () => new Response('{}', { status: 200 }))
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Navigator' })).toBeInTheDocument()
  })

  it('shows "checking…" before the health response resolves', () => {
    mockFetch(() => new Promise(() => {})) // never resolves
    render(<App />)
    expect(screen.getByText(/checking/)).toBeInTheDocument()
  })

  it('shows the backend status when the health check succeeds', async () => {
    mockFetch(
      async () =>
        new Response(JSON.stringify({ status: 'ok' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    )
    render(<App />)
    await waitFor(() =>
      expect(screen.getByText('Backend API: ok')).toBeInTheDocument(),
    )
  })

  it('calls the health endpoint', async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ status: 'ok' }), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/health'))
  })

  it('shows "unreachable" when the request fails', async () => {
    mockFetch(async () => {
      throw new Error('network down')
    })
    render(<App />)
    await waitFor(() =>
      expect(screen.getByText('Backend API: unreachable')).toBeInTheDocument(),
    )
  })
})
