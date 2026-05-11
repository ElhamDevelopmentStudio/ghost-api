import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

import { AuthField } from './auth-field';

type PasswordFieldProps = Omit<
  React.ComponentProps<typeof AuthField>,
  'type' | 'icon' | 'trailing'
>;

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <AuthField
      {...props}
      type={visible ? 'text' : 'password'}
      icon={<Lock className="size-5" />}
      trailing={
        <button
          type="button"
          className="hover:text-foreground focus-visible:ring-ring rounded-sm outline-none transition focus-visible:ring-2"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      }
    />
  );
}
