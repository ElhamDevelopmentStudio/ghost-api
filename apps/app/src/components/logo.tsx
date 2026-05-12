import { Link, type LinkProps } from 'react-router-dom';

import { cn } from '@ghostapi/ui';

type LogoProps = {
  className?: string;
  imageClassName?: string;
  to?: LinkProps['to'];
};

export function Logo({ className, imageClassName, to = '/projects' }: LogoProps) {
  return (
    <Link to={to} className={cn('inline-flex items-center', className)} aria-label="GhostAPI home">
      <img
        src="/logo/logo-lg.svg"
        alt="GhostAPI"
        className={cn('h-10 w-auto object-contain', imageClassName)}
      />
    </Link>
  );
}
