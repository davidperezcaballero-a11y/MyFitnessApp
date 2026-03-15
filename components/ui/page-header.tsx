type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="mb-6 rounded-[32px] bg-ink px-6 py-7 text-white shadow-panel">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-coral">
        {eyebrow}
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-white/72">{description}</p>
    </section>
  );
}
