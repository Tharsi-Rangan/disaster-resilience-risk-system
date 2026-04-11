function EmptyState({ title = 'No Data', description = 'No data available.' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
      <div className="text-center">
        <p className="text-6xl">📭</p>
        <h2 className="mt-4 text-2xl font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-slate-600">{description}</p>
      </div>
    </div>
  )
}

export default EmptyState
