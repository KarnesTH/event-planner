import { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE_URL = 'http://localhost:5000/api/v1'

const AuthContext = createContext(null)

/**
 * AuthProvider component
 * @param {Object} children - The children components
 * @returns {JSX.Element} - The AuthProvider component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUserData(token)
    } else {
      setLoading(false)
    }
  }, [])

  /**
   * Fetch the user data
   * @param {string} token - The token
   */
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

  /**
   * Login function
   * @param {string} email - The email
   * @param {string} password - The password
   * @returns {Object} - The login response
   */
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

  /**
   * Register function
   * @param {Object} userData - The user data
   * @returns {Object} - The register response
   */
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

  /**
   * Logout function
   */
  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    navigate('/')
  }

  /**
   * Auth context value
   * @returns {Object} - The auth context value
   */
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

export default AuthContext