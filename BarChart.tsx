interface BarChartProps {
  data: { label: string; value: number }[];
  max?: number;
  unit?: string;
  accent?: string; // tailwind gradient classes
  height?: number;
}

export function BarChart({
  data,
  max,
  unit = '',
  accent = 'from-gold-400 to-gold-600',
  height = 220,
}: BarChartProps) {
  const maxVal = max ?? Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="w-full" style={{ height }}>
      <div className="flex h-full items-end justify-between gap-3">
        {data.map((d, i) => {
          const h = maxVal === 0 ? 0 : (d.value / maxVal) * 100;
          return (
            <div key={d.label + i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="text-xs font-semibold text-slate-300">
                {d.value.toFixed(d.value % 1 === 0 ? 0 : 1)}
                {unit}
              </span>
              <div
                className="w-full max-w-[48px] origin-bottom rounded-t-md bg-gradient-to-t shadow-glow transition-all duration-700 ease-out animate-grow"
                style={{ height: `${h}%`, minHeight: d.value > 0 ? '4px' : '0' }}
              >
                <div className={`h-full w-full rounded-t-md bg-gradient-to-t ${accent}`} />
              </div>
              <span className="max-w-full truncate text-[11px] text-slate-400">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
