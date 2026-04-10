function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Frontend Foundation</h2>
          <p className="text-sm text-slate-500">Shared layout for contractor and admin flows</p>
        </div>

        <div className="rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-700">
          System Ready
        </div>
      </div>
    </header>
  )
}

export default Navbar