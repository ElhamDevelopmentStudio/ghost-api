import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Trash2 } from 'lucide-react';

import { Button } from './button.js';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog.js';

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Centered modal built on Radix Dialog. Compose with Trigger / Content / Header / ' +
          'Title / Description / Footer / Close. DialogContent accepts a `size` prop ' +
          '(`sm | md | lg | xl`) for different content widths.',
      },
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit project</DialogTitle>
          <DialogDescription>
            Change how this project shows up in the workspace sidebar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <label className="text-sm">
            <span className="text-muted-foreground mb-1 block text-xs uppercase tracking-wider">
              Name
            </span>
            <input
              defaultValue="Notes API"
              className="border-border bg-surface-elevated focus:border-ring h-9 w-full rounded-md border px-3 text-sm outline-none"
            />
          </label>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="tertiary">Cancel</Button>
          </DialogClose>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Confirmation: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 />
          Delete project
        </Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Delete this project?</DialogTitle>
          <DialogDescription>
            This permanently removes <span className="font-mono">notes-api</span>, all of its mocked
            endpoints, and its request logs. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="tertiary">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={fn()}>
            Delete project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Information: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="tertiary">What's new</Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Release notes · v0.4</DialogTitle>
          <DialogDescription>
            Latency simulation now supports per-endpoint overrides. Auth modes added: bearer, basic,
            and API key.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Got it</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const LargeContent: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Open large dialog</Button>
      </DialogTrigger>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>Schema preview</DialogTitle>
          <DialogDescription>
            14 endpoints detected in <span className="font-mono">openapi.yaml</span>. Confirm the
            import below.
          </DialogDescription>
        </DialogHeader>
        <pre className="bg-surface-elevated text-muted-foreground max-h-72 overflow-auto rounded-md p-4 text-xs leading-relaxed">{`GET    /users
GET    /users/:id
POST   /users
PATCH  /users/:id
DELETE /users/:id
GET    /projects
POST   /projects
…`}</pre>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="tertiary">Cancel</Button>
          </DialogClose>
          <Button>Import 14 endpoints</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const AllSizes: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex items-center gap-3">
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Dialog key={size}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm">
              size: {size}
            </Button>
          </DialogTrigger>
          <DialogContent size={size}>
            <DialogHeader>
              <DialogTitle className="capitalize">{size} dialog</DialogTitle>
              <DialogDescription>Same primitives, different `size` prop.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  ),
};
