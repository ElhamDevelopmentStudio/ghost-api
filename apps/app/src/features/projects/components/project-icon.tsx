import {
  RiAddLine,
  RiBankCardLine,
  RiBox3Line,
  RiCheckboxBlankCircleLine,
  RiDatabase2Line,
  RiEqualizerLine,
  RiGlobalLine,
  RiKey2Line,
  RiShieldCheckLine,
  RiShoppingCartLine,
  RiSparkling2Line,
  RiTeamLine,
  RiTimeLine,
  RiTruckLine,
  type RemixiconComponentType,
} from '@remixicon/react';

import { cn } from '@ghostapi/ui';

import { attachmentAssetUrl } from '@/features/uploads/api/uploads-api';
import { parseInitialsIcon } from '@/features/projects/utils/project-formatters';

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

const fallbackIcons: RemixiconComponentType[] = [
  RiBox3Line,
  RiSparkling2Line,
  RiTimeLine,
  RiTeamLine,
  RiDatabase2Line,
  RiGlobalLine,
  RiShieldCheckLine,
  RiAddLine,
];

const namedIcons: Record<string, RemixiconComponentType> = {
  'shopping-cart': RiShoppingCartLine,
  users: RiTeamLine,
  card: RiBankCardLine,
  analytics: RiEqualizerLine,
  truck: RiTruckLine,
  settings: RiCheckboxBlankCircleLine,
  database: RiDatabase2Line,
  shield: RiShieldCheckLine,
  globe: RiGlobalLine,
  key: RiKey2Line,
};

export function ProjectIcon({
  icon,
  index = 0,
  className,
  iconClassName,
}: {
  icon: string | null;
  index?: number;
  className?: string;
  iconClassName?: string;
}) {
  const parsedInitials = parseInitialsIcon(icon);
  const iconUrl = icon?.startsWith('/uploads') ? icon : null;
  const Icon =
    (icon ? namedIcons[icon] : null) ?? fallbackIcons[index % fallbackIcons.length] ?? RiBox3Line;

  return (
    <div
      className={cn(
        'grid size-[60px] overflow-hidden rounded-lg bg-gradient-to-br ring-1',
        iconUrl || parsedInitials ? '' : iconStyles[index % iconStyles.length],
        className,
      )}
      style={parsedInitials ? { background: parsedInitials.color } : undefined}
    >
      {iconUrl ? (
        <img src={attachmentAssetUrl(iconUrl)} alt="" className="size-full object-cover" />
      ) : parsedInitials ? (
        <span className="m-auto text-lg font-semibold text-white">{parsedInitials.label}</span>
      ) : (
        <Icon className={cn('m-auto size-8', iconClassName)} />
      )}
    </div>
  );
}
