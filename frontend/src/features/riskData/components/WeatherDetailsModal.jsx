import { useState } from 'react'
import { Cloud, X } from 'lucide-react'

function WeatherDetailsModal({ snapshot }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!snapshot) return null

  const weatherDetails = [
    {
      label: 'Pressure',
      value: snapshot.pressure,
      unit: 'hPa',
      icon: '🔽'
    },
    {
      label: 'Visibility',
      value: snapshot.visibility,
      unit: 'm',
      icon: '👁️'
    },
    {
      label: 'Humidity',
      value: snapshot.humidity,
      unit: '%',
      icon: '💧'
    },
    {
      label: 'Cloudiness',
      value: snapshot.cloudiness,
      unit: '%',
      icon: '☁️'
    },
    {
      label: 'Temperature',
      value: snapshot.temperature,
      unit: '°C',
      icon: '🌡️'
    },
    {
      label: 'Wind Speed',
      value: snapshot.windSpeed,
      unit: 'm/s',
      icon: '💨'
    },
    {
      label: 'Rainfall',
      value: snapshot.rainfall,
      unit: 'mm',
      icon: '🌧️'
    },
    {
      label: 'Weather Code',
      value: snapshot.weatherCode || 'N/A',
      unit: 'WMO',
      icon: '📡'
    }
  ]

  const hasWeatherData = weatherDetails.some((d) => d.value !== null && d.value !== undefined)

  if (!hasWeatherData) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-400"
      >
        <Cloud className="h-4 w-4" />
        View Weather Details
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900">Weather Details</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Source:</strong> {snapshot.source || 'Unknown'} • <strong>Fetched:</strong>{' '}
                  {new Date(snapshot.fetchedAt).toLocaleString()}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {weatherDetails.map((detail) => (
                  <div
                    key={detail.label}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">
                          {detail.label}
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                          {detail.value !== null && detail.value !== undefined ? detail.value : 'N/A'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{detail.unit}</p>
                      </div>
                      <span className="text-3xl">{detail.icon}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-lg bg-slate-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">
                  Weather Code (WMO)
                </p>
                <p className="text-sm text-slate-700">
                  {snapshot.weatherCode
                    ? `Code ${snapshot.weatherCode} - Refer to WMO Weather Codes standard`
                    : 'Not available'}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 p-6">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default WeatherDetailsModal
