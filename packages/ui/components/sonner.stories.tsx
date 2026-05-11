import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './button.js';
import { Toaster, toast } from './sonner.js';

const meta = {
  title: 'Components/Toaster (Sonner)',
  component: Toaster,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Toasts are transient, screen-edge notifications. Mount `<Toaster />` once near the ' +
          'app root, then call the re-exported `toast` helper from anywhere. Stories below ' +
          'render the Toaster inline alongside trigger buttons so you can fire each variant.',
      },
    },
  },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

const TriggerGrid = (): React.JSX.Element => (
  <div className="bg-background flex flex-col items-center gap-6 rounded-lg p-10">
    <Toaster position="top-right" />
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Button variant="secondary" onClick={() => toast('Schema saved')}>
        Default
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast.success('Endpoint published', { description: 'GET /users now live.' })}
      >
        Success
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.warning('Latency above 500ms', { description: 'Last 5 requests averaged 612ms.' })
        }
      >
        Warning
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.error('Schema parse failed', { description: 'Unexpected token at line 42.' })
        }
      >
        Error
      </Button>
      <Button variant="secondary" onClick={() => toast.info('Mock server restarted')}>
        Info
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          const id = toast.loading('Generating mock data…');
          setTimeout(() => toast.success('Mock data generated', { id }), 1800);
        }}
      >
        Loading → success
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast('Endpoint deleted', {
            description: 'GET /users was removed.',
            action: { label: 'Undo', onClick: () => toast.success('Restored') },
          })
        }
      >
        With action
      </Button>
      <Button variant="tertiary" onClick={() => toast.dismiss()}>
        Dismiss all
      </Button>
    </div>
  </div>
);

export const Playground: Story = {
  render: () => <TriggerGrid />,
};
