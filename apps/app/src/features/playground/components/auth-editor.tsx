import { RiShieldKeyholeLine } from '@remixicon/react';

export function AuthEditor({
  mode,
  token,
  authRequired,
  onModeChange,
  onTokenChange,
}: {
  mode: 'none' | 'bearer';
  token: string;
  authRequired: boolean;
  onModeChange: (mode: 'none' | 'bearer') => void;
  onTokenChange: (token: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.03] p-4">
        <RiShieldKeyholeLine className="size-5 text-cyan-200" />
        <div>
          <p className="text-sm font-medium text-white">
            {authRequired ? 'Bearer auth required' : 'No auth required by mock config'}
          </p>
          <p className="text-white/48 mt-1 text-sm">
            Bearer mode sends an Authorization header with this request.
          </p>
        </div>
      </div>
      <select
        value={mode}
        onChange={(event) => onModeChange(event.target.value as 'none' | 'bearer')}
        className="h-10 w-full rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none"
      >
        <option value="none">No authentication</option>
        <option value="bearer">Bearer token</option>
      </select>
      {mode === 'bearer' ? (
        <input
          value={token}
          onChange={(event) => onTokenChange(event.target.value)}
          placeholder="Bearer token"
          className="h-10 w-full rounded-md border border-white/10 bg-black/25 px-3 text-sm text-white outline-none placeholder:text-white/35"
        />
      ) : null}
    </div>
  );
}
