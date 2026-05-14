import { Button, Skeleton } from '@ghostapi/ui';

export function PlaygroundSkeleton() {
  return (
    <div className="grid min-h-[calc(100vh-40px)] gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(430px,0.8fr)]">
      <Skeleton className="rounded-lg bg-white/[0.06]" />
      <Skeleton className="rounded-lg bg-white/[0.06]" />
    </div>
  );
}

export function PlaygroundError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-white/10 bg-[#070b12] px-6 py-12 text-center">
      <p className="text-sm font-medium text-white">Endpoints could not be loaded.</p>
      <p className="text-white/52 mt-2 text-sm">Refresh the list or check the server connection.</p>
      <Button type="button" variant="secondary" className="mt-6" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

export function PlaygroundEmpty() {
  return (
    <div className="rounded-lg border border-dashed border-white/10 bg-[#070b12] px-6 py-12 text-center">
      <p className="text-sm font-medium text-white">No endpoints are mounted yet.</p>
      <p className="text-white/52 mt-2 text-sm">
        Upload an OpenAPI schema before using Playground.
      </p>
    </div>
  );
}
