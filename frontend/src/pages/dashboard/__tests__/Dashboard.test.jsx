import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from '../Dashboard'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockEvents = {
  organized: [
    {
      _id: '1',
      title: 'Sommerfest 2024',
      description: 'Ein tolles Sommerfest',
      date: '2024-07-15T18:00:00.000Z',
      location: { name: 'Stadtpark' },
      category: 'Fest',
      status: 'published',
      imageUrl: '/test-image.jpg',
      participants: [],
      maxParticipants: 100
    }
  ],
  participating: [
    {
      _id: '2',
      title: 'Tech Workshop',
      description: 'Workshop zu modernen Webtechnologien',
      date: '2024-08-01T10:00:00.000Z',
      location: { name: 'Tech Hub' },
      category: 'Workshop',
      status: 'published',
      imageUrl: '/workshop.jpg',
      participants: ['user123'],
      maxParticipants: 20
    }
  ]
}

const mockUser = {
  _id: 'user123',
  firstName: 'Max',
  lastName: 'Mustermann',
  email: 'max@example.com'
}

const mockToken = 'mock-token-123'

vi.mock('../../../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    user: mockUser,
    logout: vi.fn()
  })
}))

const renderDashboard = () => {
  localStorage.setItem('token', mockToken)
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  )
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    localStorage.clear()
  })

  it('zeigt den Ladezustand an', async () => {
    global.fetch.mockImplementation(() => new Promise(() => {}))
    renderDashboard()
    
    await waitFor(() => {
      expect(screen.getByText('Lade Dashboard...')).toBeInTheDocument()
    })
  })

  it('zeigt Events korrekt an', async () => {
    global.fetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ events: mockEvents })
      })
    )

    renderDashboard()
    
    await waitFor(() => {
      expect(screen.getByText('Sommerfest 2024')).toBeInTheDocument()
      expect(screen.getByText('Tech Workshop')).toBeInTheDocument()
    })

    // Spezifischere Tests für die Übersicht
    const overviewSection = screen.getByText('Übersicht').closest('div')
    expect(overviewSection).toBeInTheDocument()
    
    // Prüfe die Gesamtanzahl der Events
    const totalEvents = overviewSection.querySelector('.text-blue-600')
    expect(totalEvents).toHaveTextContent('2')
    
    // Prüfe die kommenden Events
    const upcomingEvents = overviewSection.querySelector('.text-green-600')
    expect(upcomingEvents).toHaveTextContent('0')
    
    // Prüfe die vergangenen Events
    const pastEvents = overviewSection.querySelector('.text-gray-600')
    expect(pastEvents).toHaveTextContent('2')

    // Prüfe die Event-Details
    expect(screen.getByText('Stadtpark')).toBeInTheDocument()
    expect(screen.getByText('Tech Hub')).toBeInTheDocument()
    expect(screen.getByText('Fest')).toBeInTheDocument()
    expect(screen.getByText('Workshop')).toBeInTheDocument()
  })

  it('zeigt eine Fehlermeldung bei API-Fehlern', async () => {
    global.fetch.mockImplementation(() => 
      Promise.reject(new Error('Netzwerkfehler'))
    )

    renderDashboard()
    
    await waitFor(() => {
      const errorMessage = screen.getByText(/Fehler:/)
      expect(errorMessage).toHaveTextContent('Netzwerkfehler')
    })
  })

  it('zeigt leere Listen korrekt an', async () => {
    global.fetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ events: { organized: [], participating: [] } })
      })
    )

    renderDashboard()
    
    await waitFor(() => {
      expect(screen.getByText('Keine kommenden Veranstaltungen')).toBeInTheDocument()
      expect(screen.getByText('Keine vergangenen Veranstaltungen')).toBeInTheDocument()
    })
  })
}) 