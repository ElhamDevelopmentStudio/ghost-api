import type { Meta, StoryObj } from '@storybook/react-vite';

import { MethodBadge, type HttpMethod } from './method-badge.js';

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const meta = {
  title: 'Components/MethodBadge',
  component: MethodBadge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Method-colored pill backed by `--method-*` tokens. Use anywhere an HTTP method ' +
          'needs a visual marker — endpoint sidebar, log rows, the live activity panel.',
      },
    },
  },
  argTypes: {
    method: { control: 'inline-radio', options: METHODS },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  args: { method: 'GET', size: 'md' },
} satisfies Meta<typeof MethodBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllMethods: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="bg-background flex flex-col gap-4 rounded-lg p-8">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-2">
          {METHODS.map((method) => (
            <MethodBadge key={method} method={method} size={size} />
          ))}
        </div>
      ))}
    </div>
  ),
};
