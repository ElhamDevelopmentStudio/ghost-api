import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { RiMailLine, RiUserLine } from '@remixicon/react';

import { Checkbox } from '@ghostapi/ui';

import {
  AuthCard,
  AuthField,
  AuthNotice,
  AuthSubmitButton,
  getAuthErrorMessage,
  PasswordField,
  PasswordStrength,
  useAuth,
} from '@/features/auth';

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get('invitation') ?? undefined;
  const invitedEmail = searchParams.get('email') ?? '';
  const { register, isRegistering } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(invitedEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  useEffect(() => {
    if (invitedEmail) setEmail(invitedEmail);
  }, [invitedEmail]);

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
        invitationToken,
      });
      setSubmittedEmail(response.user.email);
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Unable to create your account.'));
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
        <AuthNotice variant="success">
          Open the email and verify your address before signing in.
        </AuthNotice>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle={
        invitationToken
          ? 'Create your account to accept the project invitation.'
          : 'Start building in seconds.'
      }
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

        {error ? <AuthNotice variant="error">{error}</AuthNotice> : null}

        <AuthSubmitButton type="submit" loading={isRegistering}>
          Create account
        </AuthSubmitButton>
      </form>
    </AuthCard>
  );
}
