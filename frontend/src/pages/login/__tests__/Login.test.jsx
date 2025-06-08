import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Login from '../Login'

const mockLogin = vi.fn().mockImplementation(async () => ({
  success: true,
  error: null
}))

const mockUseAuth = vi.fn(() => ({
  login: mockLogin
}))

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }) => <>{children}</>
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: { from: { pathname: '/dashboard' } } })
  }
})

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLogin.mockReset()
  })

  it('rendert die Login-Seite korrekt', () => {
    renderWithProviders(<Login />)
    
    expect(screen.getByRole('heading', { name: 'Anmelden' })).toBeInTheDocument()
    expect(screen.getByLabelText('E-Mail-Adresse')).toBeInTheDocument()
    expect(screen.getByLabelText('Passwort')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Anmelden' })).toBeInTheDocument()
    expect(screen.getByText('Passwort vergessen?')).toBeInTheDocument()
    expect(screen.getByText('registriere dich für ein neues Konto')).toBeInTheDocument()
  })

  describe('Formularvalidierung', () => {
    it('akzeptiert gültige Eingaben', async () => {
      renderWithProviders(<Login />)
      
      const emailInput = screen.getByLabelText('E-Mail-Adresse')
      const passwordInput = screen.getByLabelText('Passwort')
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      
      const submitButton = screen.getByRole('button', { name: 'Anmelden' })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.queryByText('E-Mail ist erforderlich')).not.toBeInTheDocument()
        expect(screen.queryByText('Passwort ist erforderlich')).not.toBeInTheDocument()
      })
    })
  })

  describe('Login-Prozess', () => {
    it('zeigt Ladezustand während des Logins', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ success: true, error: null }), 100)
      ))
      
      renderWithProviders(<Login />)
      
      fireEvent.change(screen.getByLabelText('E-Mail-Adresse'), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByLabelText('Passwort'), {
        target: { value: 'password123' }
      })
      
      const submitButton = screen.getByRole('button', { name: 'Anmelden' })
      fireEvent.click(submitButton)
      
      expect(screen.getByText('Anmelden...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('navigiert nach erfolgreichem Login', async () => {
      mockLogin.mockResolvedValue({ success: true })
      
      renderWithProviders(<Login />)
      
      fireEvent.change(screen.getByLabelText('E-Mail-Adresse'), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByLabelText('Passwort'), {
        target: { value: 'password123' }
      })
      
      const submitButton = screen.getByRole('button', { name: 'Anmelden' })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
      })
    })

    it('zeigt Fehlermeldung bei fehlgeschlagenem Login', async () => {
      mockLogin.mockResolvedValue({ 
        success: false, 
        error: 'Ungültige Anmeldedaten' 
      })
      
      renderWithProviders(<Login />)
      
      fireEvent.change(screen.getByLabelText('E-Mail-Adresse'), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByLabelText('Passwort'), {
        target: { value: 'wrong-password' }
      })
      
      const submitButton = screen.getByRole('button', { name: 'Anmelden' })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Ungültige Anmeldedaten')).toBeInTheDocument()
      })
    })
  })
})