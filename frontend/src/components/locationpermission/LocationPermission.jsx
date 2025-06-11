import { useState } from 'react'

/**
 * LocationPermission component
 * @param {Object} props - The component props
 * @param {Function} props.onPermissionGranted - Callback when permission is granted
 * @returns {JSX.Element} - The LocationPermission component
 */
const LocationPermission = ({ onPermissionGranted }) => {
  const [error, setError] = useState(null)

  const handlePermissionRequest = async () => {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        })
      })
      
      onPermissionGranted(position.coords)
      setError(null)
    } catch (err) {
      console.error('Standortabfrage fehlgeschlagen:', err)
      setError(
        err.code === 1 ? 'Standortzugriff wurde verweigert' :
        err.code === 2 ? 'Standort konnte nicht ermittelt werden' :
        err.code === 3 ? 'Standortabfrage hat zu lange gedauert' :
        'Ein Fehler ist bei der Standortabfrage aufgetreten'
      )
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Events in deiner Nähe entdecken
        </h2>
        <p className="text-gray-600 mb-4">
          Um dir Events in deiner Umgebung anzuzeigen, benötigen wir Zugriff auf deinen Standort.
          Deine Daten werden nur für diese Funktion verwendet und nicht gespeichert.
        </p>
        
        {error && (
          <p className="text-red-600 mb-4">
            {error}
          </p>
        )}
        
        <button
          onClick={handlePermissionRequest}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Standortzugriff erlauben
        </button>
      </div>
    </div>
  )
}

export default LocationPermission 