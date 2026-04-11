import { useState } from 'react'
import { MapPinned, X } from 'lucide-react'

function MapModal({ projectLocation, projectName }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!projectLocation) return null

  const lat = projectLocation.latitude
  const lng = projectLocation.longitude

  if (!lat || !lng) return null

  const mapURL = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-400"
      >
        <MapPinned className="h-4 w-4" />
        View Location Map
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
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
              <div className="mb-4 rounded-lg bg-slate-50 p-3">
                <p className="text-sm text-slate-600">
                  <strong>Coordinates:</strong> {lat.toFixed(4)}, {lng.toFixed(4)}
                </p>
              </div>

              <div className="h-96 w-full overflow-hidden rounded-lg border border-slate-200">
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
                Map provided by © OpenStreetMap contributors
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
        </div>
      )}
    </>
  )
}

export default MapModal
