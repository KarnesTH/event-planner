import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import EventList from '../EventList'

const mockEvents = [
  {
    _id: '1',
    title: 'Test Event 1',
    description: 'Test Description 1',
    date: '2024-03-20T10:00:00Z',
    location: { name: 'Test Location' },
    category: 'Workshop'
  },
  {
    _id: '2',
    title: 'Test Event 2',
    description: 'Test Description 2',
    date: '2024-03-21T15:00:00Z',
    location: { name: 'Andere Location' },
    category: 'Konzert'
  }
]

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('EventList', () => {
  it('zeigt einen Ladezustand an', () => {
    renderWithRouter(<EventList loading={true} />)
    expect(screen.getByText('Lade Events...')).toBeInTheDocument()
  })

  it('zeigt Events an', () => {
    renderWithRouter(<EventList events={mockEvents} />)
    expect(screen.getByText('Test Event 1')).toBeInTheDocument()
    expect(screen.getByText('Test Event 2')).toBeInTheDocument()
  })

  it('zeigt eine Meldung an, wenn keine Events vorhanden sind', () => {
    renderWithRouter(<EventList events={[]} />)
    expect(screen.getByText('Keine Events gefunden')).toBeInTheDocument()
  })

  it('zeigt eine Fehlermeldung an', () => {
    renderWithRouter(<EventList error="Fehler beim Laden der Events" />)
    expect(screen.getByText('Fehler beim Laden der Events')).toBeInTheDocument()
  })

  it('zeigt eine Standortfehlermeldung an', () => {
    renderWithRouter(<EventList locationError="Standort konnte nicht ermittelt werden." />)
    expect(screen.getByText('Standort konnte nicht ermittelt werden.')).toBeInTheDocument()
  })
}) 