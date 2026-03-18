'use client';

interface Props {
  history: number[];
}

function getColor(n: number) {
  if (n < 1.5) return '#ef4444';
  if (n < 2) return '#f97316';
  if (n < 5) return '#f0c420';
  if (n < 10) return '#22c55e';
  return '#22c55e';
}

export default function HistoryBar({ history }: Props) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
      {history.map((h, i) => (
        <span
          key={i}
          className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-bold tabular-nums"
          style={{ background: `${getColor(h)}22`, color: getColor(h), border: `1px solid ${getColor(h)}44` }}
        >
          {h.toFixed(2)}x
        </span>
      ))}
    </div>
  );
}
