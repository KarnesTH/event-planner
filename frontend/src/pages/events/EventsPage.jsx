import { useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import EventList from '../../components/eventlist/EventList'
import SearchBar from '../../components/searchbar/SearchBar'
import useEvents from '../../hooks/useEvents'

/**
 * @description: This is the EventsPage component.
 * @param {Object} fetchEvents - The function to fetch events.
 * @param {Object} fetchNearbyEvents - The function to fetch nearby events.
 * @returns {JSX.Element} - The events page component
 */
const EventsPage = () => {
  const location = useLocation()
  const { 
    events, 
    loading, 
    error, 
    filters, 
    updateFilters,
    showNearbyEvents,
    toggleNearbyEvents,
    loadEvents
  } = useEvents(false, false)

  /**
   * Handle the filter change
   * @param {Object} newFilters - The new filters
   */
  useEffect(() => {
    if (location.state?.initialSearch || location.state?.initialCategory) {
      updateFilters({
        search: location.state.initialSearch || '',
        category: location.state.initialCategory || ''
      })
      loadEvents(false)
    }
  }, [location.state, updateFilters, loadEvents])

  /**
   * Handle the filter change
   * @param {Object} newFilters - The new filters
   */
  const handleFilterChange = useCallback((newFilters) => {
    updateFilters(newFilters)
  }, [updateFilters])

  /**
   * Render the events page
   * @returns {JSX.Element} - The events page
   */
  return (
    <div>
      <div className="bg-gradient-to-b from-blue-50 to-white py-8">
        <div className="container mx-auto px-4">
          <SearchBar 
            filters={filters}
            onFilterChange={handleFilterChange}
            events={events}
            isHomePage={false}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Veranstaltungen entdecken
          </h1>
          
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {showNearbyEvents ? 'Events in deiner Nähe' : 'Alle Events'}
            </h2>
            <button
              onClick={toggleNearbyEvents}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showNearbyEvents ? 'Alle Events anzeigen' : 'In der Nähe anzeigen'}
            </button>
          </div>

          <EventList 
            events={events}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  )
}

export default EventsPage 