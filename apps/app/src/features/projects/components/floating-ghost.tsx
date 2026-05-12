import { cn } from '@ghostapi/ui';

type FloatingGhostProps = {
  className?: string;
};

export function FloatingGhost({ className }: FloatingGhostProps) {
  return (
    <div className={cn('relative hidden h-[180px] lg:block', className)}>
      <style>
        {`@keyframes ghostapi-subtle-bounce {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -7px); }
        }`}
      </style>
      <div className="bg-floating-ghost-halo absolute inset-0" />
      <div className="absolute left-1/2 top-1/2 h-[105px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-purple-500/25" />
      <div className="bg-purple-700/22 absolute left-1/2 top-[64%] h-[48px] w-[170px] -translate-x-1/2 rounded-[50%] border border-purple-400/35" />
      <div
        className="bg-floating-ghost-body shadow-floating-ghost absolute left-1/2 top-[22px] h-[86px] w-[76px] rounded-b-[20px] rounded-t-[34px]"
        style={{ animation: 'ghostapi-subtle-bounce 4.8s ease-in-out infinite' }}
      >
        <span className="absolute left-[22px] top-[30px] h-4 w-2.5 rounded-full bg-white" />
        <span className="absolute right-[22px] top-[30px] h-4 w-2.5 rounded-full bg-white" />
        <span className="absolute left-[31px] top-[52px] h-3 w-4 rounded-b-full bg-white" />
      </div>
    </div>
  );
}
