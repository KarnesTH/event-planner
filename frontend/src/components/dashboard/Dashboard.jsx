import { useState } from 'react'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('tickets')

  // Beispiel-Daten für das Dashboard
  const userData = {
    name: "Max Mustermann",
    email: "max@example.com",
    avatar: "/placeholder-avatar.jpg",
    upcomingEvents: [
      {
        id: 1,
        title: "Sommerfestival 2024",
        date: "15. Juni 2024",
        location: "Stadtpark Berlin",
        ticketType: "VIP-Ticket",
        ticketId: "TICK-123456",
        status: "bestätigt"
      },
      {
        id: 2,
        title: "Tech Workshop",
        date: "20. Juni 2024",
        location: "Coworking Space München",
        ticketType: "Standard-Ticket",
        ticketId: "TICK-789012",
        status: "bestätigt"
      }
    ],
    savedEvents: [
      {
        id: 3,
        title: "Networking Dinner",
        date: "25. Juni 2024",
        location: "Restaurant Hamburg",
        price: "€35"
      }
    ],
    pastEvents: [
      {
        id: 4,
        title: "Winterfest 2023",
        date: "15. Dezember 2023",
        location: "Stadtmitte Berlin",
        ticketType: "Standard-Ticket",
        ticketId: "TICK-345678",
        status: "abgeschlossen"
      }
    ]
  }

  const renderTickets = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Kommende Veranstaltungen</h3>
        <div className="space-y-4">
          {userData.upcomingEvents.map(event => (
            <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-lg">{event.title}</h4>
                  <div className="text-sm text-gray-500 mt-1">
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {event.date}
                    </div>
                    <div className="flex items-center mt-1">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {event.status}
                  </span>
                  <div className="text-sm text-gray-500 mt-2">
                    {event.ticketType}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {event.ticketId}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  Ticket anzeigen
                </button>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Vergangene Veranstaltungen</h3>
        <div className="space-y-4">
          {userData.pastEvents.map(event => (
            <div key={event.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-lg">{event.title}</h4>
                  <div className="text-sm text-gray-500 mt-1">
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {event.date}
                    </div>
                  </div>
                </div>
                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                  {event.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSavedEvents = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Gespeicherte Veranstaltungen</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userData.savedEvents.map(event => (
          <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
            <h4 className="font-medium">{event.title}</h4>
            <div className="text-sm text-gray-500 mt-2">
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {event.date}
              </div>
              <div className="flex items-center mt-1">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {event.location}
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-blue-600 font-medium">{event.price}</span>
              <button className="text-sm text-blue-600 hover:text-blue-800">
                Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderProfile = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-4 mb-6">
        <img
          src={userData.avatar}
          alt={userData.name}
          className="w-20 h-20 rounded-full"
        />
        <div>
          <h3 className="text-xl font-semibold">{userData.name}</h3>
          <p className="text-gray-500">{userData.email}</p>
        </div>
      </div>

      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Vorname
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            defaultValue={userData.name.split(' ')[0]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nachname
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            defaultValue={userData.name.split(' ')[1]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            E-Mail-Adresse
          </label>
          <input
            type="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            defaultValue={userData.email}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Passwort ändern
          </label>
          <input
            type="password"
            placeholder="Neues Passwort"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Änderungen speichern
          </button>
        </div>
      </form>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('tickets')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'tickets'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Meine Tickets
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'saved'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Merkliste
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'profile'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Profil
                </button>
              </nav>
            </div>
          </div>

          <div className="mt-6">
            {activeTab === 'tickets' && renderTickets()}
            {activeTab === 'saved' && renderSavedEvents()}
            {activeTab === 'profile' && renderProfile()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 