import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import {
  RiCheckboxCircleLine,
  RiGitBranchLine,
  RiPriceTag3Line,
  RiSparkling2Line,
} from '@remixicon/react';

import { Chip } from './chip.js';

const VARIANTS = ['neutral', 'primary', 'success', 'warning', 'destructive', 'info'] as const;

const meta = {
  title: 'Components/Chip',
  component: Chip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Compact, pill-shaped marker for tags, filters, and statuses. Add `onClick` to make ' +
          'it actionable, `onDismiss` to add a remove button. Stronger semantics than Badge — ' +
          'pick Chip when the user can interact, Badge when it is purely decorative.',
      },
    },
  },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    children: { control: 'text' },
    onClick: { table: { disable: true } },
    onDismiss: { table: { disable: true } },
    icon: { table: { disable: true } },
  },
  args: {
    variant: 'neutral',
    size: 'md',
    children: 'Chip',
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};
export const Primary: Story = { args: { variant: 'primary' } };
export const Success: Story = { args: { variant: 'success', children: 'Healthy' } };
export const Warning: Story = { args: { variant: 'warning', children: 'Unverified' } };
export const Destructive: Story = { args: { variant: 'destructive', children: 'Failing' } };
export const Info: Story = { args: { variant: 'info', children: 'Beta' } };

export const WithIcon: Story = {
  args: { icon: <RiPriceTag3Line />, children: 'public' },
};

export const Removable: Story = {
  args: { variant: 'primary', children: 'method:GET', onDismiss: fn() },
};

export const Interactive: Story = {
  args: { variant: 'neutral', children: 'Filter', icon: <RiGitBranchLine />, onClick: fn() },
};

export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="bg-background flex flex-col gap-6 rounded-lg p-8">
      {(['md', 'sm'] as const).map((size) => (
        <div key={size} className="flex flex-col gap-2">
          <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
            {size === 'md' ? 'medium (default)' : 'small'}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {VARIANTS.map((variant) => (
              <Chip key={variant} variant={variant} size={size}>
                {variant}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip variant="success" size={size} icon={<RiCheckboxCircleLine />}>
              200 OK
            </Chip>
            <Chip variant="info" size={size} icon={<RiSparkling2Line />}>
              new
            </Chip>
            <Chip variant="primary" size={size} onDismiss={fn()}>
              status:active
            </Chip>
            <Chip variant="neutral" size={size} onClick={fn()}>
              clickable
            </Chip>
          </div>
        </div>
      ))}
    </div>
  ),
};
