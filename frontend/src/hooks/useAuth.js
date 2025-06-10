import { useContext } from "react"
import AuthContext from "../context/AuthContext"

/**
 * useAuth hook
 * @returns {Object} - The useAuth hook
 */
const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
      throw new Error('useAuth muss innerhalb eines AuthProviders verwendet werden')
    }
    return context
  }

  export default useAuth