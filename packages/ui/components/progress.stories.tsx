import type { Meta, StoryObj } from '@storybook/react-vite';

import { Progress } from './progress.js';

const VARIANTS = ['primary', 'success', 'warning', 'destructive', 'info'] as const;

const meta = {
  title: 'Components/Progress',
  component: Progress,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Linear progress bar. Provide `value` for determinate state, or set ' +
          '`indeterminate` for a continuous sweep when total work is unknown.',
      },
    },
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    variant: { control: 'inline-radio', options: VARIANTS },
    indeterminate: { control: 'boolean' },
  },
  args: {
    value: 60,
    size: 'md',
    variant: 'primary',
    indeterminate: false,
  },
  render: (args) => (
    <div className="w-[480px]">
      <Progress {...args} />
    </div>
  ),
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Indeterminate: Story = { args: { indeterminate: true } };

export const WithLabel: Story = {
  render: (args) => (
    <div className="w-[480px] space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Generating mock data</span>
        <span className="text-foreground font-mono tabular-nums">{args.value ?? 0}%</span>
      </div>
      <Progress {...args} />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="bg-background w-[480px] space-y-6 rounded-lg p-6">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="space-y-1.5">
          <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
            {size}
          </span>
          <Progress value={66} size={size} />
        </div>
      ))}
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="bg-background w-[480px] space-y-4 rounded-lg p-6">
      {VARIANTS.map((variant) => (
        <div key={variant} className="space-y-1.5">
          <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
            {variant}
          </span>
          <Progress value={60} variant={variant} />
        </div>
      ))}
    </div>
  ),
};
