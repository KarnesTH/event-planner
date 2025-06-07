import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { user } = useAuth()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Nicht angemeldet')
        }

        const response = await fetch('http://localhost:5000/api/v1/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Fehler beim Laden der Benutzerdaten')
        }

        const data = await response.json()
        setUserData(data)
      } catch (err) {
        console.error('Fehler beim Laden der Daten:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ]
    return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const renderEvents = () => {
    if (!userData?.events) return null

    const { organized, participating } = userData.events
    const now = new Date()

    const upcomingEvents = [...organized, ...participating]
      .filter(event => new Date(event.date) > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    const pastEvents = [...organized, ...participating]
      .filter(event => new Date(event.date) <= now)
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Kommende Veranstaltungen</h3>
            <Link 
              to="/events/new" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Neue Veranstaltung
            </Link>
          </div>
          
          {upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map(event => (
                <div key={event._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-lg">{event.title}</h4>
                      <div className="text-sm text-gray-500 mt-1">
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center mt-1">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {event.location.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        event.status === 'published' 
                          ? 'bg-green-100 text-green-800'
                          : event.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {event.status === 'published' ? 'Veröffentlicht' : 
                         event.status === 'draft' ? 'Entwurf' : 
                         event.status === 'cancelled' ? 'Abgesagt' : 'Abgeschlossen'}
                      </span>
                      <div className="text-sm text-gray-500 mt-2">
                        {organized.some(e => e._id === event._id) ? 'Organisator' : 'Teilnehmer'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Link 
                      to={`/events/${event._id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Details
                    </Link>
                    {organized.some(e => e._id === event._id) && (
                      <Link 
                        to={`/events/${event._id}/edit`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Bearbeiten
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Keine kommenden Veranstaltungen
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Vergangene Veranstaltungen</h3>
          {pastEvents.length > 0 ? (
            <div className="space-y-4">
              {pastEvents.map(event => (
                <div key={event._id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-lg">{event.title}</h4>
                      <div className="text-sm text-gray-500 mt-1">
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(event.date)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                        Abgeschlossen
                      </span>
                      <div className="text-sm text-gray-500 mt-2">
                        {organized.some(e => e._id === event._id) ? 'Organisator' : 'Teilnehmer'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Keine vergangenen Veranstaltungen
            </p>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Fehler beim Laden</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <Link 
              to="/profile" 
              className="text-blue-600 hover:text-blue-800"
            >
              Zum Profil
            </Link>
          </div>
          {renderEvents()}
        </div>
      </div>
    </div>
  )
}

export default Dashboard 