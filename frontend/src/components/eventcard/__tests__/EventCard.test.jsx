import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EventCard from '../EventCard';

describe('EventCard', () => {
  const mockEvent = {
    _id: 1,
    title: 'Test Event',
    description: 'Eine Testveranstaltung',
    date: '2024-06-15T14:00:00',
    location: {
      name: 'Test Location',
      address: {
        city: 'Berlin',
        country: 'Deutschland'
      }
    },
    category: 'Workshop',
    imageUrl: '/test-image.jpg',
    organizer: {
      _id: 1,
      firstName: 'Max',
      lastName: 'Mustermann'
    },
    participants: [],
    maxParticipants: 50,
    status: 'published'
  };

  const mockUserId = 2;
  const mockOnParticipate = vi.fn();

  const renderEventCard = (props = {}) => {
    const Wrapper = ({ children }) => (
      <BrowserRouter>
        {children}
      </BrowserRouter>
    );

    return render(
      <EventCard 
        event={props.event || mockEvent}
        currentUserId={props.currentUserId || mockUserId}
        onParticipate={props.onParticipate || mockOnParticipate}
        {...props}
      />,
      { wrapper: Wrapper }
    );
  };

  it('rendert Event-Informationen korrekt', () => {
    renderEventCard();
    
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Workshop')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('0/50 Teilnehmer')).toBeInTheDocument();
    expect(screen.getByText('15. Juni 2024')).toBeInTheDocument();
    expect(screen.getByText('Veröffentlicht')).toBeInTheDocument();
  });

  it('zeigt Link zum Event-Detail', () => {
    renderEventCard();
    const eventLinks = screen.getAllByRole('link', { name: /Test Event|Details anzeigen/i });
    eventLinks.forEach(link => {
      expect(link).toHaveAttribute('href', '/events/1');
    });
  });

  it('zeigt Teilnehmen-Button für veröffentlichte Events', () => {
    renderEventCard();
    const participateButton = screen.getByRole('button', { name: /Teilnehmen/i });
    expect(participateButton).toBeInTheDocument();
    expect(participateButton).not.toBeDisabled();
  });

  it('deaktiviert Teilnehmen-Button für eigene Events', () => {
    const ownEvent = {
      ...mockEvent,
      organizer: { ...mockEvent.organizer, _id: mockUserId }
    };
    
    renderEventCard({ event: ownEvent });
    
    const button = screen.getByRole('button', { name: /Teilnehmen/i });
    expect(button).toHaveAttribute('data-organizer-id', String(mockUserId));
    expect(button).toHaveAttribute('data-user-id', String(mockUserId));
    expect(button).toBeDisabled();
  });

  it('ruft onParticipate mit korrekten Parametern auf', async () => {
    const onParticipate = vi.fn().mockResolvedValue(undefined);
    renderEventCard({ onParticipate });
    
    const button = screen.getByRole('button', { name: /Teilnehmen/i });
    
    await act(async () => {
      await fireEvent.click(button);
    });
    
    expect(onParticipate).toHaveBeenCalledWith(mockEvent._id, true);
    expect(button).toHaveTextContent('Abmelden');
  });

  it('zeigt korrekten Status für ausgebuchte Events', () => {
    const fullEvent = {
      ...mockEvent,
      participants: Array(50).fill({ _id: 'participant' }),
      maxParticipants: 50
    };
    renderEventCard({ event: fullEvent });
    expect(screen.getByText('50/50 Teilnehmer')).toBeInTheDocument();
  });

  it('zeigt korrekten Status für abgesagte Events', () => {
    const canceledEvent = {
      ...mockEvent,
      status: 'canceled'
    };
    renderEventCard({ event: canceledEvent });
    expect(screen.getByText('Abgesagt')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Teilnehmen/i })).not.toBeInTheDocument();
  });

  it('zeigt korrekten Status für abgeschlossene Events', () => {
    const completedEvent = {
      ...mockEvent,
      status: 'completed'
    };
    renderEventCard({ event: completedEvent });
    expect(screen.getByText('Abgeschlossen')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Teilnehmen/i })).not.toBeInTheDocument();
  });
}); 