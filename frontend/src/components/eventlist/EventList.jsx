import EventCard from '../eventcard/EventCard'

const EventList = ({ 
  events = [], 
  loading = false, 
  error = null,
  locationError = null 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-gray-500">Lade Events...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-red-500">{error}</span>
      </div>
    )
  }

  if (locationError) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-red-500">{locationError}</span>
      </div>
    )
  }

  if (!events.length) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="text-gray-500">Keine Events gefunden</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    </div>
  )
}

export default EventList 