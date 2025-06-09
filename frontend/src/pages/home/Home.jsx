import { useCallback } from 'react'
import Hero from '../../components/hero/Hero'
import EventList from '../../components/eventlist/EventList'
import useEvents from '../../hooks/useEvents'

/**
 * @description: This is the Home component.
 * @returns {JSX.Element}
 */
const Home = () => {
  const { 
    events, 
    loading, 
    error, 
    filters, 
    updateFilters
  } = useEvents(true)

  const handleFilterChange = useCallback((newFilters) => {
    updateFilters(newFilters)
  }, [updateFilters])

  return (
    <div>
      <Hero 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        events={events}
        isHomePage={true}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Events in deiner Nähe
          </h2>
        </div>

        <EventList 
          events={events} 
          loading={loading} 
          error={error} 
        />
      </div>
    </div>
  )
}

export default Home 