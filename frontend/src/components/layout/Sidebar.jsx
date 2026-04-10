import { APP_NAME } from '../../utils/constants'

function Sidebar() {
  return (
    <aside className="hidden w-64 border-r border-slate-200 bg-white lg:block">
      <div className="border-b border-slate-200 px-6 py-5">
        <h1 className="text-xl font-bold text-slate-900">{APP_NAME}</h1>
        <p className="mt-1 text-sm text-slate-500">Disaster resilience platform</p>
      </div>

      <div className="p-6">
        <p className="text-sm text-slate-500">Sidebar navigation will be added in the next step.</p>
      </div>
    </aside>
  )
}

export default Sidebar