import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, Download, Plus, Trash2 } from 'lucide-react';

import { Button } from './button.js';

const VARIANTS = ['primary', 'secondary', 'tertiary', 'destructive'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Action component used everywhere a user triggers a flow. ' +
          'Pick `primary` for the main action on a screen, `secondary` for an alternative path, ' +
          '`tertiary` for low-emphasis actions, and `destructive` for irreversible operations.',
      },
    },
  },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'icon-sm', 'icon', 'icon-lg'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    asChild: { control: false, table: { disable: true } },
    children: { control: 'text' },
  },
  args: {
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    children: 'Button',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ---------------------------------------------------------------------------
 * Single-variant playgrounds — useful for tweaking via Controls panel.
 * ------------------------------------------------------------------------- */

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Tertiary: Story = {
  args: { variant: 'tertiary' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Delete' },
};

/* ---------------------------------------------------------------------------
 * State stories — exercise individual states in isolation.
 * ------------------------------------------------------------------------- */

export const Loading: Story = {
  args: { loading: true, children: 'Loading' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithLeadingIcon: Story = {
  args: {
    children: (
      <>
        <Plus />
        Add endpoint
      </>
    ),
  },
};

export const WithTrailingIcon: Story = {
  args: {
    children: (
      <>
        Continue
        <ArrowRight />
      </>
    ),
  },
};

export const IconOnly: Story = {
  args: {
    size: 'icon',
    'aria-label': 'Add endpoint',
    children: <Plus />,
  },
};

export const AsChildLink: Story = {
  args: {
    asChild: true,
    variant: 'tertiary',
    children: (
      <a href="https://example.com" target="_blank" rel="noreferrer">
        <Download />
        Download spec
      </a>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          '`asChild` lets the Button render through to any element (e.g. a Next.js `<Link>` ' +
          'or an `<a>`) while keeping the styling. Note: spinner injection is skipped in ' +
          'asChild mode since Slot only accepts a single child.',
      },
    },
  },
};

/* ---------------------------------------------------------------------------
 * Reference grids — mirror the design-system spec sheet so visual review can
 * happen in one screen without flipping through Controls.
 * ------------------------------------------------------------------------- */

function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2">
      <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
        {label}
      </span>
      {children}
    </div>
  );
}

export const AllStates: Story = {
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Every variant × every state. Hover and focus must be triggered manually — ' +
          'click into the canvas, then `Tab` to see focus rings.',
      },
    },
  },
  render: () => (
    <div className="bg-background flex flex-col gap-8 rounded-lg p-8">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col gap-3">
          <span className="text-foreground text-sm font-semibold capitalize">{variant}</span>
          <div className="flex flex-wrap items-center gap-4">
            <Cell label="default">
              <Button variant={variant}>{variant === 'destructive' ? 'Delete' : 'Button'}</Button>
            </Cell>
            <Cell label="loading">
              <Button variant={variant} loading>
                {variant === 'destructive' ? 'Deleting' : 'Loading'}
              </Button>
            </Cell>
            <Cell label="disabled">
              <Button variant={variant} disabled>
                {variant === 'destructive' ? 'Delete' : 'Button'}
              </Button>
            </Cell>
            <Cell label="with icon">
              <Button variant={variant}>
                {variant === 'destructive' ? <Trash2 /> : <Plus />}
                {variant === 'destructive' ? 'Delete' : 'Add'}
              </Button>
            </Cell>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="bg-background flex flex-col gap-8 rounded-lg p-8">
      {SIZES.map((size) => (
        <Cell key={size} label={size === 'md' ? 'medium (default)' : size}>
          <div className="flex items-center gap-3">
            <Button size={size}>Button</Button>
            <Button size={size} variant="secondary">
              Button
            </Button>
            <Button size={size} variant="tertiary">
              Button
            </Button>
            <Button size={size}>
              <Plus />
              With icon
            </Button>
          </div>
        </Cell>
      ))}
      <Cell label="icon only">
        <div className="flex items-center gap-3">
          <Button size="icon-sm" aria-label="Add">
            <Plus />
          </Button>
          <Button size="icon" aria-label="Add">
            <Plus />
          </Button>
          <Button size="icon-lg" aria-label="Add">
            <Plus />
          </Button>
        </div>
      </Cell>
    </div>
  ),
};
