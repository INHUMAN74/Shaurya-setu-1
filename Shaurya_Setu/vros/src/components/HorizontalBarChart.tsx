"use client";

type BarItem = { label: string; value: number; colorClass: string };

export default function HorizontalBarChart({ items, title }: { items: BarItem[]; title: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{title}</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
              <span>{item.label}</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{item.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className={`h-full rounded-full transition-all ${item.colorClass}`}
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
