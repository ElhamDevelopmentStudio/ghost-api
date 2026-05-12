import {
  RiAddLine,
  RiBox3Line,
  RiFlashlightLine,
  RiMenuLine,
  RiSparkling2Line,
  RiTeamLine,
  RiTimeLine,
} from '@remixicon/react';
import type { ComponentType } from 'react';

import { cn } from '@ghostapi/ui';

import { attachmentAssetUrl } from '@/features/uploads/api/uploads-api';
import {
  formatRelativeProjectTime,
  parseInitialsIcon,
} from '@/features/projects/utils/project-formatters';

export type ProjectCardViewModel = {
  id?: string;
  name: string;
  description: string | null;
  icon: string | null;
  status: 'Live' | 'Paused';
  updatedAt: string;
  visibility: 'Private' | 'Team';
};

const iconStyles = [
  'from-fuchsia-500/35 to-purple-700/35 text-fuchsia-300 ring-fuchsia-400/40',
  'from-emerald-500/30 to-green-900/35 text-emerald-300 ring-emerald-400/30',
  'from-orange-500/35 to-amber-900/35 text-orange-300 ring-orange-400/35',
  'from-sky-500/35 to-blue-900/35 text-sky-300 ring-sky-400/35',
  'from-violet-500/35 to-purple-900/35 text-violet-300 ring-violet-400/35',
  'from-pink-500/35 to-rose-900/35 text-pink-300 ring-pink-400/35',
  'from-cyan-500/35 to-teal-900/35 text-cyan-300 ring-cyan-400/35',
  'from-slate-500/35 to-slate-800/45 text-slate-100 ring-slate-400/20',
];

type ProjectIconComponent = ComponentType<{ className?: string }>;

const fallbackIcons: ProjectIconComponent[] = [
  RiBox3Line,
  RiFlashlightLine,
  RiTimeLine,
  RiTeamLine,
  RiBox3Line,
  RiMenuLine,
  RiSparkling2Line,
  RiAddLine,
];
const namedIcons: Record<string, ProjectIconComponent> = {
  'shopping-cart': RiBox3Line,
  users: RiTeamLine,
  card: RiBox3Line,
  analytics: RiTimeLine,
  truck: RiBox3Line,
  settings: RiSparkling2Line,
  database: RiBox3Line,
  shield: RiBox3Line,
  globe: RiSparkling2Line,
  key: RiBox3Line,
};

export function ProjectCard({
  project,
  index = 0,
}: {
  project: ProjectCardViewModel;
  index?: number;
}) {
  const live = project.status === 'Live';

  return (
    <article
      className={cn(
        'bg-app-panel/88 shadow-project-card relative flex h-[260px] flex-col rounded-xl border border-white/10 p-7',
        index === 0 && 'bg-project-card-aura-purple',
        index === 4 && 'bg-project-card-aura-violet',
        index === 5 && 'bg-project-card-aura-rose',
      )}
    >
      <div className="flex items-center gap-4">
        <ProjectIcon icon={project.icon} index={index} />
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-white">{project.name}</h2>
          <p className="mt-1 text-sm text-white/50">
            Updated {formatRelativeProjectTime(project.updatedAt)}
          </p>
        </div>
      </div>

      <p className="text-white/54 mt-7 line-clamp-3 min-h-[72px] text-[15px] leading-6">
        {project.description || 'Mock API project ready for schema uploads and simulated traffic.'}
      </p>

      <div className="mt-auto flex items-center justify-between">
        <div
          className={cn(
            'flex items-center gap-2 text-sm',
            live ? 'text-emerald-400' : 'text-yellow-400',
          )}
        >
          <span className={cn('size-2 rounded-full', live ? 'bg-emerald-400' : 'bg-yellow-400')} />
          {project.status}
        </div>
        <span
          className={cn(
            'rounded-md border px-2 py-1 text-xs',
            project.visibility === 'Team'
              ? 'bg-purple-500/12 border-purple-400/10 text-purple-300'
              : 'border-white/8 text-white/56 bg-white/[0.035]',
          )}
        >
          {project.visibility}
        </span>
      </div>
    </article>
  );
}

function ProjectIcon({ icon, index }: { icon: string | null; index: number }) {
  const parsedInitials = parseInitialsIcon(icon);
  const iconUrl = icon?.startsWith('/uploads') ? icon : null;
  const Icon =
    (icon ? namedIcons[icon] : null) ?? fallbackIcons[index % fallbackIcons.length] ?? RiBox3Line;

  return (
    <div
      className={cn(
        'grid size-[60px] overflow-hidden rounded-lg bg-gradient-to-br ring-1',
        iconUrl || parsedInitials ? '' : iconStyles[index % iconStyles.length],
      )}
      style={parsedInitials ? { background: parsedInitials.color } : undefined}
    >
      {iconUrl ? (
        <img src={attachmentAssetUrl(iconUrl)} alt="" className="size-full object-cover" />
      ) : parsedInitials ? (
        <span className="m-auto text-lg font-semibold text-white">{parsedInitials.label}</span>
      ) : (
        <Icon className="m-auto size-8" />
      )}
    </div>
  );
}
