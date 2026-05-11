import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { Button } from '@ghostapi/ui';

import { useAuth } from '@/hooks/use-auth';

type LocationState = { from?: { pathname: string } } | null;

/** Placeholder login page. Real auth wires through `signIn` once the API exists. */
export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as LocationState)?.from?.pathname ?? '/projects';

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    // TODO: replace with real /auth/login call once the endpoint exists.
    signIn({ id: 'stub', email, name: email.split('@')[0] ?? 'Developer' }, 'stub-token');
    navigate(from, { replace: true });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-foreground text-base font-semibold">Sign in</h2>
        <p className="text-muted-foreground mt-1 text-xs">Use your GhostAPI account.</p>
      </div>
      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </Field>
      <Button type="submit" loading={submitting} className="w-full">
        Sign in
      </Button>
      <p className="text-muted-foreground text-center text-xs">
        New here?{' '}
        <Link to="/register" className="text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block space-y-1.5">
      <span className="text-muted-foreground text-xs uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="border-border bg-surface-elevated focus:border-ring focus:ring-ring/30 h-9 w-full rounded-md border px-3 text-sm outline-none transition focus:ring-2"
    />
  );
}
