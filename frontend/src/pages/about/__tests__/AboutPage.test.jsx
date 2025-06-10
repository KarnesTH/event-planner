import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import AboutPage from '../AboutPage'

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('AboutPage', () => {
  it('rendert die Hauptsektionen korrekt', () => {
    renderWithRouter(<AboutPage />)

    expect(screen.getByText('Über Event Planner')).toBeInTheDocument()
    expect(screen.getByText('Wir verbinden Menschen durch Events und schaffen Raum für echte Begegnungen.')).toBeInTheDocument()
    
    const eventsLinks = screen.getAllByRole('link', { name: 'Events entdecken' })
    const heroEventsLink = eventsLinks.find(link => 
      link.className.includes('text-blue-600')
    )
    expect(heroEventsLink).toBeInTheDocument()

    expect(screen.getByText('Was uns ausmacht')).toBeInTheDocument()
    expect(screen.getByText('Community-First')).toBeInTheDocument()
    expect(screen.getByText('Einfache Organisation')).toBeInTheDocument()
    expect(screen.getByText('Entdecke Neues')).toBeInTheDocument()

    expect(screen.getByText('Unser Team')).toBeInTheDocument()
    expect(screen.getByText('Max Mustermann')).toBeInTheDocument()
    expect(screen.getByText('Anna Schmidt')).toBeInTheDocument()
    expect(screen.getByText('Tom Weber')).toBeInTheDocument()

    expect(screen.getByText('Werde Teil unserer Community')).toBeInTheDocument()
    expect(screen.getByText('Jetzt registrieren')).toBeInTheDocument()
  })

  it('enthält alle Feature-Beschreibungen', () => {
    renderWithRouter(<AboutPage />)

    const featureDescriptions = [
      'Unsere Plattform lebt von der aktiven Beteiligung der Community. Hier kannst du Events erstellen, teilen und an spannenden Veranstaltungen teilnehmen.',
      'Erstelle und verwalte deine Events mit wenigen Klicks. Von der Planung bis zur Durchführung unterstützen wir dich bei jedem Schritt.',
      'Finde interessante Events in deiner Nähe oder entdecke neue Communities. Mit unserer Suchfunktion und den Kategorien findest du schnell, was dich interessiert.'
    ]

    featureDescriptions.forEach(description => {
      expect(screen.getByText(description)).toBeInTheDocument()
    })
  })

  it('zeigt Team-Rollen korrekt an', () => {
    renderWithRouter(<AboutPage />)

    const teamRoles = [
      'Gründer & CEO',
      'Community Manager',
      'Technischer Leiter'
    ]

    teamRoles.forEach(role => {
      expect(screen.getByText(role)).toBeInTheDocument()
    })
  })

  it('enthält korrekte Links', () => {
    renderWithRouter(<AboutPage />)

    // Test für beide "Events entdecken" Links
    const eventsLinks = screen.getAllByRole('link', { name: 'Events entdecken' })
    expect(eventsLinks).toHaveLength(2)
    eventsLinks.forEach(link => {
      expect(link).toHaveAttribute('href', '/events')
    })

    const registerLink = screen.getByRole('link', { name: 'Jetzt registrieren' })
    expect(registerLink).toHaveAttribute('href', '/register')
  })
}) 