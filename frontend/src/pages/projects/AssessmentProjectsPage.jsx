import ModuleProjectsHub from '../../features/projects/components/ModuleProjectsHub'

function AssessmentProjectsPage() {
  return (
    <ModuleProjectsHub
      title="Assessment Module"
      description="Select a project to run and review disaster risk assessments."
      actionLabel="Open Assessment"
      buildPath={(projectId) => `/projects/${projectId}/assessment`}
    />
  )
}

export default AssessmentProjectsPage
