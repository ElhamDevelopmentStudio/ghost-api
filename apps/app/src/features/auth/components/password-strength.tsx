type PasswordStrengthProps = {
  password: string;
};

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const score = scorePassword(password);
  const label = score >= 3 ? 'Strong' : score >= 2 ? 'Good' : score >= 1 ? 'Weak' : '';

  return (
    <div className="mt-2 flex items-center justify-between gap-4 text-sm">
      <span className="text-zinc-400">At least 8 characters</span>
      <span className="flex items-center gap-3">
        {label ? (
          <span className={score >= 3 ? 'text-success' : 'text-warning'}>{label}</span>
        ) : null}
        <span className="flex gap-2">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className={
                index < score
                  ? 'bg-success h-1 w-6 rounded-full'
                  : 'bg-border-strong h-1 w-6 rounded-full'
              }
            />
          ))}
        </span>
      </span>
    </div>
  );
}

function scorePassword(password: string): number {
  if (!password) return 0;
  let score = password.length >= 8 ? 1 : 0;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 3);
}
