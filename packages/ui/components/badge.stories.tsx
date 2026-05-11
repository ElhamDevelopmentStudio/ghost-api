import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckCircle2, Sparkles } from 'lucide-react';

import { Badge } from './badge.js';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Compact label used to mark status, version, or count. Inherits the design ' +
          'system color tokens — pair with `font-mono` when the value is technical.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
    },
    children: { control: 'text' },
    asChild: { control: false, table: { disable: true } },
  },
  args: {
    variant: 'default',
    children: 'Badge',
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Destructive: Story = { args: { variant: 'destructive' } };
export const Outline: Story = { args: { variant: 'outline' } };
export const Ghost: Story = { args: { variant: 'ghost' } };

export const WithIcon: Story = {
  args: {
    variant: 'outline',
    children: (
      <>
        <CheckCircle2 />
        Healthy
      </>
    ),
  },
};

export const Monospace: Story = {
  args: {
    variant: 'outline',
    className: 'font-mono',
    children: 'v0.1.0',
  },
};

export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="bg-background flex flex-col gap-4 rounded-lg p-8">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="ghost">Ghost</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="font-mono">
          GET
        </Badge>
        <Badge variant="outline" className="font-mono">
          200 OK
        </Badge>
        <Badge>
          <Sparkles />
          New
        </Badge>
      </div>
    </div>
  ),
};
