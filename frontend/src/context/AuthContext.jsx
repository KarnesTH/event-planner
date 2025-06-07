import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE_URL = 'http://localhost:5000/api/v1'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Beim Start der App prüfen, ob ein Token existiert
    const token = localStorage.getItem('token')
    if (token) {
      fetchUserData(token)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const { user: userData } = await response.json()
        setUser(userData)
      } else {
        // Token ungültig
        localStorage.removeItem('token')
        setUser(null)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Benutzerdaten:', error)
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Login fehlgeschlagen')
      }

      const { token, user: userData } = await response.json()
      localStorage.setItem('token', token)
      setUser(userData)
      navigate('/dashboard')
      return { success: true }
    } catch (error) {
      console.error('Login-Fehler:', error)
      return { success: false, error: error.message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Registrierung fehlgeschlagen')
      }

      const { token, user: newUser } = await response.json()
      localStorage.setItem('token', token)
      setUser(newUser)
      navigate('/dashboard')
      return { success: true }
    } catch (error) {
      console.error('Registrierungs-Fehler:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    navigate('/')
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth muss innerhalb eines AuthProviders verwendet werden')
  }
  return context
}

export default AuthContext 