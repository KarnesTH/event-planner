import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

const Settings = () => {
  const { user: authUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [userData, setUserData] = useState(null)

  // Formular-Zustände
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: ''
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        setProfileForm({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email
        })
      } catch (err) {
        console.error('Fehler beim Laden der Daten:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const validateProfileForm = () => {
    const errors = {}
    if (!profileForm.firstName.trim()) {
      errors.firstName = 'Vorname ist erforderlich'
    }
    if (!profileForm.lastName.trim()) {
      errors.lastName = 'Nachname ist erforderlich'
    }
    if (!profileForm.email.trim()) {
      errors.email = 'E-Mail ist erforderlich'
    } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
      errors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validatePasswordForm = () => {
    const errors = {}
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Aktuelles Passwort ist erforderlich'
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = 'Neues Passwort ist erforderlich'
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Das Passwort muss mindestens 8 Zeichen lang sein'
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Die Passwörter stimmen nicht überein'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSuccessMessage('')
    setError(null)

    if (!validateProfileForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/v1/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileForm)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Fehler beim Aktualisieren des Profils')
      }

      setSuccessMessage('Profil erfolgreich aktualisiert')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setSuccessMessage('')
    setError(null)

    if (!validatePasswordForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/v1/auth/update-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Fehler beim Ändern des Passworts')
      }

      setSuccessMessage('Passwort erfolgreich geändert')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target
    if (formType === 'profile') {
      setProfileForm(prev => ({ ...prev, [name]: value }))
    } else {
      setPasswordForm(prev => ({ ...prev, [name]: value }))
    }
    // Fehler zurücksetzen, wenn das Feld bearbeitet wird
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && !userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Fehler beim Laden</h2>
          <p className="text-gray-600">{error}</p>
          <Link 
            to="/login" 
            className="text-blue-600 hover:text-blue-800 mt-4 inline-block"
          >
            Zurück zum Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Einstellungen</h1>
            <Link 
              to="/profile" 
              className="text-blue-600 hover:text-blue-800"
            >
              ← Zurück zum Profil
            </Link>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Profil bearbeiten
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`${
                  activeTab === 'password'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Passwort ändern
              </button>
            </nav>
          </div>

          {/* Erfolgsmeldung */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          {/* Fehlermeldung */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Profil-Formular */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    Vorname
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={profileForm.firstName}
                    onChange={(e) => handleInputChange(e, 'profile')}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      formErrors.firstName ? 'border-red-300' : ''
                    }`}
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Nachname
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={profileForm.lastName}
                    onChange={(e) => handleInputChange(e, 'profile')}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      formErrors.lastName ? 'border-red-300' : ''
                    }`}
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    E-Mail-Adresse
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileForm.email}
                    onChange={(e) => handleInputChange(e, 'profile')}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      formErrors.email ? 'border-red-300' : ''
                    }`}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Wird gespeichert...' : 'Änderungen speichern'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Passwort-Formular */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Aktuelles Passwort
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={(e) => handleInputChange(e, 'password')}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      formErrors.currentPassword ? 'border-red-300' : ''
                    }`}
                  />
                  {formErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    Neues Passwort
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={(e) => handleInputChange(e, 'password')}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      formErrors.newPassword ? 'border-red-300' : ''
                    }`}
                  />
                  {formErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Neues Passwort bestätigen
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => handleInputChange(e, 'password')}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      formErrors.confirmPassword ? 'border-red-300' : ''
                    }`}
                  />
                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Wird gespeichert...' : 'Passwort ändern'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings 