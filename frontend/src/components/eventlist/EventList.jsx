import EventCard from '../eventcard/EventCard'

/**
 * EventList component
 * @param {Object} events - The events
 * @param {boolean} loading - Whether the events are loading
 * @param {string} error - The error message
 * @returns {JSX.Element} - The EventList component
 */
const EventList = ({ events = [], loading = false, error = null }) => {
  /**
   * Render the loading state
   * @returns {JSX.Element} - The loading state
   */
  if (loading) {
    return (
      <div className="text-center py-8">
        <span className="text-gray-500">Lade Events...</span>
      </div>
    )
  }

  /**
   * Render the error state
   * @returns {JSX.Element} - The error state
   */
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Erneut versuchen
        </button>
      </div>
    )
  }

  /**
   * Render the no events state
   * @returns {JSX.Element} - The no events state
   */
  if (!events.length) {
    return (
      <div className="text-center text-gray-600 py-8">
        Keine Events gefunden
      </div>
    )
  }

  /**
   * Render the event list
   * @returns {JSX.Element} - The event list
   */
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map(event => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  )
}

export default EventList 