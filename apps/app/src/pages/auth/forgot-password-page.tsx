import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RiMailLine } from '@remixicon/react';

import {
  AuthCard,
  AuthField,
  AuthNotice,
  AuthSubmitButton,
  getAuthErrorMessage,
  useForgotPassword,
} from '@/features/auth';

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
      setError(getAuthErrorMessage(err, 'Unable to send reset instructions.'));
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
          <AuthNotice variant="success">
            Check your inbox for password reset instructions.
          </AuthNotice>
        ) : null}

        {error ? <AuthNotice variant="error">{error}</AuthNotice> : null}

        <AuthSubmitButton type="submit" loading={forgotPassword.isPending}>
          Send reset link
        </AuthSubmitButton>
      </form>
    </AuthCard>
  );
}
