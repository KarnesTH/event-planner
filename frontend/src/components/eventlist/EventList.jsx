import { useState, useEffect } from 'react'
import EventCard from '../eventcard/EventCard'

const EventList = ({ showNearbyEvents = false }) => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState('')

  useEffect(() => {
    if (showNearbyEvents) {
      getCurrentLocation()
    } else {
      fetchEvents()
    }
  }, [showNearbyEvents])

  const getCurrentLocation = () => {
    setLoading(true)
    setLocationError('')
    if (!navigator.geolocation) {
      setLocationError('Geolocation wird nicht unterstützt.')
      setLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        })
        fetchEvents(pos.coords.latitude, pos.coords.longitude)
      },
      (err) => {
        setLocationError('Standort konnte nicht ermittelt werden.')
        setLoading(false)
      },
      { timeout: 10000 }
    )
  }

  const fetchEvents = async (lat, lng) => {
    setLoading(true)
    setError('')
    let url = 'http://localhost:5000/api/v1/events?'
    if (lat && lng) {
      url += `lat=${lat}&lng=${lng}&radius=50`
    }
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('Fehler beim Laden der Events')
      const data = await res.json()
      setEvents(data)
    } catch (err) {
      setError('Fehler beim Laden der Events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (location && showNearbyEvents) {
      fetchEvents(location.lat, location.lng)
    }
  }, [location])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-gray-500">Lade Events...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-red-500">{error}</span>
      </div>
    )
  }

  if (locationError) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-red-500">{locationError}</span>
      </div>
    )
  }

  if (!events.length) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-gray-500">Keine Events gefunden</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    </div>
  )
}

export default EventList 