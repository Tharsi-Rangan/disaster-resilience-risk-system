import { Cloud, Zap, Info } from 'lucide-react'

function DataSourceInfo() {
  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-linear-to-r from-slate-50 to-slate-100 p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-slate-200 rounded-lg">
          <Info className="w-5 h-5 text-slate-700" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Data Sources</h3>
          <p className="text-xs text-slate-600 mt-0.5">Where this data comes from</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cloud className="w-4 h-4 text-blue-600" />
            <h4 className="font-semibold text-slate-900 text-sm">Weather Data</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Collected from <strong>OpenWeather API</strong> with <strong>Open-Meteo</strong> as fallback provider.
            Includes temperature, humidity, wind speed, rainfall, pressure, visibility, and weather codes.
          </p>
          <p className="text-xs text-slate-500 mt-2">Updated: Every fetch request</p>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-orange-600" />
            <h4 className="font-semibold text-slate-900 text-sm">Earthquake Data</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sourced from <strong>USGS Earthquake API</strong>. Detects seismic activity within
            200 km radius with magnitude ≥ 3.0 over the past 30 days.
          </p>
          <p className="text-xs text-slate-500 mt-2">Updated: Every fetch request</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-3">
        <p className="text-xs text-blue-800">
          <strong>💡 Tip:</strong> Data is cached for 5 minutes after fetch to prevent API rate limiting.
          If you see a cooldown message, please wait before fetching again.
        </p>
      </div>
    </div>
  )
}

export default DataSourceInfo
