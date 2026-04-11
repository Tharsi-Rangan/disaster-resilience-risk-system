import { useState } from 'react'
import { MapPinned, X } from 'lucide-react'

function MapModal({ projectLocation, projectName, snapshot = null }) {
  const [isOpen, setIsOpen] = useState(false)
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  if (!projectLocation) return null

  const lat = Number(
    projectLocation.latitude ??
      projectLocation.lat ??
      projectLocation.location?.latitude ??
      projectLocation.location?.lat
  )
  const lng = Number(
    projectLocation.longitude ??
      projectLocation.lng ??
      projectLocation.location?.longitude ??
      projectLocation.location?.lng
  )

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  const rainfall = snapshot?.rainfall ?? null
  const temperature = snapshot?.temperature ?? null
  const humidity = snapshot?.humidity ?? null
  const floodRiskIndex = snapshot?.floodRiskIndex ?? null
  const earthquakeCount = snapshot?.earthquakeCount ?? null

  const mapURL = googleMapsApiKey
    ? `https://www.google.com/maps/embed/v1/view?key=${googleMapsApiKey}&center=${lat},${lng}&zoom=14&maptype=roadmap`
    : `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md"
      >
        <MapPinned className="h-4 w-4 transition group-hover:rotate-6" />
        View Location Map
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-2 sm:p-4">
          <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-linear-to-r from-slate-50 via-white to-indigo-50 p-6">
              <h2 className="text-xl font-bold text-slate-900">
                {projectName || 'Project'} Location
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[2fr_1fr]">
              <div>
                <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm text-slate-600">
                    <strong>Coordinates:</strong> {lat.toFixed(4)}, {lng.toFixed(4)}
                  </p>
                </div>

                <div className="h-72 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 sm:h-96">
                  <iframe
                    key={`${lat}-${lng}`}
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

                <p className="mt-3 text-xs text-slate-500">
                  {googleMapsApiKey
                    ? 'Map provided by Google Maps'
                    : 'Map provided by OpenStreetMap contributors'}
                </p>
              </div>

              <aside className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                  Latest Hazard Details
                </h3>
                <div className="mt-3 space-y-3 text-sm text-slate-700">
                  <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2">
                    <span>Temperature</span>
                    <strong>{temperature != null ? `${temperature} degC` : 'N/A'}</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2">
                    <span>Humidity</span>
                    <strong>{humidity != null ? `${humidity}%` : 'N/A'}</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2">
                    <span>Rainfall</span>
                    <strong>{rainfall != null ? `${rainfall} mm` : 'N/A'}</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2">
                    <span>Flood Risk Index</span>
                    <strong>{floodRiskIndex != null ? floodRiskIndex : 'N/A'}</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2">
                    <span>Earthquake Count</span>
                    <strong>{earthquakeCount != null ? earthquakeCount : 'N/A'}</strong>
                  </div>
                </div>
              </aside>
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

export default MapModal
