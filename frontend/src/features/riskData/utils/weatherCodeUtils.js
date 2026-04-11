/**
 * WMO Weather Code Mappings (Open-Meteo standard)
 * Reference: https://open-meteo.com/en/docs
 */
export const weatherCodeMap = {
  0: { label: 'Clear sky', icon: '☀️', color: 'text-yellow-600' },
  1: { label: 'Mainly clear', icon: '🌤️', color: 'text-yellow-500' },
  2: { label: 'Partly cloudy', icon: '⛅', color: 'text-slate-500' },
  3: { label: 'Overcast', icon: '☁️', color: 'text-slate-600' },
  45: { label: 'Foggy', icon: '🌫️', color: 'text-slate-500' },
  48: { label: 'Depositing rime fog', icon: '🌫️', color: 'text-slate-500' },
  51: { label: 'Light drizzle', icon: '🌧️', color: 'text-blue-500' },
  53: { label: 'Moderate drizzle', icon: '🌧️', color: 'text-blue-600' },
  55: { label: 'Dense drizzle', icon: '⛈️', color: 'text-blue-700' },
  61: { label: 'Slight rain', icon: '🌧️', color: 'text-blue-500' },
  63: { label: 'Moderate rain', icon: '🌧️', color: 'text-blue-600' },
  65: { label: 'Heavy rain', icon: '⛈️', color: 'text-blue-800' },
  71: { label: 'Slight snow', icon: '❄️', color: 'text-cyan-400' },
  73: { label: 'Moderate snow', icon: '❄️', color: 'text-cyan-500' },
  75: { label: 'Heavy snow', icon: '❄️', color: 'text-cyan-600' },
  77: { label: 'Snow grains', icon: '❄️', color: 'text-cyan-500' },
  80: { label: 'Slight rain showers', icon: '🌧️', color: 'text-blue-500' },
  81: { label: 'Moderate rain showers', icon: '🌧️', color: 'text-blue-600' },
  82: { label: 'Violent rain showers', icon: '⛈️', color: 'text-blue-900' },
  85: { label: 'Slight snow showers', icon: '❄️', color: 'text-cyan-500' },
  86: { label: 'Heavy snow showers', icon: '❄️', color: 'text-cyan-600' },
  95: { label: 'Thunderstorm', icon: '⛈️', color: 'text-red-600' },
  96: { label: 'Thunderstorm with hail', icon: '⛈️', color: 'text-red-700' },
  99: { label: 'Thunderstorm with hail', icon: '⛈️', color: 'text-red-800' },
  // OpenWeather-specific codes (fallback)
  800: { label: 'Clear sky', icon: '☀️', color: 'text-yellow-600' },
  801: { label: 'Few clouds', icon: '🌤️', color: 'text-yellow-500' },
  802: { label: 'Scattered clouds', icon: '⛅', color: 'text-slate-500' },
  803: { label: 'Broken clouds', icon: '☁️', color: 'text-slate-600' },
  804: { label: 'Overcast', icon: '☁️', color: 'text-slate-700' },
}

export const getWeatherDescription = (code) => {
  if (!code) return { label: 'N/A', icon: '?', color: 'text-slate-400' }
  return weatherCodeMap[code] || { label: `Code ${code}`, icon: '?', color: 'text-slate-400' }
}
