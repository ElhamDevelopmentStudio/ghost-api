import { RiArrowRightLine } from '@remixicon/react';

import { Button, type ButtonProps } from '@ghostapi/ui';

type AuthSubmitButtonProps = ButtonProps;

export function AuthSubmitButton({ children, className, ...props }: AuthSubmitButtonProps) {
  return (
    <Button
      className={[
        'bg-brand-action-gradient shadow-auth-submit h-[58px] w-full text-base hover:brightness-110',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
      <RiArrowRightLine className="ml-auto size-5" />
    </Button>
  );
}
