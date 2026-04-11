import PageHeader from '../../components/common/PageHeader'

function ProjectDetailsPage() {
  return (
    <div>
      <PageHeader
        title="Project Details"
        description="Project details page placeholder."
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">Selected project details will appear here.</p>
      </div>
    </div>
  )
}

export default ProjectDetailsPage