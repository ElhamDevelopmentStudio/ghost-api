import { cn } from '@ghostapi/ui';

type FloatingGhostProps = {
  className?: string;
  compact?: boolean;
};

export function FloatingGhost({ className, compact = false }: FloatingGhostProps) {
  return (
    <div className={cn('relative hidden lg:block', compact ? 'h-[180px]' : 'h-[250px]', className)}>
      <style>
        {`@keyframes ghostapi-subtle-bounce {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -7px); }
        }`}
      </style>
      <div className="bg-floating-ghost-halo absolute inset-0" />
      <div
        className={cn(
          'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-purple-500/25',
          compact ? 'h-[105px] w-[380px]' : 'h-[150px] w-[420px]',
        )}
      />
      <div
        className={cn(
          'bg-purple-700/22 absolute left-1/2 rounded-[50%] border border-purple-400/35',
          compact
            ? 'top-[64%] h-[48px] w-[170px] -translate-x-1/2'
            : 'top-[57%] h-[50px] w-[178px] -translate-x-1/2 bg-purple-600/35 blur-sm',
        )}
      />
      {!compact ? (
        <div className="absolute left-1/2 top-1/2 h-[106px] w-[305px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-purple-400/35" />
      ) : null}
      <div
        className={cn(
          'bg-floating-ghost-body shadow-floating-ghost absolute left-1/2',
          compact
            ? 'top-[22px] h-[86px] w-[76px] rounded-b-[20px] rounded-t-[34px]'
            : 'top-[68px] h-[110px] w-[86px] rounded-b-[14px] rounded-t-[42px] border border-purple-300/25',
        )}
        style={{ animation: 'ghostapi-subtle-bounce 4.8s ease-in-out infinite' }}
      >
        <span
          className={cn(
            'absolute rounded-full bg-white',
            compact ? 'left-[22px] top-[30px] h-4 w-2.5' : 'left-[26px] top-[49px] h-6 w-3',
          )}
        />
        <span
          className={cn(
            'absolute rounded-full bg-white',
            compact ? 'right-[22px] top-[30px] h-4 w-2.5' : 'right-[24px] top-[49px] h-6 w-3',
          )}
        />
        <span
          className={cn(
            'absolute bg-white',
            compact
              ? 'left-[31px] top-[52px] h-3 w-4 rounded-b-full'
              : 'left-[31px] top-[78px] h-3 w-8 rounded-b-full border-b-4 border-purple-100 bg-transparent',
          )}
        />
      </div>
    </div>
  );
}
