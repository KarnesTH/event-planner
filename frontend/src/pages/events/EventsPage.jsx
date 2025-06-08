import { useState, useEffect, useCallback } from 'react'
import EventCard from '../../components/eventcard/EventCard'
import SearchBar from '../../components/searchbar/SearchBar'

/**
 * @description: This is the EventsPage component.
 * @param {Object} fetchEvents - The function to fetch events.
 * @param {Object} fetchNearbyEvents - The function to fetch nearby events.
 * @returns {JSX.Element}
 */
const EventsPage = ({ fetchEvents, fetchNearbyEvents }) => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('')
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const loadEvents = useCallback(async (currentSearchTerm, currentCategory) => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchEvents({ 
        searchTerm: currentSearchTerm, 
        category: currentCategory 
      })
      setEvents(data)
    } catch (err) {
      setError('Fehler beim Laden der Events')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [fetchEvents])

  useEffect(() => {
    if (isInitialLoad) {
      loadEvents('', '')
      setIsInitialLoad(false)
    }
  }, [isInitialLoad, loadEvents])

  const handleSearch = useCallback(async (term) => {
    setSearchTerm(term)
    await loadEvents(term, category)
  }, [category, loadEvents])

  const handleFilter = useCallback(async (selectedCategory) => {
    setCategory(selectedCategory)
    await loadEvents(searchTerm, selectedCategory)
  }, [searchTerm, loadEvents])

  const handleNearbyEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchNearbyEvents({ searchTerm, category })
      setEvents(data)
    } catch (err) {
      setError('Fehler beim Laden der Events in der Nähe')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [fetchNearbyEvents, searchTerm, category])

  const categories = [
    'Alle Kategorien',
    'Konzert',
    'Workshop',
    'Networking',
    'Sport',
    'Kultur',
    'Andere'
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Veranstaltungen entdecken
            </h1>
            <p className="text-gray-600 mb-4">
              Finde spannende Events in deiner Nähe oder erstelle deine eigene Veranstaltung
            </p>
            
            <div className="flex justify-between items-center mb-6">
              <SearchBar 
                onSearch={handleSearch}
                onFilter={handleFilter}
                initialSearchTerm={searchTerm}
                initialCategory={category}
              />
              <button
                onClick={handleNearbyEvents}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Events in der Nähe
              </button>
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="text-center py-8">
              Lade Events...
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">{error}</div>
              <button
                onClick={() => loadEvents(searchTerm, category)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Erneut versuchen
              </button>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center text-gray-600 py-8">
              Keine Events gefunden
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventsPage 