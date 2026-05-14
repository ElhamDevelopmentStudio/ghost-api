import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { RiMailLine } from '@remixicon/react';

import { toast } from '@ghostapi/ui';

import { ApiError } from '@/lib/api-client';
import {
  AuthCard,
  AuthField,
  AuthNotice,
  AuthSubmitButton,
  getAuthErrorMessage,
  PasswordField,
  useAuth,
  useResendVerification,
} from '@/features/auth';

type LocationState = { from?: { pathname: string } } | null;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggingIn } = useAuth();
  const resendVerification = useResendVerification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as LocationState)?.from?.pathname ?? '/projects';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        await resendVerificationLink();
        return;
      }
      setError(getAuthErrorMessage(err, 'Unable to sign in. Check your email and password.'));
    }
  }

  async function resendVerificationLink() {
    setError(null);

    try {
      await resendVerification.mutateAsync({ email });
      toast.info('Verification link sent', {
        description: 'Check your email to finish setting up your account.',
      });
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Unable to send a verification email.'));
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your GhostAPI account"
      githubLabel="Continue with GitHub"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-primary hover:text-primary-hover transition">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          icon={<RiMailLine className="size-5" />}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <div>
          <PasswordField
            id="password"
            label="Password"
            autoComplete="current-password"
            placeholder="••••••••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <div className="mt-4 text-right">
            <Link
              to="/forgot-password"
              className="text-primary hover:text-primary-hover text-sm transition"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {error ? <AuthNotice variant="error">{error}</AuthNotice> : null}

        <AuthSubmitButton type="submit" loading={isLoggingIn || resendVerification.isPending}>
          Sign in
        </AuthSubmitButton>
      </form>
    </AuthCard>
  );
}
