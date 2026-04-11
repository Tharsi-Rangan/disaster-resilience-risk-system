import ModuleProjectsHub from '../../features/projects/components/ModuleProjectsHub'

function AdminRiskDataProjectsPage() {
  return (
    <ModuleProjectsHub
      title="All Projects Risk Data"
      description="As an admin, you can access risk data streams across every registered project."
      actionLabel="Open Risk Data"
      buildPath={(projectId) => `/projects/${projectId}/risk-data`}
    />
  )
}

export default AdminRiskDataProjectsPage
