function PageHeader({ title, description, children }) {
  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 heading-font tracking-tight">{title}</h1>
        {description && <p className="mt-2 text-slate-500 font-medium text-base">{description}</p>}
      </div>
      {children && (
        <div className="flex-shrink-0">
          {children}
        </div>
      )}
    </div>
  )
}

export default PageHeader
