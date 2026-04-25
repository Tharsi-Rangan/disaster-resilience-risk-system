import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import WeatherDetailsModal from './WeatherDetailsModal'

describe('WeatherDetailsModal', () => {
  const baseSnapshot = {
    pressure: 1011,
    visibility: 10000,
    humidity: 88,
    cloudiness: 80,
    temperature: 27.82,
    windSpeed: 2.24,
    rainfall: 0,
    weatherCode: 803,
    elevation: 12.5,
    source: 'OpenWeather/USGS',
    fetchedAt: '2026-04-11T16:19:57.000Z',
  }

  it('opens and shows weather snapshot details', async () => {
    const user = userEvent.setup()

    render(<WeatherDetailsModal snapshot={baseSnapshot} />)

    await user.click(screen.getByRole('button', { name: /view weather details/i }))

    expect(screen.getByRole('dialog', { name: /weather details/i })).toBeTruthy()
    expect(screen.getByText(/live weather intelligence/i)).toBeTruthy()
    expect(screen.getByText(/snapshot meta/i)).toBeTruthy()
    expect(screen.getByText(/source:/i)).toBeTruthy()
    expect(screen.getByText(/openweather\/usgs/i)).toBeTruthy()
    expect(screen.getByText(/pressure/i)).toBeTruthy()
    expect(screen.getByText(/humidity/i)).toBeTruthy()
    expect(screen.getByText(/weather code \(wmo\)/i)).toBeTruthy()
    expect(screen.getByText(/code 803 - refer to wmo weather codes standard/i)).toBeTruthy()
  })

  it('shows fallback elevation text and closes cleanly', async () => {
    const user = userEvent.setup()

    render(
      <WeatherDetailsModal
        snapshot={{
          ...baseSnapshot,
          elevation: null,
        }}
      />
    )

    await user.click(screen.getByRole('button', { name: /view weather details/i }))

    expect(screen.getByText(/elevation data unavailable/i)).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /done/i }))

    expect(screen.queryByRole('dialog', { name: /weather details/i })).toBeNull()
  })
})
