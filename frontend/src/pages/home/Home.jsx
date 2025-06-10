import { useState } from 'react'
import Hero from '../../components/hero/Hero'
import EventList from '../../components/eventlist/EventList'
import LocationPermission from '../../components/locationpermission/LocationPermission'
import useEvents from '../../hooks/useEvents'

/**
 * @description: This is the Home component.
 * @returns {JSX.Element}
 */
const Home = () => {
  const [hasLocationPermission, setHasLocationPermission] = useState(false)
  const { 
    events, 
    loading, 
    error, 
    filters, 
    updateFilters,
    setLocation
  } = useEvents(false)

  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters)
  }

  const handleLocationPermission = (coords) => {
    setHasLocationPermission(true)
    setLocation(coords)
  }

  return (
    <div>
      <Hero 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        events={events}
        isHomePage={true}
      />
      
      <div className="container mx-auto px-4 py-8">
        {!hasLocationPermission ? (
          <LocationPermission onPermissionGranted={handleLocationPermission} />
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}

export default Home 