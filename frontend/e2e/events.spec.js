import { test, expect } from '@playwright/test'

const mockEvents = [
  {
    _id: '1',
    title: 'Test Event 1',
    description: 'Test Description 1',
    date: new Date().toISOString(),
    endDate: new Date(Date.now() + 3600000).toISOString(),
    location: {
      name: 'Test Location',
      coordinates: {
        type: 'Point',
        coordinates: [8.3403, 51.6775]
      }
    },
    category: 'Workshop',
    status: 'published'
  },
  {
    _id: '2',
    title: 'Test Event 2',
    description: 'Test Description 2',
    date: new Date(Date.now() + 86400000).toISOString(),
    endDate: new Date(Date.now() + 90000000).toISOString(),
    location: {
      name: 'Andere Location',
      coordinates: {
        type: 'Point',
        coordinates: [8.3403, 51.6775]
      }
    },
    category: 'Konzert',
    status: 'published'
  }
]

test.describe('Events Seite', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/events**', async (route) => {
      const url = new URL(route.request().url())
      const searchTerm = url.searchParams.get('search')
      const category = url.searchParams.get('category')
      const lat = url.searchParams.get('lat')
      const lng = url.searchParams.get('lng')

      let filteredEvents = [...mockEvents]

      if (searchTerm) {
        filteredEvents = filteredEvents.filter(event => 
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      if (category) {
        filteredEvents = filteredEvents.filter(event => event.category === category)
      }

      if (lat && lng) {
        filteredEvents = [...mockEvents]
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(filteredEvents)
      })
    })

    await page.route('**/api/v1/events?lat=*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockEvents)
      })
    })

    await page.goto('/events')
    await page.waitForLoadState('networkidle')
    
    await page.waitForSelector('.container.mx-auto.px-4', { timeout: 10000 })
  })

  test('zeigt leere Eventliste an', async ({ page }) => {
    await page.route('**/api/v1/events**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })

    await page.reload()
    await page.waitForLoadState('networkidle')
    
    const emptyMessage = page.locator('.text-gray-500:has-text("Keine Events gefunden")')
    await expect(emptyMessage).toBeVisible({ timeout: 10000 })
  })

  test('zeigt Events in der Nähe an', async ({ page }) => {
    await page.evaluate(() => {
      navigator.geolocation.getCurrentPosition = (success) => {
        success({
          coords: {
            latitude: 51.6775,
            longitude: 8.3403
          }
        })
      }
    })

    const nearbyButton = page.locator('button:has-text("Events in meiner Nähe")')
    await nearbyButton.click()
    await page.waitForLoadState('networkidle')

    const eventCards = page.locator('.bg-white.rounded-lg.shadow-sm')
    await expect(eventCards).toHaveCount(2, { timeout: 10000 })
  })

  test('filtert Events nach Kategorie', async ({ page }) => {
    const categorySelect = page.locator('select.bg-white.border')
    await categorySelect.selectOption('Workshop')
    await page.waitForLoadState('networkidle')
    
    const eventCards = page.locator('.bg-white.rounded-lg.shadow-sm')
    await expect(eventCards).toHaveCount(1, { timeout: 10000 })
    await expect(page.locator('text=Test Event 1')).toBeVisible()
  })

  test('sucht nach Events', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Nach Events suchen..."]')
    await searchInput.fill('Test Event 2')
    await page.waitForLoadState('networkidle')
    
    const eventCards = page.locator('.bg-white.rounded-lg.shadow-sm')
    await expect(eventCards).toHaveCount(1, { timeout: 10000 })
    await expect(page.locator('text=Test Event 2')).toBeVisible()
  })

  test('zeigt Event-Details an', async ({ page }) => {
    const eventCard = page.locator('a[href="/events/1"]').first()
    await eventCard.click()
    await page.waitForLoadState('networkidle')
    
    await expect(page.locator('h1.text-4xl.font-bold')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Test Event 1')).toBeVisible()
    await expect(page.locator('text=Test Description 1')).toBeVisible()
  })

  test('zeigt Fehlermeldung bei API-Fehler', async ({ page }) => {
    await page.route('**/api/v1/events**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' })
      })
    })

    await page.reload()
    await page.waitForLoadState('networkidle')
    
    const errorMessage = page.locator('.text-red-500:has-text("Fehler beim Laden der Events")')
    await expect(errorMessage).toBeVisible({ timeout: 10000 })
  })
}) 