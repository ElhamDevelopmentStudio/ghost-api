import { forwardRef } from 'react';

import { Input, cn } from '@ghostapi/ui';

type AuthFieldProps = React.ComponentProps<'input'> & {
  label: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  error?: string;
};

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(function AuthField(
  { label, id, icon, trailing, error, className, ...props },
  ref,
) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-3 block text-base text-zinc-100">{label}</span>
      <span className="relative block">
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
            {icon}
          </span>
        ) : null}
        <Input
          ref={ref}
          id={id}
          aria-invalid={Boolean(error) || undefined}
          className={cn(
            'h-[54px] bg-black/20 text-[17px] placeholder:text-zinc-500',
            icon && 'pl-13',
            trailing && 'pr-13',
            className,
          )}
          {...props}
        />
        {trailing ? (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
            {trailing}
          </span>
        ) : null}
      </span>
      {error ? <span className="text-destructive mt-2 block text-sm">{error}</span> : null}
    </label>
  );
});
