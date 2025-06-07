import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Navbar from './components/navbar/Navbar'
import Hero from './components/hero/Hero'
import EventList from './components/eventlist/EventList'
import EventsPage from './components/events/EventsPage'
import AboutPage from './components/about/AboutPage'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import EventDetail from './components/eventdetail/EventDetail'
import Dashboard from './components/dashboard/Dashboard'
import Footer from './components/footer/Footer'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                <>
                  <Hero />
                  <EventList />
                </>
              } />
              <Route path="/events" element={<EventsPage />} />
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
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
