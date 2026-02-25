import { Outlet, NavLink } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-72 flex-shrink-0 border-r bg-white lg:block">
          <div className="p-5">
            <h1 className="text-lg font-semibold text-slate-900">
              Disaster Resilience
            </h1>
            <p className="text-xs text-slate-500">
              Risk System — SDG 9 Infrastructure
            </p>
          </div>

          <nav className="px-3 pb-5">
            <NavItem to="/">Dashboard</NavItem>
            <NavItem to="/assessments">Risk Assessment (Component 3)</NavItem>
          </nav>

          <div className="px-5 pb-5">
            <div className="rounded-xl border bg-slate-50 p-3 text-xs text-slate-600">
              <div className="font-medium text-slate-700">Demo Note</div>
              Auth team still finalizing OTP email. Assessment UI works with open
              endpoints.
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Top bar (for small screens) */}
          <div className="sticky top-0 z-10 border-b bg-white lg:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Disaster Resilience
                </div>
                <div className="text-xs text-slate-500">Dashboard</div>
              </div>
              {/* You can add mobile drawer later */}
            </div>
          </div>

          {/* Content */}
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block rounded-lg px-3 py-2 text-sm ${
          isActive
            ? "bg-slate-900 text-white"
            : "text-slate-700 hover:bg-slate-100"
        }`
      }
    >
      {children}
    </NavLink>
  );
}