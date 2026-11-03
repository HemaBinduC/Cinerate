interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  centerLabel?: string;
  centerValue?: string;
  size?: number;
}

export function DonutChart({
  data,
  centerLabel,
  centerValue,
  size = 200,
}: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = size / 2;
  const stroke = size * 0.16;
  const r = radius - stroke / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  const segments = data.map((d) => {
    const fraction = d.value / total;
    const dash = fraction * circumference;
    const seg = {
      color: d.color,
      dash,
      gap: circumference - dash,
      offset: -offset,
    };
    offset += dash;
    return seg;
  });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <g transform={`rotate(-90 ${radius} ${radius})`}>
          <circle cx={radius} cy={radius} r={r} fill="none" stroke="#1a1d2b" strokeWidth={stroke} />
          {segments.map((s, i) => (
            <circle
              key={i}
              cx={radius}
              cy={radius}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={s.offset}
              strokeLinecap="butt"
              style={{ transition: 'stroke-dasharray 0.7s ease-out' }}
            />
          ))}
        </g>
        {centerValue && (
          <text
            x={radius}
            y={radius - 4}
            textAnchor="middle"
            className="fill-white"
            style={{ fontSize: size * 0.13, fontWeight: 700 }}
          >
            {centerValue}
          </text>
        )}
        {centerLabel && (
          <text
            x={radius}
            y={radius + size * 0.1}
            textAnchor="middle"
            className="fill-slate-400"
            style={{ fontSize: size * 0.07 }}
          >
            {centerLabel}
          </text>
        )}
      </svg>
      <ul className="flex flex-col gap-2 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm" style={{ background: d.color }} />
            <span className="text-slate-300">{d.label}</span>
            <span className="font-semibold text-white">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
