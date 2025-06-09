import { useState, useCallback } from 'react'
import apiClient from '../services/api'

/**
 * Custom Hook for API calls
 * @param {string} endpoint - The API endpoint
 * @returns {Object} - API methods and status
 */
const useApi = (endpoint) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Get data from the API
   * @param {Object} params - The parameters for the API call
   * @returns {Object} - The data from the API
   */
  const get = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const { data: responseData } = await apiClient.get(endpoint, { params })
      setData(responseData)
      return responseData
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  /**
   * Post data to the API
   * @param {Object} body - The body of the API call
   * @returns {Object} - The data from the API
   */
  const post = useCallback(async (body = {}) => {
    try {
      setLoading(true)
      setError(null)
      const { data: responseData } = await apiClient.post(endpoint, body)
      setData(responseData)
      return responseData
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  /**
   * Put data to the API
   * @param {Object} body - The body of the API call
   * @returns {Object} - The data from the API
   */
  const put = useCallback(async (body = {}) => {
    try {
      setLoading(true)
      setError(null)
      const { data: responseData } = await apiClient.put(endpoint, body)
      setData(responseData)
      return responseData
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  /**
   * Delete data from the API
   * @returns {Object} - The data from the API
   */
  const del = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data: responseData } = await apiClient.delete(endpoint)
      setData(responseData)
      return responseData
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  return {
    data,
    loading,
    error,
    get,
    post,
    put,
    delete: del
  }
}

export default useApi 