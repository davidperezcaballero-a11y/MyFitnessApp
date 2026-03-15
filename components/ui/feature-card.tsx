import type { ReactNode } from "react";

type FeatureCardProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function FeatureCard({ title, description, children }: FeatureCardProps) {
  return (
    <section className="rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-panel backdrop-blur">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink/70">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
