import { cn } from '@ghostapi/ui';

type FloatingGhostProps = {
  className?: string;
};

export function FloatingGhost({ className }: FloatingGhostProps) {
  return (
    <div className={cn('relative hidden h-[180px] lg:block', className)}>
      <div className="bg-floating-ghost-halo absolute inset-0" />
      <div className="border-floating-ghost-orbit absolute left-1/2 top-1/2 h-[105px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border" />
      <div className="bg-floating-ghost-pad border-floating-ghost-pad absolute left-1/2 top-[64%] h-[48px] w-[170px] -translate-x-1/2 rounded-[50%] border" />
      <div className="bg-floating-ghost-body shadow-floating-ghost animate-floating-ghost absolute left-1/2 top-[22px] h-[86px] w-[76px] rounded-b-[20px] rounded-t-[34px]">
        <span className="absolute left-[22px] top-[30px] h-4 w-2.5 rounded-full bg-white" />
        <span className="absolute right-[22px] top-[30px] h-4 w-2.5 rounded-full bg-white" />
        <span className="absolute left-[31px] top-[52px] h-3 w-4 rounded-b-full bg-white" />
      </div>
    </div>
  );
}
