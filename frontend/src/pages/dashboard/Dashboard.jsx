import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useEvents from '../../hooks/useEvents'
import useAuth from '../../hooks/useAuth'
import EventModal from '../../components/eventmodal/EventModal'
import EventCard from '../../components/eventcard/EventCard'

/**
 * @description: This is the Dashboard component.
 * @returns {JSX.Element} - The dashboard component
 */
const Dashboard = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { events, loading, error, loadEvents } = useEvents(false, true)
  const [showModal, setShowModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [activeTab, setActiveTab] = useState('created')
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalParticipants: 0
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const initializeDashboard = async () => {
      const userEvents = await loadEvents(false, null, true)
      if (userEvents?.length) {
        updateStats(userEvents)
      }
    }

    initializeDashboard()
  }, [isAuthenticated])

  const updateStats = (userEvents) => {
    if (!userEvents?.length) {
      setStats({
        totalEvents: 0,
        upcomingEvents: 0,
        totalParticipants: 0
      })
      return
    }

    const now = new Date()
    const upcomingEvents = userEvents.filter(event => new Date(event.date) > now)
    const totalParticipants = userEvents.reduce((sum, event) => 
      sum + (event.participants?.length || 0), 0)

    setStats({
      totalEvents: userEvents.length,
      upcomingEvents: upcomingEvents.length,
      totalParticipants
    })
  }

  const getActiveEvents = () => {
    if (!events?.length || !user?._id) return []
    
    return activeTab === 'created' 
      ? events.filter(event => event.isOrganizer)
      : events.filter(event => !event.isOrganizer)
  }

  const handleCloseModal = async () => {
    setShowModal(false)
    setSelectedEvent(null)
    
    const userEvents = await loadEvents(false, null, true)
    if (userEvents?.length) {
      updateStats(userEvents)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    const userEvents = await loadEvents(false, null, true)
    if (userEvents?.length) {
      updateStats(userEvents)
    }
  }

  /**
   * Handle the creation of a new event
   */
  const handleCreateEvent = () => {
    setSelectedEvent(null)
    setShowModal(true)
  }

  /**
   * Handle the editing of an event
   * @param {Object} event - The event
   */
  const handleEditEvent = (event) => {
    setSelectedEvent(event)
    setShowModal(true)
  }

  /**
   * Render the loading state
   * @returns {JSX.Element} - The loading state
   */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  /**
   * Render the error state
   * @returns {JSX.Element} - The error state
   */
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error}
        </div>
      </div>
    )
  }

  /**
   * Render the dashboard
   * @returns {JSX.Element} - The dashboard
   */
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Gesamt Events</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalEvents}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Anstehende Events</h3>
          <p className="text-3xl font-bold text-green-600">{stats.upcomingEvents}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Teilnehmer gesamt</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.totalParticipants}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('created')}
              className={`${
                activeTab === 'created'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Erstellte Events
            </button>
            <button
              onClick={() => setActiveTab('participated')}
              className={`${
                activeTab === 'participated'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Besuchte Events
            </button>
          </nav>
        </div>
      </div>

      {/* Aktuelle Events */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {activeTab === 'created' ? 'Meine Events' : 'Events an denen ich teilnehme'}
          </h2>
          {activeTab === 'created' && (
            <button
              onClick={handleCreateEvent}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Neues Event erstellen
            </button>
          )}
        </div>

        {getActiveEvents().length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            {activeTab === 'created' 
              ? 'Sie haben noch keine Events erstellt'
              : 'Sie nehmen noch an keinen Events teil'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getActiveEvents().map(event => (
              <EventCard
                key={event._id}
                event={event}
                onEdit={activeTab === 'created' ? () => handleEditEvent(event) : undefined}
                onDelete={activeTab === 'created' ? handleDeleteEvent : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Event Modal */}
      {showModal && (
        <EventModal
          event={selectedEvent}
          onClose={handleCloseModal}
          isEdit={!!selectedEvent}
        />
      )}
    </div>
  )
}

export default Dashboard