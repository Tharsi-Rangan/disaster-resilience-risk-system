import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import VerifyEmailPage from '../pages/auth/VerifyEmailPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'
import DashboardPage from '../pages/projects/DashboardPage'
import ProjectsPage from '../pages/projects/ProjectsPage'
import ProjectCreatePage from '../pages/projects/ProjectCreatePage'
import ProjectDetailsPage from '../pages/projects/ProjectDetailsPage'
import ProjectEditPage from '../pages/projects/ProjectEditPage'
import RiskDataPage from '../pages/projects/RiskDataPage'
import AssessmentPage from '../pages/projects/AssessmentPage'
import MitigationPage from '../pages/projects/MitigationPage'
import ProjectsList from '../pages/projects/ProjectsList'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminProjectsPage from '../pages/admin/AdminProjectsPage'
import AdminAssessmentsPage from '../pages/admin/AdminAssessmentsPage'
import AdminMitigationsPage from '../pages/admin/AdminMitigationsPage'
import UnauthorizedPage from '../pages/UnauthorizedPage'
import NotFoundPage from '../pages/NotFoundPage'
import ProtectedRoute from '../routes/ProtectedRoute'
import RoleRoute from '../routes/RoleRoute'
import { USER_ROLES } from '../utils/constants'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },

          {
            path: 'dashboard',
            element: (
              <RoleRoute allowedRoles={[USER_ROLES.CONTRACTOR]}>
                <DashboardPage />
              </RoleRoute>
            ),
          },
          {
            path: 'projects',
            element: (
              <RoleRoute allowedRoles={[USER_ROLES.CONTRACTOR]}>
                <ProjectsPage />
              </RoleRoute>
            ),
          },
          {
            path: 'projects/new',
            element: (
              <RoleRoute allowedRoles={[USER_ROLES.CONTRACTOR]}>
                <ProjectCreatePage />
              </RoleRoute>
            ),
          },
          {
            path: 'projects/:id',
            element: (
              <RoleRoute allowedRoles={[USER_ROLES.CONTRACTOR]}>
                <ProjectDetailsPage />
              </RoleRoute>
            ),
          },
          {
            path: 'projects/:id/edit',
            element: (
              <RoleRoute allowedRoles={[USER_ROLES.CONTRACTOR]}>
                <ProjectEditPage />
              </RoleRoute>
            ),
          },
          {
            path: 'projects/:id/risk-data',
            element: (
              <RoleRoute allowedRoles={[USER_ROLES.CONTRACTOR]}>
                <RiskDataPage />
              </RoleRoute>
            ),
          },
          {
            path: 'projects/:id/assessment',
            element: (
              <RoleRoute allowedRoles={[USER_ROLES.CONTRACTOR]}>
                <AssessmentPage />
              </RoleRoute>
            ),
          },
          {
            path: 'projects/:id/mitigation',
            element: (
              <RoleRoute allowedRoles={[USER_ROLES.CONTRACTOR]}>
                <MitigationPage />
              </RoleRoute>
            ),
          },

          {
            path: 'admin',
            element: (
              <RoleRoute allowedRoles={[USER_ROLES.ADMIN]}>
                <AdminDashboardPage />
              </RoleRoute>
            ),
          },
          {
            path: 'admin/projects',
            element: (
              <RoleRoute allowedRoles={[USER_ROLES.ADMIN]}>
                <AdminProjectsPage />
              </RoleRoute>
            ),
          },
          {
            path: 'admin/assessments',
            element: (
              <RoleRoute allowedRoles={[USER_ROLES.ADMIN]}>
                <AdminAssessmentsPage />
              </RoleRoute>
            ),
          },
          {
            path: 'admin/mitigations',
            element: (
              <RoleRoute allowedRoles={[USER_ROLES.ADMIN]}>
                <AdminMitigationsPage />
              </RoleRoute>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export default router