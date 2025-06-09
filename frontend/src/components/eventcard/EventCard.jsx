import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import apiClient from '../../services/api'
import useEvents from '../../hooks/useEvents'
import EventModal from '../eventmodal/EventModal'

/**
 * EventCard component
 * @param {Object} event - The event
 * @param {Function} onDelete - The function to delete the event
 * @param {Function} onUpdate - The function to update the event
 * @returns {JSX.Element} - The EventCard component
 */
const EventCard = ({ event, onDelete, onUpdate }) => {
  const navigate = useNavigate()
  const [isParticipating, setIsParticipating] = useState(event.isParticipating)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { participate, updateEvent, deleteEvent } = useEvents()

  /**
   * Get the current user id
   */
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setCurrentUserId(null)
      return
    }

    apiClient.get('/auth/me')
      .then(response => {
        if (response.data?.user?._id) {
          setCurrentUserId(response.data.user._id)
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

  /**
   * Check if the current user is the organizer
   * @returns {boolean} - Whether the current user is the organizer
   */
  const isOrganizer = (() => {
    const organizerId = typeof event.organizer === 'object' ? event.organizer._id : event.organizer
    return Boolean(currentUserId && organizerId && currentUserId === organizerId)
  })()

  /**
   * Check if the current user is participating in the event
   */
  useEffect(() => {
    if (currentUserId) {
      setIsParticipating(event.participants?.some(p => p._id === currentUserId))
    }
  }, [event, currentUserId])

  /**
   * Handle the participation
   * @param {Event} e - The event
   */
  const handleParticipate = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    try {
      setLoading(true)
      await participate(event._id, isParticipating)
      setIsParticipating(!isParticipating)
    } catch (error) {
      console.error('Teilnahme fehlgeschlagen:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle the deletion
   */
  const handleDelete = async () => {
    if (!window.confirm('Möchten Sie dieses Event wirklich löschen?')) {
      return
    }

    try {
      await deleteEvent(event._id)
      onDelete?.(event._id)
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Event konnte nicht gelöscht werden'
      alert(errorMessage)
    }
  }

  /**
   * Handle the update
   * @param {Object} updatedEventData - The updated event data
   */
  const handleUpdate = async (updatedEventData) => {
    try {
      const { 
        _id, 
        organizer, 
        participants, 
        createdAt, 
        updatedAt, 
        __v,
        ...restData 
      } = updatedEventData

      const cleanedLocation = restData.location ? {
        name: restData.location.name,
        address: restData.location.address,
        coordinates: restData.location.coordinates
      } : undefined

      const updateData = {
        ...restData,
        location: cleanedLocation
      }

      await updateEvent(event._id, updateData)
      setShowEditModal(false)
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Event konnte nicht aktualisiert werden'
      alert(errorMessage)
    }
  }

  /**
   * Format the date
   * @param {string} dateString - The date string
   * @returns {string} - The formatted date
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  /**
   * Get the participant count
   * @returns {number} - The participant count
   */
  const getParticipantCount = () => {
    const count = event.participants?.length || 0
    const max = event.maxParticipants
    return max ? `${count}/${max}` : count
  }

  /**
   * Get the status badge
   * @returns {JSX.Element} - The status badge
   */
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

  /**
   * Handle the card click
   * @param {Event} e - The event
   */
  const handleCardClick = (e) => {
    if (e.target.closest('button')) {
      return
    }
    navigate(`/events/${event._id}`)
  }

  /**
   * Render the event card
   * @returns {JSX.Element} - The event card
   */
  return (
    <>
      <div 
        onClick={handleCardClick}
        className="relative bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      >
        {/* Admin Buttons */}
        {isOrganizer && (
          <div className="absolute top-2 right-2 z-10 flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowEditModal(true)
              }}
              className="p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors"
              title="Event bearbeiten"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (window.confirm('Möchten Sie dieses Event wirklich löschen?')) {
                  handleDelete()
                }
              }}
              className="p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors"
              title="Event löschen"
            >
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}

        {/* Event Image */}
        <div className="relative h-48 bg-gray-100">
          {event.imageUrl ? (
            <img 
              src={event.imageUrl.startsWith('http') ? event.imageUrl : `http://localhost:5000${event.imageUrl}`}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            {getStatusBadge()}
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {event.category}
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-4">
            {formatDate(event.date)}
          </p>

          <p className="text-gray-700 mb-4 line-clamp-2">
            {event.description}
          </p>

          {/* Tags */}
          {event.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {event.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {getParticipantCount()} Teilnehmer
            </span>

            {event.status === 'published' && (
              <button
                onClick={handleParticipate}
                disabled={loading}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  loading 
                    ? 'bg-gray-100 text-gray-400'
                    : isParticipating
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading 
                  ? '...' 
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