import { useState, useEffect } from 'react'
import EventCard from '../eventcard/EventCard'

const EventsPage = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    category: '',
    date: '',
    search: ''
  })

  useEffect(() => {
    fetchEvents()
  }, [filters])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        ...filters,
        search: filters.search || undefined,
        category: filters.category || undefined,
        date: filters.date || undefined
      }).toString()

      const response = await fetch(`/api/events?${queryParams}`)
      if (!response.ok) throw new Error('Fehler beim Laden der Events')
      
      const data = await response.json()
      setEvents(data)
      setError(null)
    } catch (err) {
      setError('Events konnten nicht geladen werden')
      console.error('Fehler beim Laden der Events:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

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
            <p className="text-gray-600">
              Finde spannende Events in deiner Nähe oder erstelle deine eigene Veranstaltung
            </p>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Suche
                </label>
                <input
                  type="text"
                  id="search"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Suche nach Events..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Kategorie
                </label>
                <select
                  id="category"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category === 'Alle Kategorien' ? '' : category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Datum
                </label>
                <select
                  id="date"
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Alle Termine</option>
                  <option value="today">Heute</option>
                  <option value="tomorrow">Morgen</option>
                  <option value="week">Diese Woche</option>
                  <option value="month">Dieser Monat</option>
                </select>
              </div>
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">
              {error}
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