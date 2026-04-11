import ModuleProjectsHub from '../../features/projects/components/ModuleProjectsHub'

function MitigationProjectsPage() {
  return (
    <ModuleProjectsHub
      title="Mitigation Module"
      description="Select a project to generate and manage mitigation plans."
      actionLabel="Open Mitigation"
      buildPath={(projectId) => `/projects/${projectId}/mitigation`}
    />
  )
}

export default MitigationProjectsPage
