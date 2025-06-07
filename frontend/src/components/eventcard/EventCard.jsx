import { Link } from 'react-router-dom'

const EventCard = ({ event }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getParticipantCount = () => {
    const count = event.participants?.length || 0
    const max = event.maxParticipants
    return max ? `${count}/${max}` : count
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <Link to={`/event/${event._id}`}>
        <div className="relative h-48">
          <img
            src={event.imageUrl || '/placeholder-event.jpg'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
              {event.category}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/event/${event._id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
            {event.title}
          </h3>
        </Link>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(event.date)}
          </div>

          <div className="flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.location.name}
          </div>

          <div className="flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {getParticipantCount()} Teilnehmer
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <Link 
            to={`/event/${event._id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Details anzeigen
          </Link>
          
          <button 
            className="text-gray-400 hover:text-blue-600 transition-colors"
            aria-label="Event speichern"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default EventCard 