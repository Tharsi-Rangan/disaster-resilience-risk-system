import { Link, Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

function NavItem({ to, label }) {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <Link
      to={to}
      className={`block rounded-lg px-3 py-2 text-sm transition ${
        active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      {label}
    </Link>
  );
}

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" />
      <div className="mx-auto flex max-w-7xl gap-4 p-4">
        <aside className="w-64 shrink-0 rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-5">
            <h1 className="text-lg font-semibold text-slate-900">
              Disaster Resilience
            </h1>
            <p className="text-xs text-slate-500">
              Risk System – SDG 9 Infrastructure
            </p>
          </div>

          <nav className="space-y-1">
            <NavItem to="/" label="Dashboard" />
            <NavItem to="/assessments" label="Risk Assessment (Component 3)" />
          </nav>

          <div className="mt-6 rounded-xl border bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-600">Demo Note</p>
            <p className="mt-1 text-xs text-slate-500">
              Auth team still finalizing OTP email. Assessment UI works with open endpoints.
            </p>
          </div>
        </aside>

        <main className="flex-1 rounded-2xl bg-white p-5 shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
}