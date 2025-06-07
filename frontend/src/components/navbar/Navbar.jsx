import { Link } from 'react-router-dom'
import { useState } from 'react'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
            <img src="/logo.svg" alt="Event Planner Logo" className="h-8 w-8" />
            <span className="font-semibold text-xl">Event Planner</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-blue-200 transition-colors duration-200">Home</Link>
            <Link to="/events" className="hover:text-blue-200 transition-colors duration-200">Veranstaltungen</Link>
            <Link to="/about" className="hover:text-blue-200 transition-colors duration-200">Über uns</Link>
            <Link to="/login" className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md transition-colors duration-200">
              Anmelden
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={toggleMenu} className="md:hidden p-2 rounded-md hover:bg-blue-700 focus:outline-none">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="hover:text-blue-200 transition-colors duration-200">Home</Link>
              <Link to="/events" className="hover:text-blue-200 transition-colors duration-200">Veranstaltungen</Link>
              <Link to="/about" className="hover:text-blue-200 transition-colors duration-200">Über uns</Link>
              <Link to="/login" className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md transition-colors duration-200 inline-block">
                Anmelden
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar