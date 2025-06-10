import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

const mockGeolocation = {
  getCurrentPosition: vi.fn()
    .mockImplementation((success) => 
      success({
        coords: {
          latitude: 51.6775,
          longitude: 8.3403,
          accuracy: 1,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        }
      })
    ),
  watchPosition: vi.fn(),
  clearWatch: vi.fn()
}

const mockFetch = vi.fn()

Object.defineProperty(globalThis.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true
})
globalThis.fetch = mockFetch

globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) 