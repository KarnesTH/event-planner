import EventCard from '../eventcard/EventCard'

const EventList = ({ events = [] }) => {
  // Beispiel-Events für die Vorschau
  const sampleEvents = [
    {
      id: 1,
      title: "Sommerfestival 2024",
      date: "15. Juni 2024",
      location: "Stadtpark Berlin",
      category: "Festival",
      price: "€45",
      imageUrl: "/placeholder-event.jpg"
    },
    {
      id: 2,
      title: "Tech Workshop",
      date: "20. Juni 2024",
      location: "Coworking Space München",
      category: "Workshop",
      price: "€89",
      imageUrl: "/placeholder-event.jpg"
    },
    {
      id: 3,
      title: "Networking Dinner",
      date: "25. Juni 2024",
      location: "Restaurant Hamburg",
      category: "Networking",
      price: "€35",
      imageUrl: "/placeholder-event.jpg"
    }
  ]

  const displayEvents = events.length > 0 ? events : sampleEvents

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}

export default EventList 