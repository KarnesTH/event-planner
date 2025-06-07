import { useState, useEffect } from 'react'
import EventCard from '../eventcard/EventCard'

const EventList = ({ showNearbyEvents = false }) => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)

  useEffect(() => {
    if (showNearbyEvents && !location) {
      getCurrentLocation()
    } else if (!showNearbyEvents) {
      setLocation(null)
      fetchEvents()
    } else if (location) {
      fetchEvents()
    }
  }, [showNearbyEvents])

  useEffect(() => {
    if (location) {
      fetchEvents()
    }
  }, [location])

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.log('Geolocation wird nicht unterstützt');
      setLocationError('Geolocation wird von Ihrem Browser nicht unterstützt')
      fetchEvents()
      return
    }

    console.log('Starte Geolocation-Abfrage...');
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Geolocation erfolgreich:', position.coords);
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        console.error('Geolocation-Fehler:', error.code, error.message);
        setLocationError(`Standort konnte nicht ermittelt werden: ${error.message}`)
        setLocation(null)
        fetchEvents()
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      if (location) {
        console.log('Verwende Standort für Eventsuche:', location);
        queryParams.append('lat', location.lat)
        queryParams.append('lng', location.lng)
        queryParams.append('radius', '50')
      }

      const url = `http://localhost:5000/api/v1/events?${queryParams.toString()}`;
      console.log('Fetching Events von:', url);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Fehler beim Laden der Events')
      }
      
      const data = await response.json()
      console.log(`${data.length} Events empfangen`);
      setEvents(data)
    } catch (err) {
      console.error('Fehler beim Laden der Events:', err)
      setError(err.message || 'Events konnten nicht geladen werden')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (locationError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="text-yellow-600 mb-2">{locationError}</div>
          <p className="text-gray-600 mb-4">Es werden alle verfügbaren Events angezeigt.</p>
          <button
            onClick={getCurrentLocation}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Standort erneut abrufen
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="text-red-600 mb-2">{error}</div>
          <button
            onClick={fetchEvents}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {showNearbyEvents ? 'Keine Events in Ihrer Nähe' : 'Keine Events gefunden'}
          </h2>
          <p className="text-gray-600">
            {showNearbyEvents 
              ? 'Es wurden keine Events in Ihrer Umgebung gefunden. Versuchen Sie es später erneut oder schauen Sie sich alle Events an.'
              : 'Aktuell sind keine Events verfügbar.'}
          </p>
          {showNearbyEvents && (
            <button
              onClick={() => setLocation(null)}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Alle Events anzeigen
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {showNearbyEvents && (
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Events in Ihrer Nähe
          </h2>
          <p className="text-gray-600">
            Entdecken Sie spannende Veranstaltungen in Ihrer Umgebung
          </p>
          <button
            onClick={() => setLocation(null)}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            Alle Events anzeigen
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    </div>
  )
}

export default EventList 