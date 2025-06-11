import { Link } from 'react-router-dom'

/**
 * @description: This is the AboutPage component.
 * @returns {JSX.Element}
 */
const AboutPage = () => {
  const features = [
    {
      title: 'Community-First',
      description: 'Unsere Plattform lebt von der aktiven Beteiligung der Community. Hier kannst du Events erstellen, teilen und an spannenden Veranstaltungen teilnehmen.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      title: 'Einfache Organisation',
      description: 'Erstelle und verwalte deine Events mit wenigen Klicks. Von der Planung bis zur Durchführung unterstützen wir dich bei jedem Schritt.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'Entdecke Neues',
      description: 'Finde interessante Events in deiner Nähe oder entdecke neue Communities. Mit unserer Suchfunktion und den Kategorien findest du schnell, was dich interessiert.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    }
  ]

  const team = [
    {
      name: 'Max Mustermann',
      role: 'Gründer & CEO',
      image: '/team/vicky-hladynets-C8Ta0gwPbQg-unsplash.jpg',
      bio: 'Leidenschaftlicher Event-Organisator mit über 10 Jahren Erfahrung in der Community-Bildung.'
    },
    {
      name: 'Anna Schmidt',
      role: 'Community Manager',
      image: '/team/christopher-campbell-rDEOVtE7vOs-unsplash.jpg',
      bio: 'Expertin für Community-Management und Event-Organisation mit Fokus auf nachhaltige Communities.'
    },
    {
      name: 'Tom Weber',
      role: 'Technischer Leiter',
      image: '/team/craig-mckay-jmURdhtm7Ng-unsplash.jpg',
      bio: 'Full-Stack Entwickler mit Erfahrung in der Entwicklung von Community-Plattformen.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">
              Über Event Planner
            </h1>
            <p className="text-xl mb-8">
              Wir verbinden Menschen durch Events und schaffen Raum für echte Begegnungen.
            </p>
            <Link
              to="/events"
              className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Events entdecken
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Was uns ausmacht
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-blue-600 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Unser Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <div
                  key={index}
                  className="text-center"
                >
                  <div className="w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600">
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Werde Teil unserer Community
            </h2>
            <p className="text-xl mb-8">
              Erstelle dein Profil und beginne, Events zu entdecken oder selbst zu organisieren.
            </p>
            <div className="space-x-4">
              <Link
                to="/register"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Jetzt registrieren
              </Link>
              <Link
                to="/events"
                className="inline-block bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Events entdecken
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage 