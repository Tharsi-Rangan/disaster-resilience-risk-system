import StatusBadge from '../../../components/common/StatusBadge'
import { getWeatherDescription } from '../utils/weatherCodeUtils'
import { formatNumber, formatPressure, formatVisibility } from '../utils/formatUtils'

function WeatherCard({ snapshot }) {
  const weatherDesc = getWeatherDescription(snapshot?.weatherCode)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Weather Conditions</h3>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {/* Temperature */}
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-600">Temperature</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatNumber(snapshot?.temperature, 1)}°C
          </p>
        </div>

        {/* Humidity */}
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-600">Humidity</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatNumber(snapshot?.humidity, 0)}%
          </p>
        </div>

        {/* Wind Speed */}
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-600">Wind Speed</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatNumber(snapshot?.windSpeed, 2)} m/s
          </p>
        </div>

        {/* Cloudiness */}
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-600">Cloudiness</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatNumber(snapshot?.cloudiness, 0)}%
          </p>
        </div>

        {/* Rainfall */}
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-600">Rainfall</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatNumber(snapshot?.rainfall, 1)} mm
          </p>
        </div>

        {/* Pressure (New Field) */}
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-600">Pressure</p>
          <p className="mt-2 text-xl font-bold text-slate-900">
            {formatPressure(snapshot?.pressure)}
          </p>
        </div>

        {/* Visibility (New Field) */}
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-600">Visibility</p>
          <p className="mt-2 text-xl font-bold text-slate-900">
            {formatVisibility(snapshot?.visibility)}
          </p>
        </div>

        {/* Weather Code (New Field) */}
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-600">Condition</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-2xl">{weatherDesc.icon}</span>
            <p className="text-sm font-medium text-slate-700">{weatherDesc.label}</p>
          </div>
        </div>

        {/* Flood Risk Index */}
        <div className="rounded-lg bg-orange-50 p-4">
          <p className="text-xs font-medium text-slate-600">Flood Risk Index</p>
          <p className="mt-2 text-2xl font-bold text-orange-600">
            {formatNumber(snapshot?.floodRiskIndex, 0)}/100
          </p>
        </div>
      </div>
    </div>
  )
}

export default WeatherCard
