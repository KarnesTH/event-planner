import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EventDetail from '../EventDetail';

const mockEvent = {
  _id: 1,
  title: "Sommerfestival 2024",
  description: "Das größte Sommerfestival in Berlin! Genieße Live-Musik, Street Food und eine unvergessliche Atmosphäre im Herzen der Stadt.",
  date: "2024-06-15T14:00:00",
  endDate: "2024-06-15T23:00:00",
  location: {
    name: "Stadtpark Berlin",
    address: { street: "Großer Tiergarten", city: "Berlin", postalCode: "10785", country: "Deutschland" },
    coordinates: { lat: 52.5145, lng: 13.3501 }
  },
  category: "Festival",
  imageUrl: "/placeholder-event.jpg",
  organizer: { _id: 1, firstName: "Max", lastName: "Mustermann", avatar: "/placeholder-avatar.jpg" },
  participants: [],
  maxParticipants: 5000,
  tags: ["Musik", "Festival", "Sommer", "Outdoor"],
  status: "published",
  isPublic: true
};

const renderEventDetail = (event = mockEvent) => {
  return render(
    <BrowserRouter>
      <EventDetail event={event} />
    </BrowserRouter>
  );
};

describe("EventDetail", () => {
  it("rendert alle Event-Details korrekt", () => {
    renderEventDetail();
    expect(screen.getByText("Sommerfestival 2024")).toBeInTheDocument();
    expect(screen.getByText("Das größte Sommerfestival in Berlin! Genieße Live-Musik, Street Food und eine unvergessliche Atmosphäre im Herzen der Stadt.")).toBeInTheDocument();
    expect(screen.getByText("Festival")).toBeInTheDocument();
    expect(screen.getByText("Stadtpark Berlin")).toBeInTheDocument();
    expect(screen.getByText("0/5000 Teilnehmer")).toBeInTheDocument();
    expect(screen.getByText("Max Mustermann")).toBeInTheDocument();
    expect(screen.getByText("#Musik")).toBeInTheDocument();
    expect(screen.getByText("#Festival")).toBeInTheDocument();
    expect(screen.getByText("#Sommer")).toBeInTheDocument();
    expect(screen.getByText("#Outdoor")).toBeInTheDocument();
  });

  it("zeigt das Beispiel-Event an, wenn kein Event übergeben wird", () => {
    renderEventDetail(undefined);
    expect(screen.getByText("Sommerfestival 2024")).toBeInTheDocument();
  });

  it("interagiert korrekt mit den Teilnehmen- und Merklisten-Buttons", () => {
    renderEventDetail();
    const teilnehmenButton = screen.getByRole("button", { name: "Jetzt teilnehmen" });
    expect(teilnehmenButton).toBeInTheDocument();
    fireEvent.click(teilnehmenButton);
    expect(screen.getByRole("button", { name: "Teilnahme stornieren" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Teilnahme stornieren" }));
    expect(screen.getByRole("button", { name: "Jetzt teilnehmen" })).toBeInTheDocument();

    const merkenButton = screen.getByRole("button", { name: "Auf Merkliste setzen" });
    expect(merkenButton).toBeInTheDocument();
    fireEvent.click(merkenButton);
    expect(screen.getByRole("button", { name: "Aus Merkliste entfernen" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Aus Merkliste entfernen" }));
    expect(screen.getByRole("button", { name: "Auf Merkliste setzen" })).toBeInTheDocument();
  });

  it("zeigt einen Link zum Veranstalter an", () => {
    renderEventDetail();
    const veranstalterLink = screen.getByRole("link", { name: /Max Mustermann.*Veranstalter/i });
    expect(veranstalterLink).toBeInTheDocument();
    expect(veranstalterLink).toHaveAttribute("href", "/user/1");
  });
}); 