import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppLayout } from '@/layouts/app-layout';
import { AuthLayout } from '@/layouts/auth-layout';
import { ForgotPasswordPage } from '@/pages/auth/forgot-password-page';
import { LoginPage } from '@/pages/auth/login-page';
import { RegisterPage } from '@/pages/auth/register-page';
import { ResetPasswordPage } from '@/pages/auth/reset-password-page';
import { VerifyEmailPage } from '@/pages/auth/verify-email-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { LogsPage } from '@/pages/protected/activity-log-page';
import { ProjectsPage } from '@/pages/protected/projects-page';
import { SettingsPage } from '@/pages/protected/settings-page';
import { WorkspacePage } from '@/pages/protected/workspace-page';
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
      { path: 'verify-email', element: <VerifyEmailPage /> },
      { path: 'verify-email/:token', element: <VerifyEmailPage /> },
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
