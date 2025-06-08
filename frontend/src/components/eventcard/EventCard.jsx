import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import EventModal from '../eventmodal/EventModal'

const EventCard = ({ event, onDelete, onUpdate }) => {
  const navigate = useNavigate()
  const [isParticipating, setIsParticipating] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Token-basierte Benutzererkennung
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setCurrentUserId(null)
      return
    }

    fetch('http://localhost:5000/api/v1/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
    .then(async response => {
      const data = await response.json()
      
      if (response.ok && data?.user?._id) {
        setCurrentUserId(data.user._id)
      } else {
        localStorage.removeItem('token')
        setCurrentUserId(null)
      }
    })
    .catch(() => {
      localStorage.removeItem('token')
      setCurrentUserId(null)
    })
  }, [])

  // Organizer-Erkennung
  const isOrganizer = (() => {
    const organizerId = typeof event.organizer === 'object' ? event.organizer._id : event.organizer
    return Boolean(currentUserId && organizerId && currentUserId === organizerId)
  })()

  useEffect(() => {
    if (currentUserId) {
      setIsParticipating(event.participants?.some(p => p._id === currentUserId))
    }
  }, [event, currentUserId])

  const handleParticipate = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/v1/events/${event._id}/participate`, {
        method: isParticipating ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token')
        setCurrentUserId(null)
        navigate('/login')
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Teilnahme konnte nicht aktualisiert werden')
      }

      const updatedEvent = await response.json()
      onUpdate?.(updatedEvent)
      setIsParticipating(!isParticipating)
    } catch (err) {
      console.error('Fehler bei der Teilnahme:', err)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Möchten Sie dieses Event wirklich löschen?')) {
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/v1/events/${event._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token')
        setCurrentUserId(null)
        navigate('/login')
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Event konnte nicht gelöscht werden')
      }

      onDelete?.(event._id)
    } catch (err) {
      console.error('Fehler beim Löschen:', err)
      alert(err.message)
    }
  }

  const handleUpdate = async (updatedEventData) => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    try {
      console.log('Sende Update-Request mit Daten:', updatedEventData)
      const response = await fetch(`http://localhost:5000/api/v1/events/${event._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedEventData)
      })

      const data = await response.json()

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token')
        setCurrentUserId(null)
        navigate('/login')
        return
      }

      if (!response.ok) {
        throw new Error(
          data.message || 
          (data.invalidFields ? `Ungültige Felder: ${data.invalidFields.join(', ')}` : 'Event konnte nicht aktualisiert werden')
        )
      }

      onUpdate?.(data)
      setShowEditModal(false)
    } catch (err) {
      console.error('Fehler beim Aktualisieren:', err)
      alert(err.message)
    }
  }

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

  const getStatusBadge = () => {
    const statusColors = {
      draft: 'bg-gray-500',
      published: 'bg-green-500',
      cancelled: 'bg-red-500',
      completed: 'bg-blue-500'
    }

    const statusText = {
      draft: 'Entwurf',
      published: 'Veröffentlicht',
      cancelled: 'Abgesagt',
      completed: 'Abgeschlossen'
    }

    return (
      <span className={`${statusColors[event.status]} text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm`}>
        {statusText[event.status]}
      </span>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="relative">
          <Link to={`/events/${event._id}`} className="block">
            <img
              src={event.imageUrl || '/placeholder-event.jpg'}
              alt={event.title}
              className="w-full h-48 object-cover"
            />
          </Link>
          <div className="absolute top-2 right-2">
            {getStatusBadge()}
          </div>
          {isOrganizer && (
            <div className="absolute top-2 left-2 flex space-x-2 bg-white/80 p-1 rounded-lg">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowEditModal(true)
                }}
                className="p-1.5 bg-white hover:bg-gray-50 rounded-full shadow-sm hover:shadow transition-all duration-200"
                title="Event bearbeiten"
              >
                <svg className="h-5 w-5 text-gray-600 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (window.confirm('Möchten Sie dieses Event wirklich löschen?')) {
                    handleDelete()
                  }
                }}
                className="p-1.5 bg-white hover:bg-gray-50 rounded-full shadow-sm hover:shadow transition-all duration-200"
                title="Event löschen"
              >
                <svg className="h-5 w-5 text-gray-600 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <Link to={`/events/${event._id}`} className="block">
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                {event.title}
              </h3>
            </Link>
          </div>

          <div className="flex items-center text-sm text-gray-500 mb-2">
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(event.date).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>

          <div className="flex items-center text-sm text-gray-500 mb-4">
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.location.name}
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>

          <div className="flex justify-between items-center">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {event.category}
            </span>
            {event.status === 'published' && (
              <button
                onClick={handleParticipate}
                className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${
                  !currentUserId 
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : isParticipating 
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                disabled={!currentUserId}
                title={!currentUserId ? 'Bitte melden Sie sich an, um teilzunehmen' : ''}
              >
                {!currentUserId 
                  ? 'Anmelden' 
                  : isParticipating 
                    ? 'Teilnahme stornieren' 
                    : 'Teilnehmen'
                }
              </button>
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <EventModal
          event={event}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdate}
          isEdit={true}
        />
      )}
    </>
  )
}

export default EventCard 