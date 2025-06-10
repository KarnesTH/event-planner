import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi, describe, it, beforeEach, expect } from 'vitest'
import Home from '../Home'

const mockUseEvents = vi.fn()
vi.mock('../../../hooks/useEvents', () => ({
  __esModule: true,
  default: (...args) => mockUseEvents(...args)
}))

vi.mock('../../../components/eventlist/EventList', () => ({
  __esModule: true,
  default: vi.fn(({ events, loading, error }) => (
    <div data-testid="event-list">
      {loading && <div data-testid="loading">Lade Events...</div>}
      {error && <div data-testid="error">{error}</div>}
      {events?.length > 0 ? (
        <div data-testid="events-list">
          {events.map((event, index) => (
            <div key={index} data-testid={`event-${index}`}>
              {event.title}
            </div>
          ))}
        </div>
      ) : (
        <div data-testid="no-events">Keine Events gefunden</div>
      )}
    </div>
  ))
}))

vi.mock('../../../components/locationpermission/LocationPermission', () => ({
  __esModule: true,
  default: vi.fn(({ onPermissionGranted }) => (
    <div data-testid="location-permission">
      <button 
        onClick={() => onPermissionGranted({ 
          latitude: 51.1657, 
          longitude: 10.4515 
        })}
        data-testid="location-button"
      >
        Standortzugriff erlauben
      </button>
    </div>
  ))
}))

vi.mock('../../../components/hero/Hero', () => ({
  __esModule: true,
  default: vi.fn(({ filters, onFilterChange }) => (
    <div data-testid="hero">
      <input
        data-testid="search-input"
        value={filters.search}
        onChange={(e) => onFilterChange({ search: e.target.value })}
      />
      <div>Entdecke deine nächste Veranstaltung</div>
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
    mockUseEvents.mockReturnValue({
      events: [],
      loading: false,
      error: null,
      filters: { search: '', category: '' },
      updateFilters: vi.fn(),
      setLocation: vi.fn()
    })
  })

  it('rendert die Hero-Komponente mit Suchfunktion', async () => {
    const updateFilters = vi.fn()
    mockUseEvents.mockReturnValue({
      events: [],
      loading: false,
      error: null,
      filters: { search: '', category: '' },
      updateFilters,
      setLocation: vi.fn()
    })

    renderWithRouter(<Home />)
    
    const searchInput = screen.getByTestId('search-input')
    fireEvent.change(searchInput, { target: { value: 'Test Event' } })
    await vi.waitFor(() => {
      expect(updateFilters).toHaveBeenCalledWith({ search: 'Test Event' })
    })
  })

  it('zeigt die LocationPermission-Komponente initial an', () => {
    renderWithRouter(<Home />)
    expect(screen.getByTestId('location-permission')).toBeInTheDocument()
    expect(screen.getByTestId('location-button')).toBeInTheDocument()
    expect(screen.queryByTestId('event-list')).not.toBeInTheDocument()
  })

  it('zeigt Events nach Standortberechtigung an', async () => {
    const setLocation = vi.fn()
    mockUseEvents.mockReturnValue({
      events: [{ title: 'Test Event' }],
      loading: false,
      error: null,
      filters: { search: '', category: '' },
      updateFilters: vi.fn(),
      setLocation
    })

    renderWithRouter(<Home />)
    
    fireEvent.click(screen.getByTestId('location-button'))
    await vi.waitFor(() => {
      expect(setLocation).toHaveBeenCalledWith({
        latitude: 51.1657,
        longitude: 10.4515
      })
      expect(screen.getByTestId('event-list')).toBeInTheDocument()
      expect(screen.queryByTestId('location-permission')).not.toBeInTheDocument()
    })
  })

  it('behandelt Fehler beim Laden der Events', async () => {
    mockUseEvents.mockReturnValue({
      events: [],
      loading: false,
      error: 'Fehler beim Laden der Events',
      filters: { search: '', category: '' },
      updateFilters: vi.fn(),
      setLocation: vi.fn()
    })

    renderWithRouter(<Home />)
    
    fireEvent.click(screen.getByTestId('location-button'))
    await vi.waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Fehler beim Laden der Events')
    })
  })

  it('zeigt Ladezustand während des Events-Ladens', async () => {
    mockUseEvents.mockReturnValue({
      events: [],
      loading: true,
      error: null,
      filters: { search: '', category: '' },
      updateFilters: vi.fn(),
      setLocation: vi.fn()
    })

    renderWithRouter(<Home />)
    
    fireEvent.click(screen.getByTestId('location-button'))
    await vi.waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Lade Events...')
    })
  })
})