import ModuleProjectsHub from '../../features/projects/components/ModuleProjectsHub'

function RiskDataProjectsPage() {
  return (
    <ModuleProjectsHub
      title="Risk Data Module"
      description="Select a project to fetch and analyze environmental risk snapshots."
      actionLabel="Open Risk Data"
      buildPath={(projectId) => `/projects/${projectId}/risk-data`}
    />
  )
}

export default RiskDataProjectsPage
