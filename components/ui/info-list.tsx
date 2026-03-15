type InfoListProps = {
  items: Array<{
    label: string;
    value: string;
  }>;
};

export function InfoList({ items }: InfoListProps) {
  return (
    <dl className="space-y-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between rounded-2xl bg-sand px-4 py-3"
        >
          <dt className="text-sm text-ink/65">{item.label}</dt>
          <dd className="text-sm font-semibold text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
