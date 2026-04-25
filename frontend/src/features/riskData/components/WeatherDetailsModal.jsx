import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Cloud,
  CloudRain,
  Cloudy,
  Droplets,
  Eye,
  Gauge,
  MapPinned,
  Thermometer,
  Wind,
  X,
} from 'lucide-react'

function formatMetricValue(value) {
  if (value === null || value === undefined || value === '') return 'N/A'
  if (typeof value === 'number') return Number.isInteger(value) ? value : value.toFixed(2)
  return value
}

function WeatherDetailCard({ detail }) {
  const Icon = detail.icon

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            {detail.label}
          </p>
          <p className="text-4xl font-black leading-none text-slate-900">
            {formatMetricValue(detail.value)}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-500">{detail.unit}</p>
        </div>
        <div className={`rounded-xl p-2 ${detail.iconClassName}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function WeatherDetailsModal({ snapshot }) {
  const [isOpen, setIsOpen] = useState(false)

  const closeModal = () => setIsOpen(false)

  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeModal()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  if (!snapshot) return null

  const weatherDetails = [
    {
      label: 'Pressure',
      value: snapshot.pressure,
      unit: 'hPa',
      icon: Gauge,
      iconClassName: 'bg-slate-100 text-slate-700',
    },
    {
      label: 'Visibility',
      value: snapshot.visibility,
      unit: 'm',
      icon: Eye,
      iconClassName: 'bg-indigo-100 text-indigo-700',
    },
    {
      label: 'Humidity',
      value: snapshot.humidity,
      unit: '%',
      icon: Droplets,
      iconClassName: 'bg-cyan-100 text-cyan-700',
    },
    {
      label: 'Cloudiness',
      value: snapshot.cloudiness,
      unit: '%',
      icon: Cloudy,
      iconClassName: 'bg-slate-100 text-slate-700',
    },
    {
      label: 'Temperature',
      value: snapshot.temperature,
      unit: 'C',
      icon: Thermometer,
      iconClassName: 'bg-amber-100 text-amber-700',
    },
    {
      label: 'Wind Speed',
      value: snapshot.windSpeed,
      unit: 'm/s',
      icon: Wind,
      iconClassName: 'bg-sky-100 text-sky-700',
    },
    {
      label: 'Rainfall',
      value: snapshot.rainfall,
      unit: 'mm',
      icon: CloudRain,
      iconClassName: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Elevation',
      value: snapshot.elevation,
      unit: 'm above sea level',
      icon: MapPinned,
      iconClassName: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Weather Code',
      value: snapshot.weatherCode ?? 'N/A',
      unit: 'WMO',
      icon: Cloud,
      iconClassName: 'bg-violet-100 text-violet-700',
    },
  ]

  const hasWeatherData = weatherDetails.some((detail) => detail.value !== null && detail.value !== undefined)

  if (!hasWeatherData) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
      >
        <Cloud className="h-4 w-4" />
        View Weather Details
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
          onClick={closeModal}
          role="presentation"
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_32px_70px_rgba(15,23,42,0.35)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="weather-modal-title"
          >
            <div className="border-b border-blue-100 bg-linear-to-r from-blue-600 to-cyan-600 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-100">Live Weather Intelligence</p>
                  <h2 id="weather-modal-title" className="mt-1 text-2xl font-black leading-tight">Weather Details</h2>
                </div>
                <button
                  onClick={closeModal}
                  className="rounded-lg p-1.5 transition hover:bg-white/20"
                  aria-label="Close weather details"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6 md:max-h-[72vh]">
              <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Snapshot Meta</p>
                <p className="mt-2 text-sm text-blue-900">
                  <strong>Source:</strong> {snapshot.source || 'Unknown'}
                </p>
                <p className="mt-1 text-sm text-blue-900">
                  <strong>Fetched:</strong> {new Date(snapshot.fetchedAt).toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-blue-900">
                  <strong>Elevation:</strong>{' '}
                  {snapshot.elevation != null ? `${formatMetricValue(snapshot.elevation)} m above sea level` : 'Elevation data unavailable'}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {weatherDetails.map((detail) => (
                  <WeatherDetailCard key={detail.label} detail={detail} />
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-100 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">Weather Code (WMO)</p>
                <p className="text-sm text-slate-700">
                  {snapshot.weatherCode
                    ? `Code ${snapshot.weatherCode} - Refer to WMO Weather Codes standard`
                    : 'Not available'}
                </p>
              </div>
            </div>

            <div className="grid gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:grid-cols-2">
              <button
                onClick={closeModal}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
              >
                Keep Viewing Page
              </button>
              <button
                onClick={closeModal}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default WeatherDetailsModal
