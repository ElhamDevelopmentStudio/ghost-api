import type { Meta, StoryObj } from '@storybook/react-vite';
import { RiFilter3Line } from '@remixicon/react';

import { Badge } from './badge.js';
import { Button } from './button.js';
import { Chip } from './chip.js';
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet.js';

const meta = {
  title: 'Components/Sheet',
  component: Sheet,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Edge-mounted overlay built on Radix Dialog. Choose `side` on `SheetContent`: ' +
          '`right` (default), `left`, `top`, or `bottom`. Compose with Header / Body / Footer ' +
          'for consistent padding and the sticky-footer pattern.',
      },
    },
  },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Right: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">Open right sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Endpoint details</SheetTitle>
          <SheetDescription>
            Inspect the full request/response shape for this endpoint.
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          <p className="text-muted-foreground text-sm">
            Sheet content scrolls independently when the body overflows. The Header/Footer stay
            pinned.
          </p>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="tertiary">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">Open left sheet</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Project navigation</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <ul className="text-muted-foreground space-y-1 text-sm">
            <li>Endpoints</li>
            <li>Schemas</li>
            <li>Logs</li>
            <li>Settings</li>
          </ul>
        </SheetBody>
      </SheetContent>
    </Sheet>
  ),
};

export const Top: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">Open top sheet</Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>Command palette</SheetTitle>
          <SheetDescription>Search projects, endpoints, and logs.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <input
            placeholder="Type a command…"
            className="border-border bg-surface-elevated focus:border-ring h-10 w-full rounded-md border px-3 text-sm outline-none"
          />
        </SheetBody>
      </SheetContent>
    </Sheet>
  ),
};

export const Bottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">Open bottom sheet</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Recent activity</SheetTitle>
          <SheetDescription>Last 5 requests served by this mock.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <ul className="text-muted-foreground space-y-1 font-mono text-xs">
            <li>200 GET /users · 12ms</li>
            <li>200 GET /users · 18ms</li>
            <li>404 GET /users/42 · 8ms</li>
            <li>200 POST /users · 22ms</li>
            <li>200 GET /users · 11ms</li>
          </ul>
        </SheetBody>
      </SheetContent>
    </Sheet>
  ),
};

export const FilterOptions: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Mirrors the "Filter Options" example from the design spec.',
      },
    },
  },
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">
          <RiFilter3Line />
          Filters
          <Badge variant="secondary" className="ml-1">
            3
          </Badge>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter options</SheetTitle>
          <SheetDescription>Refine the endpoints visible in the workspace.</SheetDescription>
        </SheetHeader>
        <SheetBody className="space-y-6">
          <div className="space-y-2">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Method</span>
            <div className="flex flex-wrap gap-1.5">
              {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                <Chip key={m} variant="neutral" onClick={() => {}}>
                  {m}
                </Chip>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Status</span>
            <div className="flex flex-wrap gap-1.5">
              <Chip variant="success">Healthy</Chip>
              <Chip variant="warning">Degraded</Chip>
              <Chip variant="destructive">Failing</Chip>
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">
              Active filters
            </span>
            <div className="flex flex-wrap gap-1.5">
              <Chip variant="primary" onDismiss={() => {}}>
                method:GET
              </Chip>
              <Chip variant="primary" onDismiss={() => {}}>
                status:healthy
              </Chip>
              <Chip variant="primary" onDismiss={() => {}}>
                tag:public
              </Chip>
            </div>
          </div>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="tertiary">Reset</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button>Apply filters</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};
