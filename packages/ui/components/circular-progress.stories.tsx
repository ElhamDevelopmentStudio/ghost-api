import type { Meta, StoryObj } from '@storybook/react-vite';

import { CircularProgress } from './circular-progress.js';

const VARIANTS = ['primary', 'success', 'warning', 'destructive', 'info'] as const;

const meta = {
  title: 'Components/CircularProgress',
  component: CircularProgress,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'SVG-based circular progress indicator. Use the `showLabel` prop to render the ' +
          'percentage in the center, or pass a `label` node to fully override.',
      },
    },
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    variant: { control: 'inline-radio', options: VARIANTS },
    indeterminate: { control: 'boolean' },
    showLabel: { control: 'boolean' },
  },
  args: {
    value: 65,
    size: 'md',
    variant: 'primary',
    indeterminate: false,
    showLabel: false,
  },
} satisfies Meta<typeof CircularProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithLabel: Story = { args: { showLabel: true } };
export const Indeterminate: Story = { args: { indeterminate: true } };

export const AllSizes: Story = {
  render: () => (
    <div className="bg-background flex items-center gap-6 rounded-lg p-8">
      <CircularProgress value={70} size="sm" showLabel />
      <CircularProgress value={70} size="md" showLabel />
      <CircularProgress value={70} size="lg" showLabel />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="bg-background flex flex-wrap items-center gap-6 rounded-lg p-8">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col items-center gap-2">
          <CircularProgress value={75} size="md" variant={variant} showLabel />
          <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
            {variant}
          </span>
        </div>
      ))}
    </div>
  ),
};
