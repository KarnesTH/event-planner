import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

const EventDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isParticipating, setIsParticipating] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [mapUrl, setMapUrl] = useState('')
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    // Lade Benutzer-Daten
    const userData = localStorage.getItem('user')
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Token immer mitschicken, wenn vorhanden
        const token = localStorage.getItem('token')
        const headers = {
          'Content-Type': 'application/json'
        }
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(`http://localhost:5000/api/v1/events/${id}`, {
          headers
        })

        // Spezifische Fehlerbehandlung basierend auf Backend-Responses
        if (response.status === 404) {
          setError('Event nicht gefunden')
          return
        }

        if (response.status === 403) {
          // Wenn kein Token vorhanden ist, versuchen wir es ohne Auth
          if (!token) {
            setError('Bitte melden Sie sich an, um dieses Event zu sehen')
            return
          }
          // Wenn Token vorhanden, aber keine Berechtigung
          setError('Sie haben keine Berechtigung für dieses Event')
          return
        }

        if (!response.ok) {
          const errorData = await response.json()
          setError(errorData.message || 'Event konnte nicht geladen werden')
          return
        }

        const data = await response.json()
        setEvent(data)
        
        // Teilnahme-Status nur setzen wenn ein Token vorhanden ist
        if (token && currentUser?._id) {
          setIsParticipating(data.participants?.some(p => p._id === currentUser._id))
        }
      } catch (err) {
        console.error('Fehler beim Laden des Events:', err)
        setError('Ein unerwarteter Fehler ist aufgetreten')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [id, currentUser])

  useEffect(() => {
    if (event?.location?.coordinates) {
      let lat, lng
      if (Array.isArray(event.location.coordinates.coordinates)) {
        [lng, lat] = event.location.coordinates.coordinates
      } else if (event.location.coordinates.lat && event.location.coordinates.lng) {
        lat = event.location.coordinates.lat
        lng = event.location.coordinates.lng
      }

      if (lat && lng) {
        setMapUrl(`https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`)
      }
    }
  }, [event])

  const handleParticipate = async () => {
    if (!currentUser) {
      navigate('/login')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/v1/events/${id}/participate`, {
        method: isParticipating ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setCurrentUser(null)
        navigate('/login')
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Teilnahme konnte nicht aktualisiert werden')
      }

      const updatedEvent = await response.json()
      setEvent(updatedEvent)
      setIsParticipating(!isParticipating)
    } catch (err) {
      console.error('Fehler bei der Teilnahme:', err)
      setError(err.message)
    }
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
    // TODO: API-Aufruf zum Speichern/Entfernen
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getParticipantCount = () => {
    const count = event?.participants?.length || 0
    const max = event?.maxParticipants
    return max ? `${count}/${max}` : count
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error}
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-600">
          Event nicht gefunden
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Hero-Bereich mit Event-Bild */}
      <div className="relative h-96">
        <img
          src={event.imageUrl || '/placeholder-event.jpg'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto">
            <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm mb-4">
              {event.category}
            </span>
            <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center">
                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(event.date)} - {formatDate(event.endDate)}
              </span>
              <span className="flex items-center">
                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {event.location.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hauptinhalt */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">Über diese Veranstaltung</h2>
              <p className="text-gray-600 mb-6">{event.description}</p>
              
              {event.tags?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <h3 className="text-xl font-semibold mb-4">Veranstaltungsort</h3>
              {mapUrl ? (
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <iframe
                    src={mapUrl}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-lg"
                  ></iframe>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-4 mb-4 text-center text-gray-500">
                  Keine Kartenansicht verfügbar
                </div>
              )}
              <p className="text-gray-600">
                {event.location.address?.street && (
                  <>{event.location.address.street}<br /></>
                )}
                {event.location.address?.postalCode && event.location.address?.city && (
                  <>{event.location.address.postalCode} {event.location.address.city}<br /></>
                )}
                {event.location.address?.country && (
                  <>{event.location.address.country}</>
                )}
              </p>
            </div>
          </div>

          {/* Seitenleiste */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-semibold">
                    {getParticipantCount()} Teilnehmer
                  </div>
                  {event?.maxParticipants && (
                    <div className="text-sm text-gray-500">
                      Maximal {event.maxParticipants} Teilnehmer
                    </div>
                  )}
                </div>

                {event?.status === 'published' && (
                  <button 
                    onClick={handleParticipate}
                    className={`w-full py-3 px-4 rounded-lg transition-colors duration-200 mb-4 ${
                      !currentUser 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : isParticipating 
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    disabled={!currentUser}
                    title={!currentUser ? 'Bitte melden Sie sich an, um teilzunehmen' : ''}
                  >
                    {!currentUser 
                      ? 'Anmelden zum Teilnehmen' 
                      : isParticipating 
                        ? 'Teilnahme stornieren' 
                        : 'Jetzt teilnehmen'
                    }
                  </button>
                )}

                {currentUser && (
                  <button 
                    onClick={handleSave}
                    className={`w-full border py-3 px-4 rounded-lg transition-colors duration-200 mb-6 ${
                      isSaved 
                        ? 'border-blue-600 text-blue-600 bg-blue-50 hover:bg-blue-100' 
                        : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {isSaved ? 'Aus Merkliste entfernen' : 'Auf Merkliste setzen'}
                  </button>
                )}
              </div>

              {event.organizer && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Veranstalter</h3>
                  <Link to={`/user/${event.organizer._id}`} className="flex items-center hover:opacity-80 transition-opacity">
                    <img
                      src={event.organizer.avatar || '/placeholder-avatar.jpg'}
                      alt={`${event.organizer.firstName} ${event.organizer.lastName}`}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-medium">
                        {event.organizer.firstName} {event.organizer.lastName}
                      </div>
                      <div className="text-sm text-gray-500">Veranstalter</div>
                    </div>
                  </Link>
                </div>
              )}

              <div className="border-t pt-6 mt-6">
                <h3 className="font-semibold mb-4">Teilen</h3>
                <div className="flex space-x-4">
                  <button className="text-gray-400 hover:text-blue-600">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </button>
                  <button className="text-gray-400 hover:text-blue-600">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>
                  <button className="text-gray-400 hover:text-blue-600">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetail 