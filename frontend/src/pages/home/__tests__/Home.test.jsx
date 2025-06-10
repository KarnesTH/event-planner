import { render, screen, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi, describe, it, beforeEach, expect } from 'vitest'
import Home from '../Home'

vi.mock('../../../components/eventlist/EventList', () => ({
  default: vi.fn(({ showNearbyEvents }) => (
    <div data-testid="event-list">
      {showNearbyEvents ? (
        <div data-testid="nearby-events">Events in der Nähe</div>
      ) : (
        <div data-testid="all-events">Alle Events</div>
      )}
    </div>
  ))
}))

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rendert die Hero-Komponente', () => {
    renderWithRouter(<Home />)
    
    expect(screen.getByText('Entdecke deine nächste')).toBeInTheDocument()
    expect(screen.getByText('Veranstaltung')).toBeInTheDocument()
    expect(screen.getByText(/Finde und organisiere die besten Events/)).toBeInTheDocument()
    
    const categoryLinks = screen.getAllByRole('link', { name: /Konzerte|Workshops|Networking/ })
    expect(categoryLinks).toHaveLength(3)
  })

  it('wechselt zwischen allen Events und Events in der Nähe', async () => {
    renderWithRouter(<Home />)
    
    expect(screen.getByTestId('all-events')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Events in meiner Nähe' })).toBeInTheDocument()
    
    const toggleButton = screen.getByRole('button', { name: 'Events in meiner Nähe' })
    await act(async () => {
      toggleButton.click()
    })
    
    expect(screen.getByTestId('nearby-events')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Alle Events anzeigen' })).toBeInTheDocument()
    
    const backButton = screen.getByRole('button', { name: 'Alle Events anzeigen' })
    await act(async () => {
      backButton.click()
    })
    
    expect(screen.getByTestId('all-events')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Events in meiner Nähe' })).toBeInTheDocument()
  })
})