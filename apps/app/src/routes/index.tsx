import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppLayout } from '@/layouts/app-layout';
import { AuthLayout } from '@/layouts/auth-layout';
import { LoginPage } from '@/pages/login-page';
import { LogsPage } from '@/pages/logs-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { ProjectsPage } from '@/pages/projects-page';
import { RegisterPage } from '@/pages/register-page';
import { SettingsPage } from '@/pages/settings-page';
import { WorkspacePage } from '@/pages/workspace-page';
import { ProtectedRoute } from '@/routes/protected-route';

/**
 * Route table for the protected SPA.
 *
 * Public branch:   AuthLayout > /login, /register
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
