import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

/**
 * Profile component
 * @returns {JSX.Element} - The profile component
 */
const Profile = () => {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /**
   * Fetch the user data
   */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Nicht angemeldet')
        }

        const response = await fetch('http://localhost:5000/api/v1/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Fehler beim Laden der Benutzerdaten')
        }

        const data = await response.json()
        setUserData(data)
      } catch (err) {
        console.error('Fehler beim Laden der Daten:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  /**
   * Render the loading state
   * @returns {JSX.Element} - The loading state
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  /**
   * Render the error state
   * @returns {JSX.Element} - The error state
   */
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Fehler beim Laden</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  /**
   * Render the user not found state
   * @returns {JSX.Element} - The user not found state
   */
  if (!userData?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Keine Benutzerdaten gefunden</h2>
          <Link 
            to="/login" 
            className="text-blue-600 hover:text-blue-800"
          >
            Zurück zum Login
          </Link>
        </div>
      </div>
    )
  }

  const profileUser = userData.user

  /**
   * Render the profile
   * @returns {JSX.Element} - The profile
   */
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Profil</h1>
            <Link 
              to="/settings" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Einstellungen
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Profil-Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-8">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-blue-600 text-4xl font-semibold">
                  {profileUser.firstName[0]}
                </div>
                <div className="text-white">
                  <h2 className="text-2xl font-semibold">
                    {profileUser.firstName} {profileUser.lastName}
                  </h2>
                  <p className="text-blue-100 mt-1">{profileUser.email}</p>
                </div>
              </div>
            </div>

            {/* Profil-Informationen */}
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Über mich</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Vorname</p>
                    <p className="mt-1 text-gray-900">{profileUser.firstName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nachname</p>
                    <p className="mt-1 text-gray-900">{profileUser.lastName}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">E-Mail-Adresse</p>
                    <p className="mt-1 text-gray-900">{profileUser.email}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiken</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500">Organisierte Events</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      {userData.events?.organized?.length || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500">Teilgenommene Events</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      {userData.events?.participating?.length || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500">Mitglied seit</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      {new Date(profileUser.createdAt).toLocaleDateString('de-DE', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <Link 
              to="/dashboard" 
              className="text-blue-600 hover:text-blue-800"
            >
              ← Zurück zum Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile 