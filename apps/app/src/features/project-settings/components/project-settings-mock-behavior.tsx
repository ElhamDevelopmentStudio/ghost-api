import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RiArrowRightSLine,
  RiDatabase2Line,
  RiErrorWarningLine,
  RiFlashlightLine,
  RiInformationLine,
  RiSave3Line,
  RiShuffleLine,
  RiTimerFlashLine,
} from '@remixicon/react';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
  toast,
} from '@ghostapi/ui';
import type { ProjectDetail, ProjectMockDefaults } from '@ghostapi/types';

import { updateProjectMockDefaults } from '@/features/projects/api/projects-api';

type ResponseMode = ProjectMockDefaults['responseMode'];
type PaginationMode = ProjectMockDefaults['paginationMode'];
type DataFreshness = ProjectMockDefaults['dataFreshness'];
type DataSource = ProjectMockDefaults['dataSource'];

const ERROR_STATUSES = [400, 401, 404, 422, 500] as const;

export function ProjectSettingsMockBehavior({ project }: { project: ProjectDetail }) {
  const queryClient = useQueryClient();
  const [defaults, setDefaults] = useState<ProjectMockDefaults>(project.mockDefaults);
  const [customErrorDraft, setCustomErrorDraft] = useState(
    JSON.stringify(project.mockDefaults.customErrorResponses, null, 2),
  );
  const [customErrorOpen, setCustomErrorOpen] = useState(false);
  const [errorDraftError, setErrorDraftError] = useState<string | null>(null);

  useEffect(() => {
    setDefaults(project.mockDefaults);
    setCustomErrorDraft(JSON.stringify(project.mockDefaults.customErrorResponses, null, 2));
  }, [project.mockDefaults]);

  const mutation = useMutation({
    mutationFn: () => updateProjectMockDefaults(project.id, defaults),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['projects', project.id] }),
        queryClient.invalidateQueries({ queryKey: ['projects', project.id, 'endpoints'] }),
      ]);
      toast.success('Mock behavior saved');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not save mock behavior');
    },
  });

  const isDirty = JSON.stringify(defaults) !== JSON.stringify(project.mockDefaults);
  const activeErrorWeightCount = Object.values(defaults.errorStatusWeights).filter(
    (weight) => weight > 0,
  ).length;
  const customErrorCount = Object.keys(defaults.customErrorResponses).length;

  function saveCustomErrors() {
    try {
      const parsed = JSON.parse(customErrorDraft || '{}') as unknown;
      if (!isRecord(parsed)) throw new Error('Use a JSON object keyed by status code.');
      setDefaults((current) => ({ ...current, customErrorResponses: parsed }));
      setErrorDraftError(null);
      setCustomErrorOpen(false);
    } catch (error) {
      setErrorDraftError(error instanceof Error ? error.message : 'Invalid JSON');
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.92fr)]">
      <section className="bg-[#0a0f18]/72 rounded-xl border border-white/10 p-6">
        <MockPanelHeader
          eyebrow="Runtime"
          title="Global Mock Behavior"
          icon={<RiTimerFlashLine className="size-4" />}
          action={
            <Button
              type="button"
              size="sm"
              disabled={!isDirty}
              loading={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              <RiSave3Line className="size-4" />
              Save
            </Button>
          }
        />

        <div className="divide-y divide-white/10 border-y border-white/10">
          <NumberRow
            label="Default Latency"
            value={defaults.latencyMs}
            suffix="ms"
            min={0}
            max={60000}
            onChange={(latencyMs) => setDefaults((current) => ({ ...current, latencyMs }))}
          />
          <NumberRow
            label="Default Error Rate"
            value={Math.round(defaults.errorChance * 100)}
            suffix="%"
            min={0}
            max={100}
            onChange={(value) =>
              setDefaults((current) => ({ ...current, errorChance: value / 100 }))
            }
          />
          <SelectRow<ResponseMode>
            label="Default Response Mode"
            value={defaults.responseMode}
            options={[
              { value: 'smart', label: 'Smart (Dynamic + Static)' },
              { value: 'success', label: 'Success Only' },
              { value: 'client-error', label: 'Client Error' },
              { value: 'server-error', label: 'Server Error' },
            ]}
            onChange={(responseMode) =>
              setDefaults((current) => ({
                ...current,
                responseMode,
                statusCode: statusCodeForResponseMode(responseMode),
              }))
            }
          />
          <SelectRow<'disabled' | 'required'>
            label="Default Auth Mode"
            value={defaults.authRequired ? 'required' : 'disabled'}
            options={[
              { value: 'disabled', label: 'Disabled' },
              { value: 'required', label: 'Bearer Required' },
            ]}
            onChange={(value) =>
              setDefaults((current) => ({ ...current, authRequired: value === 'required' }))
            }
          />
          <SelectRow<PaginationMode>
            label="Default Pagination"
            value={defaults.paginationMode}
            options={[
              { value: 'auto', label: 'Auto Detect' },
              { value: 'cursor', label: 'Cursor' },
              { value: 'page', label: 'Page Number' },
              { value: 'none', label: 'Disabled' },
            ]}
            onChange={(paginationMode) =>
              setDefaults((current) => ({ ...current, paginationMode }))
            }
          />
          <SelectRow<DataFreshness>
            label="Default Data Freshness"
            value={defaults.dataFreshness}
            options={[
              { value: 'dynamic', label: 'Dynamic' },
              { value: 'stable', label: 'Stable per Endpoint' },
            ]}
            onChange={(dataFreshness) => setDefaults((current) => ({ ...current, dataFreshness }))}
          />
        </div>

        <div className="mt-7">
          <MockPanelHeader
            eyebrow="Failures"
            title="Error Simulation"
            icon={<RiErrorWarningLine className="size-4" />}
          />
          <div className="divide-y divide-white/10 border-y border-white/10">
            <ConfigureRow
              label="Error Distribution"
              value={`${activeErrorWeightCount || ERROR_STATUSES.length} statuses`}
              onClick={() =>
                setDefaults((current) => ({
                  ...current,
                  errorStatusWeights: ensureErrorWeights(current.errorStatusWeights),
                }))
              }
              expanded={
                <div className="grid gap-3 py-4 sm:grid-cols-5">
                  {ERROR_STATUSES.map((status) => (
                    <label key={status} className="grid gap-2">
                      <span className="settings-label">{status}</span>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={defaults.errorStatusWeights[String(status)] ?? 1}
                        onChange={(event) =>
                          setDefaults((current) => ({
                            ...current,
                            errorStatusWeights: {
                              ...ensureErrorWeights(current.errorStatusWeights),
                              [status]: clampInt(event.target.value, 0, 100),
                            },
                          }))
                        }
                      />
                    </label>
                  ))}
                </div>
              }
            />
            <ConfigureRow
              label="Custom Error Responses"
              value={`${customErrorCount} configured`}
              onClick={() => {
                setCustomErrorDraft(JSON.stringify(defaults.customErrorResponses, null, 2));
                setErrorDraftError(null);
                setCustomErrorOpen(true);
              }}
            />
          </div>
        </div>

        <div className="border-cyan-300/14 text-white/62 mt-6 flex gap-3 border bg-cyan-300/[0.035] p-4 text-sm">
          <RiInformationLine className="mt-0.5 size-4 shrink-0 text-cyan-200" />
          <p>
            Project defaults are applied to every mounted endpoint and can still be narrowed by
            endpoint-level configuration.
          </p>
        </div>
      </section>

      <section className="bg-[#0a0f18]/72 rounded-xl border border-white/10 p-6">
        <MockPanelHeader
          eyebrow="Generation"
          title="Data Generation"
          icon={<RiDatabase2Line className="size-4" />}
        />

        <div className="divide-y divide-white/10 border-y border-white/10">
          <SelectRow<DataSource>
            label="Data Source"
            value={defaults.dataSource}
            options={[
              { value: 'smart', label: 'Smart (Schema + Faker)' },
              { value: 'schema', label: 'Schema Only' },
              { value: 'faker', label: 'Faker First' },
            ]}
            onChange={(dataSource) => setDefaults((current) => ({ ...current, dataSource }))}
          />
          <ToggleRow
            label="Faker Mode"
            checked={defaults.fakerMode}
            onChange={(fakerMode) => setDefaults((current) => ({ ...current, fakerMode }))}
          />
          <ToggleRow
            label="Preserve Examples"
            checked={defaults.preserveExamples}
            onChange={(preserveExamples) =>
              setDefaults((current) => ({ ...current, preserveExamples }))
            }
          />
          <NumberRow
            label="Max Array Items"
            value={defaults.maxArrayItems}
            min={1}
            max={100}
            onChange={(maxArrayItems) => setDefaults((current) => ({ ...current, maxArrayItems }))}
          />
          <NumberRow
            label="String Length"
            value={defaults.stringLength}
            min={1}
            max={500}
            onChange={(stringLength) => setDefaults((current) => ({ ...current, stringLength }))}
          />
        </div>

        <div className="mt-7">
          <MockPanelHeader
            eyebrow="Serving"
            title="Response Behavior"
            icon={<RiFlashlightLine className="size-4" />}
          />
          <div className="divide-y divide-white/10 border-y border-white/10">
            <ToggleRow
              label="Cache Responses"
              checked={defaults.cacheResponses}
              onChange={(cacheResponses) =>
                setDefaults((current) => ({ ...current, cacheResponses }))
              }
            />
            <NumberRow
              label="Cache TTL"
              value={defaults.cacheTtlSeconds}
              suffix="sec"
              min={1}
              max={86400}
              disabled={!defaults.cacheResponses}
              onChange={(cacheTtlSeconds) =>
                setDefaults((current) => ({ ...current, cacheTtlSeconds }))
              }
            />
            <ToggleRow
              label="Randomization"
              checked={defaults.randomization}
              onChange={(randomization) =>
                setDefaults((current) => ({ ...current, randomization }))
              }
            />
          </div>
        </div>

        <div className="mt-7">
          <MockPanelHeader
            eyebrow="Overrides"
            title="Override Hierarchy"
            icon={<RiShuffleLine className="size-4" />}
          />
          <div className="grid gap-2 border-y border-white/10 py-4 text-sm">
            <HierarchyLine label="Project" active />
            <HierarchyLine label="Environment" />
            <HierarchyLine label="Endpoint" />
          </div>
        </div>
      </section>

      <Dialog open={customErrorOpen} onOpenChange={setCustomErrorOpen}>
        <DialogContent className="border-white/10 bg-[#080d15] text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Custom Error Responses</DialogTitle>
            <DialogDescription>
              JSON object keyed by HTTP status. Values are returned when error simulation picks that
              status.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={customErrorDraft}
            onChange={(event) => setCustomErrorDraft(event.target.value)}
            rows={12}
            spellCheck={false}
            className="border-input bg-input text-foreground placeholder:text-muted focus:border-ring focus:ring-ring/25 w-full resize-none rounded-md border px-3 py-3 font-mono text-sm outline-none transition focus:ring-2"
          />
          {errorDraftError ? <p className="text-sm text-red-300">{errorDraftError}</p> : null}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setCustomErrorOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveCustomErrors}>
              Apply Responses
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MockPanelHeader({
  eyebrow,
  title,
  icon,
  action,
}: {
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-lg bg-white/[0.055] text-cyan-200">
          {icon}
        </span>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/80">{eyebrow}</p>
          <h2 className="mt-1 text-lg font-semibold tracking-normal text-white">{title}</h2>
        </div>
      </div>
      {action}
    </div>
  );
}

function NumberRow({
  label,
  value,
  suffix,
  min,
  max,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  suffix?: string;
  min: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className="grid min-h-16 items-center gap-3 py-4 sm:grid-cols-[minmax(180px,1fr)_minmax(220px,280px)]">
      <span className="font-medium text-white">{label}</span>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(clampInt(event.target.value, min, max))}
          className="text-right"
        />
        {suffix ? <span className="text-white/46 w-10 text-sm">{suffix}</span> : null}
      </div>
    </div>
  );
}

function SelectRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid min-h-16 items-center gap-3 py-4 sm:grid-cols-[minmax(180px,1fr)_minmax(220px,280px)]">
      <span className="font-medium text-white">{label}</span>
      <Select value={value} onValueChange={(next) => onChange(next as T)}>
        <SelectTrigger className="w-full border-white/10 bg-white/[0.04] text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-white/12 bg-[#111722] text-white">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="grid min-h-16 items-center gap-3 py-4 sm:grid-cols-[minmax(180px,1fr)_96px]">
      <span className="font-medium text-white">{label}</span>
      <button
        type="button"
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-9 w-20 rounded-full border px-1 text-xs font-medium transition-colors',
          checked
            ? 'bg-emerald-400/14 border-emerald-300/30 text-emerald-200'
            : 'text-white/46 border-white/10 bg-white/[0.035]',
        )}
      >
        <span
          className={cn(
            'absolute top-1 grid size-7 place-items-center rounded-full bg-white/90 text-[10px] font-semibold text-slate-950 transition-transform',
            checked ? 'translate-x-11' : 'translate-x-0',
          )}
        />
        <span className={cn('relative z-10', checked ? 'pr-8' : 'pl-8')}>
          {checked ? 'On' : 'Off'}
        </span>
      </button>
    </div>
  );
}

function ConfigureRow({
  label,
  value,
  onClick,
  expanded,
}: {
  label: string;
  value: string;
  onClick: () => void;
  expanded?: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const renderedExpanded = useMemo(() => expanded, [expanded]);

  return (
    <div>
      <div className="grid min-h-16 items-center gap-3 py-4 sm:grid-cols-[minmax(180px,1fr)_auto_auto]">
        <span className="font-medium text-white">{label}</span>
        <span className="text-white/46 text-sm">{value}</span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="border-white/10 bg-white/[0.04] text-white"
          onClick={() => {
            onClick();
            if (renderedExpanded) setIsExpanded((current) => !current);
          }}
        >
          Configure
          {renderedExpanded ? (
            <RiArrowRightSLine
              className={cn('size-4 transition-transform', isExpanded && 'rotate-90')}
            />
          ) : null}
        </Button>
      </div>
      {isExpanded ? renderedExpanded : null}
    </div>
  );
}

function HierarchyLine({ label, active }: { label: string; active?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className={active ? 'text-white' : 'text-white/56'}>{label}</span>
      <span
        className={cn(
          'mx-4 h-px flex-1 bg-white/10',
          active && 'bg-gradient-to-r from-cyan-300/70 to-white/10',
        )}
      />
      <span className={active ? 'text-cyan-200' : 'text-white/36'}>
        {active ? 'Default' : 'Override'}
      </span>
    </div>
  );
}

function statusCodeForResponseMode(mode: ResponseMode): number | null {
  if (mode === 'success') return 200;
  if (mode === 'client-error') return 400;
  if (mode === 'server-error') return 500;
  return null;
}

function ensureErrorWeights(weights: ProjectMockDefaults['errorStatusWeights']) {
  return ERROR_STATUSES.reduce<Record<string, number>>((acc, status) => {
    acc[String(status)] = weights[String(status)] ?? 1;
    return acc;
  }, {});
}

function clampInt(value: string, min: number, max: number): number {
  const next = Number.parseInt(value, 10);
  if (Number.isNaN(next)) return min;
  return Math.min(max, Math.max(min, next));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
