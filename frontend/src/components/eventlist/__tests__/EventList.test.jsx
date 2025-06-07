import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import EventList from '../EventList'
import { AuthProvider } from '../../../context/AuthContext'

const mockEvents = [
  {
    _id: '1',
    title: 'Test Event 1',
    description: 'Test Description 1',
    date: new Date().toISOString(),
    endDate: new Date(Date.now() + 3600000).toISOString(),
    location: {
      name: 'Test Location',
      coordinates: {
        type: 'Point',
        coordinates: [8.3403, 51.6775]
      }
    },
    category: 'Workshop',
    status: 'published'
  },
  {
    _id: '2',
    title: 'Test Event 2',
    description: 'Test Description 2',
    date: new Date(Date.now() + 86400000).toISOString(),
    endDate: new Date(Date.now() + 90000000).toISOString(),
    location: {
      name: 'Andere Location',
      coordinates: {
        type: 'Point',
        coordinates: [8.3403, 51.6775]
      }
    },
    category: 'Konzert',
    status: 'published'
  }
]

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('EventList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('zeigt einen Ladezustand an, während Events geladen werden', () => {
    global.fetch.mockImplementation(() => new Promise(() => {}))
    renderWithProviders(<EventList />)
    
    expect(screen.getByText('Lade Events...')).toBeInTheDocument()
  })

  it('zeigt eine Liste von Events an', async () => {
    global.fetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEvents)
      })
    )

    renderWithProviders(<EventList />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument()
      expect(screen.getByText('Test Event 2')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Workshop')).toBeInTheDocument()
    expect(screen.getByText('Konzert')).toBeInTheDocument()
    expect(screen.getByText('Test Location')).toBeInTheDocument()
    expect(screen.getByText('Andere Location')).toBeInTheDocument()
  })

  it('zeigt eine Meldung an, wenn keine Events gefunden wurden', async () => {
    global.fetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    )

    renderWithProviders(<EventList />)
    
    await waitFor(() => {
      expect(screen.getByText('Keine Events gefunden')).toBeInTheDocument()
    })
  })

  it('zeigt eine Fehlermeldung an, wenn das Laden fehlschlägt', async () => {
    global.fetch.mockImplementation(() => 
      Promise.reject(new Error('Netzwerkfehler'))
    )

    renderWithProviders(<EventList />)
    
    await waitFor(() => {
      expect(screen.getByText('Fehler beim Laden der Events')).toBeInTheDocument()
    })
  })

  describe('Events in der Nähe', () => {
    beforeEach(() => {
      const mockGeolocation = {
        getCurrentPosition: vi.fn()
          .mockImplementation((success) => 
            success({
              coords: {
                latitude: 51.6775,
                longitude: 8.3403
              }
            })
          )
      }
      global.navigator.geolocation = mockGeolocation
    })

    it('zeigt Events in der Nähe an, wenn showNearbyEvents true ist', async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockEvents)
        })
      )

      renderWithProviders(<EventList showNearbyEvents={true} />)
      
      await waitFor(() => {
        expect(screen.getByText('Test Event 1')).toBeInTheDocument()
        expect(screen.getByText('Test Event 2')).toBeInTheDocument()
      })
    })

    it('zeigt eine Fehlermeldung an, wenn die Standortabfrage fehlschlägt', async () => {
      global.navigator.geolocation.getCurrentPosition = vi.fn()
        .mockImplementation((_, error) => 
          error({
            code: 1,
            message: 'Geolocation permission denied'
          })
        )

      renderWithProviders(<EventList showNearbyEvents={true} />)
      
      await waitFor(() => {
        expect(screen.getByText('Standort konnte nicht ermittelt werden.')).toBeInTheDocument()
      })
    })
  })
}) 