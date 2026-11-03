interface HBarChartProps {
  data: { label: string; value: number }[];
  max?: number;
  accent?: string;
  unit?: string;
}

export function HBarChart({
  data,
  max,
  accent = 'from-cyan-400 to-blue-600',
  unit = '',
}: HBarChartProps) {
  const maxVal = max ?? Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex w-full flex-col gap-3">
      {data.map((d, i) => {
        const w = maxVal === 0 ? 0 : (d.value / maxVal) * 100;
        return (
          <div key={d.label + i} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-right text-sm text-slate-300">{d.label}</span>
            <div className="h-6 flex-1 overflow-hidden rounded-md bg-ink-800">
              <div
                className={`flex h-full items-center justify-end rounded-md bg-gradient-to-r ${accent} px-2 text-xs font-semibold text-white transition-all duration-700 ease-out`}
                style={{ width: `${Math.max(w, d.value > 0 ? 8 : 0)}%` }}
              >
                {d.value > 0 ? `${d.value.toFixed(d.value % 1 === 0 ? 0 : 1)}${unit}` : ''}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
