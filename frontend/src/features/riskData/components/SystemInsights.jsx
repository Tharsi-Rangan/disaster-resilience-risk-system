import { Lightbulb, AlertCircle, CheckCircle } from 'lucide-react'

function SystemInsights({ snapshot }) {
  if (!snapshot) return null

  const insights = []

  // Humidity analysis
  if (snapshot.humidity > 80) {
    insights.push({
      type: 'warning',
      icon: AlertCircle,
      text: 'High humidity detected. Potential for moisture-related damage and mold growth.'
    })
  } else if (snapshot.humidity > 60) {
    insights.push({
      type: 'caution',
      icon: AlertCircle,
      text: 'Moderate humidity levels. Monitor for prolonged dampness.'
    })
  } else {
    insights.push({
      type: 'safe',
      icon: CheckCircle,
      text: 'Humidity levels are optimal for asset preservation.'
    })
  }

  // Cloudiness analysis
  if (snapshot.cloudiness > 80) {
    insights.push({
      type: 'warning',
      icon: AlertCircle,
      text: 'Heavy cloud cover. Increased chance of precipitation.'
    })
  }

  // Earthquake analysis
  const noSeismicMetrics =
    Number(snapshot.earthquakeCount || 0) === 0 &&
    snapshot.maxEarthquakeMagnitude == null &&
    snapshot.nearestEarthquakeDistanceKm == null

  if (noSeismicMetrics) {
    insights.push({
      type: 'warning',
      icon: AlertCircle,
      text: 'Seismic data may be unavailable or no events detected.'
    })
  } else if (snapshot.earthquakeCount === 0) {
    insights.push({
      type: 'safe',
      icon: CheckCircle,
      text: 'No recent seismic activity detected.'
    })
  } else if (snapshot.earthquakeCount > 0) {
    const maxMag = snapshot.maxEarthquakeMagnitude || 0
    if (maxMag >= 5.0) {
      insights.push({
        type: 'warning',
        icon: AlertCircle,
        text: `Significant earthquake activity detected (Mag ${maxMag}). Assess structural integrity.`
      })
    } else {
      insights.push({
        type: 'caution',
        icon: AlertCircle,
        text: `Minor seismic activity detected (${snapshot.earthquakeCount} event${snapshot.earthquakeCount !== 1 ? 's' : ''}).`
      })
    }
  }

  // Flood risk analysis
  if (snapshot.floodRiskIndex > 75) {
    insights.push({
      type: 'danger',
      icon: AlertCircle,
      text: 'High flood risk. Activate emergency protocols if applicable.'
    })
  } else if (snapshot.floodRiskIndex > 50) {
    insights.push({
      type: 'warning',
      icon: AlertCircle,
      text: 'Moderate flood risk. Increase monitoring frequency.'
    })
  }

  // Temperature extreme analysis
  if (snapshot.temperature > 35) {
    insights.push({
      type: 'warning',
      icon: AlertCircle,
      text: 'High temperature detected. Risk of heat damage to sensitive equipment.'
    })
  } else if (snapshot.temperature < 0) {
    insights.push({
      type: 'warning',
      icon: AlertCircle,
      text: 'Sub-zero temperatures. Risk of freezing and structural stress.'
    })
  }

  if (insights.length === 0) {
    insights.push({
      type: 'safe',
      icon: CheckCircle,
      text: 'All environmental conditions are within normal parameters.'
    })
  }

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-amber-600" />
        <h3 className="text-lg font-semibold text-slate-900">System Insights</h3>
      </div>

      <div className="space-y-2">
        {insights.map((insight, idx) => {
          const Icon = insight.icon
          const colorMap = {
            safe: 'border-emerald-200 bg-emerald-50',
            caution: 'border-amber-200 bg-amber-50',
            warning: 'border-orange-200 bg-orange-50',
            danger: 'border-red-200 bg-red-50'
          }

          const textColorMap = {
            safe: 'text-emerald-800',
            caution: 'text-amber-800',
            warning: 'text-orange-800',
            danger: 'text-red-800'
          }

          const iconColorMap = {
            safe: 'text-emerald-600',
            caution: 'text-amber-600',
            warning: 'text-orange-600',
            danger: 'text-red-600'
          }

          return (
            <div key={idx} className={`flex gap-3 rounded-lg border-2 p-3 ${colorMap[insight.type]}`}>
              <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${iconColorMap[insight.type]}`} />
              <p className={`text-sm font-medium ${textColorMap[insight.type]}`}>{insight.text}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SystemInsights
