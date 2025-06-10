import { useState, useEffect } from 'react'
import apiClient from '../services/api'

/**
 * Custom Hook for event-specific operations
 * @param {boolean} initialNearby - Whether to show nearby events initially
 * @returns {Object} Event methods and status
 */
export const useEvents = (initialNearby = false) => {
  const [allEvents, setAllEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showNearbyEvents, setShowNearbyEvents] = useState(initialNearby)
  const [userLocation, setUserLocation] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    category: ''
  })

  /**
   * Create a new event
   * @param {Object} eventData - The event data
   * @returns {Object} - The created event
   */
  const createEvent = async (eventData) => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await apiClient.post('/events', eventData)
      const currentEvents = Array.isArray(allEvents) ? allEvents : []
      setAllEvents([...currentEvents, data])
      return data
    } catch (err) {
      console.error('Event-Erstellung fehlgeschlagen:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        error: err.response?.data?.error,
        details: err.response?.data?.details,
        data: err.response?.data
      })
      const errorMessage = err.response?.data?.message || err.message
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Update an existing event
   * @param {string} eventId - The ID of the event
   * @param {Object} eventData - The event data
   * @returns {Object} - The updated event
   */
  const updateEvent = async (eventId, eventData) => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await apiClient.put(`/events/${eventId}`, eventData)
      setAllEvents(prevEvents => 
        prevEvents.map(event => event._id === eventId ? data : event)
      )
      return data
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Delete an event
   * @param {string} eventId - The ID of the event
   */
  const deleteEvent = async (eventId) => {
    try {
      setLoading(true)
      setError(null)
      await apiClient.delete(`/events/${eventId}`)
      setAllEvents(prevEvents => 
        prevEvents.filter(event => event._id !== eventId)
      )
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Load user events
   * @returns {Object} - The user events
   */
  const loadUserEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await apiClient.get('/events/my-events')
      const events = Array.isArray(data) ? data : 
                    data?.events ? data.events : 
                    data?.organized ? [...data.organized, ...(data.participating || [])] : []
      setAllEvents(events)
      return events
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Set user location and load nearby events
   * @param {Object} coords - The coordinates
   */
  const setLocation = async (coords) => {
    setUserLocation(coords)
    setShowNearbyEvents(true)
    await loadEvents(true, coords)
  }

  /**
   * Load events
   * @param {boolean} forceNearby - Whether to force loading nearby events
   * @param {Object} coords - Optional coordinates to use
   */
  const loadEvents = async (forceNearby = false, coords = null) => {
    try {
      setLoading(true)
      setError(null)
      
      let params = {}
      
      if (showNearbyEvents || forceNearby) {
        const coordinates = coords || userLocation
        if (!coordinates) {
          setError('Standort ist nicht verfügbar')
          setAllEvents([])
          return
        }
        
        params = {
          lat: coordinates.latitude,
          lng: coordinates.longitude,
          radius: 50
        }
      }
      
      const { data } = await apiClient.get('/events', { params })
      const events = Array.isArray(data) ? data : data?.events || []
      setAllEvents(events)
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message
      setError(errorMessage)
      setAllEvents([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * Load events on mount and when showNearbyEvents changes
   */
  useEffect(() => {
    loadEvents()
  }, [showNearbyEvents])

  /**
   * Filter events
   */
  useEffect(() => {
    const filtered = allEvents.filter(event => {
      const searchTerm = filters.search.toLowerCase()
      
      const matchesSearch = !searchTerm || 
        event.title?.toLowerCase().includes(searchTerm) ||
        event.description?.toLowerCase().includes(searchTerm) ||
        event.location?.address?.city?.toLowerCase().includes(searchTerm) ||
        event.location?.address?.street?.toLowerCase().includes(searchTerm) ||
        event.location?.name?.toLowerCase().includes(searchTerm)

      const matchesCategory = !filters.category || event.category === filters.category

      return matchesSearch && matchesCategory
    })

    setFilteredEvents(filtered)
  }, [allEvents, filters])

  /**
   * Update the filters
   * @param {Object} newFilters - The new filters
   */
  const updateFilters = (newFilters) => {
    if (newFilters.search !== undefined) {
      setShowNearbyEvents(false)
    }
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  /**
   * Toggle the nearby events
   */
  const toggleNearbyEvents = () => {
    setShowNearbyEvents(prev => !prev)
    setFilters(prev => ({ ...prev, search: '' }))
  }

  return {
    events: filteredEvents,
    loading,
    error,
    filters,
    updateFilters,
    showNearbyEvents,
    toggleNearbyEvents,
    loadUserEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    setLocation
  }
}

export default useEvents 