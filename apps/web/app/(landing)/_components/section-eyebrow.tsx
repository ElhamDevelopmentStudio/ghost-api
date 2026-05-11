type SectionEyebrowProps = {
  children: React.ReactNode;
};

export function SectionEyebrow({ children }: SectionEyebrowProps): React.JSX.Element {
  return (
    <div className="text-primary mb-6 flex items-center gap-2 font-mono text-xs tracking-[0.2em]">
      <span aria-hidden>{'>_'}</span>
      {children}
    </div>
  );
}
