import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';

import { Button } from '@ghostapi/ui';

import { ApiError } from '@/lib/api-client';

import { AuthCard } from '../components/auth-card';
import { AuthField } from '../components/auth-field';
import { PasswordField } from '../components/password-field';
import { useAuth } from '../hooks/use-auth';

type LocationState = { from?: { pathname: string } } | null;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggingIn } = useAuth();
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
      setError(errorMessage(err, 'Unable to sign in. Check your email and password.'));
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
          icon={<Mail className="size-5" />}
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

        {error ? (
          <p className="border-destructive/40 bg-destructive/10 text-destructive-foreground rounded-md border px-4 py-3 text-sm">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          loading={isLoggingIn}
          className="h-[58px] w-full bg-[linear-gradient(90deg,#6d33ff,#7b2cff,#681eff)] text-base shadow-[0_16px_40px_rgba(124,77,255,0.25)] hover:brightness-110"
        >
          Sign in
          <ArrowRight className="ml-auto size-5" />
        </Button>
      </form>
    </AuthCard>
  );
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}
