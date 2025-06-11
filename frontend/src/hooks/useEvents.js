import { useState, useEffect } from 'react'
import apiClient from '../services/api'

/**
 * Custom Hook for event-specific operations
 * @param {boolean} initialNearby - Whether to show nearby events initially
 * @param {boolean} userEventsOnly - Whether to load only user events
 * @returns {Object} Event methods and status
 */
export const useEvents = (initialNearby = false, userEventsOnly = false) => {
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

  useEffect(() => {
    if (!userEventsOnly) {
      loadEvents(initialNearby)
    }
  }, [])

  /**
   * Load events
   * @param {boolean} forceNearby - Whether to force loading nearby events
   * @param {Object} coords - Optional coordinates to use
   * @param {boolean} userEventsOnly - Whether to load only user events
   */
  const loadEvents = async (forceNearby = false, coords = null, userEventsOnly = false) => {
    try {
      setLoading(true)
      setError(null)
      
      let endpoint = '/events'
      let params = {}
      
      if (userEventsOnly) {
        endpoint = '/events/my-events'
      } else if (showNearbyEvents || forceNearby) {
        const coordinates = coords || userLocation
        if (!coordinates) {
          setError('Standort ist nicht verfügbar')
          setAllEvents([])
          setFilteredEvents([])
          return
        }
        
        params = {
          lat: coordinates.latitude,
          lng: coordinates.longitude,
          radius: 50
        }
      }
      
      const { data } = await apiClient.get(endpoint, { params })
      
      let events = []
      if (userEventsOnly && data?.organized) {
        events = [
          ...data.organized.map(event => ({ ...event, isOrganizer: true })),
          ...(data.participating || []).map(event => ({ ...event, isOrganizer: false }))
        ]
      } else {
        events = Array.isArray(data) ? data : 
                data?.events ? data.events : 
                data?.organized ? [...data.organized, ...(data.participating || [])] : []
      }
      
      setAllEvents(events)
      applyFilters(events, filters)
      return events
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message
      setError(errorMessage)
      setAllEvents([])
      setFilteredEvents([])
      return []
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (events, currentFilters) => {
    const filtered = events.filter(event => {
      const searchTerm = currentFilters.search.toLowerCase()
      
      const matchesSearch = !searchTerm || 
        event.title?.toLowerCase().includes(searchTerm) ||
        event.description?.toLowerCase().includes(searchTerm) ||
        event.location?.address?.city?.toLowerCase().includes(searchTerm) ||
        event.location?.address?.street?.toLowerCase().includes(searchTerm) ||
        event.location?.name?.toLowerCase().includes(searchTerm)

      const matchesCategory = !currentFilters.category || event.category === currentFilters.category

      return matchesSearch && matchesCategory
    })

    setFilteredEvents(filtered)
  }

  /**
   * Filter events
   */
  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters }
    if (newFilters.search !== undefined) {
      setShowNearbyEvents(false)
    }
    setFilters(updatedFilters)
    applyFilters(allEvents, updatedFilters)
  }

  /**
   * Toggle the nearby events
   */
  const toggleNearbyEvents = async () => {
    const newValue = !showNearbyEvents
    setShowNearbyEvents(newValue)
    setFilters(prev => ({ ...prev, search: '' }))
    await loadEvents(newValue)
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
   * Create a new event
   * @param {Object} eventData - The event data
   * @returns {Object} - The created event
   */
  const createEvent = async (eventData) => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await apiClient.post('/events', eventData)
      
      const response = await apiClient.get('/events/my-events')
      const updatedEvents = response.data?.organized 
        ? [...response.data.organized.map(event => ({ ...event, isOrganizer: true })), 
           ...(response.data.participating || []).map(event => ({ ...event, isOrganizer: false }))]
        : []
      
      setAllEvents(updatedEvents)
      applyFilters(updatedEvents, filters)
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
      
      const response = await apiClient.get('/events/my-events')
      const updatedEvents = response.data?.organized 
        ? [...response.data.organized.map(event => ({ ...event, isOrganizer: true })), 
           ...(response.data.participating || []).map(event => ({ ...event, isOrganizer: false }))]
        : []
      
      setAllEvents(updatedEvents)
      applyFilters(updatedEvents, filters)
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
      
      const response = await apiClient.get('/events/my-events')
      const updatedEvents = response.data?.organized 
        ? [...response.data.organized.map(event => ({ ...event, isOrganizer: true })), 
           ...(response.data.participating || []).map(event => ({ ...event, isOrganizer: false }))]
        : []
      
      setAllEvents(updatedEvents)
      applyFilters(updatedEvents, filters)
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    events: filteredEvents,
    loading,
    error,
    filters,
    updateFilters,
    showNearbyEvents,
    toggleNearbyEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    setLocation,
    loadEvents
  }
}

export default useEvents 