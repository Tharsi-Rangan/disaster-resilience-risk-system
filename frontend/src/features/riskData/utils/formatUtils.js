/**
 * Format utilities for risk data display
 */

export const formatDate = (date) => {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined) return 'N/A'
  return Number(num).toFixed(decimals)
}

export const formatDistance = (km) => {
  if (km === null || km === undefined) return 'N/A'
  if (km < 1) return `${(km * 1000).toFixed(0)} m`
  return `${km.toFixed(2)} km`
}

export const formatPressure = (hPa) => {
  if (hPa === null || hPa === undefined || hPa === 0) return 'N/A'
  return `${hPa} hPa`
}

export const formatVisibility = (meters) => {
  if (meters === null || meters === undefined || meters === 0) return 'N/A'
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`
  }
  return `${meters.toFixed(0)} m`
}

export const formatMagnitude = (mag) => {
  if (mag === null || mag === undefined) return 'N/A'
  return `M${formatNumber(mag, 1)}`
}
