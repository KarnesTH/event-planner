import SearchBar from "../searchbar/SearchBar"

/**
 * Hero component
 * @param {Object} filters - The filters
 * @param {Function} onFilterChange - The function to change the filters
 * @param {Object} events - The events
 * @param {boolean} isHomePage - Whether the component is on the home page
 */
const Hero = ({ filters, onFilterChange, events, isHomePage = true }) => {
  return (
    <section className="relative bg-gradient-to-b from-blue-50 to-white py-24">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Entdecke deine nächste <span className="text-blue-600">Veranstaltung</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Finde und organisiere die besten Events in deiner Nähe. Von Konzerten über Workshops bis hin zu Networking-Events – alles an einem Ort.
          </p>
          <SearchBar 
            filters={filters} 
            onFilterChange={onFilterChange} 
            events={events}
            isHomePage={isHomePage}
          />
          <div className="mt-8 flex justify-center space-x-4 text-sm text-gray-500">
            <span>Beliebte Kategorien:</span>
            <a href="#" className="hover:text-blue-600">Konzerte</a>
            <a href="#" className="hover:text-blue-600">Workshops</a>
            <a href="#" className="hover:text-blue-600">Networking</a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero