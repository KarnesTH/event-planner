import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../src/context/AuthContext';
import EventsPage from '../EventsPage';

describe('EventsPage', () => {
  const mockEvents = [
    {
      _id: 1,
      title: 'Workshop A',
      description: 'Ein Workshop',
      date: '2024-06-15T14:00:00',
      location: { name: 'Berlin' },
      category: 'Workshop',
      status: 'published'
    },
    {
      _id: 2,
      title: 'Konzert B',
      description: 'Ein Konzert',
      date: '2024-07-20T19:00:00',
      location: { name: 'Hamburg' },
      category: 'Konzert',
      status: 'published'
    }
  ];

  const mockFetchEvents = vi.fn();
  const mockFetchNearbyEvents = vi.fn();

  beforeEach(() => {
    mockFetchEvents.mockReset();
    mockFetchNearbyEvents.mockReset();
    
    mockFetchEvents.mockImplementation(async ({ searchTerm, category }) => {
      let filteredEvents = [...mockEvents];
      
      if (searchTerm) {
        filteredEvents = filteredEvents.filter(event => 
          event.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (category) {
        filteredEvents = filteredEvents.filter(event => 
          event.category === category
        );
      }
      
      return filteredEvents;
    });

    mockFetchNearbyEvents.mockImplementation(async ({ searchTerm, category }) => {
      let filteredEvents = [mockEvents[0]]; // Nur das erste Event als "in der Nähe"
      
      if (searchTerm) {
        filteredEvents = filteredEvents.filter(event => 
          event.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (category) {
        filteredEvents = filteredEvents.filter(event => 
          event.category === category
        );
      }
      
      return filteredEvents;
    });
  });

  const mockAuthContext = {
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn()
  };

  const renderEventsPage = (props = {}) => {
    return render(
      <BrowserRouter>
        <AuthProvider value={mockAuthContext}>
          <EventsPage 
            fetchEvents={mockFetchEvents}
            fetchNearbyEvents={mockFetchNearbyEvents}
            {...props}
          />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  const waitForLoadingToFinish = async () => {
    await waitFor(() => {
      expect(screen.queryByText('Lade Events...')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  };

  it('lädt und zeigt Events an', async () => {
    renderEventsPage();
    
    await waitFor(() => {
      expect(mockFetchEvents).toHaveBeenCalledWith({ searchTerm: '', category: '' });
    });
    
    await waitFor(() => {
      expect(screen.getByText('Workshop A')).toBeInTheDocument();
      expect(screen.getByText('Konzert B')).toBeInTheDocument();
    });
  });

  it('zeigt Ladezustand während des Fetches', () => {
    mockFetchEvents.mockImplementation(() => new Promise(() => {}));
    renderEventsPage();
    expect(screen.getByText('Lade Events...')).toBeInTheDocument();
  });

  it('zeigt Fehlermeldung bei fehlgeschlagenem Fetch', async () => {
    mockFetchEvents.mockRejectedValueOnce(new Error('Fetch failed'));
    renderEventsPage();
    
    await waitFor(() => {
      expect(screen.getByText('Fehler beim Laden der Events')).toBeInTheDocument();
    });
  });

  it('filtert Events nach Kategorie', async () => {
    renderEventsPage();
    
    await waitFor(() => {
      expect(screen.getByText('Workshop A')).toBeInTheDocument();
    });

    const categorySelect = screen.getByRole('combobox', { name: 'Kategorie' });
    fireEvent.change(categorySelect, { target: { value: 'Workshop' } });
    
    await waitFor(() => {
      expect(mockFetchEvents).toHaveBeenCalledWith({ searchTerm: '', category: 'Workshop' });
    });

    await waitFor(() => {
      expect(screen.getByText('Workshop A')).toBeInTheDocument();
      expect(screen.queryByText('Konzert B')).not.toBeInTheDocument();
    });
  });

  it('sucht Events nach Titel', async () => {
    renderEventsPage();
    
    await waitFor(() => {
      expect(screen.getByText('Workshop A')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Nach Events suchen...');
    fireEvent.change(searchInput, { target: { value: 'Workshop' } });
    
    await waitFor(() => {
      expect(mockFetchEvents).toHaveBeenCalledWith({ searchTerm: 'Workshop', category: '' });
    });

    await waitFor(() => {
      expect(screen.getByText('Workshop A')).toBeInTheDocument();
      expect(screen.queryByText('Konzert B')).not.toBeInTheDocument();
    });
  });

  it('lädt Events in der Nähe', async () => {
    renderEventsPage();
    
    await waitFor(() => {
      expect(screen.getByText('Workshop A')).toBeInTheDocument();
    });

    const nearbyButton = screen.getByText('Events in der Nähe');
    fireEvent.click(nearbyButton);
    
    await waitFor(() => {
      expect(mockFetchNearbyEvents).toHaveBeenCalledWith({ searchTerm: '', category: '' });
    });

    await waitFor(() => {
      expect(screen.getByText('Workshop A')).toBeInTheDocument();
      expect(screen.queryByText('Konzert B')).not.toBeInTheDocument();
    });
  });

  it('zeigt "Keine Events gefunden" bei leerer Liste', async () => {
    mockFetchEvents.mockResolvedValueOnce([]);
    renderEventsPage();
    
    await waitFor(() => {
      expect(screen.getByText('Keine Events gefunden')).toBeInTheDocument();
    });
  });
}); 