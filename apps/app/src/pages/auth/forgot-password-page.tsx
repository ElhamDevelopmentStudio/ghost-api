import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RiArrowRightLine, RiMailLine } from '@remixicon/react';

import { Button } from '@ghostapi/ui';

import { ApiError } from '@/lib/api-client';
import { AuthCard, AuthField, useForgotPassword } from '@/features/auth';

export function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await forgotPassword.mutateAsync({ email });
      setSubmitted(true);
    } catch (err) {
      setError(errorMessage(err, 'Unable to send reset instructions.'));
    }
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="We’ll send a secure reset link if the account exists."
      githubLabel="Continue with GitHub"
      className="max-w-[570px]"
      footer={
        <>
          Remembered it?{' '}
          <Link to="/login" className="text-primary hover:text-primary-hover transition">
            Sign in
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

        {submitted ? (
          <div className="border-success/35 bg-success/10 text-success-foreground rounded-md border px-4 py-3 text-sm">
            Check your inbox for password reset instructions.
          </div>
        ) : null}

        {error ? (
          <p className="border-destructive/40 bg-destructive/10 text-destructive-foreground rounded-md border px-4 py-3 text-sm">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          loading={forgotPassword.isPending}
          className="h-[58px] w-full bg-[linear-gradient(90deg,#6d33ff,#7b2cff,#681eff)] text-base shadow-[0_16px_40px_rgba(124,77,255,0.25)] hover:brightness-110"
        >
          Send reset link
          <RiArrowRightLine className="ml-auto size-5" />
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
