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
    source: 'OpenWeather/USGS',
    fetchedAt: '2026-04-11T16:19:57.000Z',
  }

  it('opens and shows map unavailable message when coordinates are missing', async () => {
    const user = userEvent.setup()

    render(
      <WeatherDetailsModal
        snapshot={baseSnapshot}
        projectLocation={null}
        projectName="Test Project"
      />
    )

    await user.click(screen.getByRole('button', { name: /view location \+ weather map/i }))

    expect(screen.getByText(/location and weather intelligence/i)).toBeInTheDocument()
    expect(screen.getAllByText(/selected project/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/test project/i)).toBeInTheDocument()
    expect(
      screen.getByText(/map is unavailable because project coordinates are missing/i)
    ).toBeInTheDocument()
  })

  it('renders an embedded map and external map link when coordinates are provided', async () => {
    const user = userEvent.setup()

    render(
      <WeatherDetailsModal
        snapshot={baseSnapshot}
        projectLocation={{ location: { lat: 6.8783, lng: 79.8598 } }}
        projectName="Wellawatte"
      />
    )

    await user.click(screen.getByRole('button', { name: /view location \+ weather map/i }))

    expect(screen.getAllByText(/wellawatte/i).length).toBeGreaterThan(0)

    const mapLink = screen.getByRole('link', { name: /open in maps/i })
    expect(mapLink).toHaveAttribute('href', expect.stringContaining('google.com/maps/search'))

    const iframe = document.querySelector('iframe')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('src', expect.stringContaining('maps'))
  })
})
