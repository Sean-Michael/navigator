import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the Navigator brand', () => {
    render(<App />)
    expect(screen.getByText('Navigator')).toBeInTheDocument()
  })

  it('renders the three top-level tabs', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /Overview/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Inbox/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Projects/ })).toBeInTheDocument()
  })

  it('shows the portfolio on the overview tab by default', () => {
    render(<App />)
    expect(screen.getByText('Portfolio')).toBeInTheDocument()
    // a mock project appears as a portfolio tile heading
    expect(screen.getByRole('heading', { name: 'spincd' })).toBeInTheDocument()
  })

  it('switches to the Inbox tab and renders the attention queue', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Inbox/ }))
    expect(screen.getByRole('heading', { name: 'Inbox' })).toBeInTheDocument()
    expect(screen.getByText('Needs attention')).toBeInTheDocument()
    expect(screen.getByText('Ready to delegate')).toBeInTheDocument()
  })

  it('switches to the Projects tab and renders the portal subnav', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Projects/ }))
    expect(screen.getByRole('button', { name: /CI \/ CD/ })).toBeInTheDocument()
  })

  it('opens the command palette with Cmd+K', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.keyboard('{Meta>}k{/Meta}')
    const palette = screen.getByPlaceholderText(/Describe a task, jump to a project/)
    expect(palette).toBeInTheDocument()
    // delegating a task opens the enriched preview modal
    await user.type(palette, 'add label filtering to search')
    await user.keyboard('{Enter}')
    expect(within(screen.getByRole('heading', { name: 'Delegate task' })).queryByText('Delegate task')).toBeTruthy()
  })
})
