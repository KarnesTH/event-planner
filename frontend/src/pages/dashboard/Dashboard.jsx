import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import EventCard from '../../components/eventcard/EventCard'

/**
 * @description: This is the Dashboard component.
 * @returns {JSX.Element}
 */
const Dashboard = () => {
  const { user } = useAuth()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) { throw new Error('Nicht angemeldet') }
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

  const renderOverview = () => {
    if (!userData?.events) return null
    const { organized, participating } = userData.events
    const totalEvents = organized.length + participating.length
    const now = new Date()
    const upcomingEvents = [...organized, ...participating].filter(event => new Date(event.date) > now).length
    const pastEvents = totalEvents - upcomingEvents

    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Übersicht</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800">Gesamt Events</h4>
            <p className="text-2xl font-bold text-blue-600">{totalEvents}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800">Kommende Events</h4>
            <p className="text-2xl font-bold text-green-600">{upcomingEvents}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800">Vergangene Events</h4>
            <p className="text-2xl font-bold text-gray-600">{pastEvents}</p>
          </div>
        </div>
      </div>
    )
  }

  const renderEventSection = (events, title, emptyMessage) => (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <EventCard 
              key={event._id} 
              event={event}
              currentUserId={user?._id}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">{emptyMessage}</p>
      )}
    </div>
  )

  const renderEvents = () => {
    if (!userData?.events) return null

    const { organized, participating } = userData.events
    const now = new Date()
    const allEvents = [...organized, ...participating]
    
    const upcomingEvents = allEvents
      .filter(event => new Date(event.date) > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
    
    const pastEvents = allEvents
      .filter(event => new Date(event.date) <= now)
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    return (
      <div className="space-y-6">
        {renderOverview()}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Meine Veranstaltungen</h2>
          <Link 
            to="/events/new" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Neue Veranstaltung
          </Link>
        </div>
        {renderEventSection(
          upcomingEvents,
          'Kommende Veranstaltungen',
          'Keine kommenden Veranstaltungen'
        )}
        {renderEventSection(
          pastEvents,
          'Vergangene Veranstaltungen',
          'Keine vergangenen Veranstaltungen'
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center py-12">
          <span className="text-gray-500">Lade Dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center py-12">
          <span className="text-red-500">Fehler: {error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      {renderEvents()}
    </div>
  )
}

export default Dashboard