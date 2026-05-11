import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RiArrowDownLine, RiArrowUpLine, RiExpandUpDownLine, RiMoreLine } from '@remixicon/react';

import { Badge } from './badge.js';
import { Button } from './button.js';
import { Skeleton } from './skeleton.js';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table.js';

const meta = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Composable table primitives. Style every variant by composing with the existing ' +
          'tokens — e.g. striping comes from `[&_tr:nth-child(even)]:bg-surface/40` on the ' +
          'TableBody, density from `py-1.5`/`py-3.5` on TableCell.',
      },
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const ROWS = [
  { id: 'usr_1', name: 'Lina Ortega', role: 'Owner', requests: 12_482, status: 'active' },
  { id: 'usr_2', name: 'Yuki Tanaka', role: 'Editor', requests: 8_213, status: 'active' },
  { id: 'usr_3', name: 'Marc Bauer', role: 'Viewer', requests: 412, status: 'invited' },
  { id: 'usr_4', name: 'Sara Khalil', role: 'Editor', requests: 3_771, status: 'paused' },
] as const;

const STATUS_VARIANT = {
  active: 'default',
  invited: 'secondary',
  paused: 'outline',
} as const;

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Requests</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell className="text-muted-foreground">{row.role}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">
              {row.requests.toLocaleString()}
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[row.status]} className="capitalize">
                {row.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithFooterTotal: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="text-right">Requests</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">
              {row.requests.toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell className="text-right font-mono tabular-nums">
            {ROWS.reduce((sum, r) => sum + r.requests, 0).toLocaleString()}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

function SortHeader({
  label,
  active,
  direction,
  onClick,
}: {
  label: string;
  active?: boolean;
  direction?: 'asc' | 'desc';
  onClick?: () => void;
}): React.JSX.Element {
  const Icon = !active ? RiExpandUpDownLine : direction === 'asc' ? RiArrowUpLine : RiArrowDownLine;
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 uppercase"
    >
      {label}
      <Icon className="size-3" />
    </button>
  );
}

export const Sortable: Story = {
  render: function Sortable() {
    const [sortBy, setSortBy] = useState<'name' | 'requests'>('requests');
    const [dir, setDir] = useState<'asc' | 'desc'>('desc');

    const sorted = [...ROWS].sort((a, b) => {
      const factor = dir === 'asc' ? 1 : -1;
      if (sortBy === 'name') return a.name.localeCompare(b.name) * factor;
      return (a.requests - b.requests) * factor;
    });

    const toggle = (col: 'name' | 'requests') => {
      if (col === sortBy) setDir(dir === 'asc' ? 'desc' : 'asc');
      else {
        setSortBy(col);
        setDir('asc');
      }
    };

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortHeader
                label="Name"
                active={sortBy === 'name'}
                direction={dir}
                onClick={() => toggle('name')}
              />
            </TableHead>
            <TableHead className="text-right">
              <SortHeader
                label="Requests"
                active={sortBy === 'requests'}
                direction={dir}
                onClick={() => toggle('requests')}
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {row.requests.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};

export const SelectableRows: Story = {
  render: function SelectableRows() {
    const [selected, setSelected] = useState<Set<string>>(new Set([ROWS[0].id]));
    const toggle = (id: string) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };
    const allSelected = selected.size === ROWS.length;

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">
              <input
                type="checkbox"
                aria-label="Select all"
                checked={allSelected}
                onChange={() =>
                  setSelected(allSelected ? new Set() : new Set(ROWS.map((r) => r.id)))
                }
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROWS.map((row) => (
            <TableRow key={row.id} data-state={selected.has(row.id) ? 'selected' : undefined}>
              <TableCell>
                <input
                  type="checkbox"
                  aria-label={`Select ${row.name}`}
                  checked={selected.has(row.id)}
                  onChange={() => toggle(row.id)}
                />
              </TableCell>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell className="text-muted-foreground">{row.role}</TableCell>
              <TableCell className="text-right">
                <Button variant="tertiary" size="icon-sm" aria-label="Row actions">
                  <RiMoreLine />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};

export const Loading: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Requests</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 4 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-4 w-32" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-16" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="ml-auto h-4 w-20" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const Empty: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Requests</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={3} className="text-muted-foreground py-12 text-center">
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm">No team members yet</span>
              <Button size="sm">Invite someone</Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
      <TableCaption>Invite teammates to collaborate on this project.</TableCaption>
    </Table>
  ),
};
