import { createBrowserRouter, Navigate } from 'react-router-dom';

import { ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from '@/features/auth';
import { AppLayout } from '@/layouts/app-layout';
import { AuthLayout } from '@/layouts/auth-layout';
import { LogsPage } from '@/pages/logs-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { ProjectsPage } from '@/pages/projects-page';
import { SettingsPage } from '@/pages/settings-page';
import { WorkspacePage } from '@/pages/workspace-page';
import { ProtectedRoute } from '@/routes/protected-route';

/**
 * Route table for the protected SPA.
 *
 * Public branch:   AuthLayout > /login, /register, password recovery
 * Protected branch: ProtectedRoute > AppLayout > /projects, /workspace, /logs, /settings
 *
 * Add new pages here so the surface stays scannable.
 */
export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'reset-password/:token', element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/projects" replace /> },
          { path: 'projects', element: <ProjectsPage /> },
          { path: 'workspace', element: <WorkspacePage /> },
          { path: 'logs', element: <LogsPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
