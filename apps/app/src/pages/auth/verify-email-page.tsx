import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { RiArrowRightLine } from '@remixicon/react';

import { Button } from '@ghostapi/ui';

import { AuthCard, useVerifyEmail } from '@/features/auth';
import { ApiError } from '@/lib/api-client';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const verifyEmail = useVerifyEmail();
  const token = params.token ?? searchParams.get('token') ?? '';
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || verified || verifyEmail.isPending) return;

    void handleVerify(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleVerify(nextToken: string) {
    setError(null);

    try {
      await verifyEmail.mutateAsync({ token: nextToken });
      setVerified(true);
    } catch (err) {
      setError(errorMessage(err, 'Unable to verify this email address.'));
    }
  }

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
        <Button
          type="button"
          onClick={() => navigate('/login', { replace: true })}
          className="h-[58px] w-full bg-[linear-gradient(90deg,#6d33ff,#7b2cff,#681eff)] text-base shadow-[0_16px_40px_rgba(124,77,255,0.25)] hover:brightness-110"
        >
          Sign in
          <RiArrowRightLine className="ml-auto size-5" />
        </Button>
      ) : (
        <div className="space-y-5">
          {!token ? (
            <p className="border-destructive/40 bg-destructive/10 text-destructive-foreground rounded-md border px-4 py-3 text-sm">
              This verification link is missing or invalid. Request a new verification email from
              the sign-in page.
            </p>
          ) : null}

          {error ? (
            <p className="border-destructive/40 bg-destructive/10 text-destructive-foreground rounded-md border px-4 py-3 text-sm">
              {error}
            </p>
          ) : null}

          <Button
            type="button"
            disabled={!token}
            onClick={() => void handleVerify(token)}
            loading={verifyEmail.isPending}
            className="h-[58px] w-full bg-[linear-gradient(90deg,#6d33ff,#7b2cff,#681eff)] text-base shadow-[0_16px_40px_rgba(124,77,255,0.25)] hover:brightness-110"
          >
            Verify email
            <RiArrowRightLine className="ml-auto size-5" />
          </Button>
        </div>
      )}
    </AuthCard>
  );
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}
