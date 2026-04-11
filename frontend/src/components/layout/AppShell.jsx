import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

function AppShell() {
  return (
    <div className="min-h-screen bg-[#f4f7f9] text-slate-900 font-sans">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col lg:pl-72 transition-all duration-300">
          <Navbar />
          <main className="flex-1 p-6 lg:p-8 relative">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default AppShell
