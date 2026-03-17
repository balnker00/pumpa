'use client';

import type { BetEntry } from '@/hooks/useCrashGame';

interface Props {
  bets: BetEntry[];
}

export default function BetsList({ bets }: Props) {
  return (
    <div className="flex flex-col gap-1 overflow-y-auto max-h-64">
      <div className="flex justify-between px-2 py-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        <span>{bets.length} Playing</span>
        <span>◎{bets.reduce((s, b) => s + b.amount, 0).toFixed(4)}</span>
      </div>
      {bets.map((bet, i) => (
        <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--accent-purple)' }}>
              {bet.username[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate" style={{ color: 'var(--text-primary)', maxWidth: 100 }}>{bet.username}</p>
              <p className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>◎{bet.amount.toFixed(4)}</p>
            </div>
          </div>
          {bet.cashedOut ? (
            <div className="text-right">
              <p className="font-bold text-xs" style={{ color: '#22c55e' }}>+◎{bet.payout.toFixed(4)}</p>
              <p className="text-xs" style={{ color: '#22c55e' }}>{bet.multiplier?.toFixed(2)}x</p>
            </div>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>JOINED</span>
          )}
        </div>
      ))}
    </div>
  );
}
