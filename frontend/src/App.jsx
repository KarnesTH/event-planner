import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Navbar from './components/navbar/Navbar'
import Home from './pages/home/Home'
import EventsPage from './pages/events/EventsPage'
import AboutPage from './pages/about/AboutPage'
import Login from './pages/login/Login'
import Register from './pages/register/Register'
import EventDetail from './components/eventdetail/EventDetail'
import Dashboard from './pages/dashboard/Dashboard'
import Profile from './pages/profile/Profile'
import Settings from './pages/settings/Settings'
import Footer from './components/footer/Footer'

const fetchEvents = async ({ searchTerm = '', category = '' }) => {
  try {
    const token = localStorage.getItem('token')
    const headers = {
      'Content-Type': 'application/json'
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const queryParams = new URLSearchParams()
    if (searchTerm) queryParams.append('search', searchTerm)
    if (category && category !== 'Alle Kategorien') queryParams.append('category', category)

    const response = await fetch(
      `http://localhost:5000/api/v1/events?${queryParams.toString()}`,
      { headers }
    )

    if (!response.ok) {
      throw new Error('Fehler beim Laden der Events')
    }

    return await response.json()
  } catch (error) {
    console.error('Fehler beim Laden der Events:', error)
    throw error
  }
}

const fetchNearbyEvents = async ({ searchTerm = '', category = '' }) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Bitte melden Sie sich an, um Events in Ihrer Nähe zu sehen')
    }

    const queryParams = new URLSearchParams()
    if (searchTerm) queryParams.append('search', searchTerm)
    if (category && category !== 'Alle Kategorien') queryParams.append('category', category)

    const response = await fetch(
      `http://localhost:5000/api/v1/events/nearby?${queryParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Fehler beim Laden der Events in der Nähe')
    }

    return await response.json()
  } catch (error) {
    console.error('Fehler beim Laden der Events in der Nähe:', error)
    throw error
  }
}

/**
 * Main App component
 * @returns {JSX.Element}
 */
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home fetchEvents={fetchEvents} fetchNearbyEvents={fetchNearbyEvents} />} />
              <Route path="/events" element={<EventsPage fetchEvents={fetchEvents} fetchNearbyEvents={fetchNearbyEvents} />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/events/:id" element={<EventDetail />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
