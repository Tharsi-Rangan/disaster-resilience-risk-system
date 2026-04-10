import { createBrowserRouter } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import LoginPage from '../pages/auth/LoginPage'
import DashboardPage from '../pages/contractor/DashboardPage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import NotFoundPage from '../pages/NotFoundPage'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'admin',
        element: <AdminDashboardPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export default router