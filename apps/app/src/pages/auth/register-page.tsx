import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RiArrowRightLine, RiMailLine, RiUserLine } from '@remixicon/react';

import { Button, Checkbox } from '@ghostapi/ui';

import { ApiError } from '@/lib/api-client';
import { AuthCard, AuthField, PasswordField, PasswordStrength, useAuth } from '@/features/auth';

export function RegisterPage() {
  const { register, isRegistering } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!acceptedTerms) {
      setError('You need to agree to the terms before creating an account.');
      return;
    }

    try {
      const response = await register({
        name: name.trim() || undefined,
        email,
        password,
      });
      setSubmittedEmail(response.user.email);
    } catch (err) {
      setError(errorMessage(err, 'Unable to create your account.'));
    }
  }

  if (submittedEmail) {
    return (
      <AuthCard
        title="Check your email"
        subtitle={`We sent a verification link to ${submittedEmail}.`}
        githubLabel="Sign up with GitHub"
        compact
        className="max-w-[570px]"
        footer={
          <>
            Already verified?{' '}
            <Link to="/login" className="text-primary hover:text-primary-hover transition">
              Sign in
            </Link>
          </>
        }
      >
        <div className="border-success/35 bg-success/10 text-success-foreground rounded-md border px-4 py-3 text-sm">
          Open the email and verify your address before signing in.
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start building in seconds."
      githubLabel="Sign up with GitHub"
      compact
      className="max-w-[570px]"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-hover transition">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          id="name"
          label="Full name"
          autoComplete="name"
          placeholder="Your full name"
          icon={<RiUserLine className="size-5" />}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

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

        <label className="flex items-start gap-3 text-sm text-zinc-400">
          <Checkbox
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
          />
          <span>
            I agree to the{' '}
            <a href="#" className="text-primary hover:text-primary-hover transition">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:text-primary-hover transition">
              Privacy Policy
            </a>
          </span>
        </label>

        {error ? (
          <p className="border-destructive/40 bg-destructive/10 text-destructive-foreground rounded-md border px-4 py-3 text-sm">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          loading={isRegistering}
          className="h-[58px] w-full bg-[linear-gradient(90deg,#6d33ff,#7b2cff,#681eff)] text-base shadow-[0_16px_40px_rgba(124,77,255,0.25)] hover:brightness-110"
        >
          Create account
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
