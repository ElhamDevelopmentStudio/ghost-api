import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { Button } from '@ghostapi/ui';

import { ApiError } from '@/lib/api-client';

import { AuthCard } from '../components/auth-card';
import { AuthField } from '../components/auth-field';
import { PasswordField } from '../components/password-field';
import { PasswordStrength } from '../components/password-strength';
import { useResetPassword } from '../hooks/use-auth';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const resetPassword = useResetPassword();
  const [token, setToken] = useState(params.token ?? searchParams.get('token') ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await resetPassword.mutateAsync({ token, password });
      navigate('/login', { replace: true, state: { reset: true } });
    } catch (err) {
      setError(errorMessage(err, 'Unable to reset your password.'));
    }
  }

  return (
    <AuthCard
      title="Create a new password"
      subtitle="Use the reset token from your email."
      githubLabel="Continue with GitHub"
      className="max-w-[570px]"
      footer={
        <>
          Back to{' '}
          <Link to="/login" className="text-primary hover:text-primary-hover transition">
            sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          id="reset-token"
          label="Reset token"
          autoComplete="one-time-code"
          placeholder="Paste your reset token"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          required
        />

        <div>
          <PasswordField
            id="password"
            label="New password"
            autoComplete="new-password"
            placeholder="••••••••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
          <PasswordStrength password={password} />
        </div>

        <PasswordField
          id="confirm-password"
          label="Confirm password"
          autoComplete="new-password"
          placeholder="••••••••••••••"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          minLength={8}
          required
        />

        {error ? (
          <p className="border-destructive/40 bg-destructive/10 text-destructive-foreground rounded-md border px-4 py-3 text-sm">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          loading={resetPassword.isPending}
          className="h-[58px] w-full bg-[linear-gradient(90deg,#6d33ff,#7b2cff,#681eff)] text-base shadow-[0_16px_40px_rgba(124,77,255,0.25)] hover:brightness-110"
        >
          Reset password
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
