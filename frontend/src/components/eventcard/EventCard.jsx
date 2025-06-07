import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const EventCard = ({ event }) => {
  const { user } = useAuth()
  const [isParticipating, setIsParticipating] = useState(event.participants?.includes(user?._id))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ]
    return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const getParticipantCount = () => {
    const count = event.participants?.length || 0
    const max = event.maxParticipants
    return max ? `${count}/${max}` : count
  }

  const handleParticipate = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      // Wenn nicht eingeloggt, zur Login-Seite weiterleiten
      window.location.href = '/login'
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      const method = isParticipating ? 'DELETE' : 'POST'
      const response = await fetch(`http://localhost:5000/api/v1/events/${event._id}/participate`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Fehler bei der Teilnahme')
      }

      setIsParticipating(!isParticipating)
    } catch (err) {
      console.error('Fehler bei der Teilnahme:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = () => {
    const statusColors = {
      draft: 'bg-gray-500',
      published: 'bg-green-500',
      canceled: 'bg-red-500',
      completed: 'bg-blue-500'
    }

    const statusText = {
      draft: 'Entwurf',
      published: 'Veröffentlicht',
      canceled: 'Abgesagt',
      completed: 'Abgeschlossen'
    }

    return (
      <span className={`${statusColors[event.status]} text-white px-2 py-1 rounded-full text-xs`}>
        {statusText[event.status]}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <Link to={`/events/${event._id}`}>
        <div className="relative h-48">
          <img
            src={event.imageUrl || '/placeholder-event.jpg'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 flex space-x-2">
            {getStatusBadge()}
            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
              {event.category}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/events/${event._id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
            {event.title}
          </h3>
        </Link>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(event.date)}
          </div>

          <div className="flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.location?.name}
          </div>

          <div className="flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {getParticipantCount()} Teilnehmer
          </div>
        </div>

        {error && (
          <div className="mt-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <Link 
            to={`/events/${event._id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Details anzeigen
          </Link>
          
          {event.status === 'published' && (
            <button 
              onClick={handleParticipate}
              disabled={isLoading || event.organizer?._id === user?._id}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                isParticipating
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isParticipating ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    )}
                  </svg>
                  <span>{isParticipating ? 'Abmelden' : 'Teilnehmen'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventCard 