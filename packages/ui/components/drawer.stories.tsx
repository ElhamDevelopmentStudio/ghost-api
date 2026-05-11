import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './button.js';
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './drawer.js';

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Bottom-mounted, drag-to-dismiss drawer built on Vaul. Pair with `direction="left"`, ' +
          '`"right"`, or `"top"` for side variants. Use Drawer for mobile-first bottom sheets ' +
          'and quick actions; reach for Sheet when you need a desktop side panel that does ' +
          'not require dragging.',
      },
    },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="secondary">Open drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Move endpoint</DrawerTitle>
          <DrawerDescription>
            Pick a destination project to move <span className="font-mono">GET /users</span> to.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <ul className="text-foreground space-y-1 text-sm">
            {['notes-api', 'crm-mock', 'internal-tools'].map((project) => (
              <li
                key={project}
                className="hover:bg-surface-hover flex cursor-pointer items-center justify-between rounded-md px-3 py-2 transition-colors"
              >
                <span className="font-mono">{project}</span>
                <span className="text-muted-foreground text-xs">14 endpoints</span>
              </li>
            ))}
          </ul>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="tertiary">Cancel</Button>
          </DrawerClose>
          <Button>Move</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const SideRight: Story = {
  render: () => (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="secondary">Open right drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Request inspector</DrawerTitle>
          <DrawerDescription>Inspect headers and body for the current request.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <pre className="bg-surface-elevated text-muted-foreground overflow-x-auto rounded-md p-3 text-xs leading-relaxed">{`Accept: application/json
Authorization: Bearer ••••
User-Agent: curl/8.4.0`}</pre>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="tertiary">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const SideLeft: Story = {
  render: () => (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button variant="secondary">Open left drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Navigation</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <ul className="text-muted-foreground space-y-1 text-sm">
            <li>Endpoints</li>
            <li>Schemas</li>
            <li>Logs</li>
            <li>Settings</li>
          </ul>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  ),
};
