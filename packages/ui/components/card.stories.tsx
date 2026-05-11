import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowUpRight, Plus, TrendingUp, Users } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from './avatar.js';
import { Badge } from './badge.js';
import { Button } from './button.js';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card.js';

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Surface container with composable slots: Header / Title / Description / Action / ' +
          'Content / Footer. Slot order is intentional — Action floats to the right of the ' +
          'header automatically when present.',
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>Project settings</CardTitle>
        <CardDescription>
          Configure how this project ingests, normalizes, and serves mock responses.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-end gap-2">
        <Button variant="tertiary">Cancel</Button>
        <Button>Save changes</Button>
      </CardFooter>
    </Card>
  ),
};

export const MetricCard: Story = {
  render: () => (
    <Card className="w-[280px]">
      <CardHeader>
        <CardDescription>Total requests</CardDescription>
        <CardTitle className="font-mono text-3xl tabular-nums">128.7K</CardTitle>
        <CardAction>
          <Badge variant="outline" className="text-success gap-1 font-mono">
            <TrendingUp className="size-3" />
            +12.4%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="text-muted-foreground text-xs">
        vs. last 7 days · projected 142K by Sunday
      </CardContent>
    </Card>
  ),
};

export const ActionCard: Story = {
  render: () => (
    <Card className="w-[320px]">
      <CardHeader>
        <CardTitle>Upgrade to Pro</CardTitle>
        <CardDescription>
          Unlock unlimited mock projects, advanced latency simulation, and priority support.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-end">
        <Button>
          Upgrade
          <ArrowUpRight />
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const TeamMembers: Story = {
  render: () => (
    <Card className="w-[320px]">
      <CardHeader>
        <CardTitle>Team members</CardTitle>
        <CardDescription>4 members with access to this project.</CardDescription>
        <CardAction>
          <Button variant="tertiary" size="icon-sm" aria-label="Invite member">
            <Plus />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <AvatarGroup>
          <Avatar>
            <AvatarFallback>LO</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>YT</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>MB</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>SK</AvatarFallback>
          </Avatar>
          <AvatarGroupCount>+3</AvatarGroupCount>
        </AvatarGroup>
      </CardContent>
    </Card>
  ),
};

export const StatsRow: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="grid w-[640px] grid-cols-3 gap-4">
      {[
        { label: 'Endpoints', value: '27', delta: '+3' },
        { label: 'Requests / min', value: '418', delta: '+12%' },
        { label: 'Active sessions', value: '6', delta: '−1' },
      ].map((stat) => (
        <Card key={stat.label}>
          <CardHeader>
            <CardDescription>{stat.label}</CardDescription>
            <CardTitle className="font-mono text-2xl tabular-nums">{stat.value}</CardTitle>
            <CardAction>
              <Badge variant="outline" className="font-mono text-xs">
                {stat.delta}
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
      ))}
    </div>
  ),
};

export const WithIconHeader: Story = {
  render: () => (
    <Card className="w-[320px]">
      <CardHeader>
        <div className="bg-primary/10 text-primary mb-2 inline-flex size-9 items-center justify-center rounded-md">
          <Users className="size-5" />
        </div>
        <CardTitle>Team activity</CardTitle>
        <CardDescription>
          Monitor who's editing schemas and who's hitting your mock endpoints.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-end">
        <Button variant="tertiary" size="sm">
          View activity
          <ArrowUpRight />
        </Button>
      </CardFooter>
    </Card>
  ),
};
