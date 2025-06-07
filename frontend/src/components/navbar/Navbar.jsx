import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/')
        } catch (error) {
            console.error('Logout fehlgeschlagen:', error)
        }
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const UserDropdown = () => (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
            >
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {user?.firstName?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden md:inline-block">{user?.firstName}</span>
                <svg 
                    className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                    >
                        Profil
                    </Link>
                    <button
                        onClick={() => {
                            setIsDropdownOpen(false)
                            handleLogout()
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Abmelden
                    </button>
                </div>
            )}
        </div>
    )

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
                        {user ? (
                            <UserDropdown />
                        ) : (
                            <Link 
                                to="/login" 
                                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md transition-colors duration-200"
                            >
                                Anmelden
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        onClick={toggleMenu} 
                        className="md:hidden p-2 rounded-md hover:bg-blue-700 focus:outline-none"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4">
                        <div className="flex flex-col space-y-4">
                            <Link 
                                to="/" 
                                className="hover:text-blue-200 transition-colors duration-200"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link 
                                to="/events" 
                                className="hover:text-blue-200 transition-colors duration-200"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Veranstaltungen
                            </Link>
                            <Link 
                                to="/about" 
                                className="hover:text-blue-200 transition-colors duration-200"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Über uns
                            </Link>
                            {user ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className="hover:text-blue-200 transition-colors duration-200"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className="hover:text-blue-200 transition-colors duration-200"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Profil
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false)
                                            handleLogout()
                                        }}
                                        className="text-left hover:text-blue-200 transition-colors duration-200"
                                    >
                                        Abmelden
                                    </button>
                                </>
                            ) : (
                                <Link 
                                    to="/login" 
                                    className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md transition-colors duration-200 inline-block"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Anmelden
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar