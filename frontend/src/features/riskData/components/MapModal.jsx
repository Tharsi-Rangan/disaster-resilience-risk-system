import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { MapPinned, X } from 'lucide-react'

function MapModal({ projectLocation, projectName, projectOverview = null, latestSnapshot = null }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  if (!projectLocation) return null

  const lat = Number(projectLocation.latitude ?? projectLocation.lat)
  const lng = Number(projectLocation.longitude ?? projectLocation.lng)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const hasGoogleEmbedKey = Boolean(googleMapsApiKey)
  const googleMapURL = `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${lat},${lng}&zoom=14&maptype=roadmap`
  const osmMapURL = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`
  const mapURL = hasGoogleEmbedKey ? googleMapURL : osmMapURL
  const overviewType = projectOverview?.projectType || projectOverview?.type || 'N/A'
  const overviewStatus = projectOverview?.status || 'N/A'
  const overviewLocation =
    projectOverview?.location?.address ||
    projectOverview?.address ||
    projectOverview?.locationName ||
    `${lat.toFixed(4)}, ${lng.toFixed(4)}`

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-400"
      >
        <MapPinned className="h-4 w-4" />
        View Location Map
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/35 p-3 backdrop-blur-sm sm:p-4">
          <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
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

            <div className="p-6">
              <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Project Overview</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <p className="text-sm text-slate-700"><strong>Name:</strong> {projectName || 'Project'}</p>
                  <p className="text-sm text-slate-700"><strong>Type:</strong> {overviewType}</p>
                  <p className="text-sm text-slate-700"><strong>Status:</strong> {overviewStatus}</p>
                  <p className="text-sm text-slate-700"><strong>Location:</strong> {overviewLocation}</p>
                </div>
              </div>

              <div className="mb-4 rounded-lg bg-slate-50 p-3">
                <p className="text-sm text-slate-600">
                  <strong>Coordinates:</strong> {lat.toFixed(4)}, {lng.toFixed(4)}
                </p>
              </div>

              {latestSnapshot && (
                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Latest Hazard Snapshot</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <p className="text-sm text-blue-900"><strong>Flood Risk:</strong> {latestSnapshot.floodRiskIndex ?? 'N/A'}</p>
                    <p className="text-sm text-blue-900"><strong>Earthquakes:</strong> {latestSnapshot.earthquakeCount ?? 'N/A'}</p>
                    <p className="text-sm text-blue-900"><strong>Temperature:</strong> {latestSnapshot.temperature ?? 'N/A'}{latestSnapshot.temperature !== null && latestSnapshot.temperature !== undefined ? ' °C' : ''}</p>
                    <p className="text-sm text-blue-900"><strong>Fetched:</strong> {latestSnapshot.fetchedAt ? new Date(latestSnapshot.fetchedAt).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
              )}

              <div className="h-56 w-full overflow-hidden rounded-lg border border-slate-200 sm:h-72 md:h-96">
                <iframe
                  key={`${lat}-${lng}-${hasGoogleEmbedKey ? 'google' : 'osm'}`}
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
                {hasGoogleEmbedKey
                  ? 'Map provided by Google Maps'
                  : 'Map provided by © OpenStreetMap contributors'}
              </p>
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
        </div>,
        document.body
      )}
    </>
  )
}

export default MapModal
