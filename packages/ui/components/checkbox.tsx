import * as React from 'react';
import { RiCheckLine } from '@remixicon/react';

import { cn } from '@ghostapi/ui/lib/utils';

type CheckboxProps = Omit<React.ComponentProps<'input'>, 'type'>;

function Checkbox({ className, checked, ...props }: CheckboxProps): React.JSX.Element {
  return (
    <span className="relative inline-flex size-5 shrink-0 items-center justify-center">
      <input
        data-slot="checkbox"
        type="checkbox"
        checked={checked}
        className={cn(
          'border-input bg-input peer size-5 appearance-none rounded-[5px] border outline-none transition',
          'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2',
          'checked:border-primary checked:bg-primary disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
      <RiCheckLine
        className="text-primary-foreground pointer-events-none absolute size-3.5 opacity-0 transition peer-checked:opacity-100"
        aria-hidden
      />
    </span>
  );
}

export { Checkbox };
export type { CheckboxProps };
