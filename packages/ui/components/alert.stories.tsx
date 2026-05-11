import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Alert, AlertDescription, AlertTitle } from './alert.js';

const VARIANTS = ['default', 'success', 'warning', 'destructive', 'info'] as const;

const meta = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Inline status banner. Lower-emphasis than a Toast — use for context that should ' +
          'stay on the page (e.g. "this schema has unsaved changes"). The status icon is ' +
          'auto-picked from the variant; pass `icon={null}` to suppress it or `icon={<X/>}` ' +
          'to override.',
      },
    },
    layout: 'padded',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    onDismiss: { control: false, table: { disable: true } },
    icon: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  args: {
    variant: 'default',
  },
  render: (args) => (
    <div className="w-[480px]">
      <Alert {...args}>
        <AlertTitle>Schema validated</AlertTitle>
        <AlertDescription>
          Imported 14 endpoints from <span className="font-mono">openapi.yaml</span>.
        </AlertDescription>
      </Alert>
    </div>
  ),
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Success: Story = { args: { variant: 'success' } };
export const Warning: Story = { args: { variant: 'warning' } };
export const Destructive: Story = { args: { variant: 'destructive' } };
export const Info: Story = { args: { variant: 'info' } };

export const TitleOnly: Story = {
  render: (args) => (
    <div className="w-[480px]">
      <Alert {...args}>
        <AlertTitle>Saved 3 minutes ago</AlertTitle>
      </Alert>
    </div>
  ),
};

export const Dismissible: Story = {
  args: { variant: 'info', onDismiss: fn() },
};

export const WithoutIcon: Story = {
  args: { variant: 'warning', icon: null },
};

export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="bg-background flex w-[640px] flex-col gap-3 rounded-lg p-8">
      {VARIANTS.map((variant) => (
        <Alert key={variant} variant={variant}>
          <AlertTitle className="capitalize">{variant}</AlertTitle>
          <AlertDescription>
            Short, scannable description that explains what the user should do next.
          </AlertDescription>
        </Alert>
      ))}
    </div>
  ),
};
