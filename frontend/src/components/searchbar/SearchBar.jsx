import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * SearchBar component
 * @param {Object} filters - The filters
 * @param {Function} onFilterChange - The function to change the filters
 * @param {Object} events - The events
 * @param {boolean} isHomePage - Whether the component is on the home page
 */
const SearchBar = ({ 
  filters, 
  onFilterChange,
  isHomePage = false
}) => {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [categoryInput, setCategoryInput] = useState('')

  /**
   * Handle the search change
   * @param {Event} e - The event
   */
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value
    setSearchInput(value)
    
    if (!isHomePage) {
      // Nur auf der EventsPage direkt filtern
      onFilterChange({ search: value })
    }
  }, [onFilterChange, isHomePage])

  /**
   * Handle the category change
   * @param {Event} e - The event
   */
  const handleCategoryChange = useCallback((e) => {
    const category = e.target.value
    setCategoryInput(category)
    
    if (!isHomePage) {
      // Nur auf der EventsPage direkt filtern
      onFilterChange({ category })
    }
  }, [onFilterChange, isHomePage])

  /**
   * Handle the submit
   * @param {Event} e - The event
   */
  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    
    if (isHomePage) {
      // Auf der HomePage zur EventsPage navigieren
      navigate('/events', { 
        state: { 
          initialSearch: searchInput,
          initialCategory: categoryInput 
        }
      })
    }
  }, [isHomePage, navigate, searchInput, categoryInput])

  /**
   * Display the search input
   * @returns {string} - The search input
   */
  const displaySearch = isHomePage ? searchInput : (filters.search || '')

  /**
   * Display the category input
   * @returns {string} - The category input
   */
  const displayCategory = isHomePage ? categoryInput : (filters.category || '')

  /**
   * Render the search bar
   * @returns {JSX.Element} - The search bar
   */
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={displaySearch}
            onChange={handleSearchChange}
            placeholder="Nach Events suchen..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="w-full md:w-48">
          <select
            aria-label="Kategorie auswählen"
            value={displayCategory}
            onChange={handleCategoryChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Alle Kategorien</option>
            <option value="Konzert">Konzerte</option>
            <option value="Workshop">Workshops</option>
            <option value="Networking">Networking</option>
            <option value="Sport">Sport</option>
            <option value="Kultur">Kultur</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isHomePage ? 'Events entdecken' : 'Suchen'}
        </button>
      </div>
    </form>
  )
}

export default SearchBar