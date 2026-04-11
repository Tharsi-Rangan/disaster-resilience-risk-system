import { useState } from 'react'
import { Cloud, ExternalLink, MapPin, X } from 'lucide-react'

function WeatherDetailsModal({ snapshot, projectLocation = null, projectName = 'Project' }) {
  const [isOpen, setIsOpen] = useState(false)
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

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
  const lat = Number(
    projectLocation?.latitude ??
      projectLocation?.lat ??
      projectLocation?.location?.latitude ??
      projectLocation?.location?.lat
  )
  const lng = Number(
    projectLocation?.longitude ??
      projectLocation?.lng ??
      projectLocation?.location?.longitude ??
      projectLocation?.location?.lng
  )
  const hasValidLocation = Number.isFinite(lat) && Number.isFinite(lng)
  const encodedQuery = encodeURIComponent(`${lat},${lng}`)

  const mapURL = hasValidLocation
    ? googleMapsApiKey
      ? `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${encodedQuery}&zoom=14&maptype=roadmap`
      : `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`
    : ''

  const externalMapLink = hasValidLocation
    ? `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`
    : ''

  if (!hasWeatherData) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800/20 bg-linear-to-r from-slate-900 via-slate-800 to-indigo-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-slate-900/10 transition hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
      >
        <Cloud className="h-4 w-4 transition group-hover:rotate-6" />
        View Location + Weather Map
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-2 sm:p-4">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 bg-linear-to-r from-slate-50 via-white to-indigo-50 px-4 py-4 sm:px-6 sm:py-5">
              <div>
                <h2 className="pr-3 text-base font-bold text-slate-900 sm:text-xl">Location and Weather Intelligence</h2>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">Live map context and atmospheric metrics for the selected project.</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-6">
              <div className="mb-4 rounded-xl border border-slate-200 bg-linear-to-r from-slate-50 to-indigo-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Selected Project
                    </p>
                    <p className="mt-1 text-base font-bold text-slate-900">{projectName}</p>
                  </div>
                  <div className="text-left text-sm text-slate-600 sm:text-right">
                    <p>
                      <strong>Source:</strong> {snapshot.source || 'Unknown'}
                    </p>
                    <p>
                      <strong>Fetched:</strong> {new Date(snapshot.fetchedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {hasValidLocation ? (
                <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-linear-to-r from-slate-50 to-indigo-50 px-4 py-2 text-sm text-slate-700">
                    <div className="inline-flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <span className="font-semibold">{projectName}</span>
                      <span className="text-slate-500">{lat.toFixed(4)}, {lng.toFixed(4)}</span>
                    </div>
                    <a
                      href={externalMapLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
                    >
                      Open in Maps
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <div className="h-56 w-full bg-slate-100 sm:h-72">
                    <iframe
                      key={`${projectName}-${lat}-${lng}`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      src={mapURL}
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>
              ) : (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Map is unavailable because project coordinates are missing.
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {weatherDetails.map((detail) => (
                  <div
                    key={detail.label}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">
                          {detail.label}
                        </p>
                        <p className="text-xl font-bold text-slate-900 sm:text-2xl">
                          {detail.value !== null && detail.value !== undefined ? detail.value : 'N/A'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{detail.unit}</p>
                      </div>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-2xl sm:text-3xl">{detail.icon}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
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

            <div className="border-t border-slate-200 p-4 sm:p-6">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full rounded-lg bg-linear-to-r from-slate-900 to-indigo-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-slate-800 hover:to-indigo-800"
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
