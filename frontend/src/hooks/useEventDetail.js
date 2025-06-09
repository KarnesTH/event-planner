import { useState, useCallback } from 'react'
import apiClient from '../services/api'

/**
 * Custom Hook for event detail operations
 * @returns {Object} Event detail methods and status
 */
export const useEventDetail = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Load event details
   * @param {string} eventId - The ID of the event
   * @returns {Object} - The event details
   */
  const loadEvent = useCallback(async (eventId) => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await apiClient.get(`/events/${eventId}`)
      return data
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Participate in an event
   * @param {string} eventId - The ID of the event
   * @param {boolean} isParticipating - Whether the user is participating
   * @returns {Object} - The event details
   */
    const participate = useCallback(async (eventId, isParticipating) => {
    try {
      setLoading(true)
      setError(null)
      const endpoint = isParticipating ? 'leave' : 'join'
      const { data } = await apiClient.post(`/events/${eventId}/${endpoint}`)
      return data
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loadEvent,
    participate,
    loading,
    error
  }
}

export default useEventDetail 