import { useState, useEffect } from 'react'
import Hero from '../../components/hero/Hero'
import EventList from '../../components/eventlist/EventList'

/**
 * @description: This is the Home component.
 * @returns {JSX.Element}
 */
const Home = ({ fetchEvents, fetchNearbyEvents }) => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showNearbyEvents, setShowNearbyEvents] = useState(false)

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await (showNearbyEvents ? fetchNearbyEvents : fetchEvents)({})
      setEvents(data)
    } catch (err) {
      setError(err.message)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [showNearbyEvents])

  return (
    <div>
      <Hero />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowNearbyEvents(!showNearbyEvents)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg 
              className="h-5 w-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {showNearbyEvents ? 'Alle Events anzeigen' : 'Events in meiner Nähe'}
          </button>
        </div>
        <EventList 
          events={events}
          loading={loading}
          error={error}
          locationError={showNearbyEvents && !localStorage.getItem('token') ? 'Bitte melden Sie sich an, um Events in Ihrer Nähe zu sehen' : null}
        />
      </div>
    </div>
  )
}

export default Home 