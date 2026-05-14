import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import {
  AuthCard,
  AuthNotice,
  AuthSubmitButton,
  getAuthErrorMessage,
  useVerifyEmail,
} from '@/features/auth';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const verifyEmail = useVerifyEmail();
  const token = params.token ?? searchParams.get('token') ?? '';
  const hasAttemptedVerification = useRef(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = useCallback(
    async function handleVerify(nextToken: string) {
      setError(null);

      try {
        await verifyEmail.mutateAsync({ token: nextToken });
        setVerified(true);
      } catch (err) {
        setError(getAuthErrorMessage(err, 'Unable to verify this email address.'));
      }
    },
    [verifyEmail],
  );

  useEffect(() => {
    if (!token || verified || verifyEmail.isPending || hasAttemptedVerification.current) return;

    hasAttemptedVerification.current = true;
    void handleVerify(token);
  }, [handleVerify, token, verified, verifyEmail.isPending]);

  return (
    <AuthCard
      title={verified ? 'Email verified' : 'Verify your email'}
      subtitle={
        verified
          ? 'Your account is ready. You can sign in now.'
          : 'Open the verification link from your email.'
      }
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
      {verified ? (
        <AuthSubmitButton type="button" onClick={() => navigate('/login', { replace: true })}>
          Sign in
        </AuthSubmitButton>
      ) : (
        <div className="space-y-5">
          {!token ? (
            <AuthNotice variant="error">
              This verification link is missing or invalid. Request a new verification email from
              the sign-in page.
            </AuthNotice>
          ) : null}

          {error ? <AuthNotice variant="error">{error}</AuthNotice> : null}

          <AuthSubmitButton
            type="button"
            disabled={!token}
            onClick={() => void handleVerify(token)}
            loading={verifyEmail.isPending}
          >
            Verify email
          </AuthSubmitButton>
        </div>
      )}
    </AuthCard>
  );
}
