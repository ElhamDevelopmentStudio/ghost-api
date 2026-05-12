import { Link } from 'react-router-dom';

import { cn } from '@ghostapi/ui';

import { ProjectIcon } from '@/features/projects/components/project-icon';
import { formatRelativeProjectTime } from '@/features/projects/utils/project-formatters';

export type ProjectCardViewModel = {
  id?: string;
  name: string;
  description: string | null;
  icon: string | null;
  status: 'Live' | 'Paused';
  updatedAt: string;
  visibility: 'Private' | 'Team';
};

export function ProjectCard({
  project,
  index = 0,
}: {
  project: ProjectCardViewModel;
  index?: number;
}) {
  const live = project.status === 'Live';
  const content = (
    <>
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
    </>
  );
  const className = cn(
    'bg-app-panel/88 shadow-project-card relative flex h-[260px] flex-col rounded-xl border border-white/10 p-7 transition-colors',
    project.id &&
      'hover:border-purple-300/40 focus-visible:border-purple-300/60 focus-visible:outline-none',
    index === 0 && 'bg-project-card-aura-purple',
    index === 4 && 'bg-project-card-aura-violet',
    index === 5 && 'bg-project-card-aura-rose',
  );

  if (project.id) {
    return (
      <Link
        to={`/projects/${project.id}`}
        className={className}
        aria-label={`Open ${project.name}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <article
      className={cn(
        'bg-app-panel/88 shadow-project-card relative flex h-[260px] flex-col rounded-xl border border-white/10 p-7',
        index === 0 && 'bg-project-card-aura-purple',
        index === 4 && 'bg-project-card-aura-violet',
        index === 5 && 'bg-project-card-aura-rose',
      )}
    >
      {content}
    </article>
  );
}
