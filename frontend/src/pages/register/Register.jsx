import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

/**
 * Register component
 * @returns {JSX.Element} - The register component
 */
const Register = () => {
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  /**
   * Validate the form
   * @returns {boolean} - Whether the form is valid
   */
  const validateForm = () => {
    const newErrors = {}
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Vorname ist erforderlich'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Nachname ist erforderlich'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
    }
    if (formData.password.length < 8) {
      newErrors.password = 'Das Passwort muss mindestens 8 Zeichen lang sein'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Die Passwörter stimmen nicht überein'
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Bitte akzeptiere die Nutzungsbedingungen'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handle the submit
   * @param {Event} e - The event
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const { ...registerData } = formData
      const result = await register(registerData)
      
      if (!result.success) {
        setSubmitError(result.error || 'Registrierung fehlgeschlagen')
      }
    } catch (error) {
      setSubmitError('Ein unerwarteter Fehler ist aufgetreten')
      console.error('Registrierungs-Fehler:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Handle the change
   * @param {Event} e - The event
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  /**
   * Render the register
   * @returns {JSX.Element} - The register
   */
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Neues Konto erstellen
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Oder{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            melde dich mit deinem bestehenden Konto an
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {submitError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Vorname
                </label>
                <div className="mt-1">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Nachname
                </label>
                <div className="mt-1">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-Mail-Adresse
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Passwort
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Passwort bestätigen
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                  errors.acceptTerms ? 'border-red-300' : ''
                }`}
              />
              <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
                Ich akzeptiere die{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Nutzungsbedingungen
                </a>{' '}
                und{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Datenschutzerklärung
                </a>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-red-600">{errors.acceptTerms}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSubmitting 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {isSubmitting ? 'Registriere...' : 'Registrieren'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register 