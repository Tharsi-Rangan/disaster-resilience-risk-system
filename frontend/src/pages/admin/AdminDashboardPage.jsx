import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import useAuth from '../../hooks/useAuth'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { projectService } from '../../services/projectService'
import { riskDataService } from '../../services/riskDataService'

const normalizeProjects = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.projects)) return payload.projects
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

const formatDateTime = (value) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString()
}

function AdminDashboardPage() {
  const { user } = useAuth()
  const [cards, setCards] = useState([
    { title: 'Projects', description: 'Monitor all projects in the system.' },
    { title: 'Assessments', description: 'Review risk assessment outputs.' },
    { title: 'Mitigations', description: 'Manage mitigation plans and actions.' },
  ])
  const [recentSnapshots, setRecentSnapshots] = useState([])
  const [isLoadingSnapshots, setIsLoadingSnapshots] = useState(true)
  const [snapshotError, setSnapshotError] = useState('')

  useEffect(() => {
    const loadSnapshotOverview = async () => {
      try {
        setIsLoadingSnapshots(true)
        setSnapshotError('')

        const projectResponse = await projectService.getProjects(1, 100)
        const projects = normalizeProjects(projectResponse)

        const snapshotRows = await Promise.all(
          projects.map(async (project) => {
            const projectId = project?._id || project?.id
            if (!projectId) return null

            try {
              const latest = await riskDataService.getLatestRiskData(projectId)
              const snapshot = latest?.snapshot
              if (!snapshot) return null

              return {
                snapshotId: snapshot._id,
                projectId,
                projectName: project?.title || project?.name || 'Untitled Project',
                fetchedAt: snapshot.fetchedAt,
                source: snapshot.source || 'N/A',
                floodRiskIndex: Number(snapshot.floodRiskIndex || 0),
                earthquakeCount: Number(snapshot.earthquakeCount || 0),
              }
            } catch {
              return null
            }
          })
        )

        const validSnapshots = snapshotRows
          .filter(Boolean)
          .sort((a, b) => new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime())

        setRecentSnapshots(validSnapshots.slice(0, 6))

        const projectsWithSnapshots = validSnapshots.length
        const highRiskSnapshots = validSnapshots.filter((row) => row.floodRiskIndex >= 60).length
        const averageFloodRisk =
          projectsWithSnapshots > 0
            ? (
                validSnapshots.reduce((sum, row) => sum + Number(row.floodRiskIndex || 0), 0) /
                projectsWithSnapshots
              ).toFixed(1)
            : '0.0'

        setCards([
          {
            title: 'Projects',
            description: `${projects.length} total projects in the system.`,
          },
          {
            title: 'Snapshots',
            description: `${projectsWithSnapshots} projects with recent risk snapshots.`,
          },
          {
            title: 'High Flood Risk',
            description: `${highRiskSnapshots} projects currently at elevated flood risk.`,
          },
          {
            title: 'Avg Flood Risk Index',
            description: `${averageFloodRisk} average flood risk across latest snapshots.`,
          },
        ])
      } catch {
        setSnapshotError('Unable to load snapshot overview right now.')
      } finally {
        setIsLoadingSnapshots(false)
      }
    }

    loadSnapshotOverview()
  }, [])

  const riskBadgeClass = useMemo(
    () => (value) => {
      if (value >= 75) return 'bg-rose-100 text-rose-700'
      if (value >= 60) return 'bg-amber-100 text-amber-700'
      return 'bg-emerald-100 text-emerald-700'
    },
    []
  )

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description={`Welcome, ${user?.name}. Monitor the overall system from here.`}
      />

      <div className="mb-6">
        <StatusBadge label="Admin Access" variant="info" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">Recent Risk Snapshots</h3>
          <p className="mt-1 text-sm text-slate-600">Latest available project hazard snapshots for quick admin monitoring.</p>
        </div>

        {snapshotError ? (
          <div className="px-6 py-4 text-sm text-rose-700">{snapshotError}</div>
        ) : isLoadingSnapshots ? (
          <div className="px-6 py-4 text-sm text-slate-500">Loading snapshot overview...</div>
        ) : recentSnapshots.length === 0 ? (
          <div className="px-6 py-4 text-sm text-slate-500">No snapshots available yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Project</th>
                  <th className="px-6 py-3 font-medium">Fetched At</th>
                  <th className="px-6 py-3 font-medium">Source</th>
                  <th className="px-6 py-3 font-medium">Flood Risk</th>
                  <th className="px-6 py-3 font-medium">Earthquakes</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentSnapshots.map((snapshot) => (
                  <tr key={snapshot.snapshotId || snapshot.projectId} className="border-b border-slate-100">
                    <td className="px-6 py-3 font-medium text-slate-900">{snapshot.projectName}</td>
                    <td className="px-6 py-3 text-slate-600">{formatDateTime(snapshot.fetchedAt)}</td>
                    <td className="px-6 py-3 text-slate-600">{snapshot.source}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${riskBadgeClass(snapshot.floodRiskIndex)}`}>
                        {snapshot.floodRiskIndex}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-700">{snapshot.earthquakeCount}</td>
                    <td className="px-6 py-3">
                      <Link
                        to={`/projects/${snapshot.projectId}/risk-data`}
                        className="inline-flex rounded-lg border border-sky-200 px-2.5 py-1.5 text-xs font-medium text-sky-700 transition hover:bg-sky-50"
                      >
                        View Risk Data
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboardPage