import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SystemInsights from './SystemInsights'

describe('SystemInsights', () => {
  it('renders key warning insights for high-risk snapshot', () => {
    render(
      <SystemInsights
        snapshot={{
          humidity: 85,
          cloudiness: 82,
          earthquakeCount: 0,
          maxEarthquakeMagnitude: null,
          nearestEarthquakeDistanceKm: null,
          floodRiskIndex: 80,
          temperature: 36,
        }}
      />
    )

    expect(screen.getByText(/system insights/i)).toBeInTheDocument()
    expect(
      screen.getByText(/high humidity detected\. potential for moisture-related damage and mold growth\./i)
    ).toBeInTheDocument()
    expect(screen.getByText(/heavy cloud cover\. increased chance of precipitation\./i)).toBeInTheDocument()
    expect(
      screen.getByText(/seismic data may be unavailable or no events detected\./i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/high flood risk\. activate emergency protocols if applicable\./i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/high temperature detected\. risk of heat damage to sensitive equipment\./i)
    ).toBeInTheDocument()
  })

  it('renders nothing when no snapshot is provided', () => {
    const { container } = render(<SystemInsights snapshot={null} />)
    expect(container).toBeEmptyDOMElement()
  })
})
