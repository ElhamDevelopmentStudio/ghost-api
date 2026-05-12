'use client';

import { MethodBadge, type HttpMethod } from '../components/method-badge';
import { cn } from '../lib/utils';

export type ApiLogEntry = {
  id: string;
  method: HttpMethod;
  endpoint: string;
  status: string;
  statusCode: number;
  responseTime: string;
  size: string;
  timestamp: string;
};

type ApiLogRowProps = React.ComponentProps<'div'> & {
  entry: ApiLogEntry;
  /** When true, the row glows with a primary halo + side dot — used to mark "the request that just fired". */
  highlighted?: boolean;
};

function statusColor(code: number): string {
  if (code >= 200 && code < 300) return 'text-success';
  if (code >= 400) return 'text-destructive';
  return 'text-muted-foreground';
}

/**
 * One row in a "live API activity" feed: method pill, endpoint, timestamp,
 * status code + response time + size. The visual story (border + shadow +
 * side dot when highlighted) is the same one used in the landing animation.
 */
export function ApiLogRow({
  entry,
  highlighted = false,
  className,
  ...props
}: ApiLogRowProps): React.JSX.Element {
  return (
    <div
      data-slot="api-log-row"
      className={cn(
        'bg-surface/90 relative rounded-lg border backdrop-blur-sm transition-all duration-300',
        highlighted ? 'border-primary/60 shadow-primary/20 shadow-lg' : 'border-border/40',
        className,
      )}
      {...props}
    >
      <div className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <MethodBadge method={entry.method} size="sm" />
            <span className="text-foreground truncate font-mono text-sm">{entry.endpoint}</span>
          </div>
          <span className="text-muted-foreground/70 shrink-0 font-mono text-[10px]">
            {entry.timestamp}
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-3 text-[11px]">
          <span className={cn('font-mono', statusColor(entry.statusCode))}>
            {entry.statusCode} {entry.status}
          </span>
          <span className="text-muted-foreground font-mono">{entry.responseTime}</span>
          <span className="text-muted-foreground font-mono">{entry.size}</span>
        </div>
      </div>

      {highlighted && (
        <span className="bg-primary shadow-primary/60 absolute -right-1.5 top-1/2 size-3 -translate-y-1/2 rounded-full shadow-lg" />
      )}
    </div>
  );
}
