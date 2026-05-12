import { Link } from 'react-router-dom';
import {
  RiAddLine,
  RiInboxLine,
  RiNotification3Line,
  RiSearchLine,
  type RemixiconComponentType,
} from '@remixicon/react';

import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, cn } from '@ghostapi/ui';

import { APP_SHELL_WIDTH_CLASS, APP_SHELL_X_PADDING_CLASS } from '@/components/app-shell';

type AppTopbarProps = {
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  action?: {
    label: string;
    to: string;
    icon?: RemixiconComponentType;
  } | null;
  bordered?: boolean;
};

export type { AppTopbarProps };

export function AppTopbar({
  search,
  action = { label: 'New Project', to: '/projects/new', icon: RiAddLine },
  bordered = false,
}: AppTopbarProps) {
  const ActionIcon = action?.icon;

  return (
    <header className={cn('h-[92px]', bordered && 'border-white/8 border-b')}>
      <div
        className={cn(
          'mx-auto flex h-full w-full items-center justify-between',
          APP_SHELL_WIDTH_CLASS,
          APP_SHELL_X_PADDING_CLASS,
        )}
      >
        <div className="ml-auto flex items-center gap-6">
          {search ? <TopbarSearch search={search} /> : null}

          <NotificationsMenu />
          {action ? (
            <Button
              asChild
              className="bg-brand-action hover:bg-brand-action-hover h-10 rounded-md px-5 text-sm"
            >
              <Link to={action.to}>
                {ActionIcon ? <ActionIcon className="size-4" /> : null}
                {action.label}
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function TopbarSearch({ search }: { search: NonNullable<AppTopbarProps['search']> }) {
  return (
    <label className="text-white/48 bg-app-panel-deep/95 shadow-project-search hidden h-10 w-[290px] items-center gap-3 rounded-lg border border-white/10 px-3 md:flex">
      <RiSearchLine className="size-4" />
      <input
        value={search.value}
        onChange={(event) => search.onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/45"
        placeholder={search.placeholder ?? 'Search projects...'}
        aria-label={search.placeholder ?? 'Search projects'}
      />
    </label>
  );
}

function NotificationsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="bg-app-panel-strong relative hidden size-10 place-items-center rounded-lg border border-white/10 text-white md:grid"
        >
          <RiNotification3Line className="size-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="bg-app-panel w-[320px] border-white/10 p-0 text-white"
      >
        <div className="border-white/8 border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Notifications</h2>
        </div>
        <div className="flex min-h-[180px] flex-col items-center justify-center px-6 py-8 text-center">
          <div className="bg-app-panel-muted text-white/56 grid size-12 place-items-center rounded-full border border-white/10">
            <RiInboxLine className="size-6" />
          </div>
          <p className="mt-4 text-sm font-medium text-white">No notifications yet</p>
          <p className="text-white/52 mt-2 text-sm leading-6">
            Product updates, project activity, and alerts will appear here.
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
